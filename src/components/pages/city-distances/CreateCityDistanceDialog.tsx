"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { createCityDistance } from "@/services/city-distances.service";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, MapPin } from "lucide-react";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { useAuth } from "@/contexts/auth-provider";
import { BRAZILIAN_STATES, USER_ROLES } from "@/utils/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  cityName: z.string().min(1, "Nome da cidade é obrigatório"),
  state: z.string().length(2, "Estado deve ter 2 letras").toUpperCase(),
  distance: z.coerce.number().int().positive("Distância deve ser positiva"),
  filialId: z.string().min(1, "Filial é obrigatória"),
});

interface CreateCityDistanceDialogProps {
  preSelectedFilialId?: string;
}

export function CreateCityDistanceDialog({
  preSelectedFilialId,
}: CreateCityDistanceDialogProps) {
  const [ open, setOpen ] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const defaultFilialId =
    preSelectedFilialId ||
    (user?.role === USER_ROLES.MASTER ? "" : user?.sourceFilialId || "");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cityName: "",
      state: "",
      distance: 0,
      filialId: defaultFilialId,
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createCityDistance(values);
      toast.success("Distância cadastrada com sucesso!");
      setOpen(false);
      form.reset({
        ...values,
        cityName: "",
        state: "",
        distance: 0,
      });
      queryClient.invalidateQueries({ queryKey: [ "city-distances" ] });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cadastrar distância. Verifique se já existe.");
    }
  }

  return (
    <Dialog open={ open } onOpenChange={ setOpen }>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Nova Distância
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastro Manual de Distância</DialogTitle>
          <DialogDescription>
            Defina a distância fixa de uma cidade para a filial selecionada.
          </DialogDescription>
        </DialogHeader>

        <Form { ...form }>
          <form onSubmit={ form.handleSubmit(onSubmit) } className="space-y-4">
            <FormField
              control={ form.control }
              name="filialId"
              render={ ({ field }) => (
                <FormItem>
                  <FormLabel>Filial de Origem</FormLabel>
                  <SelectFilial
                    onValueChange={ field.onChange }
                    value={ field.value }
                    defaultFilial={ field.value }
                  />
                  <FormMessage />
                </FormItem>
              ) }
            />

            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={ form.control }
                name="cityName"
                render={ ({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Recife" { ...field } />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ) }
              />

              <FormField
                control={ form.control }
                name="state"
                render={ ({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>UF</FormLabel>
                    <Select
                      onValueChange={ field.onChange }
                      defaultValue={ field.value }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BRAZILIAN_STATES.map((state) => (
                          <SelectItem key={ state } value={ state }>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                ) }
              />
            </div>

            <FormField
              control={ form.control }
              name="distance"
              render={ ({ field }) => (
                <FormItem>
                  <FormLabel>Distância (km)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        className="pl-9"
                        placeholder="0"
                        { ...field }
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              ) }
            />

            <DialogFooter>
              <Button type="submit" disabled={ isSubmitting }>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar Distância
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
