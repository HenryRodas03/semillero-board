import { Task } from "@/pages/Tasks";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  tasks: Task[];
  onMoveTask: (taskId: number, newStatus: Task["status"]) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

const columns = [
  { id: "pending" as const, title: "Pendiente", color: "border-accent" },
  { id: "in-progress" as const, title: "En Progreso", color: "border-blue" },
  { id: "completed" as const, title: "Completada", color: "border-light-green" },
];

export function KanbanBoard({ tasks, onMoveTask, onEditTask, onDeleteTask }: KanbanBoardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          tasks={tasks.filter((task) => task.status === column.id)}
          onMoveTask={onMoveTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
}
