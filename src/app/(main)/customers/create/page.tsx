import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/utils/routes";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NovoClientePage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={ROUTES.CUSTOMERS}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Novo Cliente</h1>
                    <p className="text-muted-foreground">Cadastre um novo cliente no sistema</p>
                </div>
            </div>

            <Tabs defaultValue="dados" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
                    <TabsTrigger value="endereco">Endereço</TabsTrigger>
                </TabsList>
                <TabsContent value="dados">
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
                </TabsContent>
                <TabsContent value="endereco">
                    <Card>
                        <CardHeader>
                            <CardTitle>Endereço</CardTitle>
                            <CardDescription>Preencha os dados de endereço do cliente</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="rua">Rua</Label>
                                <Input id="rua" placeholder="Nome da rua e número" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bairro">Bairro</Label>
                                <Input id="bairro" />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="cidade">Cidade</Label>
                                    <Input id="cidade" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="estado">Estado</Label>
                                    <Select>
                                        <SelectTrigger id="estado">
                                            <SelectValue placeholder="UF" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ac">AC</SelectItem>
                                            <SelectItem value="al">AL</SelectItem>
                                            <SelectItem value="am">AM</SelectItem>
                                            <SelectItem value="ap">AP</SelectItem>
                                            <SelectItem value="ba">BA</SelectItem>
                                            <SelectItem value="ce">CE</SelectItem>
                                            <SelectItem value="df">DF</SelectItem>
                                            <SelectItem value="es">ES</SelectItem>
                                            <SelectItem value="go">GO</SelectItem>
                                            <SelectItem value="ma">MA</SelectItem>
                                            <SelectItem value="mg">MG</SelectItem>
                                            <SelectItem value="ms">MS</SelectItem>
                                            <SelectItem value="mt">MT</SelectItem>
                                            <SelectItem value="pa">PA</SelectItem>
                                            <SelectItem value="pb">PB</SelectItem>
                                            <SelectItem value="pe">PE</SelectItem>
                                            <SelectItem value="pi">PI</SelectItem>
                                            <SelectItem value="pr">PR</SelectItem>
                                            <SelectItem value="rj">RJ</SelectItem>
                                            <SelectItem value="rn">RN</SelectItem>
                                            <SelectItem value="ro">RO</SelectItem>
                                            <SelectItem value="rr">RR</SelectItem>
                                            <SelectItem value="rs">RS</SelectItem>
                                            <SelectItem value="sc">SC</SelectItem>
                                            <SelectItem value="se">SE</SelectItem>
                                            <SelectItem value="sp">SP</SelectItem>
                                            <SelectItem value="to">TO</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pais">País</Label>
                                <Select defaultValue="brasil">
                                    <SelectTrigger id="pais">
                                        <SelectValue placeholder="Selecione o país" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="brasil">Brasil</SelectItem>
                                        <SelectItem value="argentina">Argentina</SelectItem>
                                        <SelectItem value="chile">Chile</SelectItem>
                                        <SelectItem value="colombia">Colômbia</SelectItem>
                                        <SelectItem value="uruguai">Uruguai</SelectItem>
                                        <SelectItem value="paraguai">Paraguai</SelectItem>
                                        <SelectItem value="outro">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4">
                <Button variant="outline" asChild>
                    <Link href="/dashboard/clientes">Cancelar</Link>
                </Button>
                <Button>
                    <Save className="mr-2 h-4 w-4" />
          Salvar
                </Button>
            </div>
        </div>
    );
}
