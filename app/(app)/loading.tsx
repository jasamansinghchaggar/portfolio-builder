function Block({
  className = "",
}: {
  className?: string
}) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />
}

export default function AppLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading page">
      <div className="space-y-2">
        <Block className="h-3 w-20" />
        <Block className="h-9 w-64" />
        <Block className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Block className="h-48" />
        <Block className="h-48" />
      </div>
      <Block className="h-32" />
    </div>
  )
}
