import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { demoCases, type CaseRecord } from "@/lib/case-taking";

export type PractitionerProfile = {
  displayName: string;
  practiceName: string;
  phone: string;
};

type SavedNotice = { patientName: string; updated: boolean };

type CaseDeskWorkspaceValue = {
  records: CaseRecord[];
  dialogOpen: boolean;
  editingCase: CaseRecord | null;
  savedNotice: SavedNotice | null;
  profile: PractitionerProfile;
  setProfile: Dispatch<SetStateAction<PractitionerProfile>>;
  clearSavedNotice: () => void;
  startNewCase: () => void;
  openCase: (record: CaseRecord) => void;
  setDialogOpen: (open: boolean) => void;
  saveCase: (record: CaseRecord) => void;
};

const CaseDeskWorkspaceContext = createContext<CaseDeskWorkspaceValue | null>(null);

export function CaseDeskWorkspaceProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<CaseRecord[]>(demoCases);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseRecord | null>(null);
  const [savedNotice, setSavedNotice] = useState<SavedNotice | null>(null);
  const [profile, setProfile] = useState<PractitionerProfile>({
    displayName: "Dr. Rahman",
    practiceName: "Clinic workspace",
    phone: "",
  });

  const startNewCase = () => {
    setEditingCase(null);
    setDialogOpen(true);
  };

  const openCase = (record: CaseRecord) => {
    setEditingCase(record);
    setDialogOpen(true);
  };

  const saveCase = (record: CaseRecord) => {
    const updated = records.some((current) => current.patientId === record.patientId);
    setRecords((current) =>
      updated
        ? current.map((item) => item.patientId === record.patientId ? record : item)
        : [record, ...current],
    );
    setSavedNotice({ patientName: record.fullName, updated });
  };

  return (
    <CaseDeskWorkspaceContext.Provider
      value={{
        records,
        dialogOpen,
        editingCase,
        savedNotice,
        profile,
        setProfile,
        clearSavedNotice: () => setSavedNotice(null),
        startNewCase,
        openCase,
        setDialogOpen,
        saveCase,
      }}
    >
      {children}
    </CaseDeskWorkspaceContext.Provider>
  );
}

export function useCaseDeskWorkspace() {
  const context = useContext(CaseDeskWorkspaceContext);
  if (!context) throw new Error("Case Desk workspace must be used within its provider.");
  return context;
}