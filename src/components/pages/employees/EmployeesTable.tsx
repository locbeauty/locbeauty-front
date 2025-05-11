export function EmployeesTable() {
    return (
        <div className="border rounded-lg max-h-[70vh] lg:w-full w-[89vw] overflow-x-auto">
            <table className="w-full">
                <thead className="bg-muted">
                    <tr>
                        <th className="text-left p-3 font-medium">Nome</th>
                        <th className="text-left p-3 font-medium">CPF</th>
                        <th className="text-left p-3 font-medium">Cargo</th>
                        <th className="text-left p-3 font-medium">Regional</th>
                        <th className="text-left p-3 font-medium">Telefone</th>
                        <th className="text-left p-3 font-medium">Email</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">Roberto Silva</td>
                        <td className="p-3">123.456.789-00</td>
                        <td className="p-3">Gerente</td>
                        <td className="p-3">Sudeste</td>
                        <td className="p-3">(11) 98765-4321</td>
                        <td className="p-3">roberto@empresa.com</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">Fernanda Santos</td>
                        <td className="p-3">987.654.321-00</td>
                        <td className="p-3">Analista</td>
                        <td className="p-3">Sul</td>
                        <td className="p-3">(51) 98765-4321</td>
                        <td className="p-3">fernanda@empresa.com</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">Marcos Oliveira</td>
                        <td className="p-3">456.789.123-00</td>
                        <td className="p-3">Técnico</td>
                        <td className="p-3">Nordeste</td>
                        <td className="p-3">(81) 98765-4321</td>
                        <td className="p-3">marcos@empresa.com</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}