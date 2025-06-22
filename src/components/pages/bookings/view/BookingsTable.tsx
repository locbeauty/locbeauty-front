import { BookingStatusBadge } from "@/components/pages/bookings/common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../common/BookingPaymentStatusBadge";

export function BookingsTable() {
    return (
        <div className="border rounded-lg max-h-[70vh] lg:w-full w-[89vw] overflow-x-auto">
            <table className="w-full">
                <thead className="bg-muted">
                    <tr>
                        <th className="text-left p-3 font-medium">Cliente</th>
                        <th className="text-left p-3 font-medium">Equipamento</th>
                        <th className="text-center p-3 font-medium">Quantidade</th>
                        <th className=" text-center p-3 font-medium">Data</th>
                        <th className=" text-center p-3 font-medium">Horário inicial</th>
                        <th className=" text-center p-3 font-medium">Horário final</th>
                        <th className="p-3 font-medium text-center">Status</th>
                        <th className="p-3 font-medium text-center">Pagamento</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">João Silva</td>
                        <td className="p-3">Lavieen</td>
                        <td className="p-3 text-center">1</td>
                        <td className="p-3 text-center">15/05/2023</td>
                        <td className="p-3 text-center">14:00</td>
                        <td className="p-3 text-center">18:00</td>
                        <td className="p-3 text-center">
                            <BookingStatusBadge status="Cancelado" />
                        </td>
                        <td className="p-3 text-center">
                            <BookingPaymentStatusBadge status="Pendente" />
                        </td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">Empresa ABC Ltda</td>
                        <td className="p-3">Herus Hifu</td>
                        <td className="p-3 text-center">3</td>
                        <td className="p-3 text-center">10/06/2023</td>
                        <td className="p-3 text-center">14:00</td>
                        <td className="p-3 text-center">18:00</td>
                        <td className="p-3 text-center">
                            <BookingStatusBadge status="Concluido" />
                        </td>
                        <td className="p-3 text-center">
                            <BookingPaymentStatusBadge status="Pago" />
                        </td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">Maria Oliveira</td>
                        <td className="p-3">Ultraformer</td>
                        <td className="p-3 text-center">5</td>
                        <td className="p-3 text-center">01/04/2023</td>
                        <td className="p-3 text-center">14:00</td>
                        <td className="p-3 text-center">18:00</td>
                        <td className="p-3 text-center">
                            <BookingStatusBadge status="Pendente" />
                        </td>
                        <td className="p-3 text-center">
                            <BookingPaymentStatusBadge status="Parcial" />
                        </td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">Maria Oliveira</td>
                        <td className="p-3">Delight</td>
                        <td className="p-3 text-center">5</td>
                        <td className="p-3 text-center">01/04/2023</td>
                        <td className="p-3 text-center">14:00</td>
                        <td className="p-3 text-center">18:00</td>
                        <td className="p-3 text-center">
                            <BookingStatusBadge status="Cancelado" />
                        </td>
                        <td className="p-3 text-center">
                            <BookingPaymentStatusBadge status="Pendente" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
