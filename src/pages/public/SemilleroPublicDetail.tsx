import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { publicService, SemilleroPublico, CampoPublico } from "@/services/publicService";
import { ArrowLeft, BookOpen, Home, Loader2, Users, Mail, Target, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

export default function SemilleroPublicDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [semillero, setSemillero] = useState<SemilleroPublico | null>(null);
  const [campos, setCampos] = useState<CampoPublico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSemillero();
    }
  }, [id]);

  const loadSemillero = async () => {
    try {
      setLoading(true);
      const data = await publicService.getSemilleroDetalle(parseInt(id!));
      console.log('Detalle del semillero:', data);
      setSemillero(data);
      
      // Cargar los campos del semillero
      try {
        const camposData = await publicService.getCamposBySemillero(parseInt(id!));
        console.log('Campos del semillero:', camposData);
        setCampos(camposData);
      } catch (error) {
        console.error('Error al cargar campos:', error);
        // Si falla, usar los campos que vienen en el detalle del semillero
        if (data.campos && data.campos.length > 0) {
          setCampos(data.campos);
        }
      }
    } catch (error) {
      console.error('Error al cargar semillero:', error);
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

  if (!semillero) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Semillero no encontrado</p>
                <Link to="/public/semilleros">
                  <Button className="mt-4">Volver a Semilleros</Button>
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
          {semillero.imagen ? (
            <div className="relative h-64 md:h-80">
              <img 
                src={semillero.imagen} 
                alt={semillero.nombre}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant={semillero.activo === 1 ? 'default' : 'secondary'} className="text-sm">
                    {semillero.activo === 1 ? 'Activo' : 'Inactivo'}
                  </Badge>
                  {semillero.linea_investigacion && (
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                      {semillero.linea_investigacion}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                  {semillero.nombre}
                </h1>
                {semillero.descripcion && (
                  <p className="text-lg text-white/90 max-w-3xl line-clamp-2">
                    {semillero.descripcion}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {semillero.activo === 1 ? 'Activo' : 'Inactivo'}
                </Badge>
                {semillero.linea_investigacion && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                    {semillero.linea_investigacion}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                {semillero.nombre}
              </h1>
              {semillero.descripcion && (
                <p className="text-lg text-white/90 max-w-3xl line-clamp-2">
                  {semillero.descripcion}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descripción del Semillero */}
            {semillero.descripcion && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Acerca del Semillero
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {semillero.descripcion}
                  </p>
                  {semillero.linea_investigacion && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Línea de Investigación
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {semillero.linea_investigacion}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Campos de Investigación */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Campos de Investigación
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Áreas de investigación del semillero
                    </CardDescription>
                  </div>
                  {campos.length > 0 && (
                    <Badge variant="secondary">
                      {campos.length} {campos.length === 1 ? 'campo' : 'campos'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {campos.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {campos.map((campo) => (
                      <Link 
                        key={campo.id} 
                        to={`/public/campo/${campo.id}`}
                        className="group"
                      >
                        <Card className="h-full transition-all hover:shadow-lg hover:border-blue-300">
                          {campo.ruta_imagen && (
                            <div className="h-32 overflow-hidden rounded-t-lg">
                              <img 
                                src={campo.ruta_imagen} 
                                alt={campo.nombre}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base group-hover:text-blue-600 transition-colors">
                                {campo.nombre}
                              </CardTitle>
                              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {campo.descripcion || 'Sin descripción disponible'}
                            </p>
                            {(campo.liderUsuario || campo.estado_nombre) && (
                              <div className="flex flex-wrap gap-2">
                                {campo.estado_nombre && (
                                  <Badge variant="outline" className="text-xs">
                                    {campo.estado_nombre}
                                  </Badge>
                                )}
                                {campo.liderUsuario && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    <span>{campo.liderUsuario.nombre}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">No hay campos de investigación disponibles</p>
                    <p className="text-sm text-muted-foreground/70">
                      Este semillero aún no tiene campos registrados
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información de Contacto */}
            {semillero.contacto && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {semillero.contacto && (
                      <a 
                        href={`mailto:${semillero.contacto}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm font-medium truncate">{semillero.contacto}</p>
                        </div>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Campos</p>
                        <p className="text-2xl font-bold">{campos.length}</p>
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
                          {semillero.activo === 1 ? 'Activo' : 'Inactivo'}
                        </p>
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
