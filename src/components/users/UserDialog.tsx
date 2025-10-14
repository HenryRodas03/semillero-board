import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { User } from "@/pages/Users";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSave: (user: Omit<User, "id"> & { id?: number }) => void;
}

export function UserDialog({ open, onOpenChange, user, onSave }: UserDialogProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<User>({
    defaultValues: {
      name: "",
      email: "",
      role: "member",
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

  const onSubmit = (data: User) => {
    onSave({ ...data, id: user?.id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {user ? "Editar Usuario" : "Nuevo Usuario"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              {...register("name", { required: true })}
              placeholder="Ej: María García"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              {...register("email", { required: true })}
              placeholder="ejemplo@semillero.edu"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select
              value={role}
              onValueChange={(value) => setValue("role", value as User["role"])}
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
