import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCaseDeskLanguage } from "@/lib/case-desk-language";
import {
  createEmptyCase,
  missingPatientProfileFields,
  type AgeUnit,
  type CaseRecord,
  type ClinicalNotes,
  type PatientProfile,
  type SymptomCode,
  type SymptomEntry,
} from "@/lib/case-taking";

const steps = [
  { value: "profile", label: "Patient", short: "Profile", number: "01" },
  { value: "narrative", label: "Narrative", short: "Story", number: "02" },
  { value: "symptoms", label: "Symptoms", short: "Symptoms", number: "03" },
  { value: "clinical", label: "Clinical", short: "Clinical", number: "04" },
  { value: "summary", label: "Summary", short: "Summary", number: "05" },
] as const;

const symptomCodes: SymptomCode[] = ["P", "Q", "R", "S", "K"];
const ageUnits: AgeUnit[] = ["Years", "Months", "Days"];

const clinicalFields: { key: keyof ClinicalNotes; label: string; prompt: string }[] = [
  { key: "generalities", label: "Generalities", prompt: "Time, temperature, weather, position, energy" },
  { key: "digestion", label: "Digestion", prompt: "Taste, appetite, cravings, thirst, digestion" },
  { key: "reproduction", label: "Reproductive health", prompt: "Cycle, timing, flow, or other notes" },
  { key: "sleep", label: "Sleep & dreams", prompt: "Sleep, waking, dreams, position, after sleep" },
  { key: "perspiration", label: "Perspiration & skin", prompt: "Location, timing, temperature, skin changes" },
  { key: "mental", label: "Mental state", prompt: "Mood, fears, stress, focus, emotional context" },
  { key: "history", label: "History & other", prompt: "Past history, family history, head-to-toe notes" },
];

type IntakeStep = (typeof steps)[number]["value"];

type CaseIntakeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCase: CaseRecord | null;
  sequence: number;
  onSave: (record: CaseRecord) => void;
};

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: boolean;
  description?: string;
  children: ReactNode;
};

function Field({ id, label, required, error, description, children }: FieldProps) {
  const { t } = useCaseDeskLanguage();
  return (
    <div className="min-w-0 space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </label>
      {children}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {error && <p className="text-xs font-medium text-destructive">{t("This field is required.")}</p>}
    </div>
  );
}

