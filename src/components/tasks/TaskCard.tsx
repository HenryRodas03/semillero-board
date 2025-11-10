import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/pages/Tasks";
import { Calendar, MoreVertical, MoveRight, Pencil, Trash2, User } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onMove: (taskId: number, newStatus: Task["estado"]) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

const priorityConfig = {
  Baja: { label: "Baja", color: "bg-muted text-muted-foreground" },
  Media: { label: "Media", color: "bg-accent text-accent-foreground" },
  Alta: { label: "Alta", color: "bg-secondary text-secondary-foreground" },
};

const statusOptions = [
  { value: "Pendiente" as const, label: "Pendiente" },
  { value: "En Progreso" as const, label: "En Progreso" },
  { value: "Completada" as const, label: "Completada" },
];

export function TaskCard({ task, onMove, onEdit, onDelete }: TaskCardProps) {
  const availableStatuses = statusOptions.filter((s) => s.value !== task.estado);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("taskId", task.id.toString());
    e.dataTransfer.setData("estado", task.estado);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <Card 
      className="p-4 transition-shadow hover:shadow-md cursor-move"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight">{task.nombre}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <MoveRight className="mr-2 h-4 w-4" />
                  Mover a
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-popover">
                  {availableStatuses.map((status) => (
                    <DropdownMenuItem
                      key={status.value}
                      onClick={() => onMove(task.id, status.value)}
                    >
                      {status.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.descripcion && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.descripcion}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${priorityConfig[task.prioridad].color}`}>
            {priorityConfig[task.prioridad].label}
          </Badge>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(task.fecha_fin).toLocaleDateString()}</span>
          </div>
          {task.proyecto && (
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>{task.proyecto.nombre}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
