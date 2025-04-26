import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function CustomerGeneralInformationForm() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>Preencha os dados pessoais do cliente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <Label>Tipo de Pessoa</Label>
                        <RadioGroup defaultValue="pf" className="flex gap-4 mt-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pf" id="pf" />
                                <Label htmlFor="pf">Pessoa Física</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pj" id="pj" />
                                <Label htmlFor="pj">Pessoa Jurídica</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="empresa">Empresa</Label>
                        <Input id="empresa" placeholder="Nome da empresa" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input id="nome" placeholder="Nome completo" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input id="instagram" placeholder="@usuario" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone</Label>
                            <Input id="telefone" placeholder="(00) 00000-0000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cpf-cnpj">CPF / CNPJ</Label>
                            <Input id="cpf-cnpj" placeholder="000.000.000-00 ou 00.000.000/0000-00" />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="nascimento">Nascimento</Label>
                            <Input id="nascimento" type="date" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="exemplo@email.com" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}