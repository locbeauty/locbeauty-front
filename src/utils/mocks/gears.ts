import { Gear } from "../@types/gears";

// Helper function to create dates relative to today
const createDateFromNow = (daysFromNow: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

export const gears: Gear[] = [
  {
    gearId: "gear-001",
    gearName: "Lavieen",
    availableUnits: 5,
    outOfServiceUnits: 0,
    totalUnits: 5,
    // acquisitionDate: createDateFromNow(-365), // 1 year ago
    // transferable: true,
    // nextMaintenance: createDateFromNow(30), // in 30 days
    // lastMaintenance: createDateFromNow(-90), // 3 months ago
    SourceFilial: {
      filialId: "filial-pe-001",
      filialName: "Filial Pernambuco"
    }
  },
  {
    gearId: "gear-002",
    gearName: "UF3",
    availableUnits: 4,
    outOfServiceUnits: 1,
    totalUnits: 5,
    // acquisitionDate: createDateFromNow(-730), // 2 years ago
    // transferable: false,
    // nextMaintenance: createDateFromNow(15), // in 15 days
    // lastMaintenance: createDateFromNow(-30), // 1 month ago
    SourceFilial: {
      filialId: "filial-pe-001",
      filialName: "Filial Pernambuco"
    }
  },
  {
    gearId: "gear-003",
    gearName: "Herus Hifu",
    availableUnits: 8,
    outOfServiceUnits: 0,
    totalUnits: 8,
    // acquisitionDate: createDateFromNow(-180), // 6 months ago
    // transferable: true,
    // nextMaintenance: createDateFromNow(45), // in 45 days
    // lastMaintenance: createDateFromNow(-60), // 2 months ago
    SourceFilial: {
      filialId: "filial-ba-001",
      filialName: "Filial Bahia"
    }
  },
  {
    gearId: "gear-004",
    gearName: "Ultraformer",
    availableUnits: 2,
    outOfServiceUnits: 3,
    totalUnits: 5,
    // acquisitionDate: createDateFromNow(-1095), // 3 years ago
    // transferable: true,
    // nextMaintenance: createDateFromNow(7), // in 1 week (urgent)
    // lastMaintenance: createDateFromNow(-120), // 4 months ago
    SourceFilial: {
      filialId: "filial-rj-001",
      filialName: "Filial Rio de Janeiro"
    }
  },
  {
    gearId: "gear-005",
    gearName: "Delight",
    availableUnits: 6,
    outOfServiceUnits: 0,
    totalUnits: 6,
    // acquisitionDate: createDateFromNow(-90), // 3 months ago
    // transferable: false,
    // nextMaintenance: createDateFromNow(60), // in 2 months
    // lastMaintenance: createDateFromNow(-15), // 2 weeks ago
    SourceFilial: {
      filialId: "filial-ce-001",
      filialName: "Filial Ceará"
    }
  },
  {
    gearId: "gear-006",
    gearName: "Lightsheer Duet",
    availableUnits: 7,
    outOfServiceUnits: 0,
    totalUnits: 7,
    // acquisitionDate: createDateFromNow(-450), // 15 months ago
    // transferable: true,
    // nextMaintenance: createDateFromNow(90), // in 3 months
    // lastMaintenance: createDateFromNow(-45), // 45 days ago
    SourceFilial: {
      filialId: "filial-ce-001",
      filialName: "Filial Ceará"
    }
  },
  {
    gearId: "gear-007",
    gearName: "Galaxy Fiber",
    availableUnits: 3,
    outOfServiceUnits: 2,
    totalUnits: 5,
    // acquisitionDate: createDateFromNow(-600), // ~20 months ago
    // transferable: true,
    // nextMaintenance: createDateFromNow(21), // in 3 weeks
    // lastMaintenance: createDateFromNow(-75), // 2.5 months ago
    SourceFilial: {
      filialId: "filial-sp-001",
      filialName: "Filial São Paulo"
    }
  },
  {
    gearId: "gear-008",
    gearName: "Soprano Ice",
    availableUnits: 4,
    outOfServiceUnits: 1,
    totalUnits: 5,
    // acquisitionDate: createDateFromNow(-270), // 9 months ago
    // transferable: false,
    // nextMaintenance: createDateFromNow(35), // in 5 weeks
    // lastMaintenance: createDateFromNow(-20), // 3 weeks ago
    SourceFilial: {
      filialId: "filial-mg-001",
      filialName: "Filial Minas Gerais"
    }
  },
  {
    gearId: "gear-009",
    gearName: "Endymed Pro",
    availableUnits: 10,
    outOfServiceUnits: 0,
    totalUnits: 10,
    // acquisitionDate: createDateFromNow(-30), // 1 month ago (newest)
    // transferable: true,
    // nextMaintenance: createDateFromNow(120), // in 4 months
    // lastMaintenance: null, // Never maintained yet
    SourceFilial: {
      filialId: "filial-pe-001",
      filialName: "Filial Pernambuco"
    }
  },
  {
    gearId: "gear-010",
    gearName: "Picosure",
    availableUnits: 0,
    outOfServiceUnits: 3,
    totalUnits: 3,
    // acquisitionDate: createDateFromNow(-1460), // 4 years ago (oldest)
    // transferable: false,
    // nextMaintenance: createDateFromNow(-7), // Overdue by 1 week
    // lastMaintenance: createDateFromNow(-180), // 6 months ago
    SourceFilial: {
      filialId: "filial-rj-001",
      filialName: "Filial Rio de Janeiro"
    }
  }
];