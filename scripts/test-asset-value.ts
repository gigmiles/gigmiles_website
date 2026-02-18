
import fs from 'fs';
import path from 'path';
import { getVehicleMarketValue } from '@/utils/api/apify';

// Manually load .env.local because ts-node doesn't do it automatically like Next.js
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes if any
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    });
}

async function test() {
    console.log("Testing getVehicleMarketValue with token:", process.env.APIFY_API_TOKEN ? "PRESENT" : "MISSING");
    try {
        const result = await getVehicleMarketValue('2022', 'Honda', 'Civic', 15000);
        console.log("Result:", result);
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
