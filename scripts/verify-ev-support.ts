
import { getEstimatedMPG } from '@/utils/api/external';

async function verify() {
    console.log("--- Testing Gasoline Vehicle (2022 Honda Civic 4Dr) ---");
    const gasResult = await getEstimatedMPG("2022", "Honda", "Civic 4Dr");
    console.log("Result:", gasResult);

    console.log("\n--- Testing Electric Vehicle (2022 Tesla Model 3 RWD) ---");
    const evResult = await getEstimatedMPG("2022", "Tesla", "Model 3 RWD");
    console.log("Result:", evResult);

    if (evResult && evResult.fuelType === 'electric' && gasResult && gasResult.fuelType === 'gasoline') {
        console.log("\n✅ Verification SUCCESS: Both Gasoline and Electric logic verified.");
    } else {
        console.error("\n❌ Verification FAILED: Check results above.");
    }
}

verify();
