import { useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-border/60 bg-background/70 px-2 py-3 backdrop-blur-xl">
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          disabled={disabled}
          placeholder={placeholder ?? "Ask anything about your document..."}
          rows={1}
          className="max-h-32 min-h-[44px] resize-none rounded-xl"
        />
        <Button
          onClick={submit}
          disabled={disabled || !value.trim()}
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {disabled && (
        <p className="mt-2 px-2 text-xs text-muted-foreground">
          Upload a PDF and wait until it's ready to start chatting.
        </p>
      )}
    </div>
  );
}
