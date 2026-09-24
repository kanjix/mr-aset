"use client";

import { useState } from "react";
import { useT } from "@/components/I18nProvider";
import EmptyState from "@/components/EmptyState";
import { StudentRow } from "./Rows";

export default function StudentsTabs({
  pending,
  approved,
  groups,
}: {
  pending: any[];
  approved: any[];
  groups: { id: string; name: string }[];
}) {
  const t = useT();
  const P = t.admin.studentsPage;
  const [tab, setTab] = useState<"pending" | "approved">(pending.length > 0 ? "pending" : "approved");

  const tabs = [
    { key: "pending" as const, label: `${P.tabPending} (${pending.length})` },
    { key: "approved" as const, label: `${P.tabApproved} (${approved.length})` },
  ];
  const list = tab === "pending" ? pending : approved;

  return (
    <div>
      <div className="flex gap-1 border-b border-rule">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => setTab(tb.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${
              tab === tb.key ? "border-pen font-medium text-pen" : "border-transparent text-muted"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            title={tab === "pending" ? P.noPendingTitle : P.noStudentsTitle}
            text={tab === "pending" ? P.noPendingText : P.noStudentsText}
          />
        </div>
      ) : (
        <ul className="ruled mt-3">
          {list.map((s: any) => (
            <StudentRow key={s.id} student={s} groups={groups} />
          ))}
        </ul>
      )}
    </div>
  );
}