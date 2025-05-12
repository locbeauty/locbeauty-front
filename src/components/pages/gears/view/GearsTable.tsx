import { Check, X } from "lucide-react";

export function GearsTable() {
    return (
        <div className="border rounded-lg max-h-[70vh] lg:w-full w-[89vw] overflow-x-auto">
            <table className="w-full">
                <thead className="bg-muted">
                    <tr>
                        <th className="text-left p-3 font-medium">Nome</th>
                        <th className="text-left p-3 font-medium">Descrição</th>
                        <th className="text-left p-3 font-medium">Regional</th>
                        <th className="text-left p-3 font-medium">Unidades disponíveis</th>
                        <th className="text-left p-3 font-medium">Unidades totais</th>
                        <th className="text-left p-3 font-medium">Data da aquisição</th>
                        <th className="text-left p-3 font-medium">Pode ser transferido?</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">Lavieen</td>
                        <td className="p-3">Lorem ipsum dolor sit amet. Qui quia quas eum explicabo consequuntur qui esse deserunt.</td>
                        <td className="p-3">Pernambuco</td>
                        <td className="p-3 text-center">5</td>
                        <td className="p-3 text-center">10</td>
                        <td className="p-3 text-center">20/01/2023</td>
                        <td className="p-3 flex justify-center"><Check /></td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">UF3</td>
                        <td className="p-3">Lorem ipsum dolor sit amet. Qui quia quas eum explicabo consequuntur qui esse deserunt.</td>
                        <td className="p-3">Pernambuco</td>
                        <td className="p-3 text-center">5</td>
                        <td className="p-3 text-center">10</td>
                        <td className="p-3 text-center">20/01/2023</td>
                        <td className="p-3 flex justify-center"><X /></td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">Herus Hifu</td>
                        <td className="p-3">Lorem ipsum dolor sit amet. Qui quia quas eum explicabo consequuntur qui esse deserunt.</td>
                        <td className="p-3">Bahia</td>
                        <td className="p-3 text-center">5</td>
                        <td className="p-3 text-center">10</td>
                        <td className="p-3 text-center">20/01/2023</td>
                        <td className="p-3 flex justify-center"><Check /></td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">Ultraformer</td>
                        <td className="p-3">Lorem ipsum dolor sit amet. Qui quia quas eum explicabo consequuntur qui esse deserunt.</td>
                        <td className="p-3">Rio de Janeiro</td>
                        <td className="p-3 text-center">5</td>
                        <td className="p-3 text-center">10</td>
                        <td className="p-3 text-center">20/01/2023</td>
                        <td className="p-3 flex justify-center"><Check /></td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">Delight</td>
                        <td className="p-3">Lorem ipsum dolor sit amet. Qui quia quas eum explicabo consequuntur qui esse deserunt.</td>
                        <td className="p-3">Ceará</td>
                        <td className="p-3 text-center">5</td>
                        <td className="p-3 text-center">10</td>
                        <td className="p-3 text-center">20/01/2023</td>
                        <td className="p-3 flex justify-center"><X /></td>
                    </tr>
                    <tr className="border-t hover:bg-muted/50">
                        <td className="p-3">Lightsheer Duet</td>
                        <td className="p-3">Lorem ipsum dolor sit amet. Qui quia quas eum explicabo consequuntur qui esse deserunt.</td>
                        <td className="p-3">Ceará</td>
                        <td className="p-3 text-center">5</td>
                        <td className="p-3 text-center">10</td>
                        <td className="p-3 text-center">20/01/2023</td>
                        <td className="p-3 flex justify-center"><Check /></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}