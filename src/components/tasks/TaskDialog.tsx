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
import { Textarea } from "@/components/ui/textarea";
import { Task } from "@/pages/Tasks";
import { integrantesService } from "@/services/integrantesService";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSave: (task: Omit<Task, "id"> & { id?: number }) => void;
  projectId?: number;
  campoId?: number;
}

export function TaskDialog({ open, onOpenChange, task, onSave, projectId, campoId }: TaskDialogProps) {
  const [integrantes, setIntegrantes] = useState<any[]>([]);
  const [loadingIntegrantes, setLoadingIntegrantes] = useState(false);
  
  const { register, handleSubmit, reset, setValue, watch } = useForm<Partial<Task>>({
    defaultValues: {
      nombre: "",
      descripcion: "",
      estado: "Pendiente",
      prioridad: "Media",
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: "",
      id_proyecto: projectId || 1,
    },
  });

  const estado = watch("estado");
  const prioridad = watch("prioridad");

  useEffect(() => {
    if (open && campoId) {
      loadIntegrantes();
    }
  }, [open, campoId]);

  useEffect(() => {
    if (task) {
      reset(task);
    } else {
      reset({
        nombre: "",
        descripcion: "",
        estado: "Pendiente",
        prioridad: "Media",
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: "",
        id_proyecto: projectId || 1,
      });
    }
  }, [task, reset, projectId]);

  const loadIntegrantes = async () => {
    if (!campoId) return;
    
    try {
      setLoadingIntegrantes(true);
      const data = await integrantesService.getAll();
      // Filtrar por campo y solo activos
      const filtered = data.filter((i: any) => 
        i.id_campo === campoId && i.estado === 'Activo'
      );
      setIntegrantes(filtered);
    } catch (error) {
      console.error('Error al cargar integrantes:', error);
    } finally {
      setLoadingIntegrantes(false);
    }
  };

  const onSubmit = (data: Task) => {
    onSave({ ...data, id: task?.id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {task ? "Editar Tarea" : "Nueva Tarea"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Título</Label>
            <Input
              id="nombre"
              {...register("nombre", { required: true })}
              placeholder="Ej: Diseñar interfaz de usuario"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              {...register("descripcion")}
              placeholder="Describe la tarea..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={estado}
                onValueChange={(value) => setValue("estado", value as Task["estado"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="En Progreso">En Progreso</SelectItem>
                  <SelectItem value="Completada">Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridad">Prioridad</Label>
              <Select
                value={prioridad}
                onValueChange={(value) => setValue("prioridad", value as Task["prioridad"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="Baja">Baja</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_fin">Fecha Límite</Label>
            <Input
              id="fecha_fin"
              type="date"
              {...register("fecha_fin", { required: true })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {task ? "Guardar Cambios" : "Crear Tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
