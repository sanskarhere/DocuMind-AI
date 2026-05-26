import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { UploadPanel, type UploadStatus } from "@/components/UploadPanel";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatInput } from "@/components/ChatInput";
import { ErrorBanner } from "@/components/ErrorBanner";
import type { Message } from "@/components/MessageBubble";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DocuMind AI — Chat with your documents, instantly." },
      {
        name: "description",
        content:
          "Upload a PDF and chat with it in real time. DocuMind AI turns documents into conversations.",
      },
      { property: "og:title", content: "DocuMind AI" },
      { property: "og:description", content: "Chat with your documents, instantly." },
    ],
  }),
  component: Index,
});

function uuidv4(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function Index() {
  const [authed, setAuthed] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("documind_token") : null;
    if (!token) {
      window.location.href = "/login.html";
    } else {
      setAuthed(true);
      // Initialize theme from storage; default dark
      const theme = localStorage.getItem("documind_theme") ?? "dark";
      if (theme === "dark") document.documentElement.classList.add("dark");
    }
  }, []);

  const ready = status === "ready";

  const handleStatusChange = (s: UploadStatus, f: File | null) => {
    setStatus(s);
    setFile(f);
    if (s === "idle") {
      setMessages([]);
    } else if (s === "uploading") {
      setMessages([]);
    }
  };

  const handleSend = async (text: string) => {
    const userMsg: Message = { id: uuidv4(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {

        const realSessionId = localStorage.getItem("session_id");

        console.log("REAL SESSION:", realSessionId);
      
        const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  question: text,
  session_id: realSessionId,
}),
      }).catch(() => null);

let answer = "";
let data: any = {};

if (res && res.ok) {

  data = await res.json().catch(() => ({}));

  console.log("CHAT RESPONSE:", data);

  if (typeof data === "object" && data && "answer" in data) {

    answer = String(
      (data as { answer: unknown }).answer ?? ""
    );
  }
}

if (!answer) {

  console.log("EMPTY ANSWER DETECTED");

  answer =
    JSON.stringify(data, null, 2) ||
    "No response returned from backend.";
}
if (!answer) {
  console.log("EMPTY ANSWER DETECTED");

  answer =
    JSON.stringify(data, null, 2) ||
    "No response returned from backend.";
}
      const aiMsg: Message = { id: uuidv4(), role: "ai", content: answer };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get a response.");
    } finally {
      setIsTyping(false);
    }
  };

  const placeholder = useMemo(
    () => (ready ? "Ask anything about your document..." : "Upload a PDF to start chatting"),
    [ready],
  );

  if (!authed) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6">
        {error && (
          <div className="mb-4">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        <div className="grid h-[calc(100vh-7rem)] grid-cols-1 gap-4 md:grid-cols-[360px_1fr]">
          <section className="min-h-[280px] md:min-h-0">
            <UploadPanel
              status={status}
              file={file}
              onStatusChange={handleStatusChange}
              onError={setError}
            />
          </section>

          <section className="flex min-h-0 flex-col rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">Chat</h2>
                <p className="text-xs text-muted-foreground">
                  {ready ? "Document ready • Ask anything" : "Awaiting document"}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground"
                    disabled={messages.length === 0}
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear conversation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all messages from this session. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => setMessages([])}>Clear</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden px-4">
              <ChatWindow messages={messages} isTyping={isTyping} ready={ready} />
            </div>

            <ChatInput onSend={handleSend} disabled={!ready} placeholder={placeholder} />
          </section>
        </div>
      </main>
    </div>
  );
}
