import { BookingStatusBadge } from "@/components/shared/BookingStatusBadge";

export function BookingsTable() {
    return (
        <div className="border rounded-lg max-h-[70vh] lg:w-full w-[89vw] overflow-x-auto">
            <table className="w-full">
                <thead className="bg-muted">
                    <tr>
                        <th className="text-left p-3 font-medium">Cliente</th>
                        <th className="text-left p-3 font-medium">Equipamento</th>
                        <th className="text-left p-3 font-medium">Quantidade</th>
                        <th className="text-left p-3 font-medium">Data Início</th>
                        <th className="text-left p-3 font-medium">Data Fim</th>
                        <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">João Silva</td>
                        <td className="p-3">Escavadeira Hidráulica</td>
                        <td className="p-3">1</td>
                        <td className="p-3">15/05/2023</td>
                        <td className="p-3">20/05/2023</td>
                        <td className="p-3">
                            <BookingStatusBadge status="confirmado" />
                        </td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">Empresa ABC Ltda</td>
                        <td className="p-3">Compressor de Ar</td>
                        <td className="p-3">3</td>
                        <td className="p-3">10/06/2023</td>
                        <td className="p-3">25/06/2023</td>
                        <td className="p-3">
                            <BookingStatusBadge status="pendente" />
                        </td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">Maria Oliveira</td>
                        <td className="p-3">Furadeira Industrial</td>
                        <td className="p-3">5</td>
                        <td className="p-3">01/04/2023</td>
                        <td className="p-3">15/04/2023</td>
                        <td className="p-3">
                            <BookingStatusBadge status="concluído" />
                        </td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">Maria Oliveira</td>
                        <td className="p-3">Furadeira Industrial</td>
                        <td className="p-3">5</td>
                        <td className="p-3">01/04/2023</td>
                        <td className="p-3">15/04/2023</td>
                        <td className="p-3">
                            <BookingStatusBadge status="cancelado" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}