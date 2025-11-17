import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreVertical, Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectDialog } from "@/components/projects/ProjectDialog";
import { proyectosService, Proyecto } from "@/services/proyectosService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Project {
  id: number;
  name: string;
  description: string;
  status: "active" | "paused" | "completed";
  startDate: string;
  endDate: string;
  members: number;
}

const statusConfig = {
  active: { label: "Activo", color: "bg-primary text-primary-foreground" },
  paused: { label: "En Pausa", color: "bg-accent text-accent-foreground" },
  completed: { label: "Completado", color: "bg-light-green text-white" },
};

export default function Projects() {
  const [projects, setProjects] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Proyecto | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await proyectosService.getAll();
      setProjects(data);
      console.log('📊 Proyectos cargados:', data);
    } catch (error: any) {
      console.error('❌ Error al cargar proyectos:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudieron cargar los proyectos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async (projectData: any) => {
    try {
      console.log('💾 Guardando proyecto:', projectData);

      if (projectData.id) {
        // Actualizar proyecto existente
        await proyectosService.update(projectData.id, {
          titulo: projectData.titulo,
          descripcion: projectData.descripcion,
          id_estado: projectData.id_estado,
          id_campo: projectData.id_campo,
          url: projectData.url,
          ruta_foto: projectData.ruta_foto,
          porcentaje_avance: projectData.porcentaje_avance,
        });
        
        toast({
          title: "Éxito",
          description: "Proyecto actualizado correctamente",
        });
      } else {
        // Crear nuevo proyecto
        await proyectosService.create({
          titulo: projectData.titulo,
          descripcion: projectData.descripcion || '',
          id_estado: projectData.id_estado || 1,
          id_campo: projectData.id_campo,
          url: projectData.url || '',
          ruta_foto: projectData.ruta_foto || '',
          porcentaje_avance: projectData.porcentaje_avance || 0,
        });
        
        toast({
          title: "Éxito",
          description: "Proyecto creado correctamente",
        });
      }

      // Recargar la lista de proyectos
      await loadProjects();
      setDialogOpen(false);
      setEditingProject(null);
      
    } catch (error: any) {
      console.error('❌ Error al guardar proyecto:', error);
      console.error('📋 Respuesta del servidor:', error.response?.data);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || error.message
        || "Error al guardar el proyecto";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (project: Proyecto) => {
    if (!hasPermission('editar_proyecto')) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para editar proyectos",
        variant: "destructive",
      });
      return;
    }
    setEditingProject(project);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!hasPermission('eliminar_proyecto')) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para eliminar proyectos",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await proyectosService.delete(id);
      
      toast({
        title: "Éxito",
        description: "Proyecto eliminado correctamente",
      });

      // Recargar la lista de proyectos
      await loadProjects();
      
    } catch (error: any) {
      console.error('❌ Error al eliminar proyecto:', error);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || "Error al eliminar el proyecto";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Mapear estado numérico a texto para compatibilidad con el UI
  const getStatusFromEstado = (id_estado?: number): "active" | "paused" | "completed" => {
    if (!id_estado) return "active";
    switch (id_estado) {
      case 1: return "active";
      case 2: return "paused";
      case 3: return "completed";
      default: return "active";
    }
  };

  const handleCardClick = (projectId: number) => {
    navigate(`/public/proyecto/${projectId}`);
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
          <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground">
            Gestiona todos los proyectos del Semillero 4.0
          </p>
        </div>
        {hasPermission('crear_proyecto') && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proyecto
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-muted-foreground">
            No hay proyectos disponibles. {hasPermission('crear_proyecto') && 'Crea uno nuevo para comenzar.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const status = getStatusFromEstado(project.id_estado);
            
            return (
              <Card 
                key={project.id} 
                className="transition-shadow hover:shadow-lg cursor-pointer"
                onClick={() => handleCardClick(project.id!)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{project.titulo}</CardTitle>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Badge className={`mt-2 ${statusConfig[status].color}`}>
                        {statusConfig[status].label}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        {hasPermission('editar_proyecto') && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(project);
                          }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        {hasPermission('eliminar_proyecto') && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(project.id!);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {project.descripcion || 'Sin descripción'}
                  </p>
                  <div className="space-y-2 text-sm">
                    {project.url && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">URL:</span>
                        <a 
                          href={project.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline truncate max-w-[150px]"
                        >
                          {project.url}
                        </a>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progreso:</span>
                      <span className="font-medium">{project.porcentaje_avance || 0}%</span>
                    </div>
                    {project.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Creado:</span>
                        <span className="font-medium">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Barra de progreso */}
                  {project.porcentaje_avance !== undefined && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${project.porcentaje_avance}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingProject(null);
        }}
        project={editingProject}
        onSave={handleSaveProject}
      />
    </div>
  );
}
