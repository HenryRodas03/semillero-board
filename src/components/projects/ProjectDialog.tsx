import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { camposService } from "@/services/camposService";
import { useToast } from "@/hooks/use-toast";

interface ProjectFormData {
  id?: number;
  titulo: string;
  descripcion: string;
  id_estado: number;
  id_campo?: number;
  url: string;
  ruta_foto: string;
  porcentaje_avance: number;
}

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: any | null;
  onSave: (project: ProjectFormData) => void;
}

export function ProjectDialog({ open, onOpenChange, project, onSave }: ProjectDialogProps) {
  const [campos, setCampos] = useState<any[]>([]);
  const [loadingCampos, setLoadingCampos] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, watch } = useForm<ProjectFormData>({
    defaultValues: {
      titulo: "",
      descripcion: "",
      id_estado: 1,
      id_campo: undefined,
      url: "",
      ruta_foto: "",
      porcentaje_avance: 0,
    },
  });

  const id_estado = watch("id_estado");
  const id_campo = watch("id_campo");

  useEffect(() => {
    if (open) {
      loadCampos();
    }
  }, [open]);

  useEffect(() => {
    if (project) {
      console.log('🔧 Cargando proyecto para editar:', project);
      // Esperar a que los campos se carguen antes de setear el formulario
      if (campos.length > 0) {
        reset({
          titulo: project.titulo || "",
          descripcion: project.descripcion || "",
          id_estado: project.id_estado || 1,
          id_campo: project.id_campo,
          url: project.url || "",
          ruta_foto: project.ruta_foto || "",
          porcentaje_avance: project.porcentaje_avance || 0,
        });
      }
    } else {
      reset({
        titulo: "",
        descripcion: "",
        id_estado: 1,
        id_campo: undefined,
        url: "",
        ruta_foto: "",
        porcentaje_avance: 0,
      });
    }
  }, [project, reset, open, campos]);

  const loadCampos = async () => {
    try {
      setLoadingCampos(true);
      const data = await camposService.getAll();
      console.log('📋 Campos cargados:', data);
      setCampos(data);
    } catch (error) {
      console.error('❌ Error al cargar campos:', error);
    } finally {
      setLoadingCampos(false);
    }
  };

  const onSubmit = (data: ProjectFormData) => {
    console.log('📝 Datos del formulario de proyecto:', data);
    
    // Validar que id_campo esté seleccionado
    if (!data.id_campo || data.id_campo === 0) {
      toast({
        title: "Campo requerido",
        description: "Por favor selecciona un campo de investigación",
        variant: "destructive",
      });
      return;
    }
    
    console.log('✅ Validación pasada, enviando proyecto');
    onSave({ ...data, id: project?.id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? "Editar Proyecto" : "Nuevo Proyecto"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título del Proyecto *</Label>
            <Input
              id="titulo"
              {...register("titulo", { required: true })}
              placeholder="Ej: Sistema de Biblioteca Virtual"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              {...register("descripcion")}
              placeholder="Describe brevemente el proyecto..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id_estado">Estado *</Label>
              <Select
                value={id_estado?.toString()}
                onValueChange={(value) => setValue("id_estado", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="1">Activo</SelectItem>
                  <SelectItem value="2">En Pausa</SelectItem>
                  <SelectItem value="3">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_campo">Campo de Investigación *</Label>
              <Select
                value={id_campo ? id_campo.toString() : ""}
                onValueChange={(value) => {
                  console.log('🔄 Campo seleccionado:', value);
                  setValue("id_campo", parseInt(value));
                }}
                disabled={loadingCampos}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un campo" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {loadingCampos ? (
                    <SelectItem value="loading" disabled>Cargando...</SelectItem>
                  ) : campos.length === 0 ? (
                    <SelectItem value="empty" disabled>No hay campos disponibles</SelectItem>
                  ) : (
                    campos.map((campo) => (
                      <SelectItem key={campo.id} value={campo.id.toString()}>
                        {campo.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL del Proyecto</Label>
            <Input
              id="url"
              {...register("url")}
              placeholder="https://github.com/usuario/proyecto"
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ruta_foto">URL de Imagen</Label>
            <Input
              id="ruta_foto"
              {...register("ruta_foto")}
              placeholder="https://res.cloudinary.com/..."
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="porcentaje_avance">Porcentaje de Avance (%)</Label>
            <Input
              id="porcentaje_avance"
              type="number"
              min="0"
              max="100"
              {...register("porcentaje_avance", { 
                valueAsNumber: true,
                min: 0,
                max: 100 
              })}
              placeholder="0"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {project ? "Guardar Cambios" : "Crear Proyecto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
