import { useMemo, useState } from "react";
import { Eye, Filter, X } from "lucide-react";

import { Volunteer } from "@/utils/@types/volunteer";
import { Training } from "@/utils/@types/training";
import { Button } from "@/components/ui/button";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { VolunteerDetailsDialog } from "./VolunteerDetailsDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface VolunteersTableProps {
  volunteers: Volunteer[] | undefined;
  allTrainings: Training[];
}

export function VolunteersTable({
  volunteers,
  allTrainings,
}: VolunteersTableProps) {
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filters
  const [filterName, setFilterName] = useState("");
  const [filterPending, setFilterPending] = useState(false);

  const handleOpenDetails = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsDetailsOpen(true);
  };

  const clearFilters = () => {
    setFilterName("");
    setFilterPending(false);
  };

  const sortedVolunteers = useMemo(() => {
    if (!volunteers) return [];
    let result = [...volunteers];

    // Name Filter
    if (filterName) {
      result = result.filter((v) =>
        v.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    // Pending Payment Filter
    if (filterPending) {
      const volunteersWithPending = new Set<string>();
      allTrainings.forEach((training) => {
        if (
          training.TrainingPayment?.some((p) => p.paymentStatus === "Pendente")
        ) {
          // Assuming a training tracks volunteerId. Wait, `Training` type has `Volunteer` relation or `volunteerId`?
          // The `Training` type usually has `volunteerId` or `Volunteer`.
          // Let's assume `volunteerId` exists or we check `training.Volunteer?.volunteerId`.
          // But `Training` type usually has `volunteerId` as FK.
          // Let's check `training.volunteerId`.
          // If checking the `allTrainings` confirms `volunteerId`.
          if (training.volunteerId)
            volunteersWithPending.add(training.volunteerId);
        }
      });
      result = result.filter((v) => volunteersWithPending.has(v.volunteerId));
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [volunteers, filterName, filterPending, allTrainings]);

  const handleToggleDialog = (open: boolean, data: unknown) => {
    if (open && data) {
      handleOpenDetails(data as Volunteer);
    } else {
      setIsDetailsOpen(open);
    }
  };

  return (
    <>
      {/* Filters Toolbar */}
      <div className="bg-muted/30 p-4 rounded-lg border mb-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
          <Filter className="h-4 w-4" />
          Filtros
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="space-y-1 w-full sm:w-1/3">
            <Label className="text-xs">Nome do Modelo</Label>
            <Input
              placeholder="Buscar por nome..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="h-9 bg-background"
            />
          </div>
          <div className="flex items-center space-x-2 border p-2 rounded-md h-9 bg-background px-3">
            <Switch
              id="pending-volunteer"
              checked={filterPending}
              onCheckedChange={setFilterPending}
            />
            <Label
              htmlFor="pending-volunteer"
              className="text-sm cursor-pointer whitespace-nowrap"
            >
              Com Pagamento Pendente
            </Label>
          </div>
          <div className="flex-1 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground h-9"
            >
              <X className="h-3 w-3 mr-1" /> Limpar
            </Button>
          </div>
        </div>
      </div>

      <div className="border rounded-lg w-full overflow-x-auto hidden md:block">
        <table className="min-w-[800px] w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium">CPF</th>
              <th className="text-center p-3 font-medium">Telefone</th>
              <th className="text-center p-3 font-medium">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {sortedVolunteers.length === 0 && (
              <tr>
                <td className="text-center p-4" colSpan={4}>
                  {volunteers ? "Nenhum modelo encontrado." : "Carregando..."}
                </td>
              </tr>
            )}
            {sortedVolunteers.map((volunteer) => (
              <tr
                key={volunteer.volunteerId}
                className="border-t hover:bg-muted/50"
              >
                <td className="p-3 text-sm font-medium">{volunteer.name}</td>
                <td className="p-3 text-sm">{volunteer.documentNumber}</td>
                <td className="p-3 text-center text-sm">
                  {volunteer.cellphone}
                </td>
                <td className="p-3 flex justify-center items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDetails(volunteer)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {sortedVolunteers.map((volunteer) => (
          <ResponsiveCard
            key={volunteer.volunteerId}
            cardData={{
              id: volunteer.volunteerId,
              title: volunteer.name,
              description: "Paciente Modelo",
              items: [
                {
                  itemLabel: "CPF: ",
                  itemInfo: volunteer.documentNumber || "N/A",
                },
                { itemLabel: "Tel: ", itemInfo: volunteer.cellphone },
              ],
            }}
            rawData={volunteer}
            handleToggleDialog={handleToggleDialog}
          />
        ))}
        {sortedVolunteers.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {volunteers ? "Nenhum modelo encontrado." : "Carregando..."}
          </p>
        )}
      </div>

      <VolunteerDetailsDialog
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
        volunteer={selectedVolunteer}
        allTrainings={allTrainings}
      />
    </>
  );
}
