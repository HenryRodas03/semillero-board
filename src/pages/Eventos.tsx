import { EventoDialog } from "@/components/eventos/EventoDialog";
import { EventosCalendar } from "@/components/eventos/EventosCalendar";
import { EventosList } from "@/components/eventos/EventosList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSocketEvent } from "@/hooks/useSocket";
import { camposService } from "@/services/camposService";
import { eventosService, type Evento } from "@/services/eventosService";
import { SOCKET_EVENTS } from "@/services/socket";
import { Calendar, List, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function Eventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [selectedCampoId, setSelectedCampoId] = useState<number | null>(null);
  const [campos, setCampos] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<"lista" | "calendario">("lista");
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCampoId) {
      loadEventos();
    }
  }, [selectedCampoId]);

  // Socket.IO - Escuchar eventos en tiempo real
  useSocketEvent(SOCKET_EVENTS.EVENTO_NUEVO, (data: Evento) => {
    if (!selectedCampoId || data.id_campo === selectedCampoId) {
      setEventos((prev) => [data, ...prev]);
      toast({
        title: "Nuevo evento",
        description: `Se ha creado el evento: ${data.titulo}`,
      });
    }
  });

  useSocketEvent(SOCKET_EVENTS.EVENTO_ACTUALIZADO, (data: Evento) => {
    if (!selectedCampoId || data.id_campo === selectedCampoId) {
      setEventos((prev) => prev.map((e) => (e.id === data.id ? data : e)));
      toast({
        title: "Evento actualizado",
        description: `El evento ${data.titulo} ha sido actualizado`,
      });
    }
  });

  useSocketEvent(SOCKET_EVENTS.EVENTO_ELIMINADO, (data: { id: number }) => {
    setEventos((prev) => prev.filter((e) => e.id !== data.id));
    toast({
      title: "Evento eliminado",
      description: "Un evento ha sido eliminado",
      variant: "destructive",
    });
  });

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Cargar campos
      const camposData = await camposService.getAll();
      setCampos(camposData);
      
      // Si el usuario no es admin, filtrar por su campo
      if (user && !hasPermission('ver_reportes')) {
        const userCampo = camposData.find((c: any) => 
          c.lider === user.id
        );
        if (userCampo) {
          setSelectedCampoId(userCampo.id);
        }
      } else if (camposData.length > 0) {
        setSelectedCampoId(camposData[0].id);
      }
    } catch (error: any) {
      console.error('Error al cargar datos iniciales:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEventos = async () => {
    if (!selectedCampoId) return;
    
    try {
      const data = await eventosService.getByCampo(selectedCampoId);
      setEventos(data);
    } catch (error: any) {
      console.error('Error al cargar eventos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los eventos",
        variant: "destructive",
      });
    }
  };

  const handleSaveEvento = async (eventoData: Partial<Evento>) => {
    try {
      if (eventoData.id) {
        await eventosService.update(eventoData.id, eventoData);
        toast({
          title: "Éxito",
          description: "Evento actualizado correctamente",
        });
      } else {
        await eventosService.create({
          ...eventoData,
          id_campo: selectedCampoId!,
        } as any);
        toast({
          title: "Éxito",
          description: "Evento creado correctamente",
        });
      }
      
      await loadEventos();
      setDialogOpen(false);
      setEditingEvento(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al guardar el evento",
        variant: "destructive",
      });
    }
  };

  const handleEditEvento = (evento: Evento) => {
    if (!hasPermission('editar_actividad')) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para editar eventos",
        variant: "destructive",
      });
      return;
    }
    setEditingEvento(evento);
    setDialogOpen(true);
  };

  const handleDeleteEvento = async (id: number) => {
    if (!hasPermission('eliminar_actividad')) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para eliminar eventos",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('¿Estás seguro de eliminar este evento?')) return;

    try {
      await eventosService.delete(id);
      toast({
        title: "Éxito",
        description: "Evento eliminado correctamente",
      });
      await loadEventos();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al eliminar el evento",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventos y Horarios</h1>
          <p className="text-muted-foreground">
            Gestiona reuniones, talleres y actividades del campo
          </p>
        </div>
        <div className="flex gap-3">
          <Select
            value={selectedCampoId?.toString() || ""}
            onValueChange={(value) => setSelectedCampoId(parseInt(value))}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecciona un campo" />
            </SelectTrigger>
            <SelectContent>
              {campos.map((campo) => (
                <SelectItem key={campo.id} value={campo.id.toString()}>
                  {campo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {hasPermission('crear_actividad') && selectedCampoId && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Evento
            </Button>
          )}
        </div>
      </div>

      {!selectedCampoId ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Selecciona un campo para ver sus eventos
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
          <TabsList>
            <TabsTrigger value="lista">
              <List className="h-4 w-4 mr-2" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="calendario">
              <Calendar className="h-4 w-4 mr-2" />
              Calendario
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-4">
            <EventosList
              eventos={eventos}
              onEdit={handleEditEvento}
              onDelete={handleDeleteEvento}
            />
          </TabsContent>

          <TabsContent value="calendario">
            <EventosCalendar
              eventos={eventos}
              onSelectEvent={handleEditEvento}
              onSelectSlot={(start, end) => {
                if (hasPermission('crear_actividad')) {
                  setEditingEvento({
                    fecha_inicio: start.toISOString(),
                    fecha_fin: end.toISOString(),
                  } as Evento);
                  setDialogOpen(true);
                }
              }}
            />
          </TabsContent>
        </Tabs>
      )}

      <EventoDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingEvento(null);
        }}
        evento={editingEvento}
        campoId={selectedCampoId || undefined}
        onSave={handleSaveEvento}
      />
    </div>
  );
}
