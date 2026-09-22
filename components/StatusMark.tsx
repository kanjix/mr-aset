type Sub = { status: string; grade?: string | null } | null | undefined;
type Labels = { graded: string; submitted: string; overdue: string; todo: string };

// Статус задания: оценка выводится «от руки» красной ручкой, как в тетради.
export default function StatusMark({
  submission,
  dueAt,
  labels,
}: {
  submission?: Sub;
  dueAt?: string | null;
  labels: Labels;
}) {
  if (submission?.status === "graded") {
    return submission.grade ? (
      <span className="font-hand text-3xl leading-none text-mark">{submission.grade}</span>
    ) : (
      <span className="text-sm text-mark">{labels.graded}</span>
    );
  }
  if (submission) return <span className="text-sm text-pen">{labels.submitted}</span>;
  if (dueAt && new Date(dueAt).getTime() < Date.now()) {
    return <span className="text-sm text-mark">{labels.overdue}</span>;
  }
  return <span className="text-sm text-muted">{labels.todo}</span>;
}
