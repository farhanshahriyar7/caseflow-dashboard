import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  NotebookPen,
  Search,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCaseDeskLanguage } from "@/lib/case-desk-language";
import { useCaseDeskWorkspace } from "@/lib/case-desk-workspace";
import type { CaseRecord } from "@/lib/case-taking";

type CaseFilter = "all" | "open" | "due" | "reviewed";
type IconComponent = typeof UsersRound;

function localToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(
  value: string,
  language: "bn" | "en",
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
) {
  if (!value) return language === "bn" ? "নির্ধারিত নয়" : "Not scheduled";
  return new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-US", options).format(new Date(`${value}T12:00:00`));
}

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase();
}

function getStatusClass(status: CaseRecord["status"]) {
  if (status === "Follow-up due") return "border-warning/20 bg-warning/10 text-warning";
  if (status === "Reviewed") return "border-success/20 bg-success/10 text-success";
  return "border-primary/20 bg-primary/10 text-primary";
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  const { t } = useCaseDeskLanguage();
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="min-w-0">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">{t(eyebrow)}</p>
        <h1 className="mt-2 font-display text-2xl font-semibold leading-tight sm:text-3xl">{t(title)}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t(description)}</p>
      </div>
      <Badge variant="outline" className="gap-1.5 border-primary/20 bg-primary/5 text-primary">
        <span className="size-1.5 rounded-full bg-primary" /> {t("Local demo")}
      </Badge>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  icon: IconComponent;
  tone: "primary" | "warning" | "success" | "neutral";
}) {
  const toneClass = {
    primary: "bg-accent text-primary",
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
    neutral: "bg-muted text-muted-foreground",
  }[tone];
  return (
    <Card className="rounded-md border-border bg-card/95 shadow-none">
      <CardContent className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold leading-none">{value}</p>
          <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{detail}</p>
        </div>
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-md ${toneClass}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: CaseRecord["status"] }) {
  const { t } = useCaseDeskLanguage();
  return <Badge variant="outline" className={`whitespace-nowrap text-[10px] font-medium ${getStatusClass(status)}`}>{t(status)}</Badge>;
}

function EmptyState({ icon: Icon, title, description }: { icon: IconComponent; title: string; description: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-5 py-9 text-center">
      <span className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground"><Icon className="size-4" aria-hidden="true" /></span>
      <h2 className="mt-3 text-sm font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}

function CaseTable({ records, query }: { records: CaseRecord[]; query: string }) {
  const { language, t } = useCaseDeskLanguage();
  const { openCase } = useCaseDeskWorkspace();
  if (records.length === 0) {
    return <EmptyState icon={query ? Search : UsersRound} title={query ? t("No cases match that search") : t("No patient cases yet")} description={query ? t("Try searching by name, case ID, or note.") : t("Start a new case to begin a patient record.")} />;
  }
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-160">
        <TableHeader><TableRow className="hover:bg-transparent">
          <TableHead className="pl-5">{t("Patient")}</TableHead>
          <TableHead>{t("Key symptom")}</TableHead>
          <TableHead>{t("Last visit")}</TableHead>
          <TableHead>{t("Status")}</TableHead>
          <TableHead className="pr-5"><span className="sr-only">{t("Open case")}</span></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.patientId}>
              <TableCell className="pl-5">
                <Button type="button" variant="ghost" onClick={() => openCase(record)} className="h-auto min-w-0 justify-start gap-3 px-0 py-1 text-left">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">{getInitials(record.fullName)}</span>
                  <span className="min-w-0"><span className="block truncate text-sm font-medium">{record.fullName}</span><span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">{record.patientId}</span></span>
                </Button>
              </TableCell>
              <TableCell className="max-w-48 truncate text-xs text-muted-foreground">{record.symptoms[0]?.characteristic || record.summary || t("Not recorded")}</TableCell>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(record.intakeDate, language)}</TableCell>
              <TableCell><StatusBadge status={record.status} /></TableCell>
              <TableCell className="pr-5 text-right">
                <Button type="button" variant="ghost" size="icon" aria-label={`${t("Open case")} · ${record.fullName}`} title={`${t("Open case")} · ${record.fullName}`} onClick={() => openCase(record)}><ArrowUpRight aria-hidden="true" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function OverviewPage() {
  const { language, t } = useCaseDeskLanguage();
  const { records } = useCaseDeskWorkspace();
  const today = localToday();
  const dueRecords = records.filter((record) => record.followUpDate && record.followUpDate <= today && record.status !== "Reviewed");
  const activeCount = records.filter((record) => record.status !== "Reviewed").length;
  const writtenNotesCount = records.filter((record) => record.summary.trim() || record.narrative.trim()).length;
  const dateLabel = new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date());

  return (
    <>
      <PageHeading eyebrow="YOUR PRACTICE · TODAY" title="Good morning, Dr. Rahman" description="Your practice, at a glance." />
      <p className="mt-6 font-mono text-xs text-muted-foreground">{dateLabel}</p>
      <section className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label={t("Practice summary")}>
        <MetricCard label={t("Cases on file")} value={records.length} detail={t("Sample patient records")} icon={UsersRound} tone="primary" />
        <MetricCard label={t("Follow-ups due")} value={dueRecords.length} detail={t("Today or overdue")} icon={CalendarDays} tone="warning" />
        <MetricCard label={t("In progress")} value={activeCount} detail={t("Open case records")} icon={Activity} tone="success" />
        <MetricCard label={t("With written notes")} value={writtenNotesCount} detail={t("Narrative or summary added")} icon={FileText} tone="neutral" />
      </section>
      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.8fr)]">
        <section className="min-w-0 overflow-hidden rounded-md border border-border bg-card/95" aria-labelledby="recent-cases-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div><p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary">{t("CASE FILES")}</p><h2 id="recent-cases-heading" className="mt-1 text-base font-semibold">{t("Recent cases")}</h2><p className="mt-1 text-xs text-muted-foreground">{t("The latest patient interviews in this workspace.")}</p></div>
            <Button asChild type="button" variant="ghost" size="sm" className="gap-1.5 text-xs"><Link to="/cases">{t("All cases")} <ChevronRight aria-hidden="true" /></Link></Button>
          </div>
          <CaseTable records={records.slice(0, 5)} query="" />
        </section>
        <section className="min-w-0 overflow-hidden rounded-md border border-border bg-card/95" aria-labelledby="today-followups-heading">
          <div className="border-b border-border px-5 py-4"><p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary">{t("RETURN VISITS")}</p><h2 id="today-followups-heading" className="mt-1 text-base font-semibold">{t("Follow-ups to review")}</h2><p className="mt-1 text-xs text-muted-foreground">{t("Scheduled today or awaiting a check-in.")}</p></div>
          {dueRecords.length > 0 ? <div className="divide-y divide-border px-5">{dueRecords.slice(0, 3).map((record) => <FollowUpRow key={record.patientId} record={record} today={today} />)}</div> : <EmptyState icon={CalendarDays} title={t("Nothing due right now")} description={t("New return visits will show here.")} />}
          <div className="border-t border-border bg-muted/50 px-5 py-4"><Button asChild type="button" variant="ghost" size="sm" className="gap-2 px-0 text-xs text-muted-foreground"><Link to="/follow-ups"><Clock3 className="size-3.5" aria-hidden="true" /> {dueRecords.length} {t(dueRecords.length === 1 ? "visit to review" : "visits to review")} · {t("sample data")}</Link></Button></div>
        </section>
      </div>
    </>
  );
}

function FollowUpRow({ record, today }: { record: CaseRecord; today: string }) {
  const { language, t } = useCaseDeskLanguage();
  const { openCase } = useCaseDeskWorkspace();
  return (
    <Button type="button" variant="ghost" onClick={() => openCase(record)} className="h-auto w-full justify-start gap-3 rounded-none px-0 py-4 text-left hover:text-primary">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{getInitials(record.fullName)}</span>
      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-foreground">{record.fullName}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{record.summary || t("Follow-up visit")}</span></span>
      <span className="shrink-0 text-right"><span className="block font-mono text-[11px] font-semibold text-primary">{formatDate(record.followUpDate, language)}</span><span className="mt-1 block text-[10px] text-muted-foreground">{record.followUpDate < today ? t("Past due") : t("Upcoming")}</span></span>
    </Button>
  );
}

