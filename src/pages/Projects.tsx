import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectDialog } from "@/components/projects/ProjectDialog";

interface Project {
  id: number;
  name: string;
  description: string;
  status: "active" | "paused" | "completed";
  startDate: string;
  endDate: string;
  members: number;
}

const initialProjects: Project[] = [
  {
    id: 1,
    name: "Sistema de Inventario",
    description: "Desarrollo de sistema web para control de inventarios",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    members: 5,
  },
  {
    id: 2,
    name: "App Móvil iOS",
    description: "Aplicación móvil para gestión de pedidos",
    status: "active",
    startDate: "2024-02-01",
    endDate: "2024-08-15",
    members: 3,
  },
  {
    id: 3,
    name: "Dashboard Analytics",
    description: "Panel de análisis de datos en tiempo real",
    status: "paused",
    startDate: "2024-01-10",
    endDate: "2024-05-20",
    members: 4,
  },
];

const statusConfig = {
  active: { label: "Activo", color: "bg-primary text-primary-foreground" },
  paused: { label: "En Pausa", color: "bg-accent text-accent-foreground" },
  completed: { label: "Completado", color: "bg-light-green text-white" },
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleSaveProject = (project: Omit<Project, "id"> & { id?: number }) => {
    if (project.id) {
      setProjects(projects.map((p) => (p.id === project.id ? project as Project : p)));
    } else {
      const newProject = { ...project, id: Math.max(...projects.map((p) => p.id)) + 1 } as Project;
      setProjects([...projects, newProject]);
    }
    setDialogOpen(false);
    setEditingProject(null);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground">
            Gestiona todos los proyectos del Semillero 4.0
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="transition-shadow hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge className={`mt-2 ${statusConfig[project.status].color}`}>
                    {statusConfig[project.status].label}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem onClick={() => handleEdit(project)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(project.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {project.description}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inicio:</span>
                  <span className="font-medium">{new Date(project.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fin:</span>
                  <span className="font-medium">{new Date(project.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Miembros:</span>
                  <span className="font-medium">{project.members}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
