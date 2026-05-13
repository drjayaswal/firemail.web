import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 ring-0 outline-0 border border-border focus-within:border-white/20 focus-visible:border-white/20 focus:border-white/20 rounded-xl",
        className
      )}
      {...props}
    />
  )
}

export { Input }
