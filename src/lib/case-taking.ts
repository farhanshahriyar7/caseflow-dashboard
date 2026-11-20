export type AgeUnit = "Years" | "Months" | "Days";

export type SymptomCode = "P" | "Q" | "R" | "S" | "K";

export type SymptomEntry = {
  id: string;
  code: SymptomCode;
  characteristic: string;
  sensation: string;
  location: string;
  modality: string;
  causeAndConcomitants: string;
};

export type ClinicalNotes = {
  generalities: string;
  digestion: string;
  reproduction: string;
  sleep: string;
  perspiration: string;
  mental: string;
  history: string;
};

export type PatientProfile = {
  patientId: string;
  fullName: string;
  age: string;
  ageUnit: AgeUnit;
  gender: string;
  occupation: string;
  address: string;
  phone: string;
  intakeDate: string;
};

export type CaseRecord = PatientProfile & {
  narrative: string;
  additionalNarrative: string;
  questioningNote: string;
  symptoms: SymptomEntry[];
  clinical: ClinicalNotes;
  summary: string;
  medicine: string;
  potency: string;
  followUpNote: string;
  followUpDate: string;
  status: "In progress" | "Follow-up due" | "Reviewed";
};

export const requiredProfileFields: (keyof PatientProfile)[] = [
  "patientId",
  "fullName",
  "age",
  "gender",
  "occupation",
  "address",
  "phone",
  "intakeDate",
];

export function createPatientId(sequence: number): string {
  const safeSequence = Math.max(1, Math.floor(sequence));
  return `PHC-2027-${String(safeSequence).padStart(4, "0")}`;
}

export function missingPatientProfileFields(
  profile: PatientProfile,
): (keyof PatientProfile)[] {
  return requiredProfileFields.filter((field) => !profile[field].trim());
}

export function createEmptyCase(sequence: number, intakeDate: string): CaseRecord {
  return {
    patientId: createPatientId(sequence),
    fullName: "",
    age: "",
    ageUnit: "Years",
    gender: "",
    occupation: "",
    address: "",
    phone: "",
    intakeDate,
    narrative: "",
    additionalNarrative: "",
    questioningNote: "",
    symptoms: [
      {
        id: "symptom-1",
        code: "P",
        characteristic: "",
        sensation: "",
        location: "",
        modality: "",
        causeAndConcomitants: "",
      },
    ],
    clinical: {
      generalities: "",
      digestion: "",
      reproduction: "",
      sleep: "",
      perspiration: "",
      mental: "",
      history: "",
    },
    summary: "",
    medicine: "",
    potency: "",
    followUpNote: "",
    followUpDate: "",
    status: "In progress",
  };
}

export const demoCases: CaseRecord[] = [
  {
    patientId: "PHC-2027-0042",
    fullName: "Tasnim Chowdhury",
    age: "29",
    ageUnit: "Years",
    gender: "Female",
    occupation: "Teacher",
    address: "Sample address · Dhaka",
    phone: "+880 1XXX-XXX-XXX",
    intakeDate: "2026-11-19",
    narrative: "A dull headache that begins after a long day and settles with rest.",
    additionalNarrative: "Feels most noticeable above the eyes.",
    questioningNote: "Allowed time for an open-ended description before follow-up prompts.",
    symptoms: [
      {
        id: "tasnim-headache",
        code: "P",
        characteristic: "Dull, pressing",
        sensation: "Heaviness",
        location: "Above both eyes",
        modality: "Worse after a long day; better with rest",
        causeAndConcomitants: "Follows prolonged screen use",
      },
    ],
    clinical: {
      generalities: "More noticeable late afternoon.",
      digestion: "Prefers warm drinks; thirst moderate.",
      reproduction: "No concerns shared today.",
      sleep: "Sleep is generally restful.",
      perspiration: "No unusual perspiration noted.",
      mental: "Calm; reports a busy work week.",
      history: "No additional history recorded.",
    },
    summary: "Pressing headache above both eyes, worse after screen use.",
    medicine: "Nux vomica",
    potency: "30C",
    followUpNote: "Review frequency and intensity at the next visit.",
    followUpDate: "2026-11-20",
    status: "Follow-up due",
  },
  {
    patientId: "PHC-2027-0041",
    fullName: "Arif Hossain",
    age: "44",
    ageUnit: "Years",
    gender: "Male",
    occupation: "Business owner",
    address: "Sample address · Dhaka",
    phone: "+880 1XXX-XXX-XXX",
    intakeDate: "2026-11-18",
    narrative: "A heavy feeling after meals with occasional belching.",
    additionalNarrative: "More noticeable after a late dinner.",
    questioningNote: "Open questions used throughout the interview.",
    symptoms: [
      {
        id: "arif-digestion",
        code: "Q",
        characteristic: "Heavy after meals",
        sensation: "Fullness",
        location: "Upper abdomen",
        modality: "Worse after late meals",
        causeAndConcomitants: "Occasional belching",
      },
    ],
    clinical: {
      generalities: "No general pattern recorded.",
      digestion: "Fullness after meals; late dinner noted.",
      reproduction: "No concerns shared today.",
      sleep: "Usually sleeps after midnight.",
      perspiration: "No unusual perspiration noted.",
      mental: "No concerns shared today.",
      history: "No additional history recorded.",
    },
    summary: "Post-meal fullness, especially after a late dinner.",
    medicine: "Pulsatilla",
    potency: "30C",
    followUpNote: "Ask about meal timing and comfort.",
    followUpDate: "2026-11-21",
    status: "In progress",
  },
  {
    patientId: "PHC-2027-0040",
    fullName: "Mim Akter",
    age: "34",
    ageUnit: "Years",
    gender: "Female",
    occupation: "Designer",
    address: "Sample address · Chattogram",
    phone: "+880 1XXX-XXX-XXX",
    intakeDate: "2026-11-16",
    narrative: "Difficulty settling to sleep after a change in work schedule.",
    additionalNarrative: "Wakes once during the night.",
    questioningNote: "Patient completed the initial description without interruption.",
    symptoms: [
      {
        id: "mim-sleep",
        code: "S",
        characteristic: "Light, interrupted sleep",
        sensation: "Mind feels busy",
        location: "",
        modality: "Worse after late work",
        causeAndConcomitants: "Wakes once overnight",
      },
    ],
    clinical: {
      generalities: "Energy lower in the morning.",
      digestion: "Appetite unchanged.",
      reproduction: "No concerns shared today.",
      sleep: "Difficulty settling; wakes once.",
      perspiration: "No unusual perspiration noted.",
      mental: "Busy work schedule reported.",
      history: "Schedule changed recently.",
    },
    summary: "Light sleep following a work schedule change.",
    medicine: "Ignatia",
    potency: "30C",
    followUpNote: "Review sleep pattern and work schedule.",
    followUpDate: "2026-11-27",
    status: "Reviewed",
  },
];