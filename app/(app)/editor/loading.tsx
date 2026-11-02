function Block({
  className = "",
}: {
  className?: string
}) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />
}

export default function EditorLoading() {
  return (
    <div
      className="grid min-h-[calc(100vh-var(--app-header-height))] lg:grid-cols-[18rem_1fr]"
      aria-busy="true"
      aria-label="Loading editor"
    >
      <aside className="hidden border-r bg-background p-4 lg:block">
        <Block className="mb-5 h-8 w-32" />
        <div className="space-y-2">
          <Block className="h-9 w-full" />
          <Block className="h-9 w-full" />
          <Block className="h-9 w-full" />
          <Block className="h-9 w-full" />
        </div>
      </aside>
      <main className="space-y-4 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <Block className="h-8 w-48" />
          <Block className="h-9 w-24" />
        </div>
        <Block className="h-12 w-full" />
        <Block className="h-[28rem] w-full" />
      </main>
    </div>
  )
}
