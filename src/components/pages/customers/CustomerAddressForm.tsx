import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StateSelect } from "./StateSelect";

export function CustomerAddressForm() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>Preencha os dados de endereço do cliente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input id="cidade" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <StateSelect />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input id="bairro" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="space-y-2 flex-1">
                        <Label htmlFor="rua">Rua</Label>
                        <Input id="rua" placeholder="Nome da rua" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="number">Número</Label>
                        <Input id="number" placeholder="Número" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}