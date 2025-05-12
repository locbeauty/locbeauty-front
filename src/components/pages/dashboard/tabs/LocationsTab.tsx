import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, TrendingUp } from "lucide-react";

export function LocationsTab() {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="w-[89vw] md:w-auto">
                <CardHeader>
                    <CardTitle>Distribuição Geográfica</CardTitle>
                    <CardDescription>Locações por região</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <MapPin className="mx-auto h-12 w-12 opacity-50" />
                            <p className="mt-2">Mapa de distribuição geográfica</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="w-[89vw] md:w-auto">
                <CardHeader>
                    <CardTitle>Crescimento por Cidade</CardTitle>
                    <CardDescription>Comparativo de crescimento anual</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cidade</TableHead>
                                <TableHead>Locações</TableHead>
                                <TableHead>Crescimento</TableHead>
                                <TableHead>Tendência</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">São Paulo</TableCell>
                                <TableCell>1.423</TableCell>
                                <TableCell>+18%</TableCell>
                                <TableCell>
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Rio de Janeiro</TableCell>
                                <TableCell>952</TableCell>
                                <TableCell>+12%</TableCell>
                                <TableCell>
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Belo Horizonte</TableCell>
                                <TableCell>687</TableCell>
                                <TableCell>+24%</TableCell>
                                <TableCell>
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Brasília</TableCell>
                                <TableCell>532</TableCell>
                                <TableCell>+8%</TableCell>
                                <TableCell>
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Curitiba</TableCell>
                                <TableCell>408</TableCell>
                                <TableCell>+15%</TableCell>
                                <TableCell>
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}