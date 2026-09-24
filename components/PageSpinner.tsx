export default function PageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-rule border-t-pen" />
        <span className="absolute inset-0 flex items-center justify-center font-hand text-3xl text-pen">
          π
        </span>
      </div>
    </div>
  );
}