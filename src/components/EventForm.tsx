"use client";

import { useState } from "react";
import { ColourPicker } from "@/components/ColourPicker";
import { toDatetimeLocalValue, fromDatetimeLocalValue } from "@/lib/calendar";
import { PLATFORM_DEFAULT_COLOUR, PLATFORMS } from "@/types";
import type { CalendarEvent, EventColour, Platform } from "@/types";
import { inputClass, primaryButtonClass, FormField } from "@/components/AuthShell";

export interface EventFormValues {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  platform: Platform;
  colour: EventColour;
}

export function EventForm({
  initial,
  onSubmit,
  onCancel,
  onDelete,
  submitting,
}: {
  initial?: Partial<CalendarEvent>;
  onSubmit: (values: EventFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
  submitting?: boolean;
}) {
  const now = new Date();
  const inHour = new Date(now.getTime() + 60 * 60 * 1000);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [platform, setPlatform] = useState<Platform>((initial?.platform as Platform) ?? "Instagram");
  const [colour, setColour] = useState<EventColour>(
    initial?.colour ?? PLATFORM_DEFAULT_COLOUR[(initial?.platform as Platform) ?? "Instagram"]
  );
  const [startTime, setStartTime] = useState(
    initial?.start_time ? toDatetimeLocalValue(initial.start_time) : toDatetimeLocalValue(now.toISOString())
  );
  const [endTime, setEndTime] = useState(
    initial?.end_time ? toDatetimeLocalValue(initial.end_time) : toDatetimeLocalValue(inHour.toISOString())
  );
  const [error, setError] = useState<string | null>(null);

  function handlePlatformChange(p: Platform) {
    setPlatform(p);
    // Only auto-set colour if the user hasn't customized it away from the previous default
    setColour((prev) => (prev === PLATFORM_DEFAULT_COLOUR[platform] ? PLATFORM_DEFAULT_COLOUR[p] : prev));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    const startIso = fromDatetimeLocalValue(startTime);
    const endIso = fromDatetimeLocalValue(endTime);
    if (new Date(endIso) <= new Date(startIso)) {
      setError("End time must be after start time.");
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      start_time: startIso,
      end_time: endIso,
      platform,
      colour,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">
          {error}
        </div>
      )}
      <FormField label="Title">
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Instagram Reel launch"
          required
        />
      </FormField>
      <FormField label="Description">
        <textarea
          className={inputClass}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional notes about this post…"
        />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Start">
          <input
            type="datetime-local"
            className={inputClass}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </FormField>
        <FormField label="End">
          <input
            type="datetime-local"
            className={inputClass}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </FormField>
      </div>
      <FormField label="Platform">
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePlatformChange(p)}
              className={
                "rounded-full px-3.5 py-1.5 text-xs font-semibold border transition " +
                (platform === p
                  ? "bg-accent text-white border-accent"
                  : "bg-white text-foreground/70 border-black/10 hover:border-accent/40")
              }
            >
              {p}
            </button>
          ))}
        </div>
      </FormField>
      <FormField label="Colour">
        <ColourPicker value={colour} onChange={setColour} />
      </FormField>

      <div className="flex items-center justify-between pt-2">
        <div>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              Delete
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground/70 hover:bg-black/5 transition"
          >
            Cancel
          </button>
          <button type="submit" disabled={submitting} className={primaryButtonClass + " w-auto"}>
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}
