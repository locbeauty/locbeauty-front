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
        permission: "canView" | "canCreate" | "canEdit" | "canDelete",
        checked: boolean
    ) {
        const currentAccess = accessesByFilial[filialId]?.modules[module];

        // Construct new permissions
        const permissions = {
            canView: currentAccess?.canView ?? false,
            canCreate: currentAccess?.canCreate ?? false,
            canEdit: currentAccess?.canEdit ?? false,
            canDelete: currentAccess?.canDelete ?? false,
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

    function hasFilialAccess(filialId: string) {
        return !!accessesByFilial[filialId];
    }

    async function toggleFilialAccess(filialId: string, checked: boolean) {
        if (checked) {
            // Grant default access (e.g. Dashboard View) to "initialize" the filial in the list
            try {
                const newAccess = await manageAccess({
                    targetEmployeeId: employee.employeeId,
                    filialId: filialId,
                    module: SYSTEM_MODULES.DASHBOARD,
                    permissions: {
                        canView: true,
                        canCreate: false,
                        canEdit: false,
                        canDelete: false,
                    },
                });
                setAccesses((prev) => [ ...prev, newAccess ]);
                toast.success("Acesso habilitado.");
            } catch (err) {
                toast.error("Erro ao habilitar acesso.");
            }
        } else {
            toast.info(
                "Para remover o acesso, desmarque todas as permissões ou use a interface de gerenciamento."
            );
        }
    }

    if (loading) return <Loader2 className="animate-spin" />;

    const modules = Object.values(SYSTEM_MODULES);

    return (
        <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full space-y-2">
                {filials.map((filial) => {
                    const filialId = filial.filialId;
                    const hasAccess = hasFilialAccess(filialId);
                    const filialModules = accessesByFilial[filialId]?.modules || {};

                    return (
                        <AccordionItem
                            key={ filialId }
                            value={ filialId }
                            className={ `border rounded-md px-0 overflow-hidden transition-all hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600 ${
                                !hasAccess ? "opacity-75 border-dashed" : ""
                            }` }
                        >
                            <AccordionTrigger
                                className="pl-4 py-4"
                                actions={
                                    <div className="flex items-center gap-2 pr-4 ml-4">
                                        <Checkbox
                                            id={ `enable-${filialId}` }
                                            checked={ hasAccess }
                                            onCheckedChange={ (c) => {
                                                if (c === true && !hasAccess)
                                                    toggleFilialAccess(filialId, true);
                                                if (c === false && hasAccess)
                                                    toggleFilialAccess(filialId, false);
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
                                {hasAccess ? (
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
                                                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                                                        {(
                              [
                                  "canView",
                                  "canCreate",
                                  "canEdit",
                                  "canDelete",
                              ] as const
                                                        ).map((perm) => (
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
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-4 text-muted-foreground text-center text-sm">
                    Habilite o acesso para configurar permissões.
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
}
