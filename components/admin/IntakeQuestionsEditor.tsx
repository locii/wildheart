"use client";

import { useState } from "react";
import { Plus, Pencil, Check, X, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { IntakeQuestion } from "@/lib/supabase/types";

type FieldType = IntakeQuestion["field_type"];

type Draft = {
  question: string;
  field_key: string;
  field_type: FieldType;
  required: boolean;
};

const emptyDraft = (): Draft => ({
  question: "",
  field_key: "",
  field_type: "textarea",
  required: false,
});

function toFieldKey(q: string) {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 40);
}

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Short text",
  textarea: "Long text",
  select: "Select",
  checkbox: "Checkbox",
};

function QuestionForm({
  draft,
  onChange,
  onSave,
  onCancel,
  saving,
  saveLabel,
  autoKey,
}: {
  draft: Draft;
  onChange: (d: Draft) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  saveLabel: string;
  autoKey?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Question</Label>
        <Input
          placeholder="e.g. What brings you to therapy?"
          value={draft.question}
          autoFocus
          onChange={(e) => {
            const q = e.target.value;
            onChange({
              ...draft,
              question: q,
              field_key: autoKey ? toFieldKey(q) : draft.field_key,
            });
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Field key</Label>
          <Input
            placeholder="e.g. reason_for_therapy"
            value={draft.field_key}
            onChange={(e) =>
              onChange({ ...draft, field_key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })
            }
            className="font-mono text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Field type</Label>
          <select
            value={draft.field_type}
            onChange={(e) => onChange({ ...draft, field_type: e.target.value as FieldType })}
            className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {(Object.keys(FIELD_TYPE_LABELS) as FieldType[]).map((t) => (
              <option key={t} value={t}>{FIELD_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={draft.required}
          onChange={(e) => onChange({ ...draft, required: e.target.checked })}
          className="rounded"
        />
        Required
      </label>
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          onClick={onSave}
          disabled={saving || !draft.question.trim() || !draft.field_key.trim()}
        >
          <Check className="h-3.5 w-3.5 mr-1.5" />{saving ? "Saving…" : saveLabel}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="h-3.5 w-3.5 mr-1.5" />Cancel
        </Button>
      </div>
    </div>
  );
}

export function IntakeQuestionsEditor({ initialQuestions }: { initialQuestions: IntakeQuestion[] }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft());
  const [adding, setAdding] = useState(false);
  const [addDraft, setAddDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/intake/questions");
    const { questions: data } = await res.json();
    setQuestions(data ?? []);
  }

  function startEdit(q: IntakeQuestion) {
    setEditingId(q.id);
    setEditDraft({ question: q.question, field_key: q.field_key, field_type: q.field_type, required: q.required });
    setAdding(false);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    await fetch(`/api/intake/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editDraft),
    });
    setEditingId(null);
    await load();
    setSaving(false);
  }

  async function toggleActive(q: IntakeQuestion) {
    await fetch(`/api/intake/questions/${q.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !q.is_active }),
    });
    await load();
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Delete this question?")) return;
    await fetch(`/api/intake/questions/${id}`, { method: "DELETE" });
    await load();
  }

  async function move(q: IntakeQuestion, dir: -1 | 1) {
    const idx = questions.findIndex((x) => x.id === q.id);
    const swap = questions[idx + dir];
    if (!swap) return;
    await Promise.all([
      fetch(`/api/intake/questions/${q.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: swap.sort_order }),
      }),
      fetch(`/api/intake/questions/${swap.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: q.sort_order }),
      }),
    ]);
    await load();
  }

  async function addQuestion() {
    setSaving(true);
    await fetch("/api/intake/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addDraft),
    });
    setAdding(false);
    setAddDraft(emptyDraft());
    await load();
    setSaving(false);
  }

  return (
    <div className="space-y-3">
      {questions.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No questions yet. Add one below to enable the intake form for new clients.
        </p>
      )}

      <div className="space-y-2">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className={`bg-card border rounded-xl px-4 py-3 transition-opacity ${q.is_active ? "" : "opacity-50"}`}
          >
            {editingId === q.id ? (
              <QuestionForm
                draft={editDraft}
                onChange={setEditDraft}
                onSave={() => saveEdit(q.id)}
                onCancel={() => setEditingId(null)}
                saving={saving}
                saveLabel="Save"
              />
            ) : (
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-0.5 pt-0.5 shrink-0">
                  <button
                    onClick={() => move(q, -1)}
                    disabled={idx === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-20"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => move(q, 1)}
                    disabled={idx === questions.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-20"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{q.question}</span>
                    {q.required && <Badge variant="outline" className="text-[10px] py-0">Required</Badge>}
                    {!q.is_active && <Badge variant="outline" className="text-[10px] py-0">Inactive</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <span className="font-mono">{q.field_key}</span>
                    <span className="mx-1.5 opacity-40">·</span>
                    {FIELD_TYPE_LABELS[q.field_type]}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => startEdit(q)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground"
                    onClick={() => toggleActive(q)}
                    title={q.is_active ? "Deactivate" : "Activate"}
                  >
                    {q.is_active ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    onClick={() => deleteQuestion(q.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <div className="bg-card border rounded-xl px-4 py-4">
          <p className="text-sm font-medium mb-3">New question</p>
          <QuestionForm
            draft={addDraft}
            onChange={setAddDraft}
            onSave={addQuestion}
            onCancel={() => { setAdding(false); setAddDraft(emptyDraft()); }}
            saving={saving}
            saveLabel="Add question"
            autoKey
          />
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => { setAdding(true); setEditingId(null); }}>
          <Plus className="h-4 w-4 mr-1.5" />Add question
        </Button>
      )}
    </div>
  );
}
