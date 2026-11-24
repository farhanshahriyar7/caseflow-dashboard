import { useMemo, useState, type ComponentType } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  Bell,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileText,
  LayoutDashboard,
  NotebookPen,
  Plus,
  Search,
  Stethoscope,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CaseIntakeDialog } from "@/components/case-intake-dialog";
import { demoCases, type CaseRecord } from "@/lib/case-taking";
import {
  CaseDeskLanguageProvider,
  useCaseDeskLanguage,
} from "@/lib/case-desk-language";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Case Desk | Patient case-taking workspace" },
      {
        name: "description",
        content: "Organize patient interviews, symptom notes, and follow-up visits in Case Desk.",
      },
      { property: "og:title", content: "Case Desk | Patient case-taking workspace" },
      {
        property: "og:description",
        content: "A structured workspace for patient interviews, symptom notes, and follow-up visits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type DashboardSection = "overview" | "cases" | "follow-ups" | "notes";
type CaseFilter = "all" | "open" | "due" | "reviewed";
type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

const navigation: { id: DashboardSection; label: string; icon: IconComponent }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "cases", label: "Patient cases", icon: ClipboardList },
  { id: "follow-ups", label: "Follow-ups", icon: CalendarClock },
  { id: "notes", label: "Clinical notes", icon: NotebookPen },
];

const pageCopy: Record<DashboardSection, { eyebrow: string; title: string; description: string }> = {
  overview: {
    eyebrow: "YOUR PRACTICE · TODAY",
    title: "Good morning, Dr. Rahman",
    description: "A clear view of your patient cases and the visits coming up.",
  },
  cases: {
    eyebrow: "PATIENT RECORDS",
    title: "Patient cases",
    description: "Every interview and follow-up, in one place.",
  },
  "follow-ups": {
    eyebrow: "VISIT PLANNER",
    title: "Follow-ups",
    description: "Keep upcoming conversations close at hand.",
  },
  notes: {
    eyebrow: "CASE JOURNAL",
    title: "Clinical notes",
    description: "Recent narratives and distinguishing symptoms from your cases.",
  },
};

