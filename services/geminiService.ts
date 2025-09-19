
import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion, UserAnswer } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const questionsSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            description: "An array of 5 multiple-choice questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    questionText: {
                        type: Type.STRING,
                        description: "The text of the question."
                    },
                    options: {
                        type: Type.ARRAY,
                        description: "An array of 4 possible answers.",
                        items: { type: Type.STRING }
                    },
                    correctAnswer: {
                        type: Type.STRING,
                        description: "The correct answer from the options array."
                    }
                },
                required: ["questionText", "options", "correctAnswer"]
            }
        }
    },
    required: ["questions"]
};


export const generateQuizQuestions = async (topic: string): Promise<QuizQuestion[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate 5 unique, expert-level multiple-choice questions about the medical drug "${topic}". Each question must have exactly 4 options. Ensure the correct answer is one of the provided options.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: questionsSchema,
            },
        });

        const jsonString = response.text;
        const parsedResponse = JSON.parse(jsonString);

        if (!parsedResponse.questions || parsedResponse.questions.length === 0) {
            throw new Error("API returned no questions.");
        }
        
        // Validate that each question has 4 options
        parsedResponse.questions.forEach((q: QuizQuestion) => {
            if(!q.options || q.options.length !== 4) {
                throw new Error(`Question "${q.questionText}" does not have 4 options.`);
            }
            if(!q.options.includes(q.correctAnswer)) {
                throw new Error(`Correct answer for question "${q.questionText}" is not in the options list.`);
            }
        });

        return parsedResponse.questions;
    } catch (error) {
        console.error("Error generating quiz questions:", error);
        throw new Error("Failed to parse or validate questions from Gemini API.");
    }
};

export const generateExplanationForAnswer = async (question: string, correctAnswer: string, topic: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `In the context of the drug "${topic}", for the question "${question}", please briefly explain why "${correctAnswer}" is the correct answer. Be concise and clear.`,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating explanation:", error);
        return "Could not generate an explanation at this time.";
    }
};

export const generateQuizSummary = async (topic: string, answers: UserAnswer[], questions: QuizQuestion[]): Promise<string> => {
    try {
        const resultsText = answers.map((ans, index) => {
            return `Question ${index + 1}: ${ans.question}\nYour Answer: ${ans.answer}\nCorrect Answer: ${questions[index].correctAnswer}\nResult: ${ans.isCorrect ? 'Correct' : 'Incorrect'}`;
        }).join('\n\n');

        const prompt = `Based on the following quiz results on the topic of "${topic}", please provide a summary of the user's performance. The summary should be encouraging. First, provide a "Strong Areas" section highlighting concepts the user seems to understand based on correct answers. Second, provide a "Areas for Review" section for the concepts they struggled with, based on incorrect answers. Use markdown for formatting (e.g., bold headings).

        Here are the results:
        ${resultsText}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating summary:", error);
        return "Could not generate a summary at this time.";
    }
};
