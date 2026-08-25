"use client";

import { useState } from "react";
import { EventForm, type EventFormValues } from "@/components/EventForm";
import type { CalendarEvent } from "@/types";

export function EventModal({
  event,
  defaultDate,
  onClose,
  onSave,
  onDelete,
}: {
  event: CalendarEvent | null;
  defaultDate?: Date;
  onClose: () => void;
  onSave: (values: EventFormValues, id?: string) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initial: Partial<CalendarEvent> | undefined = event
    ? event
    : defaultDate
    ? { start_time: defaultDate.toISOString(), end_time: new Date(defaultDate.getTime() + 60 * 60 * 1000).toISOString() }
    : undefined;

  async function handleSubmit(values: EventFormValues) {
    setSubmitting(true);
    try {
      await onSave(values, event?.id);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!event || !onDelete) return;
    setSubmitting(true);
    try {
      await onDelete(event.id);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-panel rounded-[28px] shadow-xl border border-black/5 p-7 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">{event ? "Edit post" : "New post"}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-foreground/60"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {confirmingDelete ? (
          <div className="space-y-4">
            <p className="text-sm text-foreground/80">
              Delete <strong>{event?.title}</strong>? This can&apos;t be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmingDelete(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground/70 hover:bg-black/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-60"
              >
                {submitting ? "Deleting…" : "Delete post"}
              </button>
            </div>
          </div>
        ) : (
          <EventForm
            initial={initial}
            onSubmit={handleSubmit}
            onCancel={onClose}
            onDelete={event && onDelete ? () => setConfirmingDelete(true) : undefined}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}
