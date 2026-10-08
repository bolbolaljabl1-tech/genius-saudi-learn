import { describe, expect, it } from "vitest";
import { canAccessStudentScreen, STUDENT_ACCESS_MODE } from "@/lib/access-policy";

describe("student access policy", () => {
  it("keeps every student screen free without a subscription gate", () => {
    expect(STUDENT_ACCESS_MODE).toBe("free");
    expect(canAccessStudentScreen()).toBe(true);
  });
});