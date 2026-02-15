'use server'

import { analyzeReceiptImage } from "@/utils/api/gemini";

export async function scanReceiptAction(formData: FormData) {
    const file = formData.get('file') as File;

    if (!file) {
        return { success: false, error: "No file uploaded" };
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = file.type;

        const data = await analyzeReceiptImage(base64, mimeType);

        if (!data) {
            return { success: false, error: "Could not analyze receipt" };
        }

        return { success: true, data };

    } catch (error) {
        console.error("Scan Action Error:", error);
        return { success: false, error: "Failed to process image" };
    }
}
