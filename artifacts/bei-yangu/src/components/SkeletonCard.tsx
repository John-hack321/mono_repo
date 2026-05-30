export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 animate-pulse overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-zinc-200 to-zinc-100 -mx-5 -mt-5 mb-5" />
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 rounded-2xl bg-zinc-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-200 rounded-lg w-3/4" />
          <div className="h-3 bg-zinc-100 rounded-lg w-1/2" />
        </div>
      </div>
      <div className="mt-3 h-3 bg-zinc-100 rounded-lg w-1/3" />
      <div className="mt-3 flex gap-2">
        <div className="h-5 bg-zinc-100 rounded-full w-20" />
        <div className="h-5 bg-zinc-100 rounded-full w-16" />
      </div>
      <div className="mt-4 flex justify-between">
        <div className="h-3 bg-zinc-100 rounded-lg w-24" />
        <div className="h-3 bg-zinc-100 rounded-lg w-20" />
      </div>
    </div>
  );
}

export function SkeletonResultItem() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 animate-pulse">
      <div className="flex gap-4">
        <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-200 rounded-lg w-1/2" />
          <div className="h-3 bg-zinc-100 rounded-lg w-1/3" />
          <div className="h-3 bg-zinc-100 rounded-lg w-2/3" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-5 bg-zinc-200 rounded-lg w-32" />
          <div className="h-3 bg-zinc-100 rounded-lg w-20 ml-auto" />
        </div>
      </div>
    </div>
  );
}