function localToday(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function formatDate(
  value: string,
  language: "bn" | "en",
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
) {
  if (!value) return language === "bn" ? "নির্ধারিত নয়" : "Not scheduled";
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-US", options).format(date);
}

function getStatusClass(status: CaseRecord["status"]): string {
  if (status === "Follow-up due") return "border-warning/20 bg-warning/10 text-warning";
  if (status === "Reviewed") return "border-success/20 bg-success/10 text-success";
  return "border-primary/20 bg-primary/10 text-primary";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function Index() {
  return (
    <CaseDeskLanguageProvider>
      <CaseDeskDashboard />
    </CaseDeskLanguageProvider>
  );
}

function CaseDeskDashboard() {
  const { language, setLanguage, t } = useCaseDeskLanguage();
  const [records, setRecords] = useState<CaseRecord[]>(demoCases);
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");
  const [caseFilter, setCaseFilter] = useState<CaseFilter>("all");
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseRecord | null>(null);
  const [savedMessage, setSavedMessage] = useState("");
  const today = localToday();
  const page = pageCopy[activeSection];

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return records.filter((record) => {
      const matchesQuery = !normalizedQuery ||
        [record.fullName, record.patientId, record.summary, record.narrative, record.occupation]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      if (!matchesQuery) return false;
      if (activeSection === "follow-ups") return Boolean(record.followUpDate) && record.status !== "Reviewed";
      if (activeSection === "notes") return Boolean(record.narrative || record.summary);
      if (activeSection === "cases" && caseFilter === "open") return record.status === "In progress";
      if (activeSection === "cases" && caseFilter === "due") return record.status === "Follow-up due";
      if (activeSection === "cases" && caseFilter === "reviewed") return record.status === "Reviewed";
      return true;
    });
  }, [activeSection, caseFilter, query, records]);

  const followUpRecords = useMemo(
    () => records
      .filter((record) => record.followUpDate && record.status !== "Reviewed")
      .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate)),
    [records],
  );

  const startNewCase = () => {
    setEditingCase(null);
    setDialogOpen(true);
  };

  const openCase = (record: CaseRecord) => {
    setEditingCase(record);
    setDialogOpen(true);
  };

  const handleSave = (record: CaseRecord) => {
    const isExisting = records.some((current) => current.patientId === record.patientId);
    setRecords((current) =>
      isExisting
        ? current.map((item) => item.patientId === record.patientId ? record : item)
        : [record, ...current],
    );
    setSavedMessage(`${record.fullName} ${isExisting ? t("updated in this preview.") : t("added in this preview.")}`);
    setActiveSection("cases");
  };

  const todayVisits = followUpRecords.filter((record) => record.followUpDate <= today);
  const activeCount = records.filter((record) => record.status !== "Reviewed").length;
  const writtenNotesCount = records.filter((record) => record.summary.trim() || record.narrative.trim()).length;
  const visitDate = new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="dashboard-canvas min-h-screen text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        <aside className="hidden w-62 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/95 px-4 py-5 lg:flex">
          <Brand />
          <div className="mt-10 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {t("Workspace")}
          </div>
          <nav className="mt-3 flex flex-col gap-1" aria-label={t("Main navigation")}>
            {navigation.map((item) => (
              <NavigationButton
                key={item.id}
                item={item}
                active={activeSection === item.id}
                onClick={() => setActiveSection(item.id)}
                count={item.id === "follow-ups" ? String(todayVisits.length).padStart(2, "0") : undefined}
              />
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="rounded-md border border-sidebar-border bg-sidebar-accent/70 p-3">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-success" />
                <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("Local preview")}
                </p>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {t("Sample records reset when this page reloads.")}
              </p>
            </div>
            <div className="flex items-center gap-3 border-t border-sidebar-border px-2 pt-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                DR
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t("Dr. Rahman")}</p>
                <p className="truncate text-xs text-muted-foreground">{t("Clinic workspace")}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-border/80 bg-card/95 px-4 py-3 backdrop-blur sm:px-7 lg:px-9">
            <div className="flex items-center gap-3 lg:hidden">
              <Brand compact />
              <Button type="button" className="ml-auto" onClick={startNewCase}>
                <Plus aria-hidden="true" /> {t("New case")}
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-3 lg:mt-0">
              <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  aria-label={t("Search patients and notes")}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("Search patients, notes, or ID…")}
                  className="h-10 border-transparent bg-muted/70 pl-9 shadow-none focus-visible:border-input"
                />
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <div className="flex items-center rounded-md border border-border p-0.5" role="group" aria-label={t("Language")}>
                  <Button
                    type="button"
                    size="sm"
                    variant={language === "bn" ? "secondary" : "ghost"}
                    aria-pressed={language === "bn"}
                    onClick={() => setLanguage("bn")}
                    className="h-8 px-2 text-xs"
                  >
                    বাংলা
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={language === "en" ? "secondary" : "ghost"}
                    aria-pressed={language === "en"}
                    onClick={() => setLanguage("en")}
                    className="h-8 px-2 text-xs"
                  >
                    English
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t("Open follow-ups")}
                  title={t("Open follow-ups")}
                  onClick={() => setActiveSection("follow-ups")}
                  className="relative"
                >
                  <Bell aria-hidden="true" />
                  {todayVisits.length > 0 && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />}
                </Button>
                <div className="hidden items-center gap-2 border-l border-border pl-3 sm:flex">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    DR
                  </div>
                  <span className="text-sm font-medium">{t("Dr. Rahman")}</span>
                </div>
                <Button type="button" className="hidden sm:inline-flex" onClick={startNewCase}>
                  <Plus aria-hidden="true" /> {t("New case")}
                </Button>
              </div>
            </div>
            <nav className="mt-3 flex gap-1 overflow-x-auto pb-0.5 lg:hidden" aria-label={t("Main navigation")}>
              {navigation.map((item) => (
                <NavigationButton
                  key={item.id}
                  item={item}
                  active={activeSection === item.id}
                  onClick={() => setActiveSection(item.id)}
                  compact
                />
              ))}
            </nav>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-7 sm:py-8 lg:px-9 lg:py-9">
            <div className="mx-auto max-w-360">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                    {activeSection === "overview" ? visitDate : t(page.eyebrow)}
                  </p>
                  <h1 className="mt-2 font-display text-2xl font-semibold leading-tight sm:text-3xl">
                    {t(page.title)}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {activeSection === "overview" ? t("Your practice, at a glance.") : t(page.description)}
                  </p>
                </div>
                {activeSection !== "overview" && (
                  <Badge variant="outline" className="gap-1.5 border-primary/20 bg-primary/5 text-primary">
                  <span className="size-1.5 rounded-full bg-primary" /> {t("Local demo")}
                  </Badge>
                )}
              </div>

              {savedMessage && (
                <div
                  role="status"
                  className="mt-5 flex flex-wrap items-center gap-2 rounded-md border border-success/20 bg-success/10 px-4 py-3 text-sm text-success"
                >
                  <Check className="size-4 shrink-0" aria-hidden="true" />
                  <span>{savedMessage}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-7 text-success hover:bg-success/10 hover:text-success"
                    onClick={() => setSavedMessage("")}
                  >
                    {t("Dismiss")}
                  </Button>
                </div>
              )}

              {activeSection === "overview" && (
                <OverviewSection
                  records={records}
                  dueRecords={todayVisits}
                  activeCount={activeCount}
                  writtenNotesCount={writtenNotesCount}
                  query={query}
                  onOpenCase={openCase}
                  onViewAll={() => setActiveSection("cases")}
                  onViewFollowUps={() => setActiveSection("follow-ups")}
                />
              )}
              {activeSection === "cases" && (
                <CasesSection
                  records={filteredRecords}
                  totalCount={records.length}
                  filter={caseFilter}
                  onFilterChange={setCaseFilter}
                  onOpenCase={openCase}
                  onNewCase={startNewCase}
                />
              )}
              {activeSection === "follow-ups" && (
                <FollowUpsSection
                  records={filteredRecords}
                  today={today}
                  onOpenCase={openCase}
                  onNewCase={startNewCase}
                />
              )}
              {activeSection === "notes" && (
                <NotesSection records={filteredRecords} onOpenCase={openCase} />
              )}

              <footer className="mt-9 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4 text-xs text-muted-foreground">
                <span>{t("Case Desk · Patient interviews and follow-up")}</span>
                <span className="font-mono">{t("LOCAL PREVIEW · NOT CONNECTED")}</span>
              </footer>
            </div>
          </main>
        </div>
      </div>

      <CaseIntakeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialCase={editingCase}
        sequence={records.length + 40}
        onSave={handleSave}
      />
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  const { t } = useCaseDeskLanguage();
  return (
    <div className={`flex min-w-0 items-center gap-2.5 ${compact ? "" : "px-2"}`}>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Stethoscope className="size-4.5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-base font-bold leading-tight">{t("Case Desk")}</p>
        {!compact && <p className="mt-0.5 text-[11px] text-muted-foreground">{t("Clinical workspace")}</p>}
      </div>
    </div>
  );
}

