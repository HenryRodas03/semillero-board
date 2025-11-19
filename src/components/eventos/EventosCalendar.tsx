import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Evento } from "@/services/eventosService";
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    isToday,
    startOfMonth,
    startOfWeek,
    subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface EventosCalendarProps {
  eventos: Evento[];
  onSelectEvent: (evento: Evento) => void;
  onSelectSlot?: (start: Date, end: Date) => void;
}

export function EventosCalendar({ 
  eventos, 
  onSelectEvent,
  onSelectSlot 
}: EventosCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { locale: es });
  const endDate = endOfWeek(monthEnd, { locale: es });
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventosDelDia = (date: Date) => {
    return eventos.filter((evento) =>
      isSameDay(new Date(evento.fecha_creacion), date)
    );
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const eventosDelDia = getEventosDelDia(date);
    
    if (eventosDelDia.length === 0 && onSelectSlot) {
      // Si no hay eventos y se permite crear, crear uno nuevo
      const start = new Date(date);
      start.setHours(9, 0, 0, 0);
      const end = new Date(date);
      end.setHours(10, 0, 0, 0);
      onSelectSlot(start, end);
    }
  };

  const eventosDelDiaSeleccionado = selectedDate ? getEventosDelDia(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendario */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Encabezados de días */}
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}

            {/* Días del mes */}
            {days.map((day, idx) => {
              const eventosDelDia = getEventosDelDia(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);

              return (
                <button
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  className={`
                    min-h-[80px] p-2 rounded-lg border-2 transition-all
                    ${!isCurrentMonth ? "opacity-40" : ""}
                    ${isSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-primary/50"}
                    ${isCurrentDay ? "bg-blue-50" : ""}
                  `}
                >
                  <div
                    className={`
                      text-sm font-semibold mb-1
                      ${isCurrentDay ? "text-blue-600" : ""}
                    `}
                  >
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {eventosDelDia.slice(0, 2).map((evento) => (
                      <div
                        key={evento.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(evento);
                        }}
                        className="text-xs px-1 py-0.5 rounded bg-primary text-primary-foreground truncate cursor-pointer hover:bg-primary/80"
                      >
                        {evento.titulo}
                      </div>
                    ))}
                    {eventosDelDia.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{eventosDelDia.length - 2} más
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Panel lateral con eventos del día seleccionado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {selectedDate ? format(selectedDate, "dd MMM yyyy", { locale: es }) : "Selecciona un día"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedDate ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Haz clic en un día para ver sus eventos
            </p>
          ) : eventosDelDiaSeleccionado.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay eventos este día
            </p>
          ) : (
            <div className="space-y-3">
              {eventosDelDiaSeleccionado.map((evento) => (
                <div
                  key={evento.id}
                  onClick={() => onSelectEvent(evento)}
                  className="p-3 rounded-lg border hover:border-primary cursor-pointer transition-colors"
                >
                  <div className="font-semibold text-sm mb-1">
                    {evento.titulo}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {format(new Date(evento.fecha_creacion), "HH:mm")} - 
                    {format(new Date(evento.fecha_fin), "HH:mm")}
                  </div>
                  <Badge className="text-xs" variant="secondary">
                    {evento.tipo}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
