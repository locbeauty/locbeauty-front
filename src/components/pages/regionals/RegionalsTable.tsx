export function RegionalsTable() {
    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
                <thead className="bg-muted">
                    <tr>
                        <th className="text-left p-3 font-medium">CNPJ</th>
                        <th className="text-left p-3 font-medium">Descrição</th>
                        <th className="text-left p-3 font-medium">Gerente</th>
                        <th className="text-left p-3 font-medium">Endereço</th>
                        <th className="text-left p-3 font-medium">Telefone</th>
                        <th className="text-left p-3 font-medium">Email</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">12.345.678/0001-90</td>
                        <td className="p-3">Filial São Paulo</td>
                        <td className="p-3">Carlos Oliveira</td>
                        <td className="p-3">Av. Paulista, 1000 - São Paulo/SP</td>
                        <td className="p-3">(11) 3456-7890</td>
                        <td className="p-3">filial.sp@empresa.com</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">12.345.678/0002-71</td>
                        <td className="p-3">Filial Rio de Janeiro</td>
                        <td className="p-3">Ana Souza</td>
                        <td className="p-3">Av. Rio Branco, 500 - Rio de Janeiro/RJ</td>
                        <td className="p-3">(21) 3456-7890</td>
                        <td className="p-3">filial.rj@empresa.com</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">12.345.678/0003-52</td>
                        <td className="p-3">Filial Belo Horizonte</td>
                        <td className="p-3">Pedro Santos</td>
                        <td className="p-3">Av. Afonso Pena, 300 - Belo Horizonte/MG</td>
                        <td className="p-3">(31) 3456-7890</td>
                        <td className="p-3">filial.bh@empresa.com</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}