"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/components/I18nProvider";

type Group = { id: string; name: string };

export default function ReviewFilters({ groups }: { groups: Group[] }) {
  const t = useT().admin.reviewPage;
  const router = useRouter();
  const searchParams = useSearchParams();

  const group = searchParams.get("group") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const hasFilters = group || from || to;

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/admin/review?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-rule pb-6">
      <div>
        <label className="label">{t.filterGroup}</label>
        <select className="input" value={group} onChange={(e) => update("group", e.target.value)}>
          <option value="">{t.filterAllGroups}</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">{t.filterFrom}</label>
        <input
          type="date"
          className="input"
          value={from}
          onChange={(e) => update("from", e.target.value)}
        />
      </div>
      <div>
        <label className="label">{t.filterTo}</label>
        <input
          type="date"
          className="input"
          value={to}
          onChange={(e) => update("to", e.target.value)}
        />
      </div>
      {hasFilters && (
        <button type="button" className="btn btn-ghost" onClick={() => router.push("/admin/review")}>
          {t.filterReset}
        </button>
      )}
    </div>
  );
}