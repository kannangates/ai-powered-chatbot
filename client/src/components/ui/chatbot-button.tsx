import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface ChatbotButtonProps {
  onClick: () => void;
  className?: string;
}

export function ChatbotButton({ onClick, className }: ChatbotButtonProps) {
  return (
    <Button 
      onClick={onClick}
      variant="default"
      size="icon"
      className={cn(
        "w-14 h-14 rounded-full fixed bottom-6 right-6 shadow-lg z-50 bg-primary hover:bg-primary/90",
        className
      )}
      aria-label="Open chat"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
}
