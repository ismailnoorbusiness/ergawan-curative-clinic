import { useState } from "react";
import { CircleCheck, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitFeedback } from "@/lib/contact.functions";
import { cn } from "@/lib/utils";

export default function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (rating < 1 || comment.trim().length < 5) {
      setError("Choose a rating and write a short comment.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await submitFeedback({ data: { rating, comment: comment.trim(), patient_name: name.trim() } });
      setSent(true);
    } catch {
      setError("We could not send your feedback. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-3xl border border-border bg-background p-7">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-accent/15 text-accent">
          <CircleCheck className="h-5 w-5" />
        </span>
        <p className="mt-4 font-heading text-lg text-primary">Thank you for the feedback</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Clinic staff review every comment before anything is published on this page.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-border bg-background p-7">
      <h2 className="font-heading text-xl text-primary">Share your experience</h2>
      <p className="mt-1 text-sm text-muted-foreground">Comments are read by clinic staff and only published with their approval.</p>

      <div className="mt-4 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            aria-label={`${value} of 5`}
            className="p-1"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                value <= rating ? "fill-accent text-accent" : "text-border",
              )}
            />
          </button>
        ))}
      </div>

      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Your name (optional)"
        className="mt-4 h-11"
      />
      <Textarea
        value={comment}
        onChange={(event) => setComment(event.target.value.slice(0, 600))}
        placeholder="What was your experience like?"
        className="mt-3 min-h-24"
      />
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <Button type="submit" className="mt-4 rounded-full" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Send feedback
      </Button>
    </form>
  );
}