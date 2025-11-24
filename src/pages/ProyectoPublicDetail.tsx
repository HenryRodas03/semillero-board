import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { publicService, ProyectoPublico } from "@/services/publicService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Calendar, 
  ExternalLink, 
  FolderOpen, 
  Loader2,
  Building2,
  TrendingUp,
  Clock,
  CheckSquare,
  BookOpen,
  Home
} from "lucide-react";

export default function ProyectoPublicDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState<ProyectoPublico | null>(null);
  const [actividades, setActividades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProyecto();
    }
  }, [id]);

  const loadProyecto = async () => {
    try {
      setLoading(true);
      console.log('📋 Cargando detalle del proyecto:', id);
      
      // Cargar proyecto usando publicService
      const data = await publicService.getProyectoDetalle(parseInt(id!));
      console.log('✅ Proyecto cargado:', data);
      setProyecto(data);

      // Cargar actividades del proyecto
      try {
        const actividadesData = await publicService.getActividadesProyecto(parseInt(id!));
        console.log('✅ Actividades cargadas:', actividadesData);
        console.log('📊 Cantidad de actividades:', actividadesData.length);
        console.log('📊 Tipo de dato:', Array.isArray(actividadesData) ? 'Array' : typeof actividadesData);
        setActividades(actividadesData);
        console.log('✅ Estado de actividades actualizado');
      } catch (error) {
        console.error('Error al cargar actividades:', error);
      }
    } catch (error: any) {
      console.error('❌ Error al cargar proyecto:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-muted-foreground">Cargando proyecto...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('🎨 Renderizando componente. Actividades:', actividades.length);

  if (!proyecto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Proyecto no encontrado</p>
                <Link to="/public/campos">
                  <Button className="mt-4">Volver a Campos</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Semilleros UCP</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Inicio
                </Button>
              </Link>
              <Link to="/public/semilleros">
                <Button variant="ghost" size="sm">Semilleros</Button>
              </Link>
              <Link to="/public/campos">
                <Button variant="ghost" size="sm">Campos</Button>
              </Link>
              <Link to="/public/publicaciones">
                <Button variant="ghost" size="sm">Publicaciones</Button>
              </Link>
              <Link to="/login">
                <Button size="sm">Iniciar Sesión</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        {/* Hero Section */}
        <div className="relative mb-8 rounded-xl overflow-hidden">
          {proyecto.ruta_foto ? (
            <div className="relative h-64 md:h-80">
              <img 
                src={proyecto.ruta_foto} 
                alt={proyecto.titulo}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className="text-sm bg-white/20 text-white border-0">
                    {proyecto.estado_nombre || 'En Progreso'}
                  </Badge>
                  {proyecto.campo_nombre && (
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                      {proyecto.campo_nombre}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                  {proyecto.titulo}
                </h1>
                {proyecto.descripcion && (
                  <p className="text-lg text-white/90 max-w-3xl line-clamp-2">
                    {proyecto.descripcion}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-white/20 text-white border-0">
                  {proyecto.estado_nombre || 'En Progreso'}
                </Badge>
                {proyecto.campo_nombre && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                    {proyecto.campo_nombre}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                {proyecto.titulo}
              </h1>
              {proyecto.descripcion && (
                <p className="text-lg text-white/90 max-w-3xl line-clamp-2">
                  {proyecto.descripcion}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descripción del Proyecto */}
            {proyecto.descripcion && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Acerca del Proyecto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {proyecto.descripcion}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Actividades del Proyecto */}
            {actividades.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckSquare className="h-5 w-5" />
                        Actividades
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Actividades registradas en el proyecto
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{actividades.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {actividades.map((actividad: any, index: number) => (
                      <div 
                        key={actividad.id || index}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{actividad.titulo || actividad.nombre}</h4>
                            {actividad.descripcion && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {actividad.descripcion}
                              </p>
                            )}
                          </div>
                          {actividad.estado && (
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                              {actividad.estado}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progreso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progreso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-3xl font-bold text-gray-900">
                      {proyecto.porcentaje_avance}%
                    </span>
                    <span className="text-sm text-muted-foreground">Completado</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${proyecto.porcentaje_avance}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del Campo */}
            {proyecto.campo_nombre && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Campo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="font-medium">{proyecto.campo_nombre}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fechas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Fechas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proyecto.fecha_creacion && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Creación</p>
                        <p className="text-sm font-medium">
                          {new Date(proyecto.fecha_creacion).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resumen */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <CheckSquare className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Actividades</p>
                        <p className="text-2xl font-bold">{actividades.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Semilleros UCP. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
