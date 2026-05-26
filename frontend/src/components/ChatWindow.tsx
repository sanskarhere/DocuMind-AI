import { useEffect, useRef } from "react";
import { MessageBubble, type Message } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Sparkles } from "lucide-react";

interface ChatWindowProps {
  messages: Message[];
  isTyping: boolean;
  ready: boolean;
}

export function ChatWindow({ messages, isTyping, ready }: ChatWindowProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold">Start a conversation</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {ready
            ? "Your document is ready. Ask anything about its contents."
            : "Upload a PDF on the left to begin chatting with your document."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-1 py-4">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={endRef} />
    </div>
  );
}
