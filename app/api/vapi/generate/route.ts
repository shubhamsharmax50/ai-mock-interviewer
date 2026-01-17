import { generateText } from "ai";
import { groq } from "@ai-sdk/groq"; // 1. Change this import
import { NextResponse } from "next/server";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
  try {
    const { type, role, level, techstack, amount, userid } = await request.json();

    // Validate required fields
    if (!type || !role || !level || !techstack || !amount || !userid) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const questionCount = Number(amount);
    if (isNaN(questionCount) || questionCount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount value" },
        { status: 400 }
      );
    }

    // Generate questions using Groq
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `Prepare questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${techstack}.
The focus between behavioural and technical questions should lean towards: ${type}.
The amount of questions required is: ${questionCount}.
Return ONLY a JSON array like:
["Question 1", "Question 2"]
No extra text.`,
    });

    // ... (The rest of your cleaning, parsing, and Firebase code remains exactly the same)
    let parsedQuestions: string[];
    try {
      const cleanedText = text.replace(/```json|```/g, "").trim();
      parsedQuestions = JSON.parse(cleanedText);
    } catch {
      return NextResponse.json({ success: false, error: "AI returned invalid JSON" }, { status: 500 });
    }

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      return NextResponse.json({ success: false, error: "No questions generated" }, { status: 500 });
    }

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(",").map((t: string) => t.trim()),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: FieldValue.serverTimestamp(),
    };

    await db.collection("interviews").add(interview);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}