export function CasesPage() {
  const { t } = useCaseDeskLanguage();
  const { records } = useCaseDeskWorkspace();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CaseFilter>("all");
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = records.filter((record) => {
    const matchesQuery = !normalizedQuery || [record.fullName, record.patientId, record.summary, record.narrative, record.occupation].join(" ").toLowerCase().includes(normalizedQuery);
    if (!matchesQuery) return false;
    if (filter === "open") return record.status === "In progress";
    if (filter === "due") return record.status === "Follow-up due";
    if (filter === "reviewed") return record.status === "Reviewed";
    return true;
  });
  const filters: { id: CaseFilter; label: string }[] = [
    { id: "all", label: `${t("All cases")} · ${records.length}` },
    { id: "open", label: t("In progress") },
    { id: "due", label: t("Follow-up due") },
    { id: "reviewed", label: t("Reviewed") },
  ];
  return (
    <>
      <PageHeading eyebrow="PATIENT RECORDS" title="Patient cases" description="Every interview and follow-up, in one place." />
      <section className="mt-6 overflow-hidden rounded-md border border-border bg-card/95">
        <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:px-5">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("Filter cases")}>
            {filters.map((option) => <Button key={option.id} type="button" size="sm" variant={filter === option.id ? "secondary" : "ghost"} aria-pressed={filter === option.id} onClick={() => setFilter(option.id)} className="h-8 text-xs">{option.label}</Button>)}
          </div>
          <div className="relative max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input aria-label={t("Search patients and notes")} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search patients, notes, or ID…")} className="h-10 border-transparent bg-muted/70 pl-9 shadow-none focus-visible:border-input" /></div>
        </div>
        <CaseTable records={filtered} query={query} />
      </section>
    </>
  );
}

export function FollowUpsPage() {
  const { language, t } = useCaseDeskLanguage();
  const { records } = useCaseDeskWorkspace();
  const today = localToday();
  const followUps = records.filter((record) => record.followUpDate && record.status !== "Reviewed").sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));
  return (
    <>
      <PageHeading eyebrow="VISIT PLANNER" title="Follow-ups" description="Keep upcoming conversations close at hand." />
      <section className="mt-6 overflow-hidden rounded-md border border-border bg-card/95">
        <div className="border-b border-border px-5 py-4"><p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary">{t("RETURN VISITS")}</p><h2 className="mt-1 text-base font-semibold">{t("Next conversations")}</h2><p className="mt-1 text-xs text-muted-foreground">{t("The sample schedule is sorted by date.")}</p></div>
        {followUps.length > 0 ? <div className="divide-y divide-border">{followUps.map((record) => <FollowUpScheduleRow key={record.patientId} record={record} today={today} language={language} />)}</div> : <EmptyState icon={CalendarDays} title={t("No follow-ups found")} description={t("Try clearing your search or add a return date to a case.")} />}
      </section>
    </>
  );
}

function FollowUpScheduleRow({ record, today, language }: { record: CaseRecord; today: string; language: "bn" | "en" }) {
  const { t } = useCaseDeskLanguage();
  const { openCase } = useCaseDeskWorkspace();
  const overdue = record.followUpDate < today;
  return (
    <Button type="button" variant="ghost" onClick={() => openCase(record)} className="h-auto w-full flex-wrap justify-start gap-4 rounded-none px-5 py-4 text-left hover:bg-muted/50">
      <span className={`flex size-12 shrink-0 flex-col items-center justify-center rounded-md ${overdue ? "bg-warning/10 text-warning" : "bg-accent text-primary"}`}><span className="font-mono text-[9px] font-semibold uppercase">{formatDate(record.followUpDate, language, { month: "short" })}</span><span className="font-display text-lg font-semibold leading-none">{new Date(`${record.followUpDate}T12:00:00`).getDate()}</span></span>
      <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="font-medium text-foreground">{record.fullName}</span>{overdue && <Badge variant="outline" className="border-warning/20 bg-warning/10 text-[10px] text-warning">{t("Past due")}</Badge>}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{record.summary || record.followUpNote || t("Follow-up visit")}</span></span>
      <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="size-3.5" aria-hidden="true" /> {overdue ? t("Review") : t("Scheduled")} <ChevronRight className="size-4" aria-hidden="true" /></span>
    </Button>
  );
}

export function NotesPage() {
  const { language, t } = useCaseDeskLanguage();
  const { records } = useCaseDeskWorkspace();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const notes = records.filter((record) => Boolean(record.narrative || record.summary)).filter((record) => !normalizedQuery || [record.fullName, record.patientId, record.summary, record.narrative].join(" ").toLowerCase().includes(normalizedQuery));
  return (
    <>
      <PageHeading eyebrow="CASE JOURNAL" title="Clinical notes" description="Recent narratives and distinguishing symptoms from your cases." />
      <section className="mt-6 overflow-hidden rounded-md border border-border bg-card/95">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4"><div><p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary">{t("RECENT ENTRIES")}</p><h2 className="mt-1 text-base font-semibold">{t("Notes from the casebook")}</h2><p className="mt-1 text-xs text-muted-foreground">{t("Narratives and symptom summaries from recent interviews.")}</p></div><div className="relative w-full max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input aria-label={t("Search patients and notes")} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search patients, notes, or ID…")} className="h-9 border-transparent bg-muted/70 pl-9 shadow-none" /></div></div>
        {notes.length > 0 ? <div className="divide-y divide-border">{notes.map((record) => <NoteRow key={record.patientId} record={record} language={language} />)}</div> : <EmptyState icon={NotebookPen} title={t("No notes match your search")} description={t("Search by patient, case ID, or a phrase from a note.")} />}
      </section>
    </>
  );
}

