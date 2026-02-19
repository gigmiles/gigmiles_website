
import { ApifyClient } from 'apify-client';
import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^['"]|['"]$/g, '');
            if (!process.env[key]) process.env[key] = value;
        }
    });
}

async function testGasBuddy() {
    const apiKey = process.env.APIFY_API_TOKEN;
    if (!apiKey) {
        console.error('❌ APIFY_API_TOKEN missing');
        return;
    }

    const client = new ApifyClient({ token: apiKey });

    console.log('Testing stanvanrooy/gasbuddy-scraper...');
    try {
        // Input based on common GasBuddy scraper patterns: 'search' or 'location'
        const run = await client.actor('stanvanrooy6/gasbuddy-scraper').call({
            location: "90210", // Beverly Hills, CA
            fuel_type: "Regular",
            max_stations: 5
        });

        console.log('Run finished. Fetching dataset...');
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        console.log('Results:', JSON.stringify(items, null, 2));
    } catch (error) {
        console.error('Error calling actor:', error);
    }
}

testGasBuddy();
