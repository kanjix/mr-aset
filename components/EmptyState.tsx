export default function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="border-y border-rule py-10">
      <p className="font-medium">{title}</p>
      {text && <p className="mt-1 max-w-prose text-sm text-muted">{text}</p>}
    </div>
  );
}
