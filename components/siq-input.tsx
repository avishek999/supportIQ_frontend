"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SiqInputProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "size"> {
  /** Visible label above the input */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Current value (controlled) */
  value?: string
  /** Change handler — receives the new string value */
  onValueChange?: (value: string) => void
  /** Error message — shows below the input in red */
  error?: string
  /** Helper text — shows below the input when no error */
  helperText?: string
  /** Input type */
  type?: React.HTMLInputTypeAttribute
  /** Custom width — any CSS value */
  width?: string
  /** Custom height — any CSS value */
  height?: string
  /** Whether the input is disabled */
  disabled?: boolean
  /** Whether the field is required — adds visual indicator */
  required?: boolean
  /** Icon element to render on the left side */
  startIcon?: React.ReactNode
  /** Icon element to render on the right side */
  endIcon?: React.ReactNode
}

const SiqInput = React.forwardRef<HTMLInputElement, SiqInputProps>(
  (
    {
      label,
      placeholder,
      value,
      onValueChange,
      error,
      helperText,
      type = "text",
      width,
      height,
      disabled = false,
      required = false,
      startIcon,
      endIcon,
      className,
      id,
      style,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? React.useId()
    const errorId = error ? `${inputId}-error` : undefined
    const helperId = helperText && !error ? `${inputId}-helper` : undefined
    const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined

    return (
      <div
        className="relative flex flex-col gap-1.5 pb-2"
        style={{ width: width ?? undefined }}
      >
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium text-foreground",
              disabled && "opacity-50",
            )}
          >
            {label}
            {required && (
              <span className="ml-0.5 text-destructive" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* Input wrapper */}
        <div
          title={props.title}
          className={cn(
            "group flex items-center gap-2 rounded-lg border bg-background px-3 transition-all duration-200",
            "border-input hover:border-ring",
            "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
            error &&
              "border-destructive hover:border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
            disabled && "cursor-not-allowed opacity-50",
          )}
          style={{ height: height ?? "40px" }}
        >
          {/* Start icon */}
          {startIcon && (
            <span className="flex shrink-0 items-center text-muted-foreground [&_svg]:size-4">
              {startIcon}
            </span>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            aria-required={required}
            onChange={(e) => onValueChange?.(e.target.value)}
            className={cn(
              "flex-1 bg-transparent text-sm text-foreground outline-none",
              "placeholder:text-muted-foreground/60",
              "disabled:cursor-not-allowed",
              className,
            )}
            style={style}
            {...props}
          />

          {/* End icon */}
          {endIcon && (
            <span className="flex shrink-0 items-center text-muted-foreground [&_svg]:size-4">
              {endIcon}
            </span>
          )}

          {/* Floating hover tooltip for disabled state */}
          {disabled && props.title && (
            <div className="pointer-events-none absolute -top-9 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-[11px] font-medium text-background opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
              {props.title}
              <div className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-foreground" />
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p id={errorId} className="absolute bottom-[-10] left-0 text-xs text-destructive" role="alert">
            {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p id={helperId} className="absolute bottom-0 left-0 text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  },
)

SiqInput.displayName = "SiqInput"

export { SiqInput }
export type { SiqInputProps }
