import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/pages/Tasks";
import { useState } from "react";
import { TaskCard } from "./TaskCard";

interface KanbanColumnProps {
  column: {
    id: Task["estado"];
    title: string;
    color: string;
  };
  tasks: Task[];
  onMoveTask: (taskId: number, newStatus: Task["estado"]) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

export function KanbanColumn({ column, tasks, onMoveTask, onEditTask, onDeleteTask }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    const currentStatus = e.dataTransfer.getData("estado");
    
    if (currentStatus !== column.id) {
      onMoveTask(taskId, column.id);
    }
  };

  return (
    <Card 
      className={`border-t-4 ${column.color} transition-all ${isDragOver ? 'ring-2 ring-primary bg-accent/5' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>{column.title}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal">
            {tasks.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 min-h-[200px]">
        {tasks.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed p-8 text-center text-sm text-muted-foreground">
            No hay actividades en esta columna
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