function localToday(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

export function CaseIntakeDialog({
  open,
  onOpenChange,
  initialCase,
  sequence,
  onSave,
}: CaseIntakeDialogProps) {
  const { t } = useCaseDeskLanguage();
  const [activeStep, setActiveStep] = useState<IntakeStep>("profile");
  const [form, setForm] = useState<CaseRecord>(() => initialCase ?? createEmptyCase(sequence, localToday()));
  const [showProfileErrors, setShowProfileErrors] = useState(false);
  const missingFields = missingPatientProfileFields(form);
  const isFirstStep = activeStep === "profile";
  const isLastStep = activeStep === "summary";

  useEffect(() => {
    if (!open) return;
    setForm(initialCase ?? createEmptyCase(sequence, localToday()));
    setActiveStep("profile");
    setShowProfileErrors(false);
  }, [initialCase, open, sequence]);

  const updateField = <K extends keyof CaseRecord>(field: K, value: CaseRecord[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateSymptom = (index: number, changes: Partial<SymptomEntry>) => {
    setForm((current) => ({
      ...current,
      symptoms: current.symptoms.map((symptom, rowIndex) =>
        rowIndex === index ? { ...symptom, ...changes } : symptom,
      ),
    }));
  };

  const updateClinicalNote = (key: keyof ClinicalNotes, value: string) => {
    setForm((current) => ({
      ...current,
      clinical: { ...current.clinical, [key]: value },
    }));
  };

  const handleNext = () => {
    if (isFirstStep && missingFields.length > 0) {
      setShowProfileErrors(true);
      return;
    }
    const currentIndex = steps.findIndex((step) => step.value === activeStep);
    const nextStep = steps[currentIndex + 1];
    if (nextStep) setActiveStep(nextStep.value);
  };

  const handleSave = () => {
    if (missingFields.length > 0) {
      setShowProfileErrors(true);
      setActiveStep("profile");
      return;
    }
    onSave(form);
    onOpenChange(false);
  };

  const addSymptom = () => {
    setForm((current) => ({
      ...current,
      symptoms: [
        ...current.symptoms,
        {
          id: `symptom-${Date.now()}`,
          code: "P",
          characteristic: "",
          sensation: "",
          location: "",
          modality: "",
          causeAndConcomitants: "",
        },
      ],
    }));
  };

  const removeSymptom = (id: string) => {
    setForm((current) => ({
      ...current,
      symptoms:
        current.symptoms.length > 1
          ? current.symptoms.filter((symptom) => symptom.id !== id)
          : current.symptoms,
    }));
  };

  const selectedSymptoms = form.symptoms.filter((symptom) =>
    [
      symptom.characteristic,
      symptom.sensation,
      symptom.location,
      symptom.modality,
      symptom.causeAndConcomitants,
    ].some((value) => value.trim()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100%-1rem)] max-w-5xl flex-col gap-0 overflow-hidden border-border bg-card p-0">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-5 text-left sm:px-7">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
              <UserRound className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="font-display text-xl font-semibold">
                  {initialCase ? t("Update case") : t("Start a new case")}
                </DialogTitle>
                <Badge variant="outline" className="font-mono text-[11px] font-medium">
                  {form.patientId}
                </Badge>
              </div>
              <DialogDescription className="mt-1">
                {t("Capture the patient’s story, symptoms, and next steps in one visit.")}
              </DialogDescription>
            </div>
          </div>
          <Tabs value={activeStep} onValueChange={(value) => setActiveStep(value as IntakeStep)}>
            <TabsList className="mt-5 grid h-auto w-full grid-cols-5 rounded-md bg-muted/80 p-1">
              {steps.map((step) => (
                <TabsTrigger
                  key={step.value}
                  value={step.value}
                  className="h-auto min-h-11 min-w-0 flex-col items-start justify-center gap-0.5 rounded px-2 py-1.5 text-left data-[state=active]:bg-card data-[state=active]:shadow-sm sm:flex-row sm:items-center sm:gap-2 sm:px-3"
                >
                  <span className="font-mono text-[10px] text-muted-foreground">{step.number}</span>
                  <span className="truncate text-[11px] sm:text-xs">{t(step.short)}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <Tabs value={activeStep} onValueChange={(value) => setActiveStep(value as IntakeStep)}>
            <TabsContent value="profile" className="mt-0 space-y-6">
              <SectionHeading
                eyebrow={t("01 / Patient profile")}
                title={t("Who are we meeting today?")}
                description={t("The profile details help identify and follow up on this case.")}
              />
              <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                <Field id="patientId" label={t("Patient ID")} required description={t("Generated automatically")}>
                  <Input id="patientId" value={form.patientId} readOnly className="bg-muted/60 font-mono" />
                </Field>
                <Field
                  id="fullName"
                  label={t("Patient name")}
                  required
                  error={showProfileErrors && missingFields.includes("fullName")}
                >
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                    placeholder={t("Full name")}
                    aria-invalid={showProfileErrors && missingFields.includes("fullName")}
                  />
                </Field>
                <Field
                  id="age"
                  label={t("Age")}
                  required
                  error={showProfileErrors && missingFields.includes("age")}
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2">
                    <Input
                      id="age"
                      type="number"
                      min="0"
                      value={form.age}
                      onChange={(event) => updateField("age", event.target.value)}
                      placeholder={t("Age")}
                      aria-invalid={showProfileErrors && missingFields.includes("age")}
                    />
                    <Select
                      value={form.ageUnit}
                      onValueChange={(value) =>
                        updateField("ageUnit", ageUnits.find((unit) => unit === value) ?? "Years")
                      }
                    >
                      <SelectTrigger aria-label={t("Age unit")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ageUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>{t(unit)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </Field>
                <Field
                  id="gender"
                  label={t("Gender")}
                  required
                  error={showProfileErrors && missingFields.includes("gender")}
                >
                  <Select value={form.gender} onValueChange={(value) => updateField("gender", value)}>
                    <SelectTrigger id="gender" aria-label={t("Gender")}>
                      <SelectValue placeholder={t("Choose gender")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Female">{t("Female")}</SelectItem>
                      <SelectItem value="Male">{t("Male")}</SelectItem>
                      <SelectItem value="Other">{t("Other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field
                  id="occupation"
                  label={t("Occupation")}
                  required
                  error={showProfileErrors && missingFields.includes("occupation")}
                >
                  <Input
                    id="occupation"
                    value={form.occupation}
                    onChange={(event) => updateField("occupation", event.target.value)}
                    placeholder={t("Occupation")}
                    aria-invalid={showProfileErrors && missingFields.includes("occupation")}
                  />
                </Field>
                <Field
                  id="phone"
                  label={t("Phone number")}
                  required
                  error={showProfileErrors && missingFields.includes("phone")}
                >
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    placeholder={t("Phone number")}
                    aria-invalid={showProfileErrors && missingFields.includes("phone")}
                  />
                </Field>
                <Field
                  id="address"
                  label={t("Home address")}
                  required
                  error={showProfileErrors && missingFields.includes("address")}
                  description={t("Current or permanent address")}
                >
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(event) => updateField("address", event.target.value)}
                    placeholder={t("Street, area, city")}
                    aria-invalid={showProfileErrors && missingFields.includes("address")}
                  />
                </Field>
                <Field
                  id="intakeDate"
                  label={t("Case-taking date")}
                  required
                  error={showProfileErrors && missingFields.includes("intakeDate")}
                >
                  <Input
                    id="intakeDate"
                    type="date"
                    value={form.intakeDate}
                    onChange={(event) => updateField("intakeDate", event.target.value)}
                    aria-invalid={showProfileErrors && missingFields.includes("intakeDate")}
                  />
                </Field>
              </div>
            </TabsContent>

            <TabsContent value="narrative" className="mt-0 space-y-6">
              <SectionHeading
                eyebrow={t("02 / Free narrative")}
                title={t("Let the patient tell the story.")}
                description={t("Record the patient’s own words before adding your observations.")}
              />
              <div className="space-y-5">
                <Field id="narrative" label={t("Patient’s own description")}>
                  <Textarea
                    id="narrative"
                    rows={6}
                    value={form.narrative}
                    onChange={(event) => updateField("narrative", event.target.value)}
                    placeholder={t("Write the patient’s description in their own words…")}
                    className="min-h-36 resize-y bg-background"
                  />
                </Field>
                <Field id="additionalNarrative" label={t("After asking “Anything else?”")}>
                  <Textarea
                    id="additionalNarrative"
                    rows={4}
                    value={form.additionalNarrative}
                    onChange={(event) => updateField("additionalNarrative", event.target.value)}
                    placeholder={t("Note anything added after a pause…")}
                    className="min-h-24 resize-y bg-background"
                  />
                </Field>
                <Field
                  id="questioningNote"
                  label={t("Questioning technique note")}
                  description={t("Keep a reminder about open questions and the interview approach.")}
                >
                  <Textarea
                    id="questioningNote"
                    rows={3}
                    value={form.questioningNote}
                    onChange={(event) => updateField("questioningNote", event.target.value)}
                    placeholder={t("Notes on how the patient was invited to describe the symptoms…")}
                    className="min-h-20 resize-y bg-background"
                  />
                </Field>
              </div>
            </TabsContent>

            <TabsContent value="symptoms" className="mt-0 space-y-6">
              <SectionHeading
                eyebrow={t("03 / Symptom analysis")}
                title={t("Shape each symptom into a clear record.")}
                description={t("Capture the characteristic, sensation, location, modalities, and cause or accompanying signs.")}
              />
              <div className="flex flex-wrap items-center gap-2">
                {symptomCodes.map((code) => (
                  <Badge key={code} variant="outline" className="h-7 min-w-8 justify-center font-mono">
                    {code}
                  </Badge>
                ))}
                <span className="text-xs text-muted-foreground">{t("Choose a code for each symptom entry.")}</span>
              </div>
              <div className="overflow-x-auto rounded-md border border-border bg-background">
                <Table className="min-w-[1120px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-24">{t("Code")}</TableHead>
                      <TableHead>{t("Key feature")}</TableHead>
                      <TableHead>{t("Sensation")}</TableHead>
                      <TableHead>{t("Location")}</TableHead>
                      <TableHead>{t("Modalities")}</TableHead>
                      <TableHead>{t("Cause, order & accompanying")}</TableHead>
                      <TableHead className="w-12"><span className="sr-only">{t("Actions")}</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.symptoms.map((symptom, index) => (
                      <TableRow key={symptom.id} className="align-top">
                        <TableCell className="px-2 py-3">
                          <Select
                            value={symptom.code}
                            onValueChange={(value) =>
                              updateSymptom(index, {
                                code: symptomCodes.find((code) => code === value) ?? "P",
                              })
                            }
                          >
                            <SelectTrigger aria-label={`${t("Symptom code")} ${index + 1}`} className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {symptomCodes.map((code) => (
                                <SelectItem key={code} value={code}>{code}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="px-2 py-3">
                          <Input
                            aria-label={`${t("Key feature")} ${index + 1}`}
                            value={symptom.characteristic}
                            onChange={(event) => updateSymptom(index, { characteristic: event.target.value })}
                            placeholder={t("Distinctive feature")}
                            className="min-w-36"
                          />
                        </TableCell>
                        <TableCell className="px-2 py-3">
                          <Input
                            aria-label={`${t("Sensation")} ${index + 1}`}
                            value={symptom.sensation}
                            onChange={(event) => updateSymptom(index, { sensation: event.target.value })}
                            placeholder={t("How it feels")}
                            className="min-w-36"
                          />
                        </TableCell>
                        <TableCell className="px-2 py-3">
                          <Input
                            aria-label={`${t("Location")} ${index + 1}`}
                            value={symptom.location}
                            onChange={(event) => updateSymptom(index, { location: event.target.value })}
                            placeholder={t("Part or side")}
                            className="min-w-36"
                          />
                        </TableCell>
                        <TableCell className="px-2 py-3">
                          <Input
                            aria-label={`${t("Modalities")} ${index + 1}`}
                            value={symptom.modality}
                            onChange={(event) => updateSymptom(index, { modality: event.target.value })}
                            placeholder={t("Better / worse")}
                            className="min-w-40"
                          />
                        </TableCell>
                        <TableCell className="px-2 py-3">
                          <Input
                            aria-label={`${t("Cause and accompanying signs")} ${index + 1}`}
                            value={symptom.causeAndConcomitants}
                            onChange={(event) =>
                              updateSymptom(index, { causeAndConcomitants: event.target.value })
                            }
                            placeholder={t("Onset, order, accompanying")}
                            className="min-w-48"
                          />
                        </TableCell>
                        <TableCell className="px-2 py-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title={t("Remove symptom")}
                            aria-label={`${t("Remove symptom")} ${index + 1}`}
                            disabled={form.symptoms.length === 1}
                            onClick={() => removeSymptom(symptom.id)}
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button type="button" variant="outline" onClick={addSymptom}>
                <Plus aria-hidden="true" /> {t("Add symptom")}
              </Button>
            </TabsContent>

            <TabsContent value="clinical" className="mt-0 space-y-6">
              <SectionHeading
                eyebrow={t("04 / Clinical sections")}
                title={t("Make room for the whole picture.")}
                description={t("Use the sections that are relevant to this visit; leave the rest blank.")}
              />
              <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
                {clinicalFields.map((field) => (
                  <Field key={field.key} id={`clinical-${field.key}`} label={t(field.label)}>
                    <Textarea
                      id={`clinical-${field.key}`}
                      rows={3}
                      value={form.clinical[field.key]}
                      onChange={(event) => updateClinicalNote(field.key, event.target.value)}
                      placeholder={t(field.prompt)}
                      className="min-h-24 resize-y bg-background"
                    />
                  </Field>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="summary" className="mt-0 space-y-6">
              <SectionHeading
                eyebrow={t("05 / Summary & follow-up")}
                title={t("Bring the visit to a close.")}
                description={t("Summarize the distinguishing symptoms, record the plan, and set a return date.")}
              />
              <div className="space-y-5">
                <Field id="summary" label={t("Selected symptom summary")}>
                  <Textarea
                    id="summary"
                    rows={4}
                    value={form.summary}
                    onChange={(event) => updateField("summary", event.target.value)}
                    placeholder={t("The most characteristic symptoms from this case…")}
                    className="min-h-28 resize-y bg-background"
                  />
                </Field>
                {selectedSymptoms.length > 0 && (
                  <div className="flex flex-wrap gap-2" aria-label={t("Symptoms selected for the summary")}>
                    {selectedSymptoms.map((symptom) => (
                      <Badge key={symptom.id} variant="secondary" className="gap-1.5 font-medium">
                        <span className="font-mono text-primary">{symptom.code}</span>
                        {symptom.characteristic || symptom.sensation || symptom.location || "Symptom"}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                  <Field id="medicine" label={t("Selected medicine")}>
                    <Input
                      id="medicine"
                      value={form.medicine}
                      onChange={(event) => updateField("medicine", event.target.value)}
                      placeholder={t("Medicine name")}
                    />
                  </Field>
                  <Field id="potency" label={t("Potency")}>
                    <Input
                      id="potency"
                      value={form.potency}
                      onChange={(event) => updateField("potency", event.target.value)}
                      placeholder={t("e.g. 30C")}
                    />
                  </Field>
                  <Field id="followUpDate" label={t("Next follow-up date")}>
                    <Input
                      id="followUpDate"
                      type="date"
                      value={form.followUpDate}
                      onChange={(event) => updateField("followUpDate", event.target.value)}
                    />
                  </Field>
                  <Field id="followUpNote" label={t("Follow-up note")}>
                    <Textarea
                      id="followUpNote"
                      rows={3}
                      value={form.followUpNote}
                      onChange={(event) => updateField("followUpNote", event.target.value)}
                      placeholder={t("What to observe or review next time…")}
                      className="min-h-20 resize-y bg-background"
                    />
                  </Field>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-border bg-card px-5 py-4 sm:px-7">
          {isFirstStep ? (
            <span className="text-xs text-muted-foreground">{t("Fields marked * are required.")}</span>
          ) : (
            <Button type="button" variant="outline" onClick={() => {
              const currentIndex = steps.findIndex((step) => step.value === activeStep);
              const previousStep = steps[currentIndex - 1];
              if (previousStep) setActiveStep(previousStep.value);
            }}>
              <ArrowLeft aria-hidden="true" /> {t("Back")}
            </Button>
          )}
          {showProfileErrors && missingFields.length > 0 && (
            <span role="alert" className="text-xs font-medium text-destructive">
              {t("Complete the required patient details to save.")}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("Cancel")}
            </Button>
            {isLastStep ? (
              <Button type="button" onClick={handleSave}>
                <Check aria-hidden="true" /> {initialCase ? t("Save changes") : t("Save case")}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                {t("Continue")} <ArrowRight aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  const { t } = useCaseDeskLanguage();
  return (
    <div className="max-w-2xl space-y-2">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
        {eyebrow}
      </p>
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}