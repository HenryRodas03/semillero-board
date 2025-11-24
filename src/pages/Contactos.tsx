import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { usuariosService } from "@/services/usuariosService";
import { Loader2, Mail, User, Briefcase, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

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

export default function Contactos() {
  const [lideres, setLideres] = useState<Lider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTipo, setFilterTipo] = useState<string>("todos");

  useEffect(() => {
    loadLideres();
  }, []);

  const loadLideres = async () => {
    try {
      setLoading(true);
      const data = await usuariosService.getLideres();
      setLideres(data.lideres);
    } catch (error) {
      console.error('Error al cargar líderes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los líderes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const lideresFiltrados = filterTipo === "todos" 
    ? lideres 
    : lideres.filter(l => l.es_lider_de?.tipo.toLowerCase().includes(filterTipo.toLowerCase()));

  const lideresConAsignacion = lideresFiltrados.filter(l => l.es_lider_de !== null);
  const lideresSinAsignacion = lideresFiltrados.filter(l => l.es_lider_de === null);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Directorio de Líderes</h1>
        <p className="text-muted-foreground">
          Información de contacto de los líderes de semilleros y campos de investigación
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar por tipo</CardTitle>
          <CardDescription>
            Selecciona el tipo de líder que deseas ver
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterTipo === "todos" ? "default" : "outline"}
              onClick={() => setFilterTipo("todos")}
              size="sm"
            >
              Todos ({lideres.length})
            </Button>
            <Button
              variant={filterTipo === "semillero" ? "default" : "outline"}
              onClick={() => setFilterTipo("semillero")}
              size="sm"
            >
              Semilleros ({lideres.filter(l => l.es_lider_de?.tipo === "Semillero").length})
            </Button>
            <Button
              variant={filterTipo === "campo" ? "default" : "outline"}
              onClick={() => setFilterTipo("campo")}
              size="sm"
            >
              Campos ({lideres.filter(l => l.es_lider_de?.tipo === "Campo de Investigación").length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lideres.length}</p>
                <p className="text-sm text-muted-foreground">Total Líderes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lideresConAsignacion.length}</p>
                <p className="text-sm text-muted-foreground">Con Asignación</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lideresSinAsignacion.length}</p>
                <p className="text-sm text-muted-foreground">Sin Asignación</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Líderes con Asignación */}
      {lideresConAsignacion.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Líderes Activos</CardTitle>
            <CardDescription>
              Líderes con semilleros o campos de investigación asignados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lideresConAsignacion.map((lider) => (
                <Card key={lider.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {/* Nombre y Rol */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{lider.nombre}</h3>
                          <Badge variant="outline" className="mt-1">
                            {lider.rol.nombre}
                          </Badge>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`mailto:${lider.correo}`} 
                          className="text-blue-600 hover:underline"
                        >
                          {lider.correo}
                        </a>
                      </div>

                      {/* Asignación */}
                      {lider.es_lider_de && (
                        <div className="pt-3 border-t">
                          <div className="flex items-start gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground uppercase">
                                {lider.es_lider_de.tipo}
                              </p>
                              <p className="font-medium">{lider.es_lider_de.nombre}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
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
      )}

      {/* Lista de Líderes sin Asignación */}
      {lideresSinAsignacion.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Líderes Disponibles</CardTitle>
            <CardDescription>
              Líderes sin semilleros o campos asignados actualmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lideresSinAsignacion.map((lider) => (
                <Card key={lider.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {/* Nombre y Rol */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{lider.nombre}</h3>
                          <Badge variant="outline" className="mt-1">
                            {lider.rol.nombre}
                          </Badge>
                        </div>
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`mailto:${lider.correo}`} 
                          className="text-blue-600 hover:underline"
                        >
                          {lider.correo}
                        </a>
                      </div>

                      <div className="pt-3 border-t">
                        <Badge variant="secondary" className="text-xs">
                          Sin asignación actual
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vacío */}
      {lideresFiltrados.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No se encontraron líderes con los filtros seleccionados
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
