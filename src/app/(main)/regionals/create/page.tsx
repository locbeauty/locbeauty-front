import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/utils/routes";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NovaFilialPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={ROUTES.REGIONALS}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Nova Filial</h1>
                    <p className="text-muted-foreground">Cadastre uma nova filial no sistema</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados da Filial</CardTitle>
                    <CardDescription>Preencha os dados da filial</CardDescription>
                </CardHeader>
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
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline" asChild>
                    <Link href={ROUTES.REGIONALS}>Cancelar</Link>
                </Button>
                <Button>
                    <Save className="mr-2 h-4 w-4" />
          Salvar
                </Button>
            </div>
        </div>
    );
}
