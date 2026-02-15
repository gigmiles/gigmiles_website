export const VEHICLE_DEPRECIATION_DATA: Record<string, number> = {
    // Average Market Depreciation Rates ($/mile)
    // Based on standard market data for gig-economy usage
    'toyota_camry': 0.15,
    'toyota_prius': 0.14,
    'toyota_corolla': 0.13,
    'honda_accord': 0.16,
    'honda_civic': 0.14,
    'nissan_altima': 0.17,
    'hyundai_elantra': 0.15,
    'hyundai_sonata': 0.16,
    'kia_optima': 0.16,
    'ford_fusion': 0.18,
    'chevrolet_malibu': 0.19,
    'tesla_model_3': 0.18, // Higher initial cost, but efficient
    'tesla_model_y': 0.20,
    // Default fallback
    'default': 0.20
}

export function getDepreciationRate(make: string, model: string): number {
    const key = `${make.toLowerCase()}_${model.toLowerCase()}`.replace(/\s+/g, '_')
    // Check direct match
    if (VEHICLE_DEPRECIATION_DATA[key]) {
        console.log(`[VehicleData] Found exact match for ${key}: $${VEHICLE_DEPRECIATION_DATA[key]}/mi`)
        return VEHICLE_DEPRECIATION_DATA[key]
    }

    // Check just model match (e.g. "Prius" -> "toyota_prius" if unique enough, or just simple key)
    // For now simple fallback
    console.log(`[VehicleData] No match for ${key}, using default: $${VEHICLE_DEPRECIATION_DATA['default']}/mi`)
    return VEHICLE_DEPRECIATION_DATA['default']
}
