"use client";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/DatePicker";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-provider";
import { UpdateNotice } from "@/services/notices.service";
import { useMemo, useEffect } from "react";
import { minutesToHHMM } from "@/utils/minutesToHHMM";
import { queryClient } from "@/app/(main)/layout";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { useAccess } from "@/contexts/access-provider";
import { USER_ROLES } from "@/utils/constants";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { Notice } from "@/utils/@types/notice";

const TimeGrid = ({
  value,
  onChange,
  options,
}: {
  value: number | undefined;
  onChange: (val: number) => void;
  options: { value: number; label: string }[];
}) => {
  return (
    <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-1 rounded-md border">
      {options.map((opt) => (
        <Button
          key={ opt.value }
          type="button"
          variant={ value === opt.value ? "default" : "outline" }
          size="sm"
          onClick={ () => onChange(opt.value) }
          className={ `
            relative text-xs h-9 transition-all duration-200
            ${value === opt.value ? "ring-2 ring-primary ring-offset-2" : ""}
          ` }
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
};

const updateNoticeSchema = z
  .object({
    description: z.string().min(1, "Descrição é obrigatória"),
    filialId: z.string().optional(),
    /* eslint-disable camelcase */
    startDate: z.date({ required_error: "Data de início é obrigatória" }),
    endDate: z.date({ required_error: "Data de término é obrigatória" }),
    startHourInMinutes: z.number({
      required_error: "Horário de início é obrigatório",
    }),
    endHourInMinutes: z.number({
      required_error: "Horário de término é obrigatório",
    }),
    /* eslint-enable camelcase */
  })
  .refine(
    (data) => {
      if (data.endDate < data.startDate) return false;
      if (data.endDate.getTime() === data.startDate.getTime()) {
        return data.endHourInMinutes > data.startHourInMinutes;
      }
      return true;
    },
    {
      message: "Data/Hora de término deve ser posterior ao início",
      path: [ "endHourInMinutes" ],
    },
  );

type UpdateNoticeSchemaType = z.infer<typeof updateNoticeSchema>;

interface UpdateNoticeDialogProps {
  notice: Notice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateNoticeDialog({
  notice,
  open,
  onOpenChange,
}: UpdateNoticeDialogProps) {
  const { user } = useAuth();
  const { getAccessibleFilialsForCreate } = useAccess();

  const accessibleFilialsObjects =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
      ? []
      : getAccessibleFilialsForCreate(SYSTEM_MODULES.NOTICES);

  const accessibleFilialsIds =
    accessibleFilialsObjects.length > 0
      ? accessibleFilialsObjects.map((f) => f.filialId)
      : user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
        ? undefined
        : [];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateNoticeSchemaType>({
    resolver: zodResolver(updateNoticeSchema),
  });

  useEffect(() => {
    if (notice) {
      reset({
        description: notice.description,
        filialId: notice.filialId,
        startDate: new Date(notice.startDate),
        endDate: new Date(notice.endDate),
        startHourInMinutes: notice.startHourInMinutes,
        endHourInMinutes: notice.endHourInMinutes,
      });
    }
  }, [ notice, reset ]);

  const timeOptions = useMemo(() => {
    const opts = [];
    for (let i = 0; i < 24 * 60; i += 30) {
      opts.push({
        value: i,
        label: minutesToHHMM(i),
      });
    }
    opts.push({
      value: 1429,
      label: "23:49",
    });
    return opts.sort((a, b) => a.value - b.value);
  }, []);

  const onSubmit: SubmitHandler<UpdateNoticeSchemaType> = async (data) => {
    if (!notice) return;

    const payload = {
      description: data.description,
      filialId: data.filialId,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      startHourInMinutes: data.startHourInMinutes,
      endHourInMinutes: data.endHourInMinutes,
    };

    const response = await UpdateNotice(notice.noticeId, payload);

    if (response.statusCode === 200) {
      toast.success("Aviso atualizado com sucesso!");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: [ "get-notices" ] });
    } else {
      toast.error(response.message || "Erro ao atualizar aviso");
    }
  };

  return (
    <Dialog open={ open } onOpenChange={ onOpenChange }>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Editar Aviso</DialogTitle>
        </DialogHeader>
        <form onSubmit={ handleSubmit(onSubmit) } className="space-y-4">
          <div className="space-y-2">
            <Label>Filial</Label>
            <SelectFilial
              control={ control }
              name="filialId"
              accessibleFilials={ accessibleFilialsIds }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Controller
              name="description"
              control={ control }
              render={ ({ field }) => (
                <Textarea
                  { ...field }
                  id="description"
                  placeholder="Digite o aviso..."
                  className="min-h-[100px]"
                />
              ) }
            />
            {errors.description && (
              <span className="text-destructive text-sm">
                {errors.description.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Controller
                  name="startDate"
                  control={ control }
                  render={ ({ field }) => (
                    <DatePicker
                      value={ field.value || null }
                      onChange={ field.onChange }
                      modal={ true }
                    />
                  ) }
                />
                {errors.startDate && (
                  <span className="text-destructive text-sm">
                    {errors.startDate.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label>Horário Início</Label>
                <Controller
                  name="startHourInMinutes"
                  control={ control }
                  render={ ({ field }) => (
                    <TimeGrid
                      value={ field.value }
                      onChange={ field.onChange }
                      options={ timeOptions }
                    />
                  ) }
                />
                {errors.startHourInMinutes && (
                  <span className="text-destructive text-sm">
                    {errors.startHourInMinutes.message}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Data de Término</Label>
                <Controller
                  name="endDate"
                  control={ control }
                  render={ ({ field }) => (
                    <DatePicker
                      value={ field.value || null }
                      onChange={ field.onChange }
                      modal={ true }
                    />
                  ) }
                />
                {errors.endDate && (
                  <span className="text-destructive text-sm">
                    {errors.endDate.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label>Horário Término</Label>
                <Controller
                  name="endHourInMinutes"
                  control={ control }
                  render={ ({ field }) => (
                    <TimeGrid
                      value={ field.value }
                      onChange={ field.onChange }
                      options={ timeOptions }
                    />
                  ) }
                />
                {errors.endHourInMinutes && (
                  <span className="text-destructive text-sm">
                    {errors.endHourInMinutes.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Atualizar Aviso
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
