
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

async function checkActor() {
    const apiKey = process.env.APIFY_API_TOKEN;
    if (!apiKey) {
        console.error('❌ APIFY_API_TOKEN missing');
        return;
    }

    const client = new ApifyClient({ token: apiKey });
    const actorId = '0wi38CtP5zEKifljx';

    try {
        console.log(`Fetching details for Actor ID: ${actorId}...`);
        const actor = await client.actor(actorId).get();

        if (actor) {
            console.log('--- Actor Details ---');
            console.log('Name:', actor.name);
            console.log('Username:', actor.username);
            console.log('Title:', actor.title);
            console.log('Description:', actor.description);
            console.log('Pricing:', actor.pricingInfos);
            console.log('---------------------');
        } else {
            console.log('Actor not found/accessible.');
        }

    } catch (error) {
        console.error('Error fetching actor info:', error);
    }
}

checkActor();
