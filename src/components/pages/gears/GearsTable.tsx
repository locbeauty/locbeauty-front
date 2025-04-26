export function GearsTable() {
    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
                <thead className="bg-muted">
                    <tr>
                        <th className="text-left p-3 font-medium">Descrição</th>
                        <th className="text-left p-3 font-medium">Peso</th>
                        <th className="text-left p-3 font-medium">Altura</th>
                        <th className="text-left p-3 font-medium">Porte</th>
                        <th className="text-left p-3 font-medium">Região</th>
                        <th className="text-left p-3 font-medium">Quantidade</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">Escavadeira Hidráulica</td>
                        <td className="p-3">20 ton</td>
                        <td className="p-3">3.5 m</td>
                        <td className="p-3">Grande</td>
                        <td className="p-3">Sudeste</td>
                        <td className="p-3">5</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">Compressor de Ar</td>
                        <td className="p-3">150 kg</td>
                        <td className="p-3">0.8 m</td>
                        <td className="p-3">Médio</td>
                        <td className="p-3">Sul</td>
                        <td className="p-3">12</td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">Furadeira Industrial</td>
                        <td className="p-3">5 kg</td>
                        <td className="p-3">0.3 m</td>
                        <td className="p-3">Pequeno</td>
                        <td className="p-3">Nordeste</td>
                        <td className="p-3">25</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}