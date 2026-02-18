'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_TOKEN || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// Using gemini-1.5-flash for better performance and multimodal support
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
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
      Analyze this receipt image and extract the following information in JSON format.
      
      IMPORTANT: This receipt may be in ANY language (Turkish, English, Spanish, etc.). 
      Extract the information regardless of the language.
      
      Return JSON with these exact fields:
      {
        "merchant": "name of the store/merchant",
        "date": "transaction date in YYYY-MM-DD format (if not found, use today's date)",
        "total_amount": numeric total price (just the number, no currency symbols),
        "category": "classify as one of: Fuel, Food, Maintenance, or Other",
        "currency": "currency code like USD, EUR, TRY, etc."
      }
      
      Examples:
      - Turkish receipt: "TOPLAM" or "TUTAR" means total
      - Look for numbers with decimal separators (. or ,)
      - Date formats: DD/MM/YYYY or YYYY-MM-DD or DD.MM.YYYY
      
      If you cannot read the image or it's not a receipt, return:
      { "merchant": null, "date": null, "total_amount": null, "category": null, "currency": null }
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

        console.log("=== GEMINI RECEIPT SCAN DEBUG ===");
        console.log("Raw Response:", text);
        console.log("Response length:", text.length);

        // Validate response is not empty
        if (!text || text.trim().length === 0) {
            console.error("Gemini returned empty response");
            return null;
        }

        // Try to parse JSON
        try {
            const parsed = JSON.parse(text) as ReceiptData;

            // Validate that we got actual data, not all nulls
            if (!parsed.merchant && !parsed.total_amount) {
                console.error("Gemini could not extract receipt data (all fields null)");
                return null;
            }

            console.log("Successfully parsed receipt:", parsed);
            return parsed;
        } catch (parseError) {
            console.error("Failed to parse Gemini JSON response:", parseError);
            console.error("Raw text was:", text);
            return null;
        }

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return null;
    }
}
