import { BookingsTable } from "@/components/pages/bookings/view/BookingsTable";
import { CustomFilterSelect } from "@/components/shared/CustomFilterSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterBookingPaymentStatusTypes, FilterBookingStatusTypes } from "@/utils/filterOptions";
import { ROUTES } from "@/utils/routes";
import { Eye, Plus, Search } from "lucide-react";
import Link from "next/link";

export default function BookingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
                    <p className="text-muted-foreground">
            Gerencie os agendamentos de locações de equipamentos
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button className="flex justify-center items-center" asChild>
                        <Link
                            className="flex justify-center items-center"
                            href={ ROUTES.CREATE_BOOKING }
                        >
                            <Plus className="" />
                            <span className="hidden md:inline">Novo Agendamento</span>
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        className="flex justify-center items-center"
                        asChild
                    >
                        <Link
                            className="flex justify-center items-center"
                            href={ ROUTES.CALENDAR }
                        >
                            <Eye className="" />
                            <span className="hidden md:inline">Visualizar Agenda</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex md:flex-row flex-col md:items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar agendamentos..."
                        className="pl-8"
                    />
                </div>
                <CustomFilterSelect
                    items={ FilterBookingStatusTypes }
                    placeholder="Status do agendamento"
                    triggerProps={ {
                        className: "w-[200px]",
                        disabled: false,
                    } }
                />
                <CustomFilterSelect
                    items={ FilterBookingPaymentStatusTypes }
                    placeholder="Status do pagamento"
                    triggerProps={ {
                        className: "w-[200px]",
                        disabled: false,
                    } }
                />
            </div>

            <BookingsTable />
        </div>
    );
}
