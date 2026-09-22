"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/I18nProvider";
import { createClient } from "@/lib/supabase/client";

type Group = { id: string; name: string };

// Общая логика форм: показывает «занято», ошибку и обновляет страницу после успеха.
function useAction() {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<string | null>) {
    setBusy(true);
    setError(null);
    try {
      const err = await fn();
      if (err) setError(err);
      else router.refresh();
    } catch (e: any) {
      setError(e?.message ?? t.common.genericError);
    }
    setBusy(false);
  }

  return { busy, error, run };
}

function GroupSelect({ groups, allowAll = false }: { groups: Group[]; allowAll?: boolean }) {
  const t = useT();
  return (
    <select name="group_id" className="input" required={!allowAll} defaultValue="">
      {allowAll ? (
        <option value="">{t.common.allGroups}</option>
      ) : (
        <option value="" disabled>
          {t.common.chooseGroup}
        </option>
      )}
      {groups.map((g) => (
        <option key={g.id} value={g.id}>
          {g.name}
        </option>
      ))}
    </select>
  );
}

function Errors({ error }: { error: string | null }) {
  return error ? <p className="text-sm text-mark">{error}</p> : null;
}

const formClass = "space-y-3 border-y border-rule py-5";

export function GroupForm() {
  const F = useT().admin.forms;
  const { busy, error, run } = useAction();

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const name = String(new FormData(form).get("name") ?? "").trim();
        if (!name) return;
        run(async () => {
          const { error } = await createClient().from("groups").insert({ name });
          if (error) return error.message;
          form.reset();
          return null;
        });
      }}
    >
      <div className="min-w-48 flex-1">
        <label className="label" htmlFor="group-name">
          {F.newGroup}
        </label>
        <input
          id="group-name"
          name="name"
          className="input"
          placeholder={F.groupPlaceholder}
          required
        />
      </div>
      <button className="btn" disabled={busy}>
        {F.addGroup}
      </button>
      {error && <p className="w-full text-sm text-mark">{error}</p>}
    </form>
  );
}

export function LessonForm({ groups }: { groups: Group[] }) {
  const t = useT();
  const F = t.admin.forms;
  const { busy, error, run } = useAction();

  return (
    <form
      className={formClass}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        run(async () => {
          const fd = new FormData(form);
          const start = String(fd.get("starts_at") ?? "");
          if (!start) return F.errNoDate;
          const { error } = await createClient()
            .from("lessons")
            .insert({
              group_id: fd.get("group_id"),
              title: String(fd.get("title") ?? "").trim(),
              starts_at: new Date(start).toISOString(),
              meet_url: String(fd.get("meet_url") ?? "").trim() || null,
            });
          if (error) return error.message;
          form.reset();
          return null;
        });
      }}
    >
      <h2 className="font-medium">{F.addLessonTitle}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">{t.common.group}</label>
          <GroupSelect groups={groups} />
        </div>
        <div>
          <label className="label" htmlFor="l-title">
            {F.topic}
          </label>
          <input id="l-title" name="title" className="input" placeholder={F.topicPlaceholder} required />
        </div>
        <div>
          <label className="label" htmlFor="l-start">
            {F.dateTime}
          </label>
          <input id="l-start" name="starts_at" type="datetime-local" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="l-url">
            {F.meetLink}
          </label>
          <input
            id="l-url"
            name="meet_url"
            type="url"
            className="input"
            placeholder="https://meet.google.com/..."
          />
        </div>
      </div>
      <p className="text-sm text-muted">
        {F.meetHintBefore}
        <a
          href="https://meet.google.com/new"
          target="_blank"
          rel="noopener noreferrer"
          className="text-pen underline underline-offset-2"
        >
          meet.google.com/new
        </a>
        {F.meetHintAfter}
      </p>
      <Errors error={error} />
      <button className="btn" disabled={busy}>
        {busy ? F.saving : F.addLesson}
      </button>
    </form>
  );
}

