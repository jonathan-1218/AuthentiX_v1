import type { Grade } from "@/types";

const classMap: Record<Grade, string> = {
  "A+": "grade-aplus",
  A: "grade-a",
  B: "grade-b",
  C: "grade-c",
};

export function GradeBadge({ grade, size = "sm" }: { grade: Grade; size?: "sm" | "lg" }) {
  return (
    <span className={`${classMap[grade]} ${size === "lg" ? "text-2xl px-5 py-2" : ""}`}>
      {grade}
    </span>
  );
}
