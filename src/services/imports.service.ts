import { apiRequest, ApiResponse } from "@/lib/api";
import {
  ImportBatchDetails,
  ImportBatchListItem,
  ImportBatchStatus,
  ImportType,
  RevertImportBatchResult,
} from "@/utils/@types/import-batch";

export interface GetImportBatchesFilters {
  type?: ImportType;
  status?: ImportBatchStatus;
  filialIds?: string[];
  employeeName?: string;
  fileName?: string;
  batchId?: string;
}

export async function GetImportBatches(
  filters?: GetImportBatchesFilters,
  pagination?: { page: number; limit: number },
): Promise<ApiResponse<{ items: ImportBatchListItem[]; total: number }>> {
  return apiRequest<{ items: ImportBatchListItem[]; total: number }>({
    endpoint: "imports",
    queryParams: {
      ...(filters?.type ? { type: filters.type } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.filialIds && filters.filialIds.length > 0
        ? { filialIds: filters.filialIds }
        : {}),
      ...(filters?.employeeName ? { employeeName: filters.employeeName } : {}),
      ...(filters?.fileName ? { fileName: filters.fileName } : {}),
      ...(filters?.batchId ? { batchId: filters.batchId } : {}),
      ...(pagination
        ? { page: String(pagination.page), limit: String(pagination.limit) }
        : {}),
    },
  });
}

export async function GetImportBatchDetails(
  batchId: string,
): Promise<ApiResponse<ImportBatchDetails>> {
  return apiRequest<ImportBatchDetails>({
    endpoint: `imports/${batchId}`,
  });
}

export async function RevertImportBatch(
  batchId: string,
): Promise<ApiResponse<RevertImportBatchResult>> {
  return apiRequest<RevertImportBatchResult>({
    endpoint: `imports/${batchId}/revert`,
    method: "POST",
  });
}
