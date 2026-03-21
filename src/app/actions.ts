"use server";

import { appendRiddle } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";

export async function submitRiddle(formData: FormData) {
  const name = formData.get("name") as string;
  const topic = formData.get("topic") as string;
  const riddle = formData.get("riddle") as string;
  const answer = formData.get("answer") as string;
  const difficulty = formData.get("difficulty") as string;

  if (!name || !topic || !riddle || !answer || !difficulty) {
    throw new Error("All fields are required");
  }

  try {
    await appendRiddle({ name, topic, riddle, answer, difficulty });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error submitting riddle details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    return { success: false, error: error.message || "Failed to submit riddle" };
  }
}
