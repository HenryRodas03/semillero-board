import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSocketEvent } from "@/hooks/useSocket";
import { actividadesService } from "@/services/actividadesService";
import { integrantesService } from "@/services/integrantesService";
import { proyectosService } from "@/services/proyectosService";
import { SOCKET_EVENTS } from "@/services/socket";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export interface Task {
  id: number;
  titulo?: string; // La API usa 'titulo'
  nombre: string;
  descripcion: string;
  estado: "Pendiente" | "En Progreso" | "Completada" | "En pausa";
  estado_nombre?: string; // La API devuelve esto
  prioridad: "Baja" | "Media" | "Alta";
  fecha_creacion: string;
  fecha_fin: string | null;
  fecha_actualizacion?: string;
  id_proyecto: number;
  id_integrante?: number;
  responsable_id?: number | null;
  responsable_nombre?: string | null;
  responsable_correo?: string | null;
  proyecto?: {
    id: number;
    nombre: string;
    id_campo: number;
  };
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [userCampoId, setUserCampoId] = useState<number | null>(null);
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, [user]);

  useEffect(() => {
    if (selectedProjectId) {
      loadTasksByProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Socket.IO - Escuchar eventos en tiempo real
  useSocketEvent(SOCKET_EVENTS.ACTIVIDAD_NUEVA, (data) => {
    if (selectedProjectId && data.id_proyecto === selectedProjectId) {
      setTasks((prev) => [data, ...prev]);
      toast({
        title: "Nueva actividad",
        description: `Se ha creado la actividad: ${data.nombre}`,
      });
    }
  });

  useSocketEvent(SOCKET_EVENTS.ACTIVIDAD_ACTUALIZADA, (data) => {
    if (selectedProjectId && data.id_proyecto === selectedProjectId) {
      setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
      toast({
        title: "Actividad actualizada",
        description: `La actividad ${data.nombre} ha sido actualizada`,
      });
    }
  });

  useSocketEvent(SOCKET_EVENTS.ACTIVIDAD_COMPLETADA, (data) => {
    if (selectedProjectId && data.id_proyecto === selectedProjectId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === data.id ? { ...t, estado: "Completada" } : t))
      );
      toast({
        title: "Actividad completada",
        description: `La actividad ${data.nombre} ha sido completada`,
      });
    }
  });

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Obtener el campo de investigación del usuario
      if (user) {
        const integrantes = await integrantesService.getAll();
        const miIntegrante = integrantes.find((i: any) => i.id_usuario === user.id);
        if (miIntegrante) {
          setUserCampoId(miIntegrante.id_campo);
        }
      }

      // Cargar proyectos (filtrados por campo si es colaborador)
      const allProjects = await proyectosService.getAll();
      
      // Filtrar proyectos según permisos
      let filteredProjects = allProjects;
      if (!hasPermission('ver_reportes') && userCampoId) {
        // Si no es admin, solo ver proyectos de su campo
        filteredProjects = allProjects.filter((p: any) => p.id_campo === userCampoId);
      }
      
      setProjects(filteredProjects);
      
      // Seleccionar el primer proyecto automáticamente
      if (filteredProjects.length > 0) {
        setSelectedProjectId(filteredProjects[0].id);
      }
    } catch (error: any) {
      console.error('Error al cargar datos iniciales:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTasksByProject = async (projectId: number) => {
    try {
      const data = await proyectosService.getActividades(projectId);
      setTasks(data);
    } catch (error: any) {
      console.error('Error al cargar actividades:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las actividades",
        variant: "destructive",
      });
    }
  };

  const handleSaveTask = async (task: Partial<Task>) => {
    if (!selectedProjectId) {
      toast({
        title: "Error",
        description: "Selecciona un proyecto primero",
        variant: "destructive",
      });
      return;
    }

    try {
      const taskData = {
        ...task,
        id_proyecto: selectedProjectId,
      };

      if (task.id) {
        await actividadesService.update(task.id, taskData);
        toast({
          title: "Éxito",
          description: "Actividad actualizada correctamente",
        });
      } else {
        await actividadesService.create(taskData);
        toast({
          title: "Éxito",
          description: "Actividad creada correctamente",
        });
      }
      
      await loadTasksByProject(selectedProjectId);
      setDialogOpen(false);
      setEditingTask(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al guardar la actividad",
        variant: "destructive",
      });
    }
  };

  const handleEditTask = (task: Task) => {
    if (!hasPermission('editar_actividad')) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para editar actividades",
        variant: "destructive",
      });
      return;
    }
    
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDeleteTask = async (id: number) => {
    if (!hasPermission('eliminar_actividad')) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para eliminar actividades",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('¿Estás seguro de eliminar esta actividad?')) return;

    try {
      await actividadesService.delete(id);
      toast({
        title: "Éxito",
        description: "Actividad eliminada correctamente",
      });
      if (selectedProjectId) {
        await loadTasksByProject(selectedProjectId);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al eliminar la actividad",
        variant: "destructive",
      });
    }
  };

  const handleMoveTask = async (taskId: number, newStatus: Task["estado"]) => {
    try {
      await actividadesService.update(taskId, { estado: newStatus });
      
      // Actualizar localmente
      setTasks(tasks.map((t) => 
        t.id === taskId ? { ...t, estado: newStatus } : t
      ));

      // Si se completa, llamar al endpoint específico
      if (newStatus === "Completada") {
        await actividadesService.completar(taskId);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la actividad",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tablero Kanban</h1>
          <p className="text-muted-foreground">
            Gestiona las actividades del proyecto seleccionado
          </p>
        </div>
        <div className="flex gap-3">
          <Select
            value={selectedProjectId?.toString() || ""}
            onValueChange={(value) => setSelectedProjectId(parseInt(value))}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecciona un proyecto" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {hasPermission('crear_actividad') && selectedProjectId && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Actividad
            </Button>
          )}
        </div>
      </div>

      {!selectedProjectId ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Selecciona un proyecto para ver sus actividades
          </p>
        </div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          onMoveTask={handleMoveTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      <TaskDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingTask(null);
        }}
        projectId={selectedProjectId || undefined}
        campoId={userCampoId || undefined}
        task={editingTask}
        onSave={(taskData) => {
          handleSaveTask(taskData);
        }}
      />
    </div>
  );
}
