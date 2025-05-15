
import { Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dispatch, SetStateAction } from "react";
import { Gear } from "../GearCard";
import { gears } from "@/utils/mocks/gears";

interface EditDialogProps {
    isDialogOpen: boolean;
    setIsDialogOpen: Dispatch<SetStateAction<boolean>>
    editedGear: Gear | null
    setEditedGear: Dispatch<SetStateAction<Gear | null>>
    setSelectedGear: Dispatch<SetStateAction<Gear | null>>
    setGears: Dispatch<SetStateAction<Gear[]>>
}

export function EditDialog({ isDialogOpen, setIsDialogOpen, editedGear, setEditedGear, setSelectedGear, setGears }: EditDialogProps) {

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (editedGear) {
            setEditedGear({
                ...editedGear,
                [e.target.name]: e.target.value,
            });
        }
    };

    // Handle number input changes
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editedGear) {
            setEditedGear({
                ...editedGear,
                [e.target.name]: Number.parseInt(e.target.value, 10) || 0,
            });
        }
    };

    // Handle select changes
    const handleSelectChange = (value: string, field: string) => {
        if (editedGear) {
            setEditedGear({
                ...editedGear,
                [field]: value,
            });
        }
    };

    // Handle closing the dialog
    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedGear(null);
        setEditedGear(null);
    };

    const handleSaveGear = () => {
        if (editedGear) {
            setGears(gears.map((gear) => (gear.id === editedGear.id ? editedGear : gear)));
            setIsDialogOpen(false);
        }
    };

    const handleSwitchChange = (checked: boolean) => {
        if (editedGear) {
            setEditedGear({
                ...editedGear,
                transferable: checked,
            });
        }
    };

    const regions = [ "Pernambuco", "Bahia", "Rio de Janeiro", "Ceará", "São Paulo", "Minas Gerais" ];

    return (
        <Dialog open={ isDialogOpen } onOpenChange={ setIsDialogOpen }>
            <DialogContent className="sm:max-w-[600px]" aria-describedby={ undefined } onOpenAutoFocus={ (e) => e.preventDefault() }>
                <DialogHeader>
                    <DialogTitle>Editar Equipamento</DialogTitle>
                </DialogHeader>

                {editedGear && (
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-1 gap-3">
                            <Label htmlFor="name">Nome</Label>
                            <Input id="name" name="name" value={ editedGear.name } onChange={ handleInputChange } />
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={ editedGear.description }
                                onChange={ handleInputChange }
                                rows={ 3 }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid grid-cols-1 gap-3">
                                <Label htmlFor="region">Regional</Label>
                                <Select value={ editedGear.region } onValueChange={ (value) => handleSelectChange(value, "region") }>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma regional" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {regions.map((region) => (
                                            <SelectItem key={ region } value={ region }>
                                                {region}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <Label htmlFor="acquisitionDate">Data da aquisição</Label>
                                <Input
                                    id="acquisitionDate"
                                    name="acquisitionDate"
                                    value={ editedGear.acquisitionDate }
                                    onChange={ handleInputChange }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid grid-cols-1 gap-3">
                                <Label htmlFor="availableUnits">Unidades disponíveis</Label>
                                <Input
                                    id="availableUnits"
                                    name="availableUnits"
                                    type="number"
                                    value={ editedGear.availableUnits }
                                    onChange={ handleNumberChange }
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <Label htmlFor="totalUnits">Unidades totais</Label>
                                <Input
                                    id="totalUnits"
                                    name="totalUnits"
                                    type="number"
                                    value={ editedGear.totalUnits }
                                    onChange={ handleNumberChange }
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch id="transferable" checked={ editedGear.transferable } onCheckedChange={ handleSwitchChange } />
                            <Label htmlFor="transferable">Pode ser transferido</Label>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={ handleCloseDialog }>
              Cancelar
                    </Button>
                    <Button onClick={ handleSaveGear }>
                        <Save className="mr-2 h-4 w-4" />
              Salvar alterações
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}