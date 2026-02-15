import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyCBuKgeBSkt3_t_9E72y23hToer-8JUMRg";

async function listAvailableModels() {
    try {
        console.log("Fetching available Gemini models...\n");

        const genAI = new GoogleGenerativeAI(apiKey);

        // List all available models
        const models = await genAI.listModels();

        console.log("Available Models:");
        console.log("=".repeat(50));

        for (const model of models) {
            console.log(`\nModel: ${model.name}`);
            console.log(`  Display Name: ${model.displayName}`);
            console.log(`  Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
        }

    } catch (error: any) {
        console.error("Error listing models:", error.message);
    }
}

listAvailableModels();
