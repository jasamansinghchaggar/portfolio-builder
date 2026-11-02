function Block({
  className = "",
}: {
  className?: string
}) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />
}

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading page">
      <div className="mx-auto max-w-6xl space-y-6 px-5 py-16 sm:px-8">
        <Block className="h-4 w-28" />
        <Block className="h-14 w-full max-w-2xl" />
        <Block className="h-5 w-full max-w-xl" />
        <div className="flex gap-3">
          <Block className="h-10 w-28" />
          <Block className="h-10 w-28" />
        </div>
        <div className="grid gap-4 pt-8 md:grid-cols-3">
          <Block className="h-52" />
          <Block className="h-52" />
          <Block className="h-52" />
        </div>
      </div>
    </div>
  )
}
