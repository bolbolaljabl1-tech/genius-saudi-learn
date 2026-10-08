export const STUDENT_ACCESS_MODE = "free" as const;

export const canAccessStudentScreen = () => STUDENT_ACCESS_MODE === "free";