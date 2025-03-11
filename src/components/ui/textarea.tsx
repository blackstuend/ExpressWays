import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea"> & { onClear?: () => void }
>(({ className, onClear, ...props }, ref) => {
  return (
    <div className="relative">
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
      {props.value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-2 top-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          type="button"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      )}
    </div>
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
