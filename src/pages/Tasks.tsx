import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskDialog } from "@/components/tasks/TaskDialog";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  assignee: string;
  dueDate: string;
  projectId: number;
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Diseñar interfaz de usuario",
    description: "Crear mockups para el módulo de inventario",
    status: "in-progress",
    priority: "high",
    assignee: "María García",
    dueDate: "2024-04-15",
    projectId: 1,
  },
  {
    id: 2,
    title: "Configurar base de datos",
    description: "Definir esquema y relaciones",
    status: "pending",
    priority: "high",
    assignee: "Juan López",
    dueDate: "2024-04-10",
    projectId: 1,
  },
  {
    id: 3,
    title: "Implementar autenticación",
    description: "Sistema de login con JWT",
    status: "completed",
    priority: "high",
    assignee: "Carlos Ruiz",
    dueDate: "2024-04-05",
    projectId: 2,
  },
  {
    id: 4,
    title: "Pruebas unitarias",
    description: "Escribir tests para componentes principales",
    status: "pending",
    priority: "medium",
    assignee: "Ana Martínez",
    dueDate: "2024-04-20",
    projectId: 2,
  },
];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleSaveTask = (task: Omit<Task, "id"> & { id?: number }) => {
    if (task.id) {
      setTasks(tasks.map((t) => (t.id === task.id ? task as Task : t)));
    } else {
      const newTask = { ...task, id: Math.max(...tasks.map((t) => t.id)) + 1 } as Task;
      setTasks([...tasks, newTask]);
    }
    setDialogOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleMoveTask = (taskId: number, newStatus: Task["status"]) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
          <p className="text-muted-foreground">
            Gestiona las tareas de todos los proyectos
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>

      <KanbanBoard
        tasks={tasks}
        onMoveTask={handleMoveTask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />

      <TaskDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </div>
  );
}
