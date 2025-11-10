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
import { User } from "@/pages/Users";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  // onSave accepts the user payload; password may be present for invite flow
  onSave: (user: any) => void;
  // hide the internal role selector (role was selected previously by the caller)
  hideRoleSelector?: boolean;
}

interface FormValues {
  name: string;
  apellido?: string;
  email: string;
  role: User["role"];
  password?: string;
}

export function UserDialog({ open, onOpenChange, user, onSave, hideRoleSelector }: UserDialogProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: "",
      apellido: "",
      email: "",
      role: "member",
      password: "",
    },
  });

  const role = watch("role");

  useEffect(() => {
    if (user) {
      reset(user);
    } else {
      reset({
        name: "",
        email: "",
        role: "member",
      });
    }
  }, [user, reset]);

  const onSubmit = (data: FormValues) => {
    onSave({ ...data, id: user?.id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {user ? "Editar Usuario" : "Nuevo Usuario"}
          </DialogTitle>
          <DialogDescription>
            {user ? 'Edita la información del usuario' : 'Completa los datos para crear un nuevo usuario'}
          </DialogDescription>
        </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              {...register("name", { required: 'El nombre es requerido' })}
              placeholder="Ej: María"
            />
            {errors.name && <p className="text-sm text-destructive">{String(errors.name.message)}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              {...register("email", { required: 'El correo es requerido' })}
              placeholder="ejemplo@semillero.edu"
            />
            {errors.email && <p className="text-sm text-destructive">{String(errors.email.message)}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="apellido">Apellido</Label>
            <Input
              id="apellido"
              {...register("apellido", { required: 'El apellido es requerido' })}
              placeholder="Ej: Pérez"
            />
            {errors.apellido && <p className="text-sm text-destructive">{String(errors.apellido.message)}</p>}
          </div>

          {!hideRoleSelector && (
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={role}
                onValueChange={(value) => setValue("role", value as User["role"]) }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="member">Miembro</SelectItem>
                  <SelectItem value="coordinator">Coordinador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña (opcional)</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Dejar en blanco para invitar/sin password"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {user ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
