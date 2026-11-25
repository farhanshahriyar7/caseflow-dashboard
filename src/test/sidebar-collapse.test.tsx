import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { CasesPage, OverviewPage, ProfilePage } from "@/components/case-desk-pages";
import { CaseDeskShell } from "@/components/case-desk-shell";
import { CaseDeskLanguageProvider } from "@/lib/case-desk-language";
import { CaseDeskWorkspaceProvider } from "@/lib/case-desk-workspace";

async function renderWorkspace(initialPath = "/") {
  const rootRoute = createRootRoute({
    component: () => (
      <CaseDeskLanguageProvider>
        <CaseDeskWorkspaceProvider>
          <CaseDeskShell>
            <Outlet />
          </CaseDeskShell>
        </CaseDeskWorkspaceProvider>
      </CaseDeskLanguageProvider>
    ),
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: OverviewPage,
  });

  const casesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases",
    component: CasesPage,
  });

  const followUpsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/follow-ups",
    component: () => null,
  });

  const notesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/notes",
    component: () => null,
  });

  const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/profile",
    component: ProfilePage,
  });

  const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/settings",
    component: () => null,
  });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    casesRoute,
    followUpsRoute,
    notesRoute,
    profileRoute,
    settingsRoute,
  ]);

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
  await router.load();
  return render(<RouterProvider router={router} />);
}

describe("Case Desk collapsible sidebar", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("toggles collapsed state, updates aria and localized labels, and persists preference", async () => {
    await renderWorkspace();

    const sidebar = document.getElementById("case-desk-sidebar");
    expect(sidebar).not.toBeNull();
    expect(sidebar).toHaveAttribute("data-collapsed", "false");

    const collapseButton = screen.getByRole("button", { name: "সাইডবার সংকুচিত করুন" });
    expect(collapseButton).toHaveAttribute("aria-expanded", "true");
    expect(collapseButton).toHaveAttribute("aria-controls", "case-desk-sidebar");

    fireEvent.click(collapseButton);

    expect(sidebar).toHaveAttribute("data-collapsed", "true");
    expect(window.localStorage.getItem("case-desk:sidebar-collapsed")).toBe("true");

    const expandButton = screen.getByRole("button", { name: "সাইডবার প্রসারিত করুন" });
    expect(expandButton).toHaveAttribute("aria-expanded", "false");

    // Switching to English updates the sidebar toggle label.
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument();
  });

  it("toggles with Ctrl+B outside editable fields and restores persisted state", async () => {
    window.localStorage.setItem("case-desk:sidebar-collapsed", "true");
    await renderWorkspace("/cases");

    const sidebar = document.getElementById("case-desk-sidebar");
    expect(sidebar).toHaveAttribute("data-collapsed", "true");

    // Ctrl+B inside a search input should not accidentally toggle the sidebar.
    const searchInput = screen.getByLabelText("রোগী ও নোট খুঁজুন");
    fireEvent.keyDown(searchInput, { key: "b", ctrlKey: true });
    expect(sidebar).toHaveAttribute("data-collapsed", "true");

    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(sidebar).toHaveAttribute("data-collapsed", "false");
    expect(window.localStorage.getItem("case-desk:sidebar-collapsed")).toBe("false");
  });

  it("places Local demo badge in the top header and New case CTA in clinical page headings", async () => {
    await renderWorkspace("/");

    const header = document.querySelector("header");
    const main = document.querySelector("main");
    expect(header).not.toBeNull();
    expect(main).not.toBeNull();

    // Header holds the Local demo indicator and no New case button.
    expect(header?.textContent).toContain("স্থানীয় নমুনা");
    expect(header?.querySelectorAll("button").length).toBeGreaterThan(0);
    expect(header?.textContent).not.toContain("নতুন কেস");

    // Clinical page heading inside <main> renders the single New case CTA.
    const newCaseButtons = screen.getAllByRole("button", { name: "নতুন কেস" });
    expect(newCaseButtons).toHaveLength(1);
    expect(main).toContainElement(newCaseButtons[0]!);
    expect(main?.textContent).not.toContain("স্থানীয় নমুনা");

    cleanup();
    await renderWorkspace("/profile");
    expect(screen.queryByRole("button", { name: "নতুন কেস" })).not.toBeInTheDocument();
  });
});
