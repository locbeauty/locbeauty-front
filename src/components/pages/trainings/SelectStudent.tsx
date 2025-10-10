"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMediaQuery } from "usehooks-ts";
import { useMounted } from "@/hooks/useMounted";
import { useState } from "react";
import { Student } from "@/utils/@types/student";

interface SelectStudentProps {
    disabled?: boolean;
    students: Student[] | undefined;
    selectedStudent: string | undefined;
    onStudentChange: (studentName: string) => void;
}

export function SelectStudent({
    disabled = false,
    students,
    selectedStudent,
    onStudentChange
}: SelectStudentProps) {
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
                    allStudents={ students }
                    selectedStudent={ selectedStudent }
                    onStudentChange={ onStudentChange }
                />
            ) : (
                <MobileSelect
                    allStudents={ students }
                    selectedStudent={ selectedStudent }
                    onStudentChange={ onStudentChange }
                />
            )}
        </div>
    );
}

interface SelectProps {
    disabled?: boolean;
    allStudents: Student[] | undefined;
    selectedStudent: string | undefined;
    onStudentChange: (studentName: string) => void;
}

function DesktopSelect({ disabled, allStudents, selectedStudent, onStudentChange }: SelectProps) {
    const [ open, setOpen ] = useState(false);

    const selectedValue = getDisplayValue(selectedStudent, allStudents);

    return (
        <Popover modal={ true } open={ open } onOpenChange={ setOpen }>
            <PopoverTrigger asChild>
                <Button disabled={ disabled } variant="outline" className="w-full justify-start group cursor-pointer">
                    {selectedValue ? (
                        <>{selectedValue.name} - {hideDocumentNumber(selectedValue.documentNumber)}</>
                    ) : (
                        <span className="text-placeholder group-hover:text-white">Selecione o aluno</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-full" align="start">
                <StudentsList
                    allStudents={ allStudents }
                    setOpen={ setOpen }
                    onStudentChange={ onStudentChange }
                />
            </PopoverContent>
        </Popover>
    );
}

function MobileSelect({ allStudents, selectedStudent, onStudentChange }: Omit<SelectProps, "disabled">) {
    const [ open, setOpen ] = useState(false);

    const selectedValue = getDisplayValue(selectedStudent, allStudents);

    return (
        <Drawer open={ open } onOpenChange={ setOpen }>
            <DrawerTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                    {selectedValue ? (
                        <>{selectedValue.name} - {hideDocumentNumber(selectedValue.documentNumber)}</>
                    ) : (
                        <span className="text-placeholder">Selecione o aluno</span>
                    )}
                </Button>
            </DrawerTrigger>
            <DrawerContent className="w-full" aria-describedby={ undefined }>
                <DrawerTitle>
                    <div className="mt-4 border-t">
                        <StudentsList
                            allStudents={ allStudents }
                            setOpen={ setOpen }
                            onStudentChange={ onStudentChange }
                        />
                    </div>
                </DrawerTitle>
            </DrawerContent>
        </Drawer>
    );
}

interface StudentsListProps {
    setOpen: (_open: boolean) => void;
    onStudentChange: (studentName: string) => void;
    allStudents: Student[] | undefined;
}

function StudentsList({ setOpen, onStudentChange, allStudents }: StudentsListProps) {
    const handleSelect = (student: Student) => {
        onStudentChange(student.name);
        setOpen(false);
    };

    return (
        <Command>
            <CommandInput placeholder="Filtrar alunos..." />
            <CommandList>
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                <CommandGroup>
                    {allStudents?.map((student) => (
                        <CommandItem
                            key={ student.studentId }
                            value={ `${student.name} ${student.documentNumber}` }
                            onSelect={ () => handleSelect(student) }
                        >
                            {student.name} - {hideDocumentNumber(student.documentNumber)}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    );
}

function getDisplayValue(studentName: string | undefined, allStudents: Student[] | undefined): { name: string; documentNumber: string } | null {
    if (!studentName || !allStudents) return null;

    const student = allStudents.find(s => s.name === studentName);
    if (student) {
        return {
            name: student.name,
            documentNumber: student.documentNumber
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