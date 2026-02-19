import { describe, it, expect } from 'vitest';
import { guardVehicleValue, guardDailyFinancials } from './sanity-guards';

describe('Sanity Guards', () => {
    describe('guardVehicleValue', () => {
        it('should validate realistic values', () => {
            const result = guardVehicleValue(35000, 2024, 'Tesla');
            expect(result.isValid).toBe(true);
            expect(result.value).toBe(35000);
        });

        it('should catch unrealistic low values for new Teslas', () => {
            const result = guardVehicleValue(5000, 2026, 'Tesla');
            expect(result.isValid).toBe(false);
            expect(result.value).toBe(25000); // Floor value
            expect(result.reason).toContain('below floor');
        });

        it('should catch unrealistic low values for new Luxury cars', () => {
            const result = guardVehicleValue(8000, 2025, 'BMW');
            expect(result.isValid).toBe(false);
            expect(result.value).toBe(20000);
        });

        it('should allow low values for very old cars', () => {
            const result = guardVehicleValue(2000, 2005, 'Honda');
            expect(result.isValid).toBe(true);
        });
    });

    describe('guardDailyFinancials', () => {
        it('should validate normal earnings', () => {
            const result = guardDailyFinancials(300, 100, 8);
            expect(result.isValid).toBe(true);
        });

        it('should catch impossible hourly rates', () => {
            const result = guardDailyFinancials(5000, 10, 2); // $2500/hr
            expect(result.isValid).toBe(false);
            expect(result.value.gross).toBe(200); // 2 hrs * $100 cap
        });

        it('should catch impossible daily mileage', () => {
            const result = guardDailyFinancials(200, 1500, 10);
            expect(result.isValid).toBe(false);
            expect(result.value.miles).toBe(800);
        });
    });
});
