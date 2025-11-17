import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { proyectosService } from "@/services/proyectosService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CheckSquare
} from "lucide-react";

interface ProyectoDetalle {
  id: number;
  titulo: string;
  descripcion: string;
  ruta_foto?: string;
  url?: string;
  porcentaje_avance: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  id_estado: number;
  id_campo: number;
  estado?: {
    id: number;
    estado: string;
  };
  campo?: {
    id: number;
    nombre: string;
    semillero?: {
      id: number;
      nombre: string;
    };
  };
}

export default function ProyectoPublicDetail() {
  const { id } = useParams<{ id: string }>();
  const [proyecto, setProyecto] = useState<ProyectoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProyecto();
  }, [id]);

  const loadProyecto = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      console.log('📋 Cargando detalle del proyecto:', id);
      const data = await proyectosService.getById(parseInt(id));
      console.log('✅ Proyecto cargado:', data);
      setProyecto(data.project || data);
    } catch (error: any) {
      console.error('❌ Error al cargar proyecto:', error);
      setError('No se pudo cargar la información del proyecto');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadgeColor = (idEstado: number) => {
    switch (idEstado) {
      case 1: return "bg-green-500 text-white";
      case 2: return "bg-yellow-500 text-white";
      case 3: return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !proyecto) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500 mb-4">{error || 'Proyecto no encontrado'}</p>
            <Link to="/campos">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Campos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con botón de volver */}
        <div className="mb-6">
          <Link to={`/campos/${proyecto.id_campo}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Campo
            </Button>
          </Link>
        </div>

        {/* Imagen del proyecto */}
        {proyecto.ruta_foto && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
            <img
              src={proyecto.ruta_foto}
              alt={proyecto.titulo}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        )}

        {/* Título y Estado */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {proyecto.titulo}
              </h1>
              {proyecto.estado && (
                <Badge className={`${getEstadoBadgeColor(proyecto.id_estado)} text-sm px-3 py-1`}>
                  {proyecto.estado.estado}
                </Badge>
              )}
            </div>
          </div>

          {/* Descripción */}
          {proyecto.descripcion && (
            <p className="text-lg text-gray-600 mt-4">
              {proyecto.descripcion}
            </p>
          )}
        </div>

        {/* Cards de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Información del Campo y Semillero */}
          {proyecto.campo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Building2 className="mr-2 h-5 w-5 text-blue-600" />
                  Campo y Semillero
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Campo de Investigación</p>
                  <p className="font-semibold text-gray-900">{proyecto.campo.nombre}</p>
                </div>
                {proyecto.campo.semillero && (
                  <div>
                    <p className="text-sm text-gray-500">Semillero</p>
                    <p className="font-semibold text-gray-900">{proyecto.campo.semillero.nombre}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Progreso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                Progreso del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {parseFloat(proyecto.porcentaje_avance?.toString() || '0').toFixed(0)}%
                  </span>
                  <span className="text-sm text-gray-500">Completado</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ 
                      width: `${parseFloat(proyecto.porcentaje_avance?.toString() || '0')}%` 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fechas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="mr-2 h-5 w-5 text-purple-600" />
                Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Fecha de Creación
                </p>
                <p className="font-semibold text-gray-900 ml-6">
                  {new Date(proyecto.fecha_creacion).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Última Actualización
                </p>
                <p className="font-semibold text-gray-900 ml-6">
                  {new Date(proyecto.fecha_actualizacion).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Enlaces */}
          {proyecto.url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FolderOpen className="mr-2 h-5 w-5 text-orange-600" />
                  Recursos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={proyecto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium text-blue-600">Ver Repositorio</span>
                  <ExternalLink className="h-5 w-5 text-blue-600" />
                </a>
              </CardContent>
            </Card>
          )}

          {/* Actividades */}
          <Link to={`/projects/${proyecto.id}/actividades`}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CheckSquare className="mr-2 h-5 w-5 text-indigo-600" />
                  Actividades del Proyecto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-indigo-600">Ver Tablero de Actividades</span>
                  <ExternalLink className="h-5 w-5 text-indigo-600" />
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Gestiona y visualiza las actividades del proyecto en formato Kanban
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Footer con más información */}
        {proyecto.campo && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <p className="text-sm">
                  Este proyecto pertenece al campo de <strong>{proyecto.campo.nombre}</strong>
                </p>
                {proyecto.campo.semillero && (
                  <p className="text-sm mt-1">
                    del semillero <strong>{proyecto.campo.semillero.nombre}</strong>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