function NavigationButton({
  item,
  active,
  onClick,
  count,
  compact = false,
}: {
  item: { id: DashboardSection; label: string; icon: IconComponent };
  active: boolean;
  onClick: () => void;
  count?: string | undefined;
  compact?: boolean;
}) {
  const { t } = useCaseDeskLanguage();
  const Icon = item.icon;
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`h-10 shrink-0 justify-start gap-3 px-3 text-sm ${active ? "font-semibold text-foreground" : "text-muted-foreground"} ${compact ? "h-9 gap-2 px-2.5 text-xs" : "w-full"}`}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="whitespace-nowrap">{t(item.label)}</span>
      {count && !compact && (
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">{count}</span>
      )}
    </Button>
  );
}

function OverviewSection({
  records,
  dueRecords,
  activeCount,
  writtenNotesCount,
  query,
  onOpenCase,
  onViewAll,
  onViewFollowUps,
}: {
  records: CaseRecord[];
  dueRecords: CaseRecord[];
  activeCount: number;
  writtenNotesCount: number;
  query: string;
  onOpenCase: (record: CaseRecord) => void;
  onViewAll: () => void;
  onViewFollowUps: () => void;
}) {
  const { language, t } = useCaseDeskLanguage();
  return (
    <>
      <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label={t("Practice summary")}>
        <MetricCard label={t("Cases on file")} value={records.length} detail={t("Sample patient records")} icon={UsersRound} tone="primary" />
        <MetricCard label={t("Follow-ups due")} value={dueRecords.length} detail={t("Today or overdue")} icon={CalendarDays} tone="warning" />
        <MetricCard label={t("In progress")} value={activeCount} detail={t("Open case records")} icon={Activity} tone="success" />
        <MetricCard label={t("With written notes")} value={writtenNotesCount} detail={t("Narrative or summary added")} icon={FileText} tone="neutral" />
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.8fr)]">
        <section className="min-w-0 overflow-hidden rounded-md border border-border bg-card/95" aria-labelledby="recent-cases-heading">
          <SectionHeader
            eyebrow={t("CASE FILES")}
            title={t("Recent cases")}
            headingId="recent-cases-heading"
            description={t("The latest patient interviews in this workspace.")}
            actionLabel={t("All cases")}
            onAction={onViewAll}
          />
          {records.length > 0 ? (
            <CaseTable records={records.slice(0, 5)} query={query} onOpenCase={onOpenCase} />
          ) : (
            <EmptyState icon={Search} title={t("No cases found")} description={t("Try another search, or start a new case.")} />
          )}
        </section>

        <section className="min-w-0 overflow-hidden rounded-md border border-border bg-card/95" aria-labelledby="today-followups-heading">
          <SectionHeader
            eyebrow={t("RETURN VISITS")}
            title={t("Follow-ups to review")}
            headingId="today-followups-heading"
            description={t("Scheduled today or awaiting a check-in.")}
            actionLabel={t("View all")}
            onAction={onViewFollowUps}
          />
          {dueRecords.length > 0 ? (
            <div className="divide-y divide-border px-5">
              {dueRecords.slice(0, 3).map((record) => (
                <button
                  type="button"
                  key={record.patientId}
                  onClick={() => onOpenCase(record)}
                  className="flex w-full items-center gap-3 py-4 text-left transition-colors hover:text-primary"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                    {getInitials(record.fullName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{record.fullName}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{record.summary || t("Follow-up visit")}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-[11px] font-semibold text-primary">{formatDate(record.followUpDate, language)}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{record.followUpDate < localToday() ? t("Past due") : t("Upcoming")}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState icon={CalendarDays} title={t("Nothing due right now")} description={t("New return visits will show here.")} />
          )}
          <div className="border-t border-border bg-muted/50 px-5 py-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
              <span>{dueRecords.length} {dueRecords.length === 1 ? t("visit to review") : t("visits to review")} · {t("sample data")}</span>
            </div>
          </div>
        </section>
      </div>
    </>
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

function SectionHeader({
  eyebrow,
  title,
  headingId,
  description,
  actionLabel,
  onAction,
}: {
  eyebrow: string;
  title: string;
  headingId?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
      <div className="min-w-0">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        <h2 className="mt-1 text-base font-semibold" id={headingId}>{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button type="button" variant="ghost" size="sm" onClick={onAction} className="shrink-0 gap-1.5 text-xs">
          {actionLabel} <ChevronRight className="size-3.5" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

function CaseTable({
  records,
  query,
  onOpenCase,
}: {
  records: CaseRecord[];
  query: string;
  onOpenCase: (record: CaseRecord) => void;
}) {
  const { language, t } = useCaseDeskLanguage();
  if (records.length === 0) {
    return (
      <EmptyState
        icon={query ? Search : ClipboardList}
        title={query ? t("No cases match that search") : t("No patient cases yet")}
        description={query ? t("Try searching by name, case ID, or note.") : t("Start a new case to begin a patient record.")}
      />
    );
  }
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-160">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-5">{t("Patient")}</TableHead>
            <TableHead>{t("Key symptom")}</TableHead>
            <TableHead>{t("Last visit")}</TableHead>
            <TableHead>{t("Status")}</TableHead>
            <TableHead className="pr-5"><span className="sr-only">{t("Open case")}</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.patientId}>
              <TableCell className="pl-5">
                <button
                  type="button"
                  onClick={() => onOpenCase(record)}
                  className="flex min-w-0 items-center gap-3 text-left"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                    {getInitials(record.fullName)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground hover:text-primary">{record.fullName}</span>
                    <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">{record.patientId}</span>
                  </span>
                </button>
              </TableCell>
              <TableCell className="max-w-48 truncate text-xs text-muted-foreground">
                {record.symptoms[0]?.characteristic || record.summary || t("Not recorded")}
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                {formatDate(record.intakeDate, language)}
              </TableCell>
              <TableCell>
                <StatusBadge status={record.status} />
              </TableCell>
              <TableCell className="pr-5 text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`${t("Open case")} · ${record.fullName}`}
                  title={`${t("Open case")} · ${record.fullName}`}
                  onClick={() => onOpenCase(record)}
                >
                  <ArrowUpRight aria-hidden="true" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: CaseRecord["status"] }) {
  const { t } = useCaseDeskLanguage();
  return (
    <Badge variant="outline" className={`whitespace-nowrap text-[10px] font-medium ${getStatusClass(status)}`}>
      {t(status)}
    </Badge>
  );
}

function CasesSection({
  records,
  totalCount,
  filter,
  onFilterChange,
  onOpenCase,
  onNewCase,
}: {
  records: CaseRecord[];
  totalCount: number;
  filter: CaseFilter;
  onFilterChange: (filter: CaseFilter) => void;
  onOpenCase: (record: CaseRecord) => void;
  onNewCase: () => void;
}) {
  const { t } = useCaseDeskLanguage();
  const filters: { id: CaseFilter; label: string }[] = [
    { id: "all", label: `${t("All cases")} · ${totalCount}` },
    { id: "open", label: t("In progress") },
    { id: "due", label: t("Follow-up due") },
    { id: "reviewed", label: t("Reviewed") },
  ];
  return (
    <section className="mt-6 overflow-hidden rounded-md border border-border bg-card/95">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("Filter cases")}>
          {filters.map((option) => (
            <Button
              key={option.id}
              type="button"
              size="sm"
              variant={filter === option.id ? "secondary" : "ghost"}
              aria-pressed={filter === option.id}
              onClick={() => onFilterChange(option.id)}
              className="h-8 text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>
        <Button type="button" onClick={onNewCase}>
          <Plus aria-hidden="true" /> {t("Start a case")}
        </Button>
      </div>
      <CaseTable records={records} onOpenCase={onOpenCase} query="" />
    </section>
  );
}

function FollowUpsSection({
  records,
  today,
  onOpenCase,
  onNewCase,
}: {
  records: CaseRecord[];
  today: string;
  onOpenCase: (record: CaseRecord) => void;
  onNewCase: () => void;
}) {
  const { language, t } = useCaseDeskLanguage();
  const sortedRecords = [...records].sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));
  return (
    <section className="mt-6 overflow-hidden rounded-md border border-border bg-card/95">
      <SectionHeader
        eyebrow={t("RETURN VISITS")}
        title={t("Next conversations")}
        description={t("The sample schedule is sorted by date.")}
        actionLabel={t("New case")}
        onAction={onNewCase}
      />
      {sortedRecords.length > 0 ? (
        <div className="divide-y divide-border">
          {sortedRecords.map((record) => {
            const overdue = record.followUpDate < today;
            return (
              <button
                type="button"
                key={record.patientId}
                onClick={() => onOpenCase(record)}
                className="flex w-full flex-wrap items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50"
              >
                <span className={`flex size-12 shrink-0 flex-col items-center justify-center rounded-md ${overdue ? "bg-warning/10 text-warning" : "bg-accent text-primary"}`}>
                  <span className="font-mono text-[9px] font-semibold uppercase">{formatDate(record.followUpDate, language, { month: "short" })}</span>
                  <span className="font-display text-lg font-semibold leading-none">{new Date(`${record.followUpDate}T12:00:00`).getDate()}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{record.fullName}</span>
                    {overdue && <Badge variant="outline" className="border-warning/20 bg-warning/10 text-[10px] text-warning">{t("Past due")}</Badge>}
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {record.summary || record.followUpNote || t("Follow-up visit")}
                  </span>
                </span>
                <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5" aria-hidden="true" /> {overdue ? t("Review") : t("Scheduled")}
                  <ChevronRight className="size-4" aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={CalendarDays} title={t("No follow-ups found")} description={t("Try clearing your search or add a return date to a case.")} />
      )}
    </section>
  );
}

function NotesSection({
  records,
  onOpenCase,
}: {
  records: CaseRecord[];
  onOpenCase: (record: CaseRecord) => void;
}) {
  const { language, t } = useCaseDeskLanguage();
  return (
    <section className="mt-6 overflow-hidden rounded-md border border-border bg-card/95">
      <SectionHeader
        eyebrow={t("RECENT ENTRIES")}
        title={t("Notes from the casebook")}
        description={t("Narratives and symptom summaries from recent interviews.")}
      />
      {records.length > 0 ? (
        <div className="divide-y divide-border">
          {records.map((record) => (
            <article key={record.patientId} className="flex flex-wrap items-start gap-4 px-5 py-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                <FileText className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h2 className="font-medium">{record.fullName}</h2>
                  <span className="font-mono text-[10px] text-muted-foreground">{record.patientId}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{formatDate(record.intakeDate, language)}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-foreground/90">{record.summary || record.narrative || t("No narrative recorded.")}</p>
                {record.symptoms.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {record.symptoms.slice(0, 3).map((symptom) => (
                      <Badge key={symptom.id} variant="secondary" className="gap-1.5 text-[10px]">
                        <span className="font-mono text-primary">{symptom.code}</span>
                        {symptom.characteristic || symptom.sensation || t("Symptom")}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button type="button" variant="outline" size="sm" className="ml-auto shrink-0" onClick={() => onOpenCase(record)}>
                {t("Open case")} <ChevronRight aria-hidden="true" />
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={NotebookPen} title={t("No notes match your search")} description={t("Search by patient, case ID, or a phrase from a note.")} />
      )}
    </section>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: IconComponent;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-5 py-9 text-center">
      <span className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}