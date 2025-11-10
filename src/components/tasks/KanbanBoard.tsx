import { Task } from "@/pages/Tasks";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  tasks: Task[];
  onMoveTask: (taskId: number, newStatus: Task["estado"]) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

const columns = [
  { id: "Pendiente" as const, title: "Pendiente", color: "border-accent" },
  { id: "En Progreso" as const, title: "En Progreso", color: "border-blue" },
  { id: "Completada" as const, title: "Completada", color: "border-light-green" },
];

export function KanbanBoard({ tasks, onMoveTask, onEditTask, onDeleteTask }: KanbanBoardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          tasks={tasks.filter((task) => task.estado === column.id)}
          onMoveTask={onMoveTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
}
