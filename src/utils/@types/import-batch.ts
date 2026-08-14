export type ImportType = "CUSTOMERS" | "BOOKINGS";

export type ImportBatchStatus =
  | "Aplicado"
  | "Revertido"
  | "Revertido_Parcial";

export type ImportBatchItem = {
  itemId: string;
  batchId: string;
  entityType: "Customer" | "Checkout";
  entityId: string;
  entityLabel: string | null;
  rowNumber: number;
  revertedAt: string | null;
  revertSkipReason: string | null;
  createdAt: string;
};

export type ImportBatch = {
  batchId: string;
  type: ImportType;
  fileName: string;
  employeeId: string | null;
  employeeName: string;
  filialId: string;
  Filial: {
    filialId: string;
    filialName: string;
  };
  successCount: number;
  failedCount: number;
  skippedCount: number;
  status: ImportBatchStatus;
  revertedAt: string | null;
  revertedByEmployeeId: string | null;
  revertedByName: string | null;
  revertNotes: string | null;
  createdAt: string;
};

export type ImportBatchListItem = ImportBatch & {
  _count: { Items: number };
};

export type ImportBatchDetails = ImportBatch & {
  Items: ImportBatchItem[];
};

export type RevertImportBatchResult = {
  removedCount: number;
  preservedCount: number;
  preserved: string[];
  status: ImportBatchStatus;
};

export const IMPORT_TYPE_LABELS: Record<ImportType, string> = {
  CUSTOMERS: "Clientes",
  BOOKINGS: "Agendamentos",
};

export const IMPORT_STATUS_LABELS: Record<ImportBatchStatus, string> = {
  Aplicado: "Aplicado",
  Revertido: "Excluído",
  "Revertido_Parcial": "Excluído parcialmente",
};
