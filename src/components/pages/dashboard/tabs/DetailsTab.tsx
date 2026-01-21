import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DetailsTab() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="w-[89vw] md:w-auto">
        <CardHeader>
          <CardTitle>Número de Locações por Cliente</CardTitle>
          <CardDescription>Média de locações por cliente</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="text-4xl font-bold">3.7</div>
          <p className="mt-2 text-sm text-muted-foreground">
            +0.5 em relação ao período anterior
          </p>
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
    </div>
  );
}
