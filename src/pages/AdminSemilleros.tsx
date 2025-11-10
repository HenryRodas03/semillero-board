
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../components/ui/button";
import { Dialog } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import { toast } from "../components/ui/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { LineaInvestigacion, lineasInvestigacionService } from "../services/lineasInvestigacionService";
import { CreateSemilleroDto, Semillero, semillerosService } from "../services/semillerosService";


const AdminSemilleros: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [semilleros, setSemilleros] = useState<Semillero[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selected, setSelected] = useState<Semillero | null>(null);
  const [lineas, setLineas] = useState<LineaInvestigacion[]>([]);
  const form = useForm<CreateSemilleroDto>({
    defaultValues: {
      nombre: "",
      descripcion: "",
      logo: "",
      es_activo: true,
    },
  });

  useEffect(() => {
    fetchSemilleros();
    fetchLineas();
  }, []);

  const fetchSemilleros = async () => {
    setLoading(true);
    try {
      const data = await semillerosService.getAll();
      setSemilleros(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ title: "Error cargando semilleros" });
      setSemilleros([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLineas = async () => {
    try {
      const data = await lineasInvestigacionService.getAll({ es_activa: true });
      setLineas(data);
    } catch (err) {
      toast({ title: "Error cargando líneas de investigación" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este semillero?")) return;
    try {
      await semillerosService.delete(id);
      toast({ title: "Semillero eliminado" });
      fetchSemilleros();
    } catch (err) {
      toast({ title: "Error eliminando semillero" });
    }
  };

  const handleDialogOpen = (semillero?: Semillero | null) => {
    if (semillero) {
      form.reset({
        nombre: semillero.nombre,
        descripcion: semillero.descripcion || "",
        logo: "", // No existe en el modelo, dejar vacío o implementar si se agrega
        es_activo: semillero.activo === 1,
        id_linea: semillero.linea?.id || undefined,
      });
    } else {
      form.reset({ nombre: "", descripcion: "", logo: "", es_activo: true, id_linea: undefined });
    }
    setSelected(semillero || null);
    setShowDialog(true);
  };

  const onSubmit = async (values: any) => {
    try {
      if (selected) {
        await semillerosService.update(selected.id, values);
        toast({ title: "Semillero actualizado" });
      } else {
        await semillerosService.create(values);
        toast({ title: "Semillero creado" });
      }
      setShowDialog(false);
      fetchSemilleros();
    } catch (err) {
      toast({ title: "Error guardando semillero" });
    }
  };

  // id_rol === 2: admin semillero, id_rol === 1: super admin
  if (!user || !(hasRole(2) || hasRole(1))) return <div>No autorizado</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Administrar Semilleros</h1>
        <Button onClick={() => handleDialogOpen(null)}>Nuevo Semillero</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Descripción</th>
              <th className="p-2 border">Línea</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {semilleros.map((s) => (
              <tr key={s.id}>
                <td className="p-2 border">{s.nombre}</td>
                <td className="p-2 border">{s.descripcion}</td>
                <td className="p-2 border">{s.linea?.nombre || "-"}</td>
                <td className="p-2 border flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleDialogOpen(s)}>Editar</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(s.id)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="mt-4">Cargando...</div>}
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <div className="p-4 min-w-[350px] max-w-[400px]">
          <h2 className="text-lg font-semibold mb-2">{selected ? "Editar Semillero" : "Nuevo Semillero"}</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField name="nombre" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} required maxLength={100} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="descripcion" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea {...field} maxLength={300} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="logo" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo (URL)</FormLabel>
                  <FormControl>
                    <Input {...field} type="url" placeholder="https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name={"id_linea" as any} control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Línea de investigación</FormLabel>
                  <FormControl>
                    <Select value={field.value?.toString() || ""} onValueChange={v => field.onChange(Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una línea" />
                      </SelectTrigger>
                      <SelectContent>
                        {lineas.map(l => (
                          <SelectItem key={l.id} value={l.id.toString()}>{l.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="es_activo" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Activo</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
                <Button type="submit">{selected ? "Guardar" : "Crear"}</Button>
              </div>
            </form>
          </Form>
        </div>
      </Dialog>
    </div>
  );
};

export default AdminSemilleros;
