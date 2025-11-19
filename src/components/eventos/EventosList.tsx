import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Evento } from "@/services/eventosService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Calendar,
    Clock,
    EyeOff,
    MapPin,
    MoreVertical,
    Pencil,
    Trash2,
    Video
} from "lucide-react";

interface EventosListProps {
  eventos: Evento[];
  onEdit: (evento: Evento) => void;
  onDelete: (id: number) => void;
}

const tipoConfig: Record<Evento["tipo"], { label: string; color: string }> = {
  "Reunión": { label: "Reunión", color: "bg-blue-100 text-blue-800" },
  "Taller": { label: "Taller", color: "bg-purple-100 text-purple-800" },
  "Presentación": { label: "Presentación", color: "bg-green-100 text-green-800" },
  "Conferencia": { label: "Conferencia", color: "bg-orange-100 text-orange-800" },
  "Otro": { label: "Otro", color: "bg-gray-100 text-gray-800" },
};

const estadoConfig: Record<Evento["estado"], { label: string; color: string }> = {
  "Programado": { label: "Programado", color: "bg-blue-600 text-white" },
  "En Curso": { label: "En Curso", color: "bg-green-600 text-white" },
  "Finalizado": { label: "Finalizado", color: "bg-gray-600 text-white" },
  "Cancelado": { label: "Cancelado", color: "bg-red-600 text-white" },
};

export function EventosList({ eventos, onEdit, onDelete }: EventosListProps) {
  if (eventos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No hay eventos registrados
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Agrupar eventos por mes
  const eventosPorMes = eventos.reduce((acc, evento) => {
    const mesKey = format(new Date(evento.fecha_creacion), "MMMM yyyy", { locale: es });
    if (!acc[mesKey]) {
      acc[mesKey] = [];
    }
    acc[mesKey].push(evento);
    return acc;
  }, {} as Record<string, Evento[]>);

  return (
    <div className="space-y-6">
      {Object.entries(eventosPorMes).map(([mes, eventosDelMes]) => (
        <div key={mes}>
          <h3 className="text-lg font-semibold mb-3 capitalize">{mes}</h3>
          <div className="space-y-3">
            {eventosDelMes.map((evento) => (
              <Card key={evento.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{evento.titulo}</CardTitle>
                        {!evento.es_publico && (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={tipoConfig[evento.tipo].color}>
                          {tipoConfig[evento.tipo].label}
                        </Badge>
                        <Badge className={estadoConfig[evento.estado].color}>
                          {estadoConfig[evento.estado].label}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem onClick={() => onEdit(evento)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(evento.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {evento.descripcion && (
                    <p className="text-sm text-muted-foreground">
                      {evento.descripcion}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(evento.fecha_creacion), "dd MMM yyyy", { locale: es })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(evento.fecha_creacion), "HH:mm", { locale: es })} - 
                        {format(new Date(evento.fecha_fin), "HH:mm", { locale: es })}
                      </span>
                    </div>
                    
                    {evento.ubicacion && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{evento.ubicacion}</span>
                      </div>
                    )}
                    
                    {evento.enlace_virtual && (
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-blue-600" />
                        <a
                          href={evento.enlace_virtual}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Enlace virtual
                        </a>
                      </div>
                    )}
                  </div>

                  {evento.creador && (
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Creado por: {evento.creador.nombre}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
