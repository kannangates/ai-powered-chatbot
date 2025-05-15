import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("typing-indicator flex items-center", className)}>
      <span className="mx-[2px] h-1.5 w-1.5 rounded-full bg-gray-400 animate-pulse"></span>
      <span className="mx-[2px] h-1.5 w-1.5 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: "0.2s" }}></span>
      <span className="mx-[2px] h-1.5 w-1.5 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: "0.4s" }}></span>
    </div>
  );
}
