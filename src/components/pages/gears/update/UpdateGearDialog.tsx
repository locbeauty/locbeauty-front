import { Save } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dispatch, SetStateAction } from "react";
import { gears } from "@/utils/mocks/gears";
import { regionals } from "@/utils/mocks/regionals";
import { Gear } from "@/utils/@types/gears";

interface UpdateGearDialogProps {
  isUpdateGearDialogOpen: boolean;
  setIsUpdateGearDialogOpen: Dispatch<SetStateAction<boolean>>;
  selectedGear: Gear | null;
  setSelectedGear: Dispatch<SetStateAction<Gear | null>>;
  setGears: Dispatch<SetStateAction<Gear[]>>;
}

export function UpdateGearDialog({
    isUpdateGearDialogOpen,
    setIsUpdateGearDialogOpen,
    selectedGear,
    setSelectedGear,
    setGears,
}: UpdateGearDialogProps) {
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (selectedGear) {
            setSelectedGear({
                ...selectedGear,
                [e.target.name]: e.target.value,
            });
        }
    };

    // Handle number input changes
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedGear) {
            setSelectedGear({
                ...selectedGear,
                [e.target.name]: Number.parseInt(e.target.value, 10) || 0,
            });
        }
    };

    // Handle select changes
    const handleSelectChange = (value: string, field: string) => {
        if (selectedGear) {
            setSelectedGear({
                ...selectedGear,
                [field]: value,
            });
        }
    };

    const handleSaveGear = () => {
        if (selectedGear) {
            setGears(
                gears.map((gear) => (gear.id === selectedGear.id ? selectedGear : gear))
            );
            setIsUpdateGearDialogOpen(false);
        }
    };

    const handleSwitchChange = (checked: boolean) => {
        if (selectedGear) {
            setSelectedGear({
                ...selectedGear,
                transferable: checked,
            });
        }
    };

    return (
        <Dialog
            open={ isUpdateGearDialogOpen }
            onOpenChange={ setIsUpdateGearDialogOpen }
        >
            <DialogContent
                className="sm:max-w-[600px]"
                aria-describedby={ undefined }
                onOpenAutoFocus={ (e) => e.preventDefault() }
            >
                <DialogHeader>
                    <DialogTitle>Editar Equipamento</DialogTitle>
                </DialogHeader>

                {selectedGear && (
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-1 gap-3">
                            <Label>Nome</Label>
                            <Input
                                name="name"
                                value={ selectedGear.name }
                                onChange={ handleInputChange }
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={ selectedGear.description }
                                onChange={ handleInputChange }
                                rows={ 3 }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid grid-cols-1 gap-3">
                                <Label htmlFor="region">Regional</Label>
                                <Select
                                    value={ selectedGear.region }
                                    onValueChange={ (value) => handleSelectChange(value, "region") }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma regional" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {regionals.map((regional) => {
                                            return (
                                                <SelectItem key={ regional.regionalId } value={ regional.title }>
                                                    {regional.title}, {regional.state.title}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <Label htmlFor="acquisitionDate">Data da aquisição</Label>
                                <Input
                                    id="acquisitionDate"
                                    name="acquisitionDate"
                                    value={ selectedGear.acquisitionDate ? selectedGear.acquisitionDate.toLocaleDateString(
                                        "pt-BR"
                                    ) : "Não informado" }
                                    onChange={ handleInputChange }
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 max-w-[90%] md:max-w-[40%]">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="totalUnits">Unidades totais</Label>
                                <Input
                                    id="totalUnits"
                                    name="totalUnits"
                                    type="number"
                                    value={ selectedGear.totalUnits }
                                    onChange={ handleNumberChange }
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="availableUnits">Unidades disponíveis</Label>
                                <Input
                                    id="availableUnits"
                                    name="availableUnits"
                                    type="number"
                                    value={ selectedGear.availableUnits }
                                    onChange={ handleNumberChange }
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <Label htmlFor="totalUnits">Unidades defeituosas</Label>
                                <Input
                                    id="totalUnits"
                                    name="totalUnits"
                                    type="number"
                                    value={ selectedGear.outOfServiceUnits }
                                    onChange={ handleNumberChange }
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="transferable"
                                checked={ selectedGear.transferable }
                                onCheckedChange={ handleSwitchChange }
                            />
                            <Label htmlFor="transferable">Pode ser transferido</Label>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={ () => setIsUpdateGearDialogOpen(false) }
                    >
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
