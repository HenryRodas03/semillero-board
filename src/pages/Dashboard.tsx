import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, CheckSquare, Clock, TrendingUp } from "lucide-react";

const stats = [
  {
    title: "Proyectos Activos",
    value: "12",
    change: "+2 este mes",
    icon: FolderKanban,
    color: "text-primary",
  },
  {
    title: "Tareas Completadas",
    value: "48",
    change: "+12 esta semana",
    icon: CheckSquare,
    color: "text-light-green",
  },
  {
    title: "Tareas Pendientes",
    value: "23",
    change: "5 vencen pronto",
    icon: Clock,
    color: "text-accent",
  },
  {
    title: "Progreso General",
    value: "67%",
    change: "+8% vs mes anterior",
    icon: TrendingUp,
    color: "text-blue",
  },
];

const recentProjects = [
  { id: 1, name: "Sistema de Inventario", status: "En progreso", progress: 75 },
  { id: 2, name: "App Móvil iOS", status: "En progreso", progress: 45 },
  { id: 3, name: "Dashboard Analytics", status: "En revisión", progress: 90 },
  { id: 4, name: "API REST v2", status: "Iniciando", progress: 20 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido al sistema de gestión del Semillero 4.0
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proyectos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">{project.status}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
