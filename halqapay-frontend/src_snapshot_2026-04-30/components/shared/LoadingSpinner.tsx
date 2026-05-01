export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-primary">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-secondary-container border-t-transparent"
        aria-hidden
      />
      {label ? <p className="text-sm text-on-surface-variant">{label}</p> : null}
    </div>
  );
}
