"use server";

import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";
import { FieldValue } from "firebase-admin/firestore";

/**
 * TYPES (Assuming these are defined in your project)
 */
interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

/**
 * 1. CREATE FEEDBACK (Refactored to Groq)
 */
export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript } = params;

  try {
    // Format transcript for the AI
    const formattedTranscript = transcript
      .map(
        (sentence) => `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    // Generate evaluation using Groq llama-3.3-70b
    const { object: { totalScore, categoryScores, strengths, areasForImprovement, finalAssessment } } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: feedbackSchema,
      system: "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories.",
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. 
        Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas:
        - Communication Skills: Clarity, articulation, structured responses.
        - Technical Knowledge: Understanding of key concepts for the role.
        - Problem-Solving: Ability to analyze problems and propose solutions.
        - Cultural & Role Fit: Alignment with company values and job role.
        - Confidence & Clarity: Confidence in responses, engagement, and clarity.
      `,
    });

    // Prepare document for Firestore
    const feedback =await db.collection ("feedback").add({
      interviewId,
      userId,
      totalScore,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment,
      createdAt:new Date().toISOString() // Use server-side timestamp
    });
    return {
        success: true,
        feedbackId: feedback.id
    }
  } catch (error) {
    console.error("Error creating/saving feedback:", error);
    return { success: false };
  }
}

/**
 * 2. GET INTERVIEW BY ID
 */
export async function getInterviewById(id: string) {
  try {
    const doc = await db.collection("interviews").doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
}

/**
 * 3. GET FEEDBACK BY INTERVIEW ID
 */
export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams) {
  const { interviewId, userId} = params;

  try {
    const feedback = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (feedback.empty) return null;

    const feedbackDoc = feedback.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() };
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return null;
  }
}

/**
 * 4. GET LATEST INTERVIEWS (Excluding current user)
 * NOTE: This query requires a Firestore Composite Index.
 */
export async function getLatestInterviews(params: GetLatestInterviewsParams) {
  const { userId, limit = 20 } = params;

  try {
    const interviews = await db
      .collection("interviews")
      .where("finalized", "==", true)
      .where("userId", "!=", userId) // Inequity filter on userId
      .orderBy("userId")              // First orderBy must match the inequity field
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching latest interviews:", error);
    return null;
  }
}

/**
 * 5. GET INTERVIEWS BY USER ID
 */
export async function getInterviewsByUserId(userId: string) {
  try {
    const interviews = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching user interviews:", error);
    return null;
  }
}