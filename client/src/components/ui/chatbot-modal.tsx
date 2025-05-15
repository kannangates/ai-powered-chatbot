import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import { getAIProviderDisplayName } from "@/lib/ai-providers";
import { useChat } from "@/hooks/use-chat";
import { getChatSettings } from "@/lib/vector-store";
import { Message, ChatSettings } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const { messages, isLoading, isTyping, error, errorMessage, sendMessage, resetChat, clearError } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Settings state with UI configuration
  const [settings, setSettings] = useState<ChatSettings & {
    uiConfig?: {
      colors: {
        primary: string;
        botMessage: string;
        userMessage: string;
        sendButton: string;
      };
      text: {
        botName: string;
        welcomeMessage: string;
        inputPlaceholder: string;
      };
      icon?: {
        type: string;
        name: string;
        customUrl?: string;
      };
    };
    whatsapp?: {
      enabled: boolean;
      phoneNumber: string;
      initialMessage: string;
    };
  }>({
    apiProvider: "openai",
    apiKey: "",
    websiteUrl: "",
  });

  // Load settings on initial mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const currentSettings = await getChatSettings();
        setSettings(currentSettings);
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
    
    loadSettings();
  }, []);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      sendMessage(input);
      setInput("");
    }
  };

  // Get WhatsApp link if configured
  const getWhatsAppLink = () => {
    if (settings?.whatsapp?.enabled && settings?.whatsapp?.phoneNumber) {
      const message = encodeURIComponent(settings.whatsapp.initialMessage || "Hi");
      return `https://wa.me/${settings.whatsapp.phoneNumber}?text=${message}`;
    }
    return null;
  };

  // Render message item
  const renderMessage = (message: Message) => {
    const isUser = message.role === "user";
    
    // Get custom colors from settings
    const userBgColor = settings?.uiConfig?.colors?.userMessage || "#3b82f6";
    const botBgColor = settings?.uiConfig?.colors?.botMessage || "#f3f4f6";
    
    return (
      <div 
        key={message.id} 
        className={cn(
          "flex items-start mb-4",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        {!isUser && (
          <Avatar className="w-8 h-8 mr-2 bg-blue-100">
            <MessageCircle className="h-4 w-4 text-primary" />
          </Avatar>
        )}
        
        <div 
          className={cn(
            "p-3 rounded-lg max-w-[80%]",
            isUser ? "rounded-br-sm text-white" : "rounded-bl-sm text-gray-800"
          )}
          style={{ 
            backgroundColor: isUser ? userBgColor : botBgColor 
          }}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  };

  // Render error with WhatsApp button if needed
  const renderError = () => {
    if (!error) return null;
    
    const whatsappLink = getWhatsAppLink();
    
    return (
      <div className="mb-4 mx-auto p-3 bg-red-50 text-red-700 rounded-md text-sm">
        <p className="font-medium">Error:</p>
        <p>{errorMessage || error}</p>
        
        {whatsappLink && (
          <div className="mt-2">
            <Button
              variant="default"
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              onClick={() => window.open(whatsappLink, '_blank')}
            >
              <MessageCircle className="h-4 w-4" />
              Contact support via WhatsApp
            </Button>
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={clearError}
        >
          Dismiss
        </Button>
      </div>
    );
  };

  // Calculate send button style from settings
  const sendButtonStyle = {
    backgroundColor: settings?.uiConfig?.colors?.sendButton || "#2563eb"
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-md max-h-[85vh] p-0 flex flex-col" 
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-4 py-3 border-b flex flex-row items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <MessageCircle className="h-4 w-4" />
            </Avatar>
            <DialogTitle>{settings?.uiConfig?.text?.botName || "AI Assistant"}</DialogTitle>
          </div>
          
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        
        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <>
                {messages.map(renderMessage)}
                
                {isTyping && (
                  <div className="flex items-start mb-4">
                    <Avatar className="w-8 h-8 mr-2 bg-blue-100">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </Avatar>
                    <div className="p-3 rounded-lg rounded-bl-sm" 
                      style={{ backgroundColor: settings?.uiConfig?.colors?.botMessage || "#f3f4f6" }}>
                      <TypingIndicator />
                    </div>
                  </div>
                )}
                
                {renderError()}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {/* Input area */}
          <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
            <div className="flex items-center space-x-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={settings?.uiConfig?.text?.inputPlaceholder || "Type your message here..."}
                className="flex-1"
                disabled={isTyping}
                autoComplete="off"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!input.trim() || isTyping}
                style={sendButtonStyle}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                <span>Connected to {getAIProviderDisplayName(settings)}</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-0"
                onClick={resetChat}
              >
                Clear chat
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}