'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_TOKEN || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
});

export interface ReceiptData {
    merchant: string;
    date: string;
    total_amount: number;
    category: "Fuel" | "Food" | "Maintenance" | "Other";
    currency: string;
}

export async function analyzeReceiptImage(base64Image: string, mimeType: string): Promise<ReceiptData | null> {
    try {
        if (!apiKey) return null;

        const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - merchant: content of the merchant/store name
      - date: date of transaction in YYYY-MM-DD format (if not found, use today's date)
      - total_amount: total price as a number
      - category: classify as one of ["Fuel", "Food", "Maintenance", "Other"] based on items
      - currency: currency symbol or code (e.g. USD)
      
      If you cannot read the image or it is not a receipt, return null for values.
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        console.log("Gemini Response:", text);

        return JSON.parse(text) as ReceiptData;

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return null;
    }
}
