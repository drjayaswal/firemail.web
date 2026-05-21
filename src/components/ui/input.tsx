import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 ring-0 text-black outline-0 border border-border/10 focus-within:border-black/25 focus-visible:border-black/25 focus:border-black/25 rounded-xl",
        className
      )}
      {...props}
    />
  )
}

export { Input }
