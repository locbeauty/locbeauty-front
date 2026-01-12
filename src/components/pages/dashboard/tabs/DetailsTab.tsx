import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function DetailsTab() {
  return(
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="w-[89vw] md:w-auto">
        <CardHeader>
          <CardTitle>Número de Locações por Cliente</CardTitle>
          <CardDescription>Média de locações por cliente</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="text-4xl font-bold">3.7</div>
          <p className="mt-2 text-sm text-muted-foreground">+0.5 em relação ao período anterior</p>
          <div className="mt-4 w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span>Clientes Corporativos</span>
              <span className="font-medium">5.8</span>
            </div>
            <Progress value={ 58 } className="h-1" />

            <div className="flex justify-between text-sm">
              <span>Clientes Individuais</span>
              <span className="font-medium">1.6</span>
            </div>
            <Progress value={ 16 } className="h-1" />
          </div>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2 w-[89vw] md:w-auto">
        <CardHeader>
          <CardTitle>Equipamentos Mais Locados</CardTitle>
          <CardDescription>Top 5 equipamentos por número de locações</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipamento</TableHead>
                <TableHead>Locações</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Taxa de Ocupação</TableHead>
                <TableHead>Disponibilidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Escavadeira Hidráulica</TableCell>
                <TableCell>248</TableCell>
                <TableCell>R$ 372.000</TableCell>
                <TableCell>96%</TableCell>
                <TableCell>
                  <Badge className="bg-red-500">Baixa</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Retroescavadeira</TableCell>
                <TableCell>215</TableCell>
                <TableCell>R$ 279.500</TableCell>
                <TableCell>92%</TableCell>
                <TableCell>
                  <Badge className="bg-red-500">Baixa</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Compressor de Ar</TableCell>
                <TableCell>187</TableCell>
                <TableCell>R$ 168.300</TableCell>
                <TableCell>85%</TableCell>
                <TableCell>
                  <Badge className="bg-yellow-500">Média</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Gerador 100kVA</TableCell>
                <TableCell>156</TableCell>
                <TableCell>R$ 187.200</TableCell>
                <TableCell>78%</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">Alta</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Plataforma Elevatória</TableCell>
                <TableCell>142</TableCell>
                <TableCell>R$ 156.200</TableCell>
                <TableCell>74%</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">Alta</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}