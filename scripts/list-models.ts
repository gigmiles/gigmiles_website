
import { getVehicleModels } from '@/utils/api/external';

async function list() {
    const models = await getVehicleModels("2022", "Honda");
    console.log("2022 Honda Models:", models);
}

list();
