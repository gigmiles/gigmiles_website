
async function getVehicleModels(year: string, make: string): Promise<string[]> {
    try {
        const response = await fetch(
            `https://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year=${year}&make=${make}`,
            { headers: { 'Accept': 'application/json' } }
        )

        if (!response.ok) return []
        const data = await response.json()
        if (!data.menuItem) return []
        const items = Array.isArray(data.menuItem) ? data.menuItem : [data.menuItem]
        return items.map((item: any) => item.value)
    } catch (error) {
        console.error('Error fetching models:', error)
        return []
    }
}

async function getEstimatedMPG(year: string, make: string, model: string): Promise<number | null> {
    console.log(`\nTesting: ${year} ${make} ${model}`)
    try {
        // 1. Get Options
        const optionsUrl = `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${make}&model=${model}`
        console.log(`Fetching options from: ${optionsUrl}`)

        const response = await fetch(optionsUrl, { headers: { 'Accept': 'application/json' } })

        if (!response.ok) {
            console.log('Failed to fetch options')
            return null
        }

        const data = await response.json()

        if (!data.menuItem) {
            console.log('No menu items found')
            return null
        }

        const items = Array.isArray(data.menuItem) ? data.menuItem : [data.menuItem]
        console.log(`Found ${items.length} options:`)
        items.forEach((item: any) => console.log(` - ${item.text} (ID: ${item.value})`))

        if (items.length === 0) return null

        // CURRENT LOGIC: Picks the first one
        const vehicleId = items[0].value
        console.log(`Selected ID (First Item): ${vehicleId}`)

        // 2. Get MPG
        const mpgUrl = `https://www.fueleconomy.gov/ws/rest/vehicle/${vehicleId}`
        const mpgResponse = await fetch(mpgUrl, { headers: { 'Accept': 'application/json' } })

        if (!mpgResponse.ok) return null

        const mpgData = await mpgResponse.json()
        console.log(`MPG Data for ID ${vehicleId}:`, mpgData.comb08)
        return parseFloat(mpgData.comb08)

    } catch (error) {
        console.error('Error fetching MPG:', error)
        return null
    }
}

async function runTests() {
    console.log("=== MPG LOGIC REPRODUCTION TEST ===")

    // Test 1: Simple Case (Toyota Camry)
    // Likely has multiple options (Hybrid vs Gas, 4cyl vs 6cyl)
    await getEstimatedMPG('2023', 'Toyota', 'Camry')

    // Test 2: Complex Case (Ford F150)
    // Has many engine options, 2WD/4WD, Payload packages
    await getEstimatedMPG('2023', 'Ford', 'F150 Pickup 2WD')
}

runTests();
