import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, ...props }, ref) => {
  // Dynamic gradient based on progress value
  const getProgressGradient = (progress: number) => {
    if (progress === 0) return "bg-muted";
    if (progress < 30) return "bg-gradient-to-r from-red-500 to-orange-500";
    if (progress < 60) return "bg-gradient-to-r from-orange-500 to-yellow-500";
    if (progress < 80) return "bg-gradient-to-r from-yellow-500 to-primary";
    if (progress < 100) return "bg-gradient-to-r from-primary to-secondary";
    return "bg-gradient-to-r from-secondary to-purple-500";
  };

  const progressValue = value || 0;
  const gradientClass = getProgressGradient(progressValue);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn("relative h-4 w-full overflow-hidden rounded-full bg-muted/30", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 progress-vibrant",
          gradientClass,
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - progressValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
