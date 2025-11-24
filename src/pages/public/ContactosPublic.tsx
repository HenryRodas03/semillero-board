import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { publicService } from "@/services/publicService";
import { Loader2, Mail, User, Briefcase, BookOpen, Home, ArrowLeft } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface Lider {
  id: number;
  nombre: string;
  correo: string;
  rol: {
    id: number;
    nombre: string;
  };
  es_lider_de: {
    tipo: string;
    nombre: string;
    descripcion: string;
    id: number;
  } | null;
}

export default function ContactosPublic() {
  const navigate = useNavigate();
  const [lideres, setLideres] = useState<Lider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTipo, setFilterTipo] = useState<string>("todos");

  useEffect(() => {
    loadLideres();
  }, []);
  
  // Memoizar los conteos para evitar recalcular en cada render
  const lideresAsignados = useMemo(() => lideres.filter(l => l.es_lider_de !== null), [lideres]);
  const totalLideres = lideresAsignados.length;
  const totalSemilleros = useMemo(() => 
    lideresAsignados.filter(l => l.es_lider_de?.tipo === "Semillero").length,
    [lideresAsignados]
  );
  
  const totalCampos = useMemo(() => 
    lideresAsignados.filter(l => l.es_lider_de?.tipo === "Campo de Investigación").length,
    [lideresAsignados]
  );

  const loadLideres = async () => {
    try {
      setLoading(true);
      const data = await publicService.getLideres();
      setLideres(data.lideres);
    } catch (error) {
      console.error('Error al cargar líderes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Memoizar el filtrado para evitar recalcular en cada render
  const lideresFiltrados = useMemo(() => {
    if (filterTipo === "todos") return lideres;
    if (filterTipo === "semillero") {
      return lideres.filter(l => l.es_lider_de?.tipo === "Semillero");
    }
    return lideres.filter(l => l.es_lider_de?.tipo === "Campo de Investigación");
  }, [lideres, filterTipo]);

  const lideresConAsignacion = useMemo(() => 
    lideresFiltrados.filter(l => l.es_lider_de !== null),
    [lideresFiltrados]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Directorio de Contactos
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Inicio
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
              <p className="mt-4 text-muted-foreground">Cargando información de contacto...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
              <h2 className="text-4xl font-bold">Conecta con Nuestros Líderes</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Encuentra la información de contacto de los líderes de nuestros semilleros y campos de investigación
              </p>
            </div>

            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle>Filtrar por área</CardTitle>
                <CardDescription>
                  Selecciona el tipo de líder que deseas contactar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={filterTipo === "todos" ? "default" : "outline"}
                    onClick={() => setFilterTipo("todos")}
                    size="sm"
                  >
                    Todos ({totalLideres})
                  </Button>
                  <Button
                    variant={filterTipo === "semillero" ? "default" : "outline"}
                    onClick={() => setFilterTipo("semillero")}
                    size="sm"
                  >
                    Semilleros ({totalSemilleros})
                  </Button>
                  <Button
                    variant={filterTipo === "campo" ? "default" : "outline"}
                    onClick={() => setFilterTipo("campo")}
                    size="sm"
                  >
                    Campos de Investigación ({totalCampos})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-lg shadow-md">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-blue-900">{totalLideres}</p>
                      <p className="text-sm text-blue-700">Total de Líderes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-lg shadow-md">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-indigo-900">
                        {totalSemilleros}
                      </p>
                      <p className="text-sm text-indigo-700">Semilleros</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-600 rounded-lg shadow-md">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-purple-900">
                        {totalCampos}
                      </p>
                      <p className="text-sm text-purple-700">Campos de Investigación</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Líderes */}
            {lideresConAsignacion.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Información de Contacto
                  </CardTitle>
                  <CardDescription>
                    Contacta directamente a nuestros líderes para más información
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {lideresConAsignacion.map((lider, index) => (
                      <Card 
                        key={`${lider.id}-${lider.es_lider_de?.id || 'sin-asignacion'}-${index}`}
                        className="hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
                      >
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            {/* Nombre y Rol */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-bold text-xl text-gray-900">{lider.nombre}</h3>
                                <Badge variant="secondary" className="mt-2">
                                  {lider.rol.nombre}
                                </Badge>
                              </div>
                              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                                <User className="h-6 w-6 text-blue-600" />
                              </div>
                            </div>

                            {/* Email */}
                            <div className="pt-3 border-t">
                              <div className="flex items-center gap-2 text-sm mb-1 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span className="font-medium">Correo electrónico</span>
                              </div>
                              <a 
                                href={`mailto:${lider.correo}`} 
                                className="text-blue-600 hover:text-blue-700 font-medium hover:underline inline-flex items-center gap-1"
                              >
                                {lider.correo}
                              </a>
                            </div>

                            {/* Asignación */}
                            {lider.es_lider_de && (
                              <div className="pt-3 border-t bg-gradient-to-br from-gray-50 to-blue-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
                                <div className="flex items-start gap-3">
                                  <Briefcase className="h-5 w-5 text-blue-600 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                                      {lider.es_lider_de.tipo}
                                    </p>
                                    <p className="font-semibold text-gray-900 text-lg">
                                      {lider.es_lider_de.nombre}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                                      {lider.es_lider_de.descripcion}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-xl text-muted-foreground">
                      No se encontraron líderes con los filtros seleccionados
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-gradient-to-br from-gray-900 to-blue-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            ¿Tienes preguntas? Contacta directamente a nuestros líderes para más información
          </p>
          <p className="text-xs text-gray-400 mt-2">
            © 2024 Semilleros de Investigación - Universidad Católica de Pereira
          </p>
        </div>
      </footer>
    </div>
  );
}
