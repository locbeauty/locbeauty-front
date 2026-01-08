import { apiRequest } from "@/lib/api";
import {
    EmployeeAccess,
    SYSTEM_MODULES,
    AccessPermissions,
} from "@/utils/@types/access";

export async function manageAccess(data: {
  targetEmployeeId: string;
  filialId: string;
  module: SYSTEM_MODULES;
  permissions: AccessPermissions;
}) {
    const response = await apiRequest<EmployeeAccess>({
        endpoint: "access/manage",
        method: "POST",
        body: data,
    });
    if (response.statusCode !== 200) throw new Error(response.message);
    return response.data!;
}

export async function getEmployeeAccesses(employeeId: string) {
    const response = await apiRequest<EmployeeAccess[]>({
        endpoint: `access/${employeeId}`,
    });
    if (response.statusCode !== 200) throw new Error(response.message);
    return response.data!;
}
