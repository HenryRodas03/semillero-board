import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, CheckSquare, Clock, TrendingUp, Loader2 } from "lucide-react";
import { dashboardService, DashboardResponse } from "@/services/dashboardService";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getDashboard();
      console.log('📊 Dashboard cargado:', response);
      
      // Validar que la respuesta tenga la estructura correcta
      if (!response || typeof response !== 'object') {
        throw new Error('Respuesta inválida del servidor');
      }
      
      setData(response);
    } catch (error: any) {
      console.error('❌ Error al cargar dashboard:', error);
      console.error('❌ Error response:', error.response);
      
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "No se pudo cargar el dashboard",
        variant: "destructive",
      });
      
      // Establecer data como null para mostrar el mensaje de error
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || !data.estadisticas) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se pudo cargar el dashboard</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Proyectos Activos",
      value: (data.estadisticas?.proyectos_activos ?? 0).toString(),
      icon: FolderKanban,
      color: "text-primary",
    },
    {
      title: "Tareas Completadas",
      value: (data.estadisticas?.tareas_completadas ?? 0).toString(),
      icon: CheckSquare,
      color: "text-light-green",
    },
    {
      title: "Tareas Pendientes",
      value: (data.estadisticas?.tareas_pendientes ?? 0).toString(),
      icon: Clock,
      color: "text-accent",
    },
    {
      title: "Progreso General",
      value: `${data.estadisticas?.progreso_general ?? 0}%`,
      icon: TrendingUp,
      color: "text-blue",
    },
  ];

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEstadoBadgeColor = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('progreso')) return 'default';
    if (estadoLower.includes('revisión')) return 'secondary';
    if (estadoLower.includes('iniciando')) return 'outline';
    if (estadoLower.includes('completado')) return 'default';
    return 'secondary';
  };

  const handleProyectoClick = (proyectoId: number) => {
    navigate(`/projects/${proyectoId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          {data.semillero && `${data.semillero.nombre} • `}
          {data.campo && `${data.campo.nombre} • `}
          {data.rol}
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
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proyectos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {!data.proyectos_recientes || data.proyectos_recientes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay proyectos disponibles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.proyectos_recientes.map((proyecto) => (
                <div
                  key={proyecto.id}
                  onClick={() => handleProyectoClick(proyecto.id)}
                  className="flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-muted/50 hover:shadow-md cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{proyecto.titulo}</h3>
                      <Badge variant={getEstadoBadgeColor(proyecto.estado)}>
                        {proyecto.estado}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {proyecto.campo && (
                        <span>📂 {proyecto.campo.nombre}</span>
                      )}
                      <span>📅 {formatFecha(proyecto.fecha_actualizacion)}</span>
                      {proyecto.total_actividades !== undefined && (
                        <span>
                          ✓ {proyecto.actividades_completadas}/{proyecto.total_actividades} actividades
                        </span>
                      )}
                      {proyecto.mis_actividades && (
                        <span>
                          👤 Mis tareas: {proyecto.mis_actividades.completadas}/{proyecto.mis_actividades.total}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="w-32">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium">{parseFloat(proyecto.porcentaje_avance).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${proyecto.porcentaje_avance}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
