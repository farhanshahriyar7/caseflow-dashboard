import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  Stethoscope,
  UserRound,
  Settings2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CaseIntakeDialog } from "@/components/case-intake-dialog";
import { useCaseDeskLanguage } from "@/lib/case-desk-language";
import { useCaseDeskWorkspace } from "@/lib/case-desk-workspace";
import { cn } from "@/lib/utils";

type WorkspacePath = "/" | "/cases" | "/follow-ups" | "/notes";

const SIDEBAR_STORAGE_KEY = "case-desk:sidebar-collapsed";

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
    setDialogOpen,
    saveCase,
  } = useCaseDeskWorkspace();

  const [collapsed, setCollapsed] = useState(false);

  // Sync persisted desktop collapse state after mount to keep SSR markup deterministic.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true") {
        setCollapsed(true);
      }
    } catch {
      // Ignore storage access errors in restricted preview contexts.
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage access errors in restricted preview contexts.
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "b"
      ) {
        const target = event.target as HTMLElement | null;
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target?.isContentEditable
        ) {
          return;
        }
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const toggleLabel = collapsed ? t("Expand sidebar") : t("Collapse sidebar");

  return (
    <TooltipProvider delayDuration={200}>
      <div className="dashboard-canvas min-h-screen text-foreground">
        <div className="mx-auto flex min-h-screen max-w-[1680px]">
          <aside
            id="case-desk-sidebar"
            data-collapsed={collapsed}
            className={cn(
              "hidden shrink-0 flex-col overflow-x-hidden overflow-y-auto border-r border-sidebar-border bg-sidebar/95 py-5 transition-[width,padding] duration-200 ease-out lg:sticky lg:top-0 lg:flex lg:h-screen",
              collapsed ? "w-18 px-3" : "w-64 px-4",
            )}
          >
            <Brand collapsed={collapsed} />

            {collapsed ? (
              <div className="my-5 border-t border-sidebar-border" aria-hidden="true" />
            ) : (
              <div className="mt-10 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {t("Workspace")}
              </div>
            )}

            <nav
              className={cn("flex flex-col gap-1", collapsed ? "items-center" : "mt-3")}
              aria-label={t("Main navigation")}
            >
              {navigation.map((item) => (
                <WorkspaceNavLink
                  key={item.href}
                  {...item}
                  active={pathname === item.href}
                  collapsed={collapsed}
                />
              ))}
            </nav>

            <div className="mt-auto space-y-4 pt-6">
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      tabIndex={0}
                      role="note"
                      aria-label={`${t("Local preview")} — ${t("Sample records reset when this page reloads.")}`}
                      className="mx-auto flex size-10 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <span className="size-2.5 rounded-full bg-success" aria-hidden="true" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8} className="max-w-56">
                    <p className="font-semibold">{t("Local preview")}</p>
                    <p className="mt-0.5 text-[11px] opacity-90">
                      {t("Sample records reset when this page reloads.")}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : (
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
              )}

              <div className="border-t border-sidebar-border pt-4">
                <SidebarTooltip
                  label={t(profile.displayName)}
                  detail={t(profile.practiceName)}
                  enabled={collapsed}
                >
                  <Link
                    to="/profile"
                    className={cn(
                      "flex items-center rounded-md text-left transition-colors hover:bg-sidebar-accent/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      collapsed ? "mx-auto size-10 justify-center p-0" : "gap-3 px-2 py-1.5",
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {initials(profile.displayName)}
                    </span>
                    <span className={collapsed ? "sr-only" : "min-w-0"}>
                      <span className="block truncate text-sm font-medium">{t(profile.displayName)}</span>
                      <span className="block truncate text-xs text-muted-foreground">{t(profile.practiceName)}</span>
                    </span>
                  </Link>
                </SidebarTooltip>
              </div>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-20 border-b border-border/80 bg-card/95 px-4 py-3 backdrop-blur sm:px-7 lg:px-9">
              <div className="flex items-center gap-3 lg:hidden">
                <Brand compact />
                <LocalDemoBadge className="ml-auto" />
              </div>
              <div className="mt-3 flex items-center gap-2 lg:mt-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={toggleSidebar}
                      aria-expanded={!collapsed}
                      aria-controls="case-desk-sidebar"
                      aria-label={toggleLabel}
                      className="hidden text-muted-foreground hover:text-foreground lg:inline-flex"
                    >
                      {collapsed ? (
                        <PanelLeftOpen aria-hidden="true" />
                      ) : (
                        <PanelLeftClose aria-hidden="true" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start">
                    {toggleLabel} (Ctrl+B)
                  </TooltipContent>
                </Tooltip>

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
                  <LocalDemoBadge className="hidden lg:inline-flex" />
                </div>
              </div>
              <nav className="mt-3 flex gap-1 overflow-x-auto pb-0.5 lg:hidden" aria-label={t("Main navigation")}>
                {navigation.map((item) => (
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
    </TooltipProvider>
  );
}

function LocalDemoBadge({ className }: { className?: string }) {
  const { t } = useCaseDeskLanguage();
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 whitespace-nowrap border-primary/20 bg-primary/5 text-primary", className)}
    >
      <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
      {t("Local demo")}
    </Badge>
  );
}

function SidebarTooltip({
  label,
  detail,
  enabled,
  children,
}: {
  label: string;
  detail?: string | undefined;
  enabled: boolean;
  children: ReactNode;
}) {
  if (!enabled) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8} className="max-w-56">
        <p className="font-medium">{label}</p>
        {detail && <p className="mt-0.5 text-[11px] opacity-90">{detail}</p>}
      </TooltipContent>
    </Tooltip>
  );
}

function Brand({
  compact = false,
  collapsed = false,
}: {
  compact?: boolean;
  collapsed?: boolean;
}) {
  const { t } = useCaseDeskLanguage();
  const iconOnly = !compact && collapsed;

  return (
    <SidebarTooltip
      label={t("Case Desk")}
      detail={t("Clinical workspace")}
      enabled={iconOnly}
    >
      <div
        className={cn(
          "flex min-w-0 items-center",
          iconOnly ? "justify-center px-0" : compact ? "gap-2.5" : "gap-2.5 px-2",
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Stethoscope className="size-4.5" aria-hidden="true" />
        </div>
        <div className={iconOnly ? "sr-only" : "min-w-0"}>
          <p className="truncate font-display text-base font-bold leading-tight">{t("Case Desk")}</p>
          {!compact && <p className="mt-0.5 text-[11px] text-muted-foreground">{t("Clinical workspace")}</p>}
        </div>
      </div>
    </SidebarTooltip>
  );
}

function WorkspaceNavLink({
  href,
  label,
  icon: Icon,
  active,
  compact = false,
  collapsed = false,
}: {
  href: WorkspacePath;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  compact?: boolean;
  collapsed?: boolean;
}) {
  const { t } = useCaseDeskLanguage();
  const iconOnly = !compact && collapsed;
  const translated = t(label);

  return (
    <SidebarTooltip label={translated} enabled={iconOnly}>
      <Button
        asChild
        type="button"
        variant={active ? "secondary" : "ghost"}
        className={cn(
          "h-10 shrink-0 text-sm",
          active ? "font-semibold text-foreground" : "text-muted-foreground",
          compact
            ? "h-9 gap-2 px-2.5 text-xs"
            : iconOnly
              ? "size-10 justify-center px-0"
              : "w-full justify-start gap-3 px-3",
        )}
      >
        <Link to={href} aria-current={active ? "page" : undefined}>
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          <span className={iconOnly ? "sr-only" : "whitespace-nowrap"}>{translated}</span>
        </Link>
      </Button>
    </SidebarTooltip>
  );
}