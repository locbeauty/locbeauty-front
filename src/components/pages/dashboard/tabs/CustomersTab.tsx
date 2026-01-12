import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomPieChart } from "../CustomPieChart";
import { Clock, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function CustomersTab() {

  const satisfacaoData = [
    { name: "5 estrelas", value: 65 },
    { name: "4 estrelas", value: 23 },
    { name: "3 estrelas", value: 8 },
    { name: "2 estrelas", value: 3 },
    { name: "1 estrela", value: 1 },
  ];

  return (
    <>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Card className="w-[89vw] md:w-auto">
          <CardHeader>
            <CardTitle>Taxa de Retenção</CardTitle>
            <CardDescription>Clientes que renovam contratos</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="text-4xl font-bold mb-4">78%</div>
            <Progress value={ 78 } className="h-2 w-full" />
            <p className="mt-2 text-sm text-muted-foreground">+5% em relação ao período anterior</p>
          </CardContent>
        </Card>
        <Card className="w-[89vw] md:w-auto">
          <CardHeader>
            <CardTitle>Satisfação do Cliente</CardTitle>
            <CardDescription>Distribuição das avaliações</CardDescription>
          </CardHeader>
          <CardContent>
            <CustomPieChart
              data={ satisfacaoData }
              dataKey="value"
              nameKey="name"
              height={ 200 }
              colors={ [
                "hsl(var(--success, 142 76% 36%))",
                "hsl(var(--primary))",
                "hsl(var(--warning, 38 92% 50%))",
                "hsl(var(--warning, 38 92% 50%))",
                "hsl(var(--destructive))",
              ] }
              valueFormatter={ (value) => `${value}%` }
            />
          </CardContent>
        </Card>
        <Card className="w-[89vw] md:w-auto">
          <CardHeader>
            <CardTitle>Tempo Médio de Resposta</CardTitle>
            <CardDescription>Tempo para atender solicitações</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-primary" />
              <div className="text-3xl font-bold">2.4h</div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">-15% em relação ao período anterior</p>
            <div className="mt-4 w-full">
              <div className="flex items-center justify-between text-sm">
                <span>Solicitações Urgentes</span>
                <span className="font-medium">1.2h</span>
              </div>
              <Progress value={ 50 } className="h-1 mt-1" />

              <div className="flex items-center justify-between text-sm mt-2">
                <span>Solicitações Normais</span>
                <span className="font-medium">3.5h</span>
              </div>
              <Progress value={ 70 } className="h-1 mt-1" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="w-[89vw] md:w-auto">
        <CardHeader>
          <CardTitle>Clientes Principais</CardTitle>
          <CardDescription>Clientes com maior número de locações</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Locações</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Satisfação</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>CC</AvatarFallback>
                    </Avatar>
                    <div>
                      <div>Construtora Central</div>
                      <div className="text-xs text-muted-foreground">São Paulo</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>48</TableCell>
                <TableCell>R$ 245.800</TableCell>
                <TableCell>
                  <div className="flex">
                    {[ 1, 2, 3, 4, 5 ].map((star) => (
                      <Star
                        key={ star }
                        className={ `h-3 w-3 ${star <= 5 ? "fill-primary text-primary" : ""}` }
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-500">Ativo</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>ER</AvatarFallback>
                    </Avatar>
                    <div>
                      <div>Engenharia Rio</div>
                      <div className="text-xs text-muted-foreground">Rio de Janeiro</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>36</TableCell>
                <TableCell>R$ 187.400</TableCell>
                <TableCell>
                  <div className="flex">
                    {[ 1, 2, 3, 4, 5 ].map((star) => (
                      <Star
                        key={ star }
                        className={ `h-3 w-3 ${star <= 4 ? "fill-primary text-primary" : ""}` }
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-500">Ativo</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>MC</AvatarFallback>
                    </Avatar>
                    <div>
                      <div>Mineradora Curitiba</div>
                      <div className="text-xs text-muted-foreground">Curitiba</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>29</TableCell>
                <TableCell>R$ 156.200</TableCell>
                <TableCell>
                  <div className="flex">
                    {[ 1, 2, 3, 4, 5 ].map((star) => (
                      <Star
                        key={ star }
                        className={ `h-3 w-3 ${star <= 5 ? "fill-primary text-primary" : ""}` }
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-500">Ativo</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>PB</AvatarFallback>
                    </Avatar>
                    <div>
                      <div>Pavimentadora Brasília</div>
                      <div className="text-xs text-muted-foreground">Brasília</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>24</TableCell>
                <TableCell>R$ 132.800</TableCell>
                <TableCell>
                  <div className="flex">
                    {[ 1, 2, 3, 4, 5 ].map((star) => (
                      <Star
                        key={ star }
                        className={ `h-3 w-3 ${star <= 4 ? "fill-primary text-primary" : ""}` }
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-500">Ativo</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>CB</AvatarFallback>
                    </Avatar>
                    <div>
                      <div>Construtora BH</div>
                      <div className="text-xs text-muted-foreground">Belo Horizonte</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>18</TableCell>
                <TableCell>R$ 98.600</TableCell>
                <TableCell>
                  <div className="flex">
                    {[ 1, 2, 3, 4 ].map((star) => (
                      <Star
                        key={ star }
                        className={ `h-3 w-3 ${star <= 3 ? "fill-primary text-primary" : ""}` }
                      />
                    ))}
                    <Star className="h-3 w-3" />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-yellow-500">Renovação</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}