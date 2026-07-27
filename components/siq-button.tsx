"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { Button, type buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { VariantProps } from "class-variance-authority"

interface SiqButtonProps
  extends Omit<React.ComponentProps<"button">, "children">,
    VariantProps<typeof buttonVariants> {
  /** Button label text */
  text?: string
  /** Text shown while loading */
  loadingText?: string
  /** Whether the button is in a loading state */
  isLoading?: boolean
  /** Click handler */
  onPress?: () => void
  /** Custom width — accepts any CSS value (e.g. "100%", "200px", "auto") */
  width?: string
  /** Custom height — accepts any CSS value */
  height?: string
  /** Icon to render before text */
  startIcon?: React.ReactNode
  /** Icon to render after text */
  endIcon?: React.ReactNode
}

function SiqButton({
  text = "",
  loadingText,
  isLoading = false,
  onPress,
  width,
  height,
  startIcon,
  endIcon,
  variant = "default",
  size = "default",
  className,
  disabled,
  style,
  title,
  ...props
}: SiqButtonProps) {
  const isDisabled = isLoading || disabled

  return (
    <div className="group relative inline-flex shrink-0">
      <Button
        variant={variant}
        size={size}
        disabled={isDisabled}
        onClick={onPress}
        className={cn(
          "cursor-pointer transition-all duration-200",
          isDisabled && "cursor-not-allowed",
          className,
        )}
        style={{
          width: width ?? undefined,
          height: height ?? undefined,
          ...style,
        }}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin shrink-0" />
            {loadingText ?? text}
          </>
        ) : (
          <>
            {startIcon}
            {text}
            {endIcon}
          </>
        )}
      </Button>

      {/* Floating tooltip badge */}
      {isDisabled && title && (
        <div className="pointer-events-none absolute -top-9 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-[11px] font-medium text-background opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
          {title}
          <div className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-foreground" />
        </div>
      )}
    </div>
  )
}

export { SiqButton }
export type { SiqButtonProps }
