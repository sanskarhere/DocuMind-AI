import { useCallback, useRef, useState } from "react";
import { Upload, FileText, X, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export type UploadStatus = "idle" | "uploading" | "processing" | "ready" | "error";

interface UploadPanelProps {
  onStatusChange: (status: UploadStatus, file: File | null) => void;
  status: UploadStatus;
  file: File | null;
  onError: (msg: string) => void;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const MAX_SIZE = 50 * 1024 * 1024;

async function uploadWithProgress(
  file: File,
  onProgress: (pct: number) => void,
): Promise<any> {
  return new Promise((resolve) => {
    try {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", "http://localhost:5000/api/upload");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);

          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            data,
          });
        } catch {
          resolve(null);
        }
      };

      xhr.onerror = () => resolve(null);

      xhr.ontimeout = () => resolve(null);

      const fd = new FormData();

      fd.append("file", file);

      xhr.send(fd);

    } catch {
      resolve(null);
    }
  });
}

export function UploadPanel({ onStatusChange, status, file, onError }: UploadPanelProps) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (f: File) => {
      if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
        onError("Only PDF files are supported.");
        return;
      }
      if (f.size > MAX_SIZE) {
        onError("File exceeds the 50MB limit.");
        return;
      }
      setProgress(0);
      onStatusChange("uploading", f);

      // If a real backend is present, real progress will fire. Otherwise we
      // simulate a smooth fake progress so the indicator is always visible.
      let simulated = 0;
      let realProgressSeen = false;
      const sim = setInterval(() => {
        if (realProgressSeen) return;
        simulated = Math.min(90, simulated + Math.random() * 12 + 4);
        setProgress((p) => Math.max(p, Math.round(simulated)));
      }, 180);

      const res = await uploadWithProgress(f, (pct) => {
        realProgressSeen = true;
        setProgress(pct);
      });

      clearInterval(sim);
      setProgress(100);

      // Brief pause so users see 100%
      await new Promise((r) => setTimeout(r, 250));
      onStatusChange("processing", f);

      // Simulate server-side indexing/embedding
      await new Promise((r) => setTimeout(r, 900));

      if (res === null || (res && !res.ok && res.status !== 0)) {
      onError("Upload failed.");
      onStatusChange("error", null);
      return;
    }

    console.log("UPLOAD RESPONSE:", res);

    if (res?.data?.session_id) {
      localStorage.setItem("session_id", res.data.session_id);

      console.log(
        "SESSION SAVED:",
        localStorage.getItem("session_id")
      );
    } else {
      onError("No session_id returned from backend.");
      return;
    }

    onStatusChange("ready", f);
        },
    [onError, onStatusChange],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const remove = () => {
    onStatusChange("idle", null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  const isUploading = status === "uploading";
  const isProcessing = status === "processing";

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl shadow-[var(--shadow-card)]">
      {/* Decorative gradient glow */}
      <div className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mb-4 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Document
        </h2>
        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          RAG ready
        </span>
      </div>

      {!file && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`group relative flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
            dragOver
              ? "border-primary bg-primary/10 scale-[1.01]"
              : "border-border/70 hover:border-primary/60 hover:bg-primary/5"
          }`}
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/10 text-primary shadow-[var(--shadow-glow)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Upload className="h-7 w-7" />
          </div>
          <p className="text-sm font-semibold">Drop your PDF here</p>
          <p className="mt-1 text-xs text-muted-foreground">
            or <span className="text-primary underline-offset-2 hover:underline">click to browse</span>
          </p>
          <p className="mt-4 text-[11px] text-muted-foreground/80">PDF up to 50MB supported</p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      )}

      {file && (
        <div className="relative flex flex-1 flex-col gap-4">
          <div className="rounded-xl border border-border/60 bg-background/50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/25 to-primary/10 text-primary">
                <FileText className="h-5 w-5" />
                {(isUploading || isProcessing) && (
                  <span className="absolute -inset-0.5 animate-pulse rounded-lg ring-2 ring-primary/40" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={remove}
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Status / Progress */}
            <div className="mt-4">
              {isUploading && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-primary">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Uploading…
                    </span>
                    <span className="font-mono text-muted-foreground tabular-nums">
                      {progress}%
                    </span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-[width] duration-200 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                    <div
                      className="absolute inset-y-0 w-12 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      style={{ left: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-warning">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Indexing document…
                    </span>
                    <span className="font-mono text-muted-foreground tabular-nums">100%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-1/2 animate-[indeterminate_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-warning/40 via-warning to-warning/40" />
                  </div>
                </div>
              )}

              {status === "ready" && (
                <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/10 px-3 py-2 animate-fade-in">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    Ready to chat
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-success/80">
                    Indexed
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-border/60 bg-background/30 p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Try asking
            </p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary">›</span> Summarize the main points</li>
              <li className="flex gap-2"><span className="text-primary">›</span> What are the key takeaways?</li>
              <li className="flex gap-2"><span className="text-primary">›</span> Explain section 2 simply</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
