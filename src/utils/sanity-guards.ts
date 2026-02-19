/**
 * Sanity Guards for Financial and Asset Calculations.
 * Ensures data remains within realistic bounds to prevent obvious errors 
 * from surfacing to users (e.g. $5,000 for a 2026 Tesla).
 */

export interface SanityCheckResult<T> {
    isValid: boolean;
    value: T;
    originalValue: T;
    reason?: string;
}

/**
 * Validates vehicle market value against realistic boundaries.
 */
export function guardVehicleValue(
    value: number,
    year: number,
    make: string
): SanityCheckResult<number> {
    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - year);

    // Minimum realistic value for any running vehicle in the gig economy
    const MIN_VALUE = 1500;

    // Heuristic: Luxury/Tech cars (Tesla, BMW, etc) shouldn't be under a certain floor if new
    let floorValue = MIN_VALUE;
    const lowerMake = make.toLowerCase();

    if (age <= 2) {
        if (lowerMake.includes('tesla')) floorValue = 25000;
        else if (lowerMake.includes('mercedes') || lowerMake.includes('bmw') || lowerMake.includes('audi')) floorValue = 20000;
        else floorValue = 15000;
    }

    if (value < floorValue) {
        return {
            isValid: false,
            value: floorValue, // Fallback to floor instead of showing $5k
            originalValue: value,
            reason: `Value $${value} is below floor $${floorValue} for a ${year} ${make}`
        };
    }

    return { isValid: true, value, originalValue: value };
}

/**
 * Validates earnings and expenses for "impossible" daily entries.
 */
export function guardDailyFinancials(
    gross: number,
    miles: number,
    hours: number
): SanityCheckResult<{ gross: number; miles: number; hours: number }> {
    // 1. Gross per hour sanity (e.g. > $300/hr is highly suspicious)
    if (hours > 0 && (gross / hours) > 400) {
        return {
            isValid: false,
            value: { gross: hours * 100, miles, hours }, // Capped at $100/hr for safety
            originalValue: { gross, miles, hours },
            reason: "Earnings per hour exceeds $400/hr limit"
        };
    }

    // 2. Maximum miles in a day (e.g. > 800 miles is physically difficult for gig work)
    if (miles > 800) {
        return {
            isValid: false,
            value: { gross, miles: 800, hours },
            originalValue: { gross, miles, hours },
            reason: "Daily mileage exceeds 800 miles"
        };
    }

    return {
        isValid: true,
        value: { gross, miles, hours },
        originalValue: { gross, miles, hours }
    };
}
