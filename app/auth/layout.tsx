export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh w-full bg-background">
      {/* ── Left side — 60% premium text-first layout ── */}
      <div className="relative hidden w-[60%] flex-col justify-between overflow-hidden border-r border-border bg-sidebar/50 p-16 lg:flex">
        {/* Subtle radial spotlight background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(1000px circle at 20% 30%, rgba(255,255,255,0.06), transparent 70%)",
          }}
        />

        {/* Delicate background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "4rem 4rem",
          }}
        />

        {/* Top — Brand badge */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-foreground">
            Support<span className="text-muted-foreground font-normal">IQ</span>
          </span>
          <span className="rounded-full border border-border bg-background/50 px-3 py-1 text-xs font-mono text-muted-foreground">
            v1.0 &bull; RAG Engine
          </span>
        </div>

        {/* Center — Hero copy */}
        <div className="relative z-10 flex max-w-xl flex-col gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/80 px-3.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-md">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Context-Aware RAG Platform
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground xl:text-5xl leading-[1.15]">
            Intelligence built on your own knowledge base.
          </h1>

          <p className="text-base leading-relaxed text-muted-foreground/90">
            Upload documents, connect live web links, and empower your support workflows with precise, context-driven answers.
          </p>

          {/* Key metrics / feature badges */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-background/40 p-4 backdrop-blur-xs">
              <span className="font-mono text-xs text-muted-foreground">CONTEXT</span>
              <span className="text-sm font-semibold text-foreground">Docs & Links</span>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-background/40 p-4 backdrop-blur-xs">
              <span className="font-mono text-xs text-muted-foreground">LATENCY</span>
              <span className="text-sm font-semibold text-foreground">Real-time</span>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-background/40 p-4 backdrop-blur-xs">
              <span className="font-mono text-xs text-muted-foreground">ACCURACY</span>
              <span className="text-sm font-semibold text-foreground">Source-backed</span>
            </div>
          </div>
        </div>

        {/* Bottom — Clean quote */}
        <div className="relative z-10 flex items-center justify-between text-xs text-muted-foreground">
          <span>&ldquo;Select context. Ask anything.&rdquo;</span>
          <span>SupportIQ &copy; {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* ── Right side — 40% form area ── */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 lg:w-[40%]">
        {/* Mobile-only brand text */}
        <div className="mb-8 lg:hidden">
          <span className="text-xl font-bold tracking-tight text-foreground">
            Support<span className="text-muted-foreground font-normal">IQ</span>
          </span>
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
