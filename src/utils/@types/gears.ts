export type Gear = {
  gearId: string;
  gearName: string;
  availableUnits: number;
  outOfServiceUnits: number;
  totalUnits: number;
  SourceFilial: {
    filialId: string;
    filialName: string;
  };
};
