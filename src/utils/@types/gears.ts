export type Gear = {
    gearId: string,
    name: string,
    description: string,
    regionalId: string,
    availableUnits: number,
    outOfServiceUnits: number,
    totalUnits: number,
    acquisitionDate: Date | null,
    transferable: boolean,
    nextMaintenance: Date | null,
    lastMaintenance: Date | null,
}
