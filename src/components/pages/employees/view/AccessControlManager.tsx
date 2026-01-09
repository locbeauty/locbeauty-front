import { useEffect, useState } from "react";
import { Employee } from "@/utils/@types/employee";
import { getEmployeeAccesses, manageAccess } from "@/services/access.service";
import { EmployeeAccess, SYSTEM_MODULES } from "@/utils/@types/access";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { findAllFilials } from "@/services/filials.service";
import { Filial } from "@/utils/@types/filials";
import { Loader2 } from "lucide-react";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface AccessControlManagerProps {
  employee: Employee;
}

export function AccessControlManager({ employee }: AccessControlManagerProps) {
    const [ accesses, setAccesses ] = useState<EmployeeAccess[]>([]);
    const [ loading, setLoading ] = useState(false);
    const [ filials, setFilials ] = useState<Filial[]>([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [ accessData, filialsData ] = await Promise.all([
                    getEmployeeAccesses(employee.employeeId),
                    findAllFilials(),
                ]);
                setAccesses(accessData);
                setFilials(filialsData);
            } catch (error) {
                console.error(error);
                toast.error("Erro ao carregar acessos.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [ employee.employeeId ]);

    // Group accesses by Filial
    const accessesByFilial = accesses.reduce((acc, access) => {
        if (!acc[access.filialId]) {
            acc[access.filialId] = {
                filialName: access.Filial?.filialName || "Filial Desconhecida",
                modules: {},
            };
        }
        acc[access.filialId].modules[access.module] = access;
        return acc;
    }, {} as Record<string, { filialName: string; modules: Record<string, EmployeeAccess> }>);

    async function handlePermissionChange(
        filialId: string,
        module: SYSTEM_MODULES,
        permission: "canView" | "canCreate" | "canEdit",
        checked: boolean
    ) {
        const currentAccess = accessesByFilial[filialId]?.modules[module];

        // Construct new permissions
        const permissions = {
            canView: currentAccess?.canView ?? false,
            canCreate: currentAccess?.canCreate ?? false,
            canEdit: currentAccess?.canEdit ?? false,
            [permission]: checked,
        };

        try {
            const updatedAccess = await manageAccess({
                targetEmployeeId: employee.employeeId,
                filialId,
                module,
                permissions,
            });

            // Update state
            setAccesses((prev) => {
                // Remove old if exists
                const filtered = prev.filter(
                    (a) => !(a.filialId === filialId && a.module === module)
                );
                return [ ...filtered, updatedAccess ];
            });
            toast.success("Permissão atualizada.");
        } catch (error) {
            toast.error("Erro ao atualizar permissão.");
        }
    }

    function getFilialAccessState(filialId: string): "all" | "some" | "none" {
        const filialData = accessesByFilial[filialId];
        if (!filialData) return "none";

        const allPermissions = Object.values(filialData.modules).flatMap((mod) => [
            mod.canView,
            mod.canCreate,
            mod.canEdit,
        ]);

        // Ensure we consider all potential modules vs just the ones in DB?
        // Logic: if DB record exists, use value. If not, it's false.
        // We have `modules` list (SYSTEM_MODULES values). We should check against THAT full set for "All".

        const allSystemModules = Object.values(SYSTEM_MODULES);
        // Calculate total possible permissions count
        // const totalPossible = allSystemModules.length * 4;

        // Actually, easier way: Iterate over all system modules and check values
        let trueCount = 0;
        let totalCount = 0;

        allSystemModules.forEach((modKey) => {
            const modAccess = filialData.modules[modKey];
            trueCount += modAccess?.canView ? 1 : 0;
            trueCount += modAccess?.canCreate ? 1 : 0;
            trueCount += modAccess?.canEdit ? 1 : 0;
            totalCount += 3;
        });

        if (trueCount === totalCount) return "all";
        if (trueCount > 0) return "some";
        return "none";
    }

    async function toggleFilialAccess(filialId: string, checked: boolean) {
        const toastId = toast.loading("Atualizando permissões...");
        const modulesList = Object.values(SYSTEM_MODULES);

        const shouldEnable = checked;

        const promises = modulesList.map((module) =>
            manageAccess({
                targetEmployeeId: employee.employeeId,
                filialId: filialId,
                module: module,
                permissions: {
                    canView: shouldEnable,
                    canCreate: shouldEnable,
                    canEdit: shouldEnable,
                },
            })
        );

        try {
            await Promise.all(promises);
            const [ accessData ] = await Promise.all([
                getEmployeeAccesses(employee.employeeId),
            ]);
            setAccesses(accessData);

            toast.success(
                shouldEnable
                    ? "Todos os acessos habilitados."
                    : "Todos os acessos removidos.",
                { id: toastId }
            );
        } catch (err) {
            console.error(err);
            toast.error("Erro ao atualizar acessos da filial.", { id: toastId });
        }
    }

    if (loading) return <Loader2 className="animate-spin" />;

    const modules = Object.values(SYSTEM_MODULES);

    return (
        <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full space-y-2">
                {filials.map((filial) => {
                    const filialId = filial.filialId;
                    const accessState = getFilialAccessState(filialId);
                    const isChecked =
            accessState === "all"
                ? true
                : accessState === "some"
                    ? "indeterminate"
                    : false;

                    const filialModules = accessesByFilial[filialId]?.modules || {};

                    return (
                        <AccordionItem
                            key={ filialId }
                            value={ filialId }
                            className={ `border rounded-md px-0 overflow-hidden transition-all hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600 ${
                                accessState === "none" ? "opacity-75 border-dashed" : ""
                            }` }
                        >
                            <AccordionTrigger
                                className="pl-4 py-4"
                                actions={
                                    <div
                                        className="flex items-center gap-2 pr-4 ml-4"
                                        onClick={ (e) => e.stopPropagation() }
                                    >
                                        <Checkbox
                                            id={ `enable-${filialId}` }
                                            checked={ isChecked }
                                            onCheckedChange={ (c) => {
                                                // c is boolean | 'indeterminate'.
                                                // logic: if user CLICKS, they want to toggle.
                                                // If current was 'some' or 'none', they likely want 'all' (true).
                                                // If current was 'all', they want 'none' (false).

                                                // Simplified: accept 'c' as the desired state if boolean?
                                                // if isChecked is 'indeterminate', c will be true.

                                                const desired = c === true;
                                                toggleFilialAccess(filialId, desired);
                                            } }
                                        />
                                        <Label
                                            htmlFor={ `enable-${filialId}` }
                                            className="cursor-pointer whitespace-nowrap"
                                        >
                      Habilitar
                                        </Label>
                                    </div>
                                }
                            >
                                <span className="text-lg font-bold">{filial.filialName}</span>
                            </AccordionTrigger>

                            <AccordionContent className="px-4">
                                <div className="pt-2 space-y-4">
                                    {modules.map((module) => {
                                        const access = filialModules[module];
                                        return (
                                            <div
                                                key={ module }
                                                className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b last:border-0 gap-4"
                                            >
                                                <div className="w-1/3 font-medium text-sm">
                                                    {module}
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 w-full">
                                                    {([ "canView", "canCreate", "canEdit" ] as const).map(
                                                        (perm) => {
                                                            const isCreate = perm === "canCreate";
                                                            const isEdit = perm === "canEdit";

                                                            const disabledModules = [
                                                                SYSTEM_MODULES.DASHBOARD,
                                                                SYSTEM_MODULES.CALENDAR,
                                                                SYSTEM_MODULES.BIRTHDAYS,
                                                            ] as SYSTEM_MODULES[];

                                                            const isCreateDisabled =
                                isCreate &&
                                disabledModules.includes(
                                  module as SYSTEM_MODULES
                                );

                                                            const isEditDisabled =
                                isEdit &&
                                disabledModules.includes(
                                  module as SYSTEM_MODULES
                                );

                                                            if (isCreateDisabled || isEditDisabled) {
                                                                return <div key={ perm } aria-hidden="true" />;
                                                            }

                                                            return (
                                                                <div
                                                                    key={ perm }
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <Checkbox
                                                                        id={ `${filialId}-${module}-${perm}` }
                                                                        checked={ access?.[perm] ?? false }
                                                                        onCheckedChange={ (checked) =>
                                                                            handlePermissionChange(
                                                                                filialId,
                                                                                module,
                                                                                perm,
                                        checked as boolean
                                                                            )
                                                                        }
                                                                    />
                                                                    <Label
                                                                        htmlFor={ `${filialId}-${module}-${perm}` }
                                                                        className="text-sm font-normal cursor-pointer"
                                                                    >
                                                                        {perm.replace("can", "")}
                                                                    </Label>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
}
