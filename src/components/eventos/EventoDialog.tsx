import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { type Evento } from "@/services/eventosService";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface EventoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evento?: Evento | null;
  onSave: (evento: Partial<Evento>) => void;
  campoId?: number;
}

export function EventoDialog({ 
  open, 
  onOpenChange, 
  evento, 
  onSave, 
  campoId 
}: EventoDialogProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<Partial<Evento>>({
    defaultValues: {
      titulo: "",
      descripcion: "",
      tipo: "Reunión",
      fecha_creacion: "",
      fecha_fin: "",
      ubicacion: "",
      enlace_virtual: "",
      estado: "Programado",
      es_publico: true,
    },
  });

  const tipo = watch("tipo");
  const estado = watch("estado");
  const es_publico = watch("es_publico");

  useEffect(() => {
    if (evento) {
      reset({
        ...evento,
        fecha_creacion: evento.fecha_creacion ? new Date(evento.fecha_creacion).toISOString().slice(0, 16) : "",
        fecha_fin: evento.fecha_fin ? new Date(evento.fecha_fin).toISOString().slice(0, 16) : "",
      });
    } else {
      reset({
        titulo: "",
        descripcion: "",
        tipo: "Reunión",
        fecha_creacion: "",
        fecha_fin: "",
        ubicacion: "",
        enlace_virtual: "",
        estado: "Programado",
        es_publico: true,
      });
    }
  }, [evento, reset]);

  const onSubmit = (data: Partial<Evento>) => {
    onSave({ 
      ...data, 
      id: evento?.id,
      id_campo: campoId 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {evento?.id ? "Editar Evento" : "Nuevo Evento"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              {...register("titulo", { required: true })}
              placeholder="Ej: Reunión mensual del equipo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              {...register("descripcion")}
              placeholder="Describe el evento..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={tipo}
                onValueChange={(value) => setValue("tipo", value as Evento["tipo"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="Reunión">Reunión</SelectItem>
                  <SelectItem value="Taller">Taller</SelectItem>
                  <SelectItem value="Presentación">Presentación</SelectItem>
                  <SelectItem value="Conferencia">Conferencia</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select
                value={estado}
                onValueChange={(value) => setValue("estado", value as Evento["estado"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="Programado">Programado</SelectItem>
                  <SelectItem value="En Curso">En Curso</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_creacion">Fecha y Hora de Inicio *</Label>
              <Input
                id="fecha_creacion"
                type="datetime-local"
                {...register("fecha_creacion", { required: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_fin">Fecha y Hora de Fin *</Label>
              <Input
                id="fecha_fin"
                type="datetime-local"
                {...register("fecha_fin", { required: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ubicacion">Ubicación</Label>
            <Input
              id="ubicacion"
              {...register("ubicacion")}
              placeholder="Ej: Sala de conferencias 301"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="enlace_virtual">Enlace Virtual</Label>
            <Input
              id="enlace_virtual"
              type="url"
              {...register("enlace_virtual")}
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="es_publico"
              checked={es_publico}
              onCheckedChange={(checked) => setValue("es_publico", checked)}
            />
            <Label htmlFor="es_publico" className="cursor-pointer">
              Evento público (visible para todos)
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {evento?.id ? "Guardar Cambios" : "Crear Evento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
