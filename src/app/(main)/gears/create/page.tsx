import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/utils/routes";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NovoEquipamentoPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={ROUTES.GEARS}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Novo Equipamento</h1>
                    <p className="text-muted-foreground">Cadastre um novo equipamento no sistema</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados do Equipamento</CardTitle>
                    <CardDescription>Preencha os dados do equipamento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do equipamento</Label>
                        <Textarea id="name" placeholder="Nome do equipamento" />
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea id="descricao" placeholder="Descreva o equipamento" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="porte">Porte</Label>
                            <Select>
                                <SelectTrigger id="porte">
                                    <SelectValue placeholder="Selecione o porte" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pequeno">Pequeno</SelectItem>
                                    <SelectItem value="medio">Médio</SelectItem>
                                    <SelectItem value="grande">Grande</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="aquisicao">Data de aquisição</Label>
                            <Input id="aquisicao" type="date" className="w-auto" />
                        </div>
                    </div>

                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline" asChild>
                    <Link href={ROUTES.GEARS}>Cancelar</Link>
                </Button>
                <Button>
                    <Save className="mr-2 h-4 w-4" />
          Salvar
                </Button>
            </div>
        </div>
    );
}
