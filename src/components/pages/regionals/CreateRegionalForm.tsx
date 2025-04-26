import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateRegionalForm() {
    return (
        <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" placeholder="00.000.000/0000-00" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input id="descricao" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="gerente">Gerente</Label>
                <Input id="gerente" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="(00) 0000-0000" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Endereço</Label>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="cep">CEP</Label>
                        <Input id="cep" placeholder="00000-000" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="logradouro">Logradouro</Label>
                        <Input id="logradouro" />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="numero">Número</Label>
                        <Input id="numero" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="complemento">Complemento</Label>
                        <Input id="complemento" />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input id="bairro" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input id="cidade" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Input id="estado" />
                    </div>
                </div>
            </div>
        </CardContent>
    );
}