export interface EVModel {
    make: string
    model: string
    efficiency: number // miles per kWh
}

export const EV_MODELS: EVModel[] = [
    { make: 'Tesla', model: 'Model 3', efficiency: 4.1 },
    { make: 'Tesla', model: 'Model Y', efficiency: 3.6 },
    { make: 'Tesla', model: 'Model S', efficiency: 3.2 },
    { make: 'Tesla', model: 'Model X', efficiency: 2.8 },
    { make: 'Ford', model: 'Mustang Mach-E', efficiency: 3.1 },
    { make: 'Ford', model: 'F-150 Lightning', efficiency: 2.4 },
    { make: 'Hyundai', model: 'Ioniq 5', efficiency: 3.5 },
    { make: 'Hyundai', model: 'Ioniq 6', efficiency: 4.2 },
    { make: 'Kia', model: 'EV6', efficiency: 3.6 },
    { make: 'Kia', model: 'Niro EV', efficiency: 3.4 },
    { make: 'Volkswagen', model: 'ID.4', efficiency: 3.2 },
    { make: 'Chevrolet', model: 'Bolt EV', efficiency: 3.8 },
    { make: 'Chevrolet', model: 'Bolt EUV', efficiency: 3.4 },
    { make: 'Nissan', model: 'Leaf', efficiency: 3.3 },
    { make: 'BMW', model: 'i4', efficiency: 3.4 },
    { make: 'Polestar', model: '2', efficiency: 3.0 },
    { make: 'Rivian', model: 'R1T', efficiency: 2.3 },
    { make: 'Rivian', model: 'R1S', efficiency: 2.2 },
    { make: 'Lucid', model: 'Air', efficiency: 4.4 },
    { make: 'Toyota', model: 'bZ4X', efficiency: 3.2 }
]

export const ELECTRIC_BRANDS = ['Tesla', 'Rivian', 'Lucid', 'Polestar', 'Fisker']
