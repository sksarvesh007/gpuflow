import { cn } from "@renderer/lib/utils"
import { forwardRef } from "react"

const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border border-slate-800 bg-slate-900 text-slate-50 shadow-sm", className)} {...props} />
))
Card.displayName = "Card"
export { Card }