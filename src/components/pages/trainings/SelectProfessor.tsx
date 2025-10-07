"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMediaQuery } from "usehooks-ts";
import { useMounted } from "@/hooks/useMounted";
import { useState } from "react";
import { Professor } from "@/utils/@types/professor";

interface SelectProfessorProps {
    disabled?: boolean;
    professors: Professor[] | undefined;
    selectedProfessor: string | undefined;
    onProfessorChange: (professorName: string) => void;
}

export function SelectProfessor({
    disabled = false,
    professors,
    selectedProfessor,
    onProfessorChange
}: SelectProfessorProps) {
    const isMounted = useMounted();
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (!isMounted) {
        return <div className="h-10 w-full" />;
    }

    return (
        <div className="flex flex-col space-y-1 w-full">
            {isDesktop ? (
                <DesktopSelect
                    disabled={ disabled }
                    allProfessors={ professors }
                    selectedProfessor={ selectedProfessor }
                    onProfessorChange={ onProfessorChange }
                />
            ) : (
                <MobileSelect
                    allProfessors={ professors }
                    selectedProfessor={ selectedProfessor }
                    onProfessorChange={ onProfessorChange }
                />
            )}
        </div>
    );
}

interface SelectProps {
    disabled?: boolean;
    allProfessors: Professor[] | undefined;
    selectedProfessor: string | undefined;
    onProfessorChange: (professorName: string) => void;
}

function DesktopSelect({ disabled, allProfessors, selectedProfessor, onProfessorChange }: SelectProps) {
    const [ open, setOpen ] = useState(false);

    const selectedValue = getDisplayValue(selectedProfessor, allProfessors);

    return (
        <Popover modal={ true } open={ open } onOpenChange={ setOpen }>
            <PopoverTrigger asChild>
                <Button disabled={ disabled } variant="outline" className="w-full justify-start group cursor-pointer">
                    {selectedValue ? (
                        <>{selectedValue.name} - {hideDocumentNumber(selectedValue.documentNumber)}</>
                    ) : (
                        <span className="text-placeholder group-hover:text-white">Selecione o professor</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-full" align="start">
                <ProfessorsList
                    allProfessors={ allProfessors }
                    setOpen={ setOpen }
                    onProfessorChange={ onProfessorChange }
                />
            </PopoverContent>
        </Popover>
    );
}

function MobileSelect({ allProfessors, selectedProfessor, onProfessorChange }: Omit<SelectProps, "disabled">) {
    const [ open, setOpen ] = useState(false);

    const selectedValue = getDisplayValue(selectedProfessor, allProfessors);

    return (
        <Drawer open={ open } onOpenChange={ setOpen }>
            <DrawerTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                    {selectedValue ? (
                        <>{selectedValue.name} - {hideDocumentNumber(selectedValue.documentNumber)}</>
                    ) : (
                        <span className="text-placeholder">Selecione o professor</span>
                    )}
                </Button>
            </DrawerTrigger>
            <DrawerContent className="w-full" aria-describedby={ undefined }>
                <DrawerTitle>
                    <div className="mt-4 border-t">
                        <ProfessorsList
                            allProfessors={ allProfessors }
                            setOpen={ setOpen }
                            onProfessorChange={ onProfessorChange }
                        />
                    </div>
                </DrawerTitle>
            </DrawerContent>
        </Drawer>
    );
}

interface ProfessorsListProps {
    setOpen: (_open: boolean) => void;
    onProfessorChange: (professorName: string) => void;
    allProfessors: Professor[] | undefined;
}

function ProfessorsList({ setOpen, onProfessorChange, allProfessors }: ProfessorsListProps) {
    const handleSelect = (professor: Professor) => {
        onProfessorChange(professor.name);
        setOpen(false);
    };

    return (
        <Command>
            <CommandInput placeholder="Filtrar professores..." />
            <CommandList>
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                <CommandGroup>
                    {allProfessors?.map((professor) => (
                        <CommandItem
                            key={ professor.professorId }
                            value={ `${professor.name} ${professor.documentNumber}` }
                            onSelect={ () => handleSelect(professor) }
                        >
                            {professor.name} - {hideDocumentNumber(professor.documentNumber)}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    );
}

function getDisplayValue(professorName: string | undefined, allProfessors: Professor[] | undefined): { name: string; documentNumber: string } | null {
    if (!professorName || !allProfessors) return null;

    const professor = allProfessors.find(p => p.name === professorName);
    if (professor) {
        return {
            name: professor.name,
            documentNumber: professor.documentNumber
        };
    }

    return null;
}

function hideDocumentNumber(documentNumber: string) {
    const digits = documentNumber.replace(/\D/g, "");

    if (digits.length === 11) {
        const visible = digits.slice(6);
        return `***.***.${visible.slice(0, 3)}-${visible.slice(3)}`;
    }

    if (digits.length === 14) {
        const visible = digits.slice(8);
        return `**.***.***/${visible.slice(0, 4)}-${visible.slice(4)}`;
    }

    return documentNumber;
}