export function AssignmentForm({ groups }: { groups: Group[] }) {
  const t = useT();
  const F = t.admin.forms;
  const { busy, error, run } = useAction();

  return (
    <form
      className={formClass}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        run(async () => {
          const fd = new FormData(form);
          const due = String(fd.get("due_at") ?? "");
          const { error } = await createClient()
            .from("assignments")
            .insert({
              group_id: fd.get("group_id"),
              title: String(fd.get("title") ?? "").trim(),
              description: String(fd.get("description") ?? "").trim() || null,
              due_at: due ? new Date(due).toISOString() : null,
            });
          if (error) return error.message;
          form.reset();
          return null;
        });
      }}
    >
      <h2 className="font-medium">{F.newAssignment}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">{t.common.group}</label>
          <GroupSelect groups={groups} />
        </div>
        <div>
          <label className="label" htmlFor="a-due">
            {F.dueOptional}
          </label>
          <input id="a-due" name="due_at" type="datetime-local" className="input" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="a-title">
          {F.name}
        </label>
        <input id="a-title" name="title" className="input" placeholder={F.namePlaceholder} required />
      </div>
      <div>
        <label className="label" htmlFor="a-desc">
          {F.description}
        </label>
        <textarea id="a-desc" name="description" className="input" />
      </div>
      <Errors error={error} />
      <button className="btn" disabled={busy}>
        {busy ? F.saving : F.addAssignment}
      </button>
    </form>
  );
}

export function AnnouncementForm({ groups }: { groups: Group[] }) {
  const F = useT().admin.forms;
  const { busy, error, run } = useAction();

  return (
    <form
      className={formClass}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        run(async () => {
          const fd = new FormData(form);
          const { error } = await createClient()
            .from("announcements")
            .insert({
              group_id: String(fd.get("group_id") ?? "") || null,
              body: String(fd.get("body") ?? "").trim(),
            });
          if (error) return error.message;
          form.reset();
          return null;
        });
      }}
    >
      <h2 className="font-medium">{F.newAnnouncement}</h2>
      <div>
        <label className="label">{F.to}</label>
        <GroupSelect groups={groups} allowAll />
      </div>
      <div>
        <label className="label" htmlFor="n-body">
          {F.text}
        </label>
        <textarea id="n-body" name="body" className="input" required />
      </div>
      <Errors error={error} />
      <button className="btn" disabled={busy}>
        {busy ? F.publishing : F.publish}
      </button>
    </form>
  );
}

export function MaterialForm({ groups }: { groups: Group[] }) {
  const t = useT();
  const F = t.admin.forms;
  const { busy, error, run } = useAction();
  const [kind, setKind] = useState("book");

  return (
    <form
      className={formClass}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        run(async () => {
          const fd = new FormData(form);
          const supabase = createClient();
          const groupId = String(fd.get("group_id") ?? "");
          const title = String(fd.get("title") ?? "").trim();

          let file_path: string | null = null;
          let url: string | null = null;

          if (kind === "video") {
            url = String(fd.get("url") ?? "").trim();
            if (!url) return F.errVideo;
          } else {
            const file = fd.get("file") as File | null;
            if (!file || file.size === 0) return F.errFile;
            // Имя файла в хранилище только латиницей, настоящее название хранится в базе.
            const ext =
              (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
            file_path = `${groupId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
            const { error: upErr } = await supabase.storage
              .from("materials")
              .upload(file_path, file, { contentType: file.type || undefined, upsert: false });
            if (upErr) return upErr.message;
          }

          const { error } = await supabase
            .from("materials")
            .insert({ group_id: groupId, title, kind, file_path, url });
          if (error) return error.message;
          form.reset();
          setKind("book");
          return null;
        });
      }}
    >
      <h2 className="font-medium">{F.addMaterialTitle}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">{t.common.group}</label>
          <GroupSelect groups={groups} />
        </div>
        <div>
          <label className="label" htmlFor="m-kind">
            {F.type}
          </label>
          <select
            id="m-kind"
            name="kind"
            className="input"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="book">{F.kindBook}</option>
            <option value="presentation">{F.kindPresentation}</option>
            <option value="video">{F.kindVideo}</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="m-title">
          {F.name}
        </label>
        <input id="m-title" name="title" className="input" required />
      </div>
      {kind === "video" ? (
        <div>
          <label className="label" htmlFor="m-url">
            {F.videoUrlLabel}
          </label>
          <input id="m-url" name="url" type="url" className="input" placeholder="https://..." />
        </div>
      ) : (
        <div>
          <label className="label" htmlFor="m-file">
            {F.fileLabel}
          </label>
          <input id="m-file" name="file" type="file" className="input" />
        </div>
      )}
      <Errors error={error} />
      <button className="btn" disabled={busy}>
        {busy ? F.uploading : F.addMaterial}
      </button>
    </form>
  );
}
