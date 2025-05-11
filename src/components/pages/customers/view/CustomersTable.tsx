import { CustomerStatusBadge } from "@/components/shared/CustomerStatusBadge";

export function CustomersTable() {
    return (
        <div className="border rounded-lg max-h-[70vh] lg:w-full w-[89vw] overflow-x-auto">
            <table className="min-w-[800px] w-full">
                <thead className="bg-muted">
                    <tr>
                        <th className="text-left p-3 font-medium">Nome</th>
                        <th className="text-left p-3 font-medium">CPF/CNPJ</th>
                        <th className="text-left p-3 font-medium">Tipo</th>
                        <th className="text-left p-3 font-medium">Email</th>
                        <th className="text-left p-3 font-medium">Telefone</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Último Registro</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">João Silva</td>
                        <td className="p-3">123.456.789-00</td>
                        <td className="p-3">PF</td>
                        <td className="p-3">joao@email.com</td>
                        <td className="p-3">(11) 98765-4321</td>
                        <td className="p-3">
                            <CustomerStatusBadge status="ativo" />
                        </td>
                        <td className="p-3">10/03/2023</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">João Silva</td>
                        <td className="p-3">123.456.789-00</td>
                        <td className="p-3">PF</td>
                        <td className="p-3">joao@email.com</td>
                        <td className="p-3">(11) 98765-4321</td>
                        <td className="p-3">
                            <CustomerStatusBadge status="bloqueado" />
                        </td>
                        <td className="p-3">10/03/2023</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">João Silva</td>
                        <td className="p-3">123.456.789-00</td>
                        <td className="p-3">PF</td>
                        <td className="p-3">joao@email.com</td>
                        <td className="p-3">(11) 98765-4321</td>
                        <td className="p-3">
                            <CustomerStatusBadge status="ativo" />
                        </td>
                        <td className="p-3">10/03/2023</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">João Silva</td>
                        <td className="p-3">123.456.789-00</td>
                        <td className="p-3">PF</td>
                        <td className="p-3">joao@email.com</td>
                        <td className="p-3">(11) 98765-4321</td>
                        <td className="p-3">
                            <CustomerStatusBadge status="ativo" />
                        </td>
                        <td className="p-3">10/03/2023</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">João Silva</td>
                        <td className="p-3">123.456.789-00</td>
                        <td className="p-3">PF</td>
                        <td className="p-3">joao@email.com</td>
                        <td className="p-3">(11) 98765-4321</td>
                        <td className="p-3">
                            <CustomerStatusBadge status="inadimplente" />
                        </td>
                        <td className="p-3">10/03/2023</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">João Silva</td>
                        <td className="p-3">123.456.789-00</td>
                        <td className="p-3">PF</td>
                        <td className="p-3">joao@email.com</td>
                        <td className="p-3">(11) 98765-4321</td>
                        <td className="p-3">
                            <CustomerStatusBadge status="ativo" />
                        </td>
                        <td className="p-3">10/03/2023</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">João Silva</td>
                        <td className="p-3">123.456.789-00</td>
                        <td className="p-3">PF</td>
                        <td className="p-3">joao@email.com</td>
                        <td className="p-3">(11) 98765-4321</td>
                        <td className="p-3">
                            <CustomerStatusBadge status="inativo" />
                        </td>
                        <td className="p-3">10/03/2023</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">João Silva</td>
                        <td className="p-3">123.456.789-00</td>
                        <td className="p-3">PF</td>
                        <td className="p-3">joao@email.com</td>
                        <td className="p-3">(11) 98765-4321</td>
                        <td className="p-3">
                            <CustomerStatusBadge status="ativo" />
                        </td>
                        <td className="p-3">10/03/2023</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">João Silva</td>
                        <td className="p-3">123.456.789-00</td>
                        <td className="p-3">PF</td>
                        <td className="p-3">joao@email.com</td>
                        <td className="p-3">(11) 98765-4321</td>
                        <td className="p-3">
                            <CustomerStatusBadge status="ativo" />
                        </td>
                        <td className="p-3">10/03/2023</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">João Silva</td>
                        <td className="p-3">123.456.789-00</td>
                        <td className="p-3">PF</td>
                        <td className="p-3">joao@email.com</td>
                        <td className="p-3">(11) 98765-4321</td>
                        <td className="p-3">
                            <CustomerStatusBadge status="ativo" />
                        </td>
                        <td className="p-3">10/03/2023</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">João Silva</td>
                        <td className="p-3">123.456.789-00</td>
                        <td className="p-3">PF</td>
                        <td className="p-3">joao@email.com</td>
                        <td className="p-3">(11) 98765-4321</td>
                        <td className="p-3">
                            <CustomerStatusBadge status="ativo" />
                        </td>
                        <td className="p-3">10/03/2023</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">João Silva</td>
                        <td className="p-3">123.456.789-00</td>
                        <td className="p-3">PF</td>
                        <td className="p-3">joao@email.com</td>
                        <td className="p-3">(11) 98765-4321</td>
                        <td className="p-3">
                            <CustomerStatusBadge status="ativo" />
                        </td>
                        <td className="p-3">10/03/2023</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">João Silva</td>
                        <td className="p-3">123.456.789-00</td>
                        <td className="p-3">PF</td>
                        <td className="p-3">joao@email.com</td>
                        <td className="p-3">(11) 98765-4321</td>
                        <td className="p-3">
                            <CustomerStatusBadge status="ativo" />
                        </td>
                        <td className="p-3">10/03/2023</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">João Silva</td>
                        <td className="p-3">123.456.789-00</td>
                        <td className="p-3">PF</td>
                        <td className="p-3">joao@email.com</td>
                        <td className="p-3">(11) 98765-4321</td>
                        <td className="p-3">
                            <CustomerStatusBadge status="ativo" />
                        </td>
                        <td className="p-3">10/03/2023</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">João Silva</td>
                        <td className="p-3">123.456.789-00</td>
                        <td className="p-3">PF</td>
                        <td className="p-3">joao@email.com</td>
                        <td className="p-3">(11) 98765-4321</td>
                        <td className="p-3">
                            <CustomerStatusBadge status="ativo" />
                        </td>
                        <td className="p-3">10/03/2023</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}