import { Outlet, createFileRoute } from "@tanstack/react-router";

import { CaseDeskShell } from "@/components/case-desk-shell";
import { CaseDeskLanguageProvider } from "@/lib/case-desk-language";
import { CaseDeskWorkspaceProvider } from "@/lib/case-desk-workspace";

export const Route = createFileRoute("/_workspace")({
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  return (
    <CaseDeskLanguageProvider>
      <CaseDeskWorkspaceProvider>
        <CaseDeskShell>
          <Outlet />
        </CaseDeskShell>
      </CaseDeskWorkspaceProvider>
    </CaseDeskLanguageProvider>
  );
}