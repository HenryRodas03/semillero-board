import { Task } from "@/pages/Tasks";
import { TaskCard } from "./TaskCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface KanbanColumnProps {
  column: {
    id: Task["status"];
    title: string;
    color: string;
  };
  tasks: Task[];
  onMoveTask: (taskId: number, newStatus: Task["status"]) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

export function KanbanColumn({ column, tasks, onMoveTask, onEditTask, onDeleteTask }: KanbanColumnProps) {
  return (
    <Card className={`border-t-4 ${column.color}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>{column.title}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal">
            {tasks.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed p-8 text-center text-sm text-muted-foreground">
            No hay tareas en esta columna
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onMove={onMoveTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
