import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/utils/routes";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NovoFuncionarioPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={ROUTES.EMPLOYEES}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Novo Funcionário</h1>
                    <p className="text-muted-foreground">Cadastre um novo funcionário no sistema</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados do Funcionário</CardTitle>
                    <CardDescription>Preencha os dados do funcionário</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome</Label>
                            <Input id="nome" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cpf">CPF</Label>
                            <Input id="cpf" placeholder="000.000.000-00" />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="cargo">Cargo</Label>
                            <Select>
                                <SelectTrigger id="cargo">
                                    <SelectValue placeholder="Selecione o cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gerente">Gerente</SelectItem>
                                    <SelectItem value="analista">Analista</SelectItem>
                                    <SelectItem value="tecnico">Técnico</SelectItem>
                                    <SelectItem value="assistente">Assistente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="regional">Regional</Label>
                            <Select>
                                <SelectTrigger id="regional">
                                    <SelectValue placeholder="Selecione a regional" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="norte">Norte</SelectItem>
                                    <SelectItem value="nordeste">Nordeste</SelectItem>
                                    <SelectItem value="centro-oeste">Centro-Oeste</SelectItem>
                                    <SelectItem value="sudeste">Sudeste</SelectItem>
                                    <SelectItem value="sul">Sul</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone</Label>
                            <Input id="telefone" placeholder="(00) 00000-0000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline" asChild>
                    <Link href={ROUTES.EMPLOYEES}>Cancelar</Link>
                </Button>
                <Button>
                    <Save className="mr-2 h-4 w-4" />
          Salvar
                </Button>
            </div>
        </div>
    );
}

