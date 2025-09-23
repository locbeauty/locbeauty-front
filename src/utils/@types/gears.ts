export type Gear = {
    gearId: string,
    gearName: string,
    availableUnits: number,
    outOfServiceUnits: number,
    totalUnits: number,
    acquisitionDate: Date,
    transferable: boolean,
    nextMaintenance: Date | null,
    lastMaintenance: Date | null,
    SourceFilial: {
      filialId: string,
      filialName: string,
  }
}
