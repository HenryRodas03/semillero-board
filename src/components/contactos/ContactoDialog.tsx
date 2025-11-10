import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import type { Contacto } from "@/services/contactosService";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface ContactoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacto: Contacto | null;
  onSave: (data: any) => Promise<void>;
}

const tiposContacto = [
  "Email",
  "Teléfono",
  "WhatsApp",
  "LinkedIn",
  "Facebook",
  "Twitter",
  "Instagram",
  "Sitio Web",
  "Otro"
];

export function ContactoDialog({ open, onOpenChange, contacto, onSave }: ContactoDialogProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm({
    defaultValues: {
      tipo: contacto?.tipo || "Email",
      valor: contacto?.valor || "",
      descripcion: contacto?.descripcion || "",
      es_publico: contacto?.es_publico ?? true,
      orden: contacto?.orden ?? 0,
    }
  });

  const selectedTipo = watch("tipo");

  useEffect(() => {
    if (contacto) {
      reset({
        tipo: contacto.tipo,
        valor: contacto.valor,
        descripcion: contacto.descripcion || "",
        es_publico: contacto.es_publico,
        orden: contacto.orden,
      });
    } else {
      reset({
        tipo: "Email",
        valor: "",
        descripcion: "",
        es_publico: true,
        orden: 0,
      });
    }
  }, [contacto, reset]);

  const onSubmit = async (data: any) => {
    await onSave(data);
    reset();
  };

  const getPlaceholder = (tipo: string) => {
    const placeholders: Record<string, string> = {
      Email: "ejemplo@dominio.com",
      Teléfono: "+57 312 345 6789",
      WhatsApp: "+57 312 345 6789",
      LinkedIn: "https://linkedin.com/in/usuario",
      Facebook: "https://facebook.com/usuario",
      Twitter: "https://twitter.com/usuario",
      Instagram: "https://instagram.com/usuario",
      "Sitio Web": "https://www.ejemplo.com",
      Otro: "Información de contacto"
    };
    return placeholders[tipo] || "";
  };

  const getInputType = (tipo: string) => {
    if (tipo === "Email") return "email";
    if (tipo === "Teléfono" || tipo === "WhatsApp") return "tel";
    if (tipo === "Sitio Web" || tipo.includes("http")) return "url";
    return "text";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {contacto ? "Editar Contacto" : "Nuevo Contacto"}
          </DialogTitle>
          <DialogDescription>
            {contacto 
              ? "Modifica la información del contacto"
              : "Agrega un nuevo medio de contacto para el campo de investigación"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tipo de Contacto */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Contacto *</Label>
            <Select
              value={watch("tipo")}
              onValueChange={(value) => setValue("tipo", value as "Email" | "Teléfono" | "WhatsApp" | "LinkedIn" | "Facebook" | "Twitter" | "Instagram" | "Sitio Web" | "Otro")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposContacto.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Valor del Contacto */}
          <div className="space-y-2">
            <Label htmlFor="valor">
              {selectedTipo === "Email" && "Correo Electrónico"}
              {selectedTipo === "Teléfono" && "Número de Teléfono"}
              {selectedTipo === "WhatsApp" && "Número de WhatsApp"}
              {selectedTipo === "Sitio Web" && "URL del Sitio Web"}
              {["LinkedIn", "Facebook", "Twitter", "Instagram"].includes(selectedTipo) && `URL de ${selectedTipo}`}
              {selectedTipo === "Otro" && "Información de Contacto"}
              {" *"}
            </Label>
            <Input
              id="valor"
              type={getInputType(selectedTipo)}
              placeholder={getPlaceholder(selectedTipo)}
              {...register("valor", { 
                required: "Este campo es obligatorio",
                pattern: selectedTipo === "Email" ? {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Correo electrónico inválido"
                } : undefined
              })}
            />
            {errors.valor && (
              <p className="text-sm text-red-600">{errors.valor.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              placeholder="Información adicional sobre este contacto"
              rows={3}
              {...register("descripcion")}
            />
            <p className="text-xs text-muted-foreground">
              Ej: "Coordinador del campo", "Contacto principal", etc.
            </p>
          </div>

          {/* Orden */}
          <div className="space-y-2">
            <Label htmlFor="orden">Orden de visualización</Label>
            <Input
              id="orden"
              type="number"
              min="0"
              placeholder="0"
              {...register("orden", { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              Los contactos se ordenarán de menor a mayor. Por defecto es 0.
            </p>
          </div>

          {/* Visible Públicamente */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="es_publico" className="text-base">
                Visible públicamente
              </Label>
              <p className="text-sm text-muted-foreground">
                ¿Mostrar este contacto en las páginas públicas?
              </p>
            </div>
            <Switch
              id="es_publico"
              checked={watch("es_publico")}
              onCheckedChange={(checked) => setValue("es_publico", checked)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {contacto ? "Guardar Cambios" : "Crear Contacto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
