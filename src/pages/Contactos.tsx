import { ContactoDialog } from "@/components/contactos/ContactoDialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { camposService } from "@/services/camposService";
import { contactosService, type Contacto } from "@/services/contactosService";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function Contactos() {
  const { user } = useAuth();
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [campos, setCampos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampoId, setSelectedCampoId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContacto, setEditingContacto] = useState<Contacto | null>(null);
  const [deleteContactoId, setDeleteContactoId] = useState<number | null>(null);

  useEffect(() => {
    loadCampos();
  }, []);

  useEffect(() => {
    if (selectedCampoId) {
      loadContactos();
    }
  }, [selectedCampoId]);

  const loadCampos = async () => {
    try {
      setLoading(true);
      // Si es admin, carga todos los campos; si no, solo los suyos
      const camposData = await camposService.getAll();
      
      setCampos(camposData);
      
      if (camposData.length > 0) {
        setSelectedCampoId(camposData[0].id);
      }
    } catch (error) {
      console.error('Error al cargar campos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los campos de investigación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadContactos = async () => {
    if (!selectedCampoId) return;
    
    try {
      const data = await contactosService.getByCampo(selectedCampoId);
      setContactos(data);
    } catch (error) {
      console.error('Error al cargar contactos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los contactos",
        variant: "destructive",
      });
    }
  };

  const handleCreate = () => {
    setEditingContacto(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (contacto: Contacto) => {
    setEditingContacto(contacto);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteContactoId) return;

    try {
      await contactosService.delete(deleteContactoId);
      toast({
        title: "Contacto eliminado",
        description: "El contacto se ha eliminado correctamente",
      });
      setDeleteContactoId(null);
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el contacto",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingContacto) {
        await contactosService.update(editingContacto.id, data);
        toast({
          title: "Contacto actualizado",
          description: "El contacto se ha actualizado correctamente",
        });
      } else {
        await contactosService.create({
          ...data,
          id_campo: selectedCampoId!,
        });
        toast({
          title: "Contacto creado",
          description: "El contacto se ha creado correctamente",
        });
      }
      setIsDialogOpen(false);
      setEditingContacto(null);
      loadContactos();
    } catch (error) {
      console.error('Error al guardar contacto:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el contacto",
        variant: "destructive",
      });
    }
  };

  const handleReorder = async (reorderedContactos: Contacto[]) => {
    try {
      // Actualizar el orden en el backend
      for (let i = 0; i < reorderedContactos.length; i++) {
        const contacto = reorderedContactos[i];
        if (contacto.orden !== i) {
          await contactosService.update(contacto.id, { orden: i });
        }
      }
      
      setContactos(reorderedContactos);
      toast({
        title: "Orden actualizado",
        description: "El orden de los contactos se ha actualizado correctamente",
      });
    } catch (error) {
      console.error('Error al reordenar contactos:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el orden de los contactos",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (campos.length === 0) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No tienes campos de investigación asignados
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedCampo = campos.find(c => c.id === selectedCampoId);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gestión de Contactos</h1>
        <p className="text-muted-foreground">
          Administra la información de contacto de tus campos de investigación
        </p>
      </div>

      {/* Campo Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Campo de Investigación</CardTitle>
          <CardDescription>
            Selecciona el campo para administrar sus contactos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={selectedCampoId?.toString()}
            onValueChange={(value) => setSelectedCampoId(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un campo" />
            </SelectTrigger>
            <SelectContent>
              {campos.map((campo) => (
                <SelectItem key={campo.id} value={campo.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{campo.nombre}</span>
                    <Badge variant="outline" className="ml-2">
                      {campo.semillero?.nombre || 'Sin semillero'}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCampo && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="font-medium">{selectedCampo.nombre}</p>
                <p className="text-sm text-muted-foreground">
                  {contactos.length} contacto{contactos.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Contacto
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Contactos */}
      {selectedCampoId && contactos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contactos del Campo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contactos.map((contacto) => (
                <Card key={contacto.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{contacto.tipo}</Badge>
                          {contacto.es_publico && (
                            <Badge variant="secondary">Público</Badge>
                          )}
                        </div>
                        <p className="font-medium">{contacto.valor}</p>
                        {contacto.descripcion && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {contacto.descripcion}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(contacto)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteContactoId(contacto.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para crear/editar */}
      <ContactoDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        contacto={editingContacto}
        onSave={handleSave}
      />

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={!!deleteContactoId} onOpenChange={() => setDeleteContactoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El contacto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
