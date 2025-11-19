import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { camposService } from "@/services/camposService";
import { eventosService, type Evento } from "@/services/eventosService";
import { format, isFuture, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, ChevronDown, Clock, Filter, MapPin, Video } from "lucide-react";
import { useEffect, useState } from "react";

export default function EventosPublic() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [campos, setCampos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampoId, setSelectedCampoId] = useState<number | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);
  const [mostrarPasados, setMostrarPasados] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCampoId || selectedTipo) {
      loadEventos();
    }
  }, [selectedCampoId, selectedTipo]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [camposData, eventosData] = await Promise.all([
        camposService.getAll(),
        eventosService.getPublicos()
      ]);
      
      setCampos(camposData);
      setEventos(eventosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEventos = async () => {
    try {
      const params: any = {};
      if (selectedCampoId) params.id_campo = selectedCampoId;
      if (selectedTipo) params.tipo = selectedTipo;
      
      const data = await eventosService.getPublicos(params);
      setEventos(data);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    }
  };

  const eventosFiltrados = eventos.filter(evento => {
    if (!mostrarPasados && isPast(new Date(evento.fecha_fin)) && !isToday(new Date(evento.fecha_fin))) {
      return false;
    }
    return evento.estado !== 'Cancelado';
  });

  // Separar eventos
  const eventosProximos = eventosFiltrados
    .filter(e => (isFuture(new Date(e.fecha_creacion)) || isToday(new Date(e.fecha_creacion))) && e.estado === 'Programado')
    .sort((a, b) => new Date(a.fecha_creacion).getTime() - new Date(b.fecha_creacion).getTime());

  const eventosEnCurso = eventosFiltrados
    .filter(e => e.estado === 'En Curso')
    .sort((a, b) => new Date(a.fecha_creacion).getTime() - new Date(b.fecha_creacion).getTime());

  const eventosFinalizados = eventosFiltrados
    .filter(e => e.estado === 'Finalizado')
    .sort((a, b) => new Date(b.fecha_fin).getTime() - new Date(a.fecha_fin).getTime());

  const renderEvento = (evento: Evento) => (
    <Card key={evento.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{evento.titulo}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-sm">
                {evento.tipo}
              </Badge>
              {evento.campo && (
                <Badge variant="secondary" className="text-sm">
                  {evento.campo.nombre}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {evento.descripcion && (
          <p className="text-muted-foreground">{evento.descripcion}</p>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {format(new Date(evento.fecha_creacion), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(new Date(evento.fecha_creacion), "HH:mm", { locale: es })} - 
              {format(new Date(evento.fecha_fin), "HH:mm", { locale: es })}
            </span>
          </div>
          
          {evento.ubicacion && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{evento.ubicacion}</span>
            </div>
          )}
          
          {evento.enlace_virtual && (
            <div className="flex items-center gap-3 text-sm">
              <Video className="h-4 w-4 text-blue-600" />
              <a
                href={evento.enlace_virtual}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Unirse al evento virtual
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando eventos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Calendario de Eventos
            </h1>
            <p className="text-xl text-blue-100">
              Mantente al día con las actividades, talleres y reuniones de nuestros semilleros de investigación
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Filtrar por:</span>
              </div>
              
              <Select
                value={selectedCampoId?.toString() || "todos"}
                onValueChange={(value) => setSelectedCampoId(value === "todos" ? null : parseInt(value))}
              >
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder="Campo de investigación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los campos</SelectItem>
                  {campos.map((campo) => (
                    <SelectItem key={campo.id} value={campo.id.toString()}>
                      {campo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedTipo || "todos"}
                onValueChange={(value) => setSelectedTipo(value === "todos" ? null : value)}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="Reunión">Reunión</SelectItem>
                  <SelectItem value="Taller">Taller</SelectItem>
                  <SelectItem value="Presentación">Presentación</SelectItem>
                  <SelectItem value="Conferencia">Conferencia</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={mostrarPasados ? "default" : "outline"}
                onClick={() => setMostrarPasados(!mostrarPasados)}
                className="w-full md:w-auto"
              >
                {mostrarPasados ? "Ocultar pasados" : "Mostrar pasados"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eventos */}
      <div className="container mx-auto px-4 pb-16">
        <div className="space-y-12">
          {/* Eventos en Curso */}
          {eventosEnCurso.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <div className="h-8 w-1 bg-green-600 rounded"></div>
                En Curso Ahora
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {eventosEnCurso.map(renderEvento)}
              </div>
            </div>
          )}

          {/* Próximos Eventos */}
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <div className="h-8 w-1 bg-blue-600 rounded"></div>
              Próximos Eventos
            </h2>
            {eventosProximos.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No hay eventos próximos programados
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {eventosProximos.map(renderEvento)}
              </div>
            )}
          </div>

          {/* Eventos Finalizados */}
          {mostrarPasados && eventosFinalizados.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <div className="h-6 w-1 bg-gray-600 rounded"></div>
                    Eventos Finalizados ({eventosFinalizados.length})
                  </h2>
                  <ChevronDown className="h-5 w-5 ml-auto" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {eventosFinalizados.map(renderEvento)}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  );
}
