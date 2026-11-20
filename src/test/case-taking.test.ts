import { describe, expect, it } from "vitest";

import {
  createPatientId,
  missingPatientProfileFields,
  type PatientProfile,
} from "@/lib/case-taking";

describe("case-taking profile rules", () => {
  it("generates the documented patient ID format", () => {
    expect(createPatientId(1)).toBe("PHC-2027-0001");
  });

  it("requires each patient profile field listed in the case-taking plan", () => {
    const emptyProfile: PatientProfile = {
      patientId: "",
      fullName: "",
      age: "",
      ageUnit: "Years",
      gender: "",
      occupation: "",
      address: "",
      phone: "",
      intakeDate: "",
    };

    expect(missingPatientProfileFields(emptyProfile)).toEqual([
      "patientId",
      "fullName",
      "age",
      "gender",
      "occupation",
      "address",
      "phone",
      "intakeDate",
    ]);
  });

  it("accepts a complete profile and reports the remaining missing field", () => {
    const profile: PatientProfile = {
      patientId: "PHC-2027-0001",
      fullName: "Amina Rahman",
      age: "31",
      ageUnit: "Years",
      gender: "Female",
      occupation: "Teacher",
      address: "Sample address, Dhaka",
      phone: "Sample phone number",
      intakeDate: "2026-11-20",
    };

    expect(missingPatientProfileFields(profile)).toEqual([]);
    expect(missingPatientProfileFields({ ...profile, phone: " " })).toEqual(["phone"]);
  });
});