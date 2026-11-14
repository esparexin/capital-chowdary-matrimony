"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Plus } from "lucide-react";
import type { AdminMarriageEventRecord } from "@/app/api/admin/events/route";
import type { ApiResponse } from "@/types/api-response";
import {
  AdminEventForm,
  DEFAULT_EVENT_FORM,
  toEventFormData,
  type EventFormData,
} from "@/components/admin/events/AdminEventForm";
import { AdminEventsList } from "@/components/admin/events/AdminEventsList";
import { saveMarriageEventWithMedia } from "@/components/admin/events/event-upload-helper";

interface AdminEventsManagerProps {
  initialEvents: AdminMarriageEventRecord[];
}

export function AdminEventsManager({ initialEvents }: AdminEventsManagerProps) {
  const [eventsList, setEventsList] = useState<AdminMarriageEventRecord[]>(initialEvents);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormData>(DEFAULT_EVENT_FORM);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [removeExistingCover, setRemoveExistingCover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({ ...DEFAULT_EVENT_FORM, sortOrder: (eventsList.length + 1) * 10 });
    setSelectedFiles([]);
    setCoverIndex(0);
    setCoverPreviewUrl(null);
    setRemoveExistingCover(false);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const openCreateForm = () => {
    resetForm();
    setFormData((prev) => ({ ...prev, sortOrder: (eventsList.length + 1) * 10 }));
    setIsFormOpen(true);
  };

  const openEditForm = (ev: AdminMarriageEventRecord) => {
    setEditingId(ev.id);
    setFormData(toEventFormData(ev));
    setSelectedFiles([]);
    setCoverIndex(0);
    setCoverPreviewUrl(ev.coverUrl);
    setRemoveExistingCover(false);
    setIsFormOpen(true);
  };

  const handleFilesSelected = (newFiles: File[]) => {
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setRemoveExistingCover(false);
  };

  const handleRemoveSelectedFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
    setCoverIndex((prev) => (prev === idx ? 0 : prev > idx ? prev - 1 : prev));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const isEditing = Boolean(editingId);
      const { event: savedEvent, additionalSummary } = await saveMarriageEventWithMedia({
        editingId,
        formData,
        selectedFiles,
        coverIndex,
        removeExistingCover,
      });

      if (isEditing) {
        setEventsList((prev) => prev.map((it) => (it.id === editingId ? savedEvent : it)));
      } else {
        setEventsList((prev) => [...prev, savedEvent]);
      }

      let successText = isEditing ? "Event updated successfully." : "Event created successfully.";
      if (additionalSummary && additionalSummary.succeeded > 0) {
        successText += ` ${additionalSummary.succeeded} additional photo(s) added to event gallery.`;
      }
      setSuccessMessage(successText);
      resetForm();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save marriage event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (ev: AdminMarriageEventRecord) => {
    const nextStatus = ev.status === "published" ? "draft" : "published";
    setActionLoadingId(ev.id);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/events/${ev.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const json = (await res.json()) as ApiResponse<AdminMarriageEventRecord>;
      if (!res.ok || !json.ok)
        throw new Error(!json.ok ? json.error.message : "Failed to toggle status.");

      setEventsList((prev) => prev.map((it) => (it.id === ev.id ? json.data : it)));
      setSuccessMessage(`Event set to ${nextStatus}.`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to toggle status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (ev: AdminMarriageEventRecord) => {
    if (!confirm(`Are you sure you want to delete event "${ev.titleEn}"?`)) return;

    setActionLoadingId(ev.id);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/events/${ev.id}`, { method: "DELETE" });
      const json = (await res.json()) as ApiResponse<{ deleted: boolean }>;
      if (!res.ok || !json.ok)
        throw new Error(!json.ok ? json.error.message : "Failed to delete event.");

      setEventsList((prev) => prev.filter((it) => it.id !== ev.id));
      setSuccessMessage("Event removed successfully.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete event.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" />
          <p className="flex-1 font-medium">{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 className="size-4 shrink-0" />
          <p className="flex-1 font-medium">{successMessage}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Marriage Events ({eventsList.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Upcoming and organized community marriage gatherings and muhurtham events.
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <Plus className="size-3.5" />
            Add Event
          </button>
        )}
      </div>

      {isFormOpen && (
        <AdminEventForm
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          selectedFiles={selectedFiles}
          coverIndex={coverIndex}
          coverPreviewUrl={coverPreviewUrl}
          removeExistingCover={removeExistingCover}
          onClearCover={() => {
            setSelectedFiles([]);
            setCoverPreviewUrl(null);
            setRemoveExistingCover(true);
          }}
          onSetCoverIndex={setCoverIndex}
          onRemoveSelectedFile={handleRemoveSelectedFile}
          onFilesSelected={handleFilesSelected}
          isSubmitting={isSubmitting}
          onClose={resetForm}
          onSubmit={handleFormSubmit}
        />
      )}

      <AdminEventsList
        eventsList={eventsList}
        actionLoadingId={actionLoadingId}
        onEdit={openEditForm}
        onToggleStatus={toggleStatus}
        onDelete={handleDelete}
      />
    </div>
  );
}
