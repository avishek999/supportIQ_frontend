"use client"

import Link from "next/link"
import { SiqButton } from "@/components/siq-button"

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-6">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, oklch(0.6 0.15 250) 0%, transparent 70%)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full opacity-15 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.2 300) 0%, transparent 70%)",
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.18 180) 0%, transparent 70%)",
            animation: "float 12s ease-in-out infinite 2s",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        {/* Glitchy 404 number */}
        <div className="relative select-none">
          <h1
            className="text-[10rem] leading-none font-black tracking-tighter text-foreground/5 sm:text-[14rem]"
            aria-hidden="true"
          >
            404
          </h1>
          <h1
            className="absolute inset-0 flex items-center justify-center text-[10rem] leading-none font-black tracking-tighter text-foreground sm:text-[14rem]"
            style={{ animation: "glitch 3s ease-in-out infinite" }}
          >
            404
          </h1>
        </div>

        {/* Message */}
        <div className="-mt-10 flex flex-col items-center gap-2">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Page not found
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Looks like this page wandered off. It might have been moved,
            deleted, or maybe it never existed in the first place.
          </p>
        </div>

        {/* Action */}
        <div className="mt-2 flex items-center gap-3">
          <Link href="/">
            <SiqButton
              text="Go Home"
              width="140px"
              height="40px"
              onPress={() => {}}
            />
          </Link>
          <Link href="/">
            <SiqButton
              text="Go Back"
              variant="outline"
              width="140px"
              height="40px"
              onPress={() => window.history.back()}
            />
          </Link>
        </div>

        {/* Decorative line */}
        <div className="mt-4 flex items-center gap-3">
          <div className="h-px w-12 bg-border" />
          <span className="text-xs tracking-wider text-muted-foreground uppercase">
            SupportIQ
          </span>
          <div className="h-px w-12 bg-border" />
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes glitch {
          0%, 90%, 100% { transform: translate(0); }
          92% { transform: translate(2px, -2px); }
          94% { transform: translate(-2px, 2px); }
          96% { transform: translate(1px, 1px); }
          98% { transform: translate(-1px, -1px); }
        }
      `}</style>
    </div>
  )
}
