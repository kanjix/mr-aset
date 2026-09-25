"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/components/I18nProvider";

type Group = { id: string; name: string };

export default function LessonsFilter({ groups }: { groups: Group[] }) {
  const t = useT().admin.lessonsPage;
  const router = useRouter();
  const searchParams = useSearchParams();
  const group = searchParams.get("group") ?? "";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("group", value);
    else params.delete("group");
    router.push(`/admin/lessons?${params.toString()}`);
  }

  return (
    <div className="max-w-xs">
      <label className="label">{t.filterGroup}</label>
      <select className="input" value={group} onChange={(e) => onChange(e.target.value)}>
        <option value="">{t.filterAllGroups}</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
    </div>
  );
}