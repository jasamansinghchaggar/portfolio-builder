function Block({
  className = "",
}: {
  className?: string
}) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />
}

export default function PublicPortfolioLoading() {
  return (
    <div
      className="pf-public min-h-screen"
      aria-busy="true"
      aria-label="Loading portfolio"
    >
      <div className="mx-auto max-w-6xl space-y-6 px-5 py-16 sm:px-8">
        <Block className="h-12 w-12 rounded-full" />
        <Block className="h-12 w-full max-w-2xl" />
        <Block className="h-5 w-full max-w-xl" />
        <Block className="h-72 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Block className="h-48" />
          <Block className="h-48" />
        </div>
      </div>
    </div>
  )
}