function NoteRow({ record, language }: { record: CaseRecord; language: "bn" | "en" }) {
  const { t } = useCaseDeskLanguage();
  const { openCase } = useCaseDeskWorkspace();
  return (
    <article className="flex flex-wrap items-start gap-4 px-5 py-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-primary"><FileText className="size-4" aria-hidden="true" /></div>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h2 className="font-medium">{record.fullName}</h2><span className="font-mono text-[10px] text-muted-foreground">{record.patientId}</span><span className="text-xs text-muted-foreground">·</span><span className="text-xs text-muted-foreground">{formatDate(record.intakeDate, language)}</span></div><p className="mt-2 text-sm leading-6 text-foreground/90">{record.summary || record.narrative || t("No narrative recorded.")}</p>{record.symptoms.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{record.symptoms.slice(0, 3).map((symptom) => <Badge key={symptom.id} variant="secondary" className="gap-1.5 text-[10px]"><span className="font-mono text-primary">{symptom.code}</span>{symptom.characteristic || symptom.sensation || t("Symptom")}</Badge>)}</div>}</div>
      <Button type="button" variant="outline" size="sm" className="ml-auto shrink-0" onClick={() => openCase(record)}>{t("Open case")} <ChevronRight aria-hidden="true" /></Button>
    </article>
  );
}

export function ProfilePage() {
  const { t } = useCaseDeskLanguage();
  const { profile, setProfile } = useCaseDeskWorkspace();
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);
  const update = (field: keyof typeof draft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfile(draft);
    setSaved(true);
  };
  return (
    <>
      <PageHeading eyebrow="PROFILE DETAILS" title="Profile" description="Keep your practitioner details current in this workspace." />
      <section className="mt-6 max-w-2xl border-y border-border bg-card/80 px-5 py-6 sm:px-7">
        <div className="mb-6 flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{getInitials(profile.displayName)}</span><div><h2 className="font-semibold">{t("Practitioner profile")}</h2><p className="mt-1 text-xs text-muted-foreground">{t("Profile changes are kept in this preview only.")}</p></div></div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <ProfileField id="displayName" label={t("Display name")} value={draft.displayName} onChange={(value) => update("displayName", value)} />
          <ProfileField id="practiceName" label={t("Practice name")} value={draft.practiceName} onChange={(value) => update("practiceName", value)} />
          <ProfileField id="profilePhone" label={t("Contact phone")} value={draft.phone} onChange={(value) => update("phone", value)} type="tel" />
          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4"><Button type="submit">{t("Save profile")}</Button>{saved && <p role="status" className="text-sm text-success">{t("Profile saved in this preview.")}</p>}</div>
        </form>
      </section>
    </>
  );
}

function ProfileField({ id, label, value, onChange, type = "text" }: { id: string; label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <div className="space-y-2"><label htmlFor={id} className="text-sm font-medium">{label}</label><Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

export function SettingsPage() {
  const { language, setLanguage, t } = useCaseDeskLanguage();
  return (
    <>
      <PageHeading eyebrow="WORKSPACE SETTINGS" title="Settings" description="Manage how Case Desk looks and reads." />
      <section className="mt-6 max-w-2xl border-y border-border bg-card/80 px-5 py-6 sm:px-7">
        <div className="flex items-start gap-3"><span className="flex size-10 items-center justify-center rounded-md bg-accent text-primary"><SettingsIcon /></span><div><h2 className="font-semibold">{t("Interface language")}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("Choose the language used across the dashboard and case form.")}</p></div></div>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label={t("Language")}>
          <Button type="button" variant={language === "bn" ? "secondary" : "outline"} aria-pressed={language === "bn"} onClick={() => setLanguage("bn")}>{t("Bangla")}</Button>
          <Button type="button" variant={language === "en" ? "secondary" : "outline"} aria-pressed={language === "en"} onClick={() => setLanguage("en")}>{t("English")}</Button>
        </div>
      </section>
      <p className="mt-4 text-xs text-muted-foreground">{t("Profile changes are kept in this preview only.")}</p>
    </>
  );
}

function SettingsIcon() {
  return <span className="font-mono text-sm font-semibold" aria-hidden="true">Aa</span>;
}