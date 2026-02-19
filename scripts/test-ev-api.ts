
async function testEV() {
    const year = "2022";
    const make = "Tesla";
    const model = "Model 3 RWD";

    console.log(`Searching for: ${year} ${make} ${model}...`);

    const optionsUrl = `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${make}&model=${model}`;
    const optionsResp = await fetch(optionsUrl, { headers: { 'Accept': 'application/json' } });
    const optionsData = await optionsResp.json();

    if (!optionsData.menuItem) {
        console.log("No options found.");
        return;
    }

    const items = Array.isArray(optionsData.menuItem) ? optionsData.menuItem : [optionsData.menuItem];
    const vehicleId = items[0].value;

    const detailUrl = `https://www.fueleconomy.gov/ws/rest/vehicle/${vehicleId}`;
    const detailResp = await fetch(detailUrl, { headers: { 'Accept': 'application/json' } });
    const detailData = await detailResp.json();

    console.log("--- EV Data (Tesla Model 3) ---");
    console.log("atvType:", detailData.atvType);
    console.log("fuelType:", detailData.fuelType);
    console.log("comb08 (MPGe):", detailData.comb08);
    console.log("combE (kWh/100mi):", detailData.combE);
    console.log("--- Full Response Keys ---");
    console.log(Object.keys(detailData).join(', '));
}

testEV();
