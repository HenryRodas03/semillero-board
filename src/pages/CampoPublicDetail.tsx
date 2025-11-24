import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { publicService, CampoPublico, ProyectoPublico } from "@/services/publicService";
import { ArrowLeft, BookOpen, Home, Loader2, Users, Mail, Clock, Calendar, ExternalLink, FolderKanban } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

export default function CampoPublicDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campo, setCampo] = useState<CampoPublico | null>(null);
  const [proyectos, setProyectos] = useState<ProyectoPublico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCampo();
    }
  }, [id]);

  const loadCampo = async () => {
    try {
      setLoading(true);
      const data = await publicService.getCampoDetalle(parseInt(id!));
      console.log('Detalle del campo:', data);
      setCampo(data);

      // Cargar proyectos del campo
      try {
        const proyectosData = await publicService.getProyectosByCampo(parseInt(id!));
        console.log('Proyectos del campo:', proyectosData);
        setProyectos(proyectosData);
      } catch (error) {
        console.error('Error al cargar proyectos:', error);
      }
    } catch (error) {
      console.error('Error al cargar campo:', error);
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
            <p className="mt-4 text-muted-foreground">Cargando información...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!campo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Campo no encontrado</p>
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

  // Parse redes sociales si existe
  let redesSociales: any = null;
  if (campo.contacto_redes_sociales) {
    try {
      redesSociales = JSON.parse(campo.contacto_redes_sociales);
    } catch (e) {
      console.error('Error parsing redes sociales:', e);
    }
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
          {campo.ruta_imagen ? (
            <div className="relative h-64 md:h-80">
              <img 
                src={campo.ruta_imagen} 
                alt={campo.nombre}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant={campo.activo === 1 ? 'default' : 'secondary'} className="text-sm">
                    {campo.activo === 1 ? 'Activo' : 'Inactivo'}
                  </Badge>
                  {campo.semillero && (
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                      {campo.semillero.nombre}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                  {campo.nombre}
                </h1>
                {campo.descripcion && (
                  <p className="text-lg text-white/90 max-w-3xl line-clamp-2">
                    {campo.descripcion}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {campo.activo === 1 ? 'Activo' : 'Inactivo'}
                </Badge>
                {campo.semillero && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                    {campo.semillero.nombre}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                {campo.nombre}
              </h1>
              {campo.descripcion && (
                <p className="text-lg text-white/90 max-w-3xl line-clamp-2">
                  {campo.descripcion}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descripción del Campo */}
            {campo.descripcion && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Acerca del Campo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {campo.descripcion}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Información del Semillero */}
            {campo.semillero && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Semillero
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link to={`/public/semillero/${campo.semillero.id}`}>
                    <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                            {campo.semillero.nombre}
                          </h3>
                          {campo.semillero.descripcion && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {campo.semillero.descripcion}
                            </p>
                          )}
                        </div>
                        <ExternalLink className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Proyectos del Campo */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FolderKanban className="h-5 w-5" />
                      Proyectos
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Proyectos activos del campo
                    </CardDescription>
                  </div>
                  {proyectos.length > 0 && (
                    <Badge variant="secondary">
                      {proyectos.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {proyectos.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {proyectos.map((proyecto) => (
                      <Link 
                        key={proyecto.id} 
                        to={`/public/proyecto/${proyecto.id}`}
                        className="group"
                      >
                        <Card className="h-full transition-all hover:shadow-lg hover:border-blue-300">
                          {proyecto.ruta_foto && (
                            <div className="h-32 overflow-hidden rounded-t-lg">
                              <img 
                                src={proyecto.ruta_foto} 
                                alt={proyecto.titulo}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base group-hover:text-blue-600 transition-colors line-clamp-2">
                                {proyecto.titulo}
                              </CardTitle>
                              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {proyecto.descripcion || 'Sin descripción disponible'}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {proyecto.estado_nombre && (
                                <Badge variant="outline" className="text-xs">
                                  {proyecto.estado_nombre}
                                </Badge>
                              )}
                              {proyecto.porcentaje_avance !== undefined && (
                                <Badge variant="secondary" className="text-xs">
                                  {proyecto.porcentaje_avance}% completado
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FolderKanban className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">No hay proyectos disponibles</p>
                    <p className="text-sm text-muted-foreground/70">
                      Este campo aún no tiene proyectos registrados
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del Líder */}
            {campo.liderUsuario && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Líder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{campo.liderUsuario.nombre}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {campo.liderUsuario.correo}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Información de Contacto */}
            {(campo.contacto_email || campo.horario_reunion || redesSociales) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {campo.contacto_email && (
                      <a 
                        href={`mailto:${campo.contacto_email}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm font-medium truncate">{campo.contacto_email}</p>
                        </div>
                      </a>
                    )}
                    
                    {campo.horario_reunion && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Horario de Reunión</p>
                          <p className="text-sm font-medium">{campo.horario_reunion}</p>
                        </div>
                      </div>
                    )}

                    {redesSociales && (
                      <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Redes Sociales</p>
                        <div className="flex flex-wrap gap-2">
                          {redesSociales.instagram && (
                            <a 
                              href={`https://instagram.com/${redesSociales.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {redesSociales.instagram}
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resumen */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FolderKanban className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Proyectos</p>
                        <p className="text-2xl font-bold">{proyectos.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Estado</p>
                        <p className="text-sm font-semibold">
                          {campo.activo === 1 ? 'Activo' : 'Inactivo'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {campo.creado_en && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Creado</p>
                          <p className="text-sm font-semibold">
                            {new Date(campo.creado_en).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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
