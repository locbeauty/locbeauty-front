export type Gear = {
    gearId: string,
    gearName: string,
    description: string,
    filialId: string,
    availableUnits: number,
    outOfServiceUnits: number,
    totalUnits: number,
    acquisitionDate: Date | null,
    transferable: boolean,
    nextMaintenance: Date | null,
    lastMaintenance: Date | null,
}
