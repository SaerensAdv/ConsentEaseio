import { useId } from "react"

import { cn } from "@/lib/utils"

type SpinnerProps = Omit<React.SVGProps<SVGSVGElement>, "size"> & {
  size?: number
  variant?: "current" | "brand"
}

function Spinner({
  className,
  size,
  variant = "current",
  ...props
}: SpinnerProps) {
  const reactId = useId()
  const gradientId = `spinner-grad-${reactId.replace(/:/g, "")}`
  const isBrand = variant === "brand"

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="status"
      aria-label="Loading"
      fill="none"
      className={cn(!size && "size-4", "animate-spin shrink-0", className)}
      {...props}
    >
      {isBrand && (
        <defs>
          <linearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" style={{ stopColor: "hsl(var(--primary))" }} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--accent))" }} />
          </linearGradient>
        </defs>
      )}
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke={isBrand ? `url(#${gradientId})` : "currentColor"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="42 60"
      />
    </svg>
  )
}

export { Spinner }
