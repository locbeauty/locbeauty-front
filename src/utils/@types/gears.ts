export type Gear = {
    id: string,
    name: string,
    description: string,
    region: string,
    availableUnits: number,
    outOfServiceUnits: number,
    totalUnits: number,
    acquisitionDate: Date | null,
    transferable: boolean,
    nextMaintenance: Date | null,
    lastMaintenance: Date | null,
}
