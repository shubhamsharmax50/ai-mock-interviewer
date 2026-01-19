import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

// Helper for CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Replace with your domain in production
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// 1. Handle Preflight OPTIONS request (Fixes CORS error)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, role, level, techstack, amount, userid } = body;

    // Validate required fields
    if (!type || !role || !level || !techstack || !amount || !userid) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    const questionCount = Number(amount);

    // 2. Generate structured objects (Guarantees valid JSON without manual parsing)
    const { object } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: z.object({
        questions: z.array(z.string()).describe("A list of interview questions"),
      }),
      system: "You are a professional hiring manager. Generate clear, concise interview questions.",
      prompt: `Generate exactly ${questionCount} questions for a ${level} ${role} interview. 
               Focus: ${type}. 
               Tech Stack: ${techstack}.`,
    });

    const parsedQuestions = object.questions;

    if (!parsedQuestions || parsedQuestions.length === 0) {
      return NextResponse.json(
        { success: false, error: "No questions generated" },
        { status: 500, headers: corsHeaders }
      );
    }

    // 3. Save to Firebase
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

    return NextResponse.json(
      { success: true, questions: parsedQuestions }, 
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: "Interview Generation API",
      usage: "Use POST method with type, role, level, techstack, amount, and userid",
    },
    { status: 200, headers: corsHeaders }
  );
}