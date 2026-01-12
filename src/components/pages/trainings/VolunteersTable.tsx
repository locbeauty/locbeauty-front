"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";

import { Volunteer } from "@/utils/@types/volunteer";
import { Training } from "@/utils/@types/training";
import { Button } from "@/components/ui/button";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { VolunteerDetailsDialog } from "./VolunteerDetailsDialog";

interface VolunteersTableProps {
  volunteers: Volunteer[] | undefined;
  allTrainings: Training[];
}

export function VolunteersTable({
  volunteers,
  allTrainings,
}: VolunteersTableProps) {
  const [ selectedVolunteer, setSelectedVolunteer ] = useState<Volunteer | null>(
    null
  );
  const [ isDetailsOpen, setIsDetailsOpen ] = useState(false);

  const handleOpenDetails = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsDetailsOpen(true);
  };

  const sortedVolunteers = useMemo(() => {
    if (!volunteers) return [];
    return [ ...volunteers ].sort((a, b) => a.name.localeCompare(b.name));
  }, [ volunteers ]);

  const handleToggleDialog = (open: boolean, data: unknown) => {
    if (open && data) {
      handleOpenDetails(data as Volunteer);
    } else {
      setIsDetailsOpen(open);
    }
  };

  return (
    <>
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
            {(!volunteers || volunteers.length === 0) && (
              <tr>
                <td className="text-center p-4" colSpan={ 4 }>
                  Nenhum modelo encontrado.
                </td>
              </tr>
            )}
            {sortedVolunteers.map((volunteer) => (
              <tr
                key={ volunteer.volunteerId }
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
                    onClick={ () => handleOpenDetails(volunteer) }
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
            key={ volunteer.volunteerId }
            cardData={ {
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
            } }
            rawData={ volunteer }
            handleToggleDialog={ handleToggleDialog }
          />
        ))}
        {(!volunteers || volunteers.length === 0) && (
          <p className="text-center text-muted-foreground py-8">
            Nenhum modelo encontrado.
          </p>
        )}
      </div>

      <VolunteerDetailsDialog
        isOpen={ isDetailsOpen }
        setIsOpen={ setIsDetailsOpen }
        volunteer={ selectedVolunteer }
        allTrainings={ allTrainings }
      />
    </>
  );
}
