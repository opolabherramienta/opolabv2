// Shown inside the private frame while a screen loads its data.
export default function Loading() {
  return (
    <div aria-busy="true" className="space-y-6" role="status">
      <span className="sr-only">Cargando…</span>
      <div className="h-10 w-56 animate-pulse rounded-xl bg-slate-200" />
      <div className="h-40 animate-pulse rounded-[1.75rem] bg-slate-200" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-56 animate-pulse rounded-[1.75rem] bg-slate-200" />
        <div className="h-56 animate-pulse rounded-[1.75rem] bg-slate-200" />
      </div>
    </div>
  );
}
