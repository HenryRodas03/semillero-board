import { Task } from "@/pages/Tasks";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Calendar, User, Pencil, Trash2, MoveRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
  onMove: (taskId: number, newStatus: Task["status"]) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

const priorityConfig = {
  low: { label: "Baja", color: "bg-muted text-muted-foreground" },
  medium: { label: "Media", color: "bg-accent text-accent-foreground" },
  high: { label: "Alta", color: "bg-secondary text-secondary-foreground" },
};

const statusOptions = [
  { value: "pending" as const, label: "Pendiente" },
  { value: "in-progress" as const, label: "En Progreso" },
  { value: "completed" as const, label: "Completada" },
];

export function TaskCard({ task, onMove, onEdit, onDelete }: TaskCardProps) {
  const availableStatuses = statusOptions.filter((s) => s.value !== task.status);

  return (
    <Card className="p-4 transition-shadow hover:shadow-md">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight">{task.title}</h3>
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

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${priorityConfig[task.priority].color}`}>
            {priorityConfig[task.priority].label}
          </Badge>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            <span>{task.assignee}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
