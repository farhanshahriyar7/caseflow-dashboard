import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  NotebookPen,
  Plus,
  Stethoscope,
  UserRound,
  Settings2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CaseIntakeDialog } from "@/components/case-intake-dialog";
import { useCaseDeskLanguage } from "@/lib/case-desk-language";
import { useCaseDeskWorkspace } from "@/lib/case-desk-workspace";

type WorkspacePath = "/" | "/cases" | "/follow-ups" | "/notes";

const navigation = [
  { href: "/" as const, label: "Overview", icon: LayoutDashboard },
  { href: "/cases" as const, label: "Patient cases", icon: ClipboardList },
  { href: "/follow-ups" as const, label: "Follow-ups", icon: CalendarClock },
  { href: "/notes" as const, label: "Clinical notes", icon: NotebookPen },
];

function initials(value: string) {
  return value.split(" ").filter(Boolean).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase();
}

export function CaseDeskShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (router) => router.location.pathname });
  const { language, setLanguage, t } = useCaseDeskLanguage();
  const {
    records,
    dialogOpen,
    editingCase,
    savedNotice,
    profile,
    clearSavedNotice,
    startNewCase,
    openCase,
    setDialogOpen,
    saveCase,
  } = useCaseDeskWorkspace();

  const navItems = navigation.map((item) => ({ ...item, translated: t(item.label) }));

  return (
    <div className="dashboard-canvas min-h-screen text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/95 px-4 py-5 lg:flex">
          <Brand />
          <div className="mt-10 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {t("Workspace")}
          </div>
          <nav className="mt-3 flex flex-col gap-1" aria-label={t("Main navigation")}>
            {navItems.map((item) => (
              <WorkspaceNavLink key={item.href} {...item} active={pathname === item.href} />
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
            <Link to="/profile" className="flex items-center gap-3 border-t border-sidebar-border px-2 pt-4 text-left">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {initials(profile.displayName)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{t(profile.displayName)}</span>
                <span className="block truncate text-xs text-muted-foreground">{t(profile.practiceName)}</span>
              </span>
            </Link>
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
            <div className="mt-3 flex items-center gap-2 lg:mt-0">
              <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
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
                <Button asChild type="button" variant="ghost" size="icon" aria-label={t("Open follow-ups")} title={t("Open follow-ups")}>
                  <Link to="/follow-ups" className="relative">
                    <Bell aria-hidden="true" />
                    {records.some((record) => record.followUpDate && record.status !== "Reviewed") && (
                      <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" className="h-10 gap-2 px-2" aria-label={t("Open profile menu")}>
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                        {initials(profile.displayName)}
                      </span>
                      <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">{t(profile.displayName)}</span>
                      <ChevronDown className="hidden size-3.5 sm:block" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel className="truncate">{t(profile.displayName)}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile"><UserRound aria-hidden="true" /> {t("Profile")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings"><Settings2 aria-hidden="true" /> {t("Settings")}</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button type="button" className="hidden sm:inline-flex" onClick={startNewCase}>
                  <Plus aria-hidden="true" /> {t("New case")}
                </Button>
              </div>
            </div>
            <nav className="mt-3 flex gap-1 overflow-x-auto pb-0.5 lg:hidden" aria-label={t("Main navigation")}>
              {navItems.map((item) => (
                <WorkspaceNavLink key={item.href} {...item} active={pathname === item.href} compact />
              ))}
            </nav>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-7 sm:py-8 lg:px-9 lg:py-9">
            <div className="mx-auto max-w-360">
              {savedNotice && (
                <div role="status" className="mb-5 flex flex-wrap items-center gap-2 rounded-md border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
                  <span>{savedNotice.patientName} {t(savedNotice.updated ? "updated in this preview." : "added in this preview.")}</span>
                  <Button type="button" variant="ghost" size="sm" className="ml-auto h-7 text-success hover:bg-success/10 hover:text-success" onClick={clearSavedNotice}>
                    {t("Dismiss")}
                  </Button>
                </div>
              )}
              {children}
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
        onSave={saveCase}
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

function WorkspaceNavLink({
  href,
  label,
  icon: Icon,
  active,
  compact = false,
}: {
  href: WorkspacePath;
  label: string;
  translated: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  compact?: boolean;
}) {
  const { t } = useCaseDeskLanguage();
  return (
    <Button
      asChild
      type="button"
      variant={active ? "secondary" : "ghost"}
      className={`h-10 shrink-0 justify-start gap-3 px-3 text-sm ${active ? "font-semibold text-foreground" : "text-muted-foreground"} ${compact ? "h-9 gap-2 px-2.5 text-xs" : "w-full"}`}
    >
      <Link to={href} aria-current={active ? "page" : undefined}>
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span className="whitespace-nowrap">{t(label)}</span>
      </Link>
    </Button>
  );
}