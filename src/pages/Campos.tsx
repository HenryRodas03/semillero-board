import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { camposService } from "@/services/camposService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Users, FolderKanban, User, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Lider {
  nombre: string;
  correo: string;
}

interface Campo {
  id: number;
  nombre: string;
  descripcion: string;
  ruta_imagen: string | null;
  id_lider: number;
  lider: Lider;
  estadisticas: {
    total_proyectos: number;
    total_integrantes: number;
  };
}

interface MisCamposResponse {
  success: boolean;
  rol: string;
  semillero: {
    id: number;
    nombre: string;
  };
  campos: Campo[];
  total: number;
}

export default function Campos() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MisCamposResponse | null>(null);

  useEffect(() => {
    loadCampos();
  }, []);

  const loadCampos = async () => {
    try {
      setLoading(true);
      const response = await camposService.getMisCamposUsuario();
      console.log('📋 Mis campos:', response);
      setData(response);
    } catch (error: any) {
      console.error('❌ Error al cargar campos:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudieron cargar los campos",
        variant: "destructive",
      });
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

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se pudieron cargar los campos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mis Campos de Investigación</h1>
            <p className="text-muted-foreground mt-2">
              {data.semillero.nombre} • {data.rol}
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {data.total} {data.total === 1 ? 'Campo' : 'Campos'}
          </Badge>
        </div>
      </div>

      {/* Lista de Campos */}
      {data.campos.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No tienes campos asignados</p>
              <p className="text-sm text-muted-foreground mt-2">
                Contacta con el administrador del semillero para que te asigne a un campo
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.campos.map((campo) => (
            <Card key={campo.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                {campo.ruta_imagen && (
                  <div className="w-full h-40 mb-4 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={campo.ruta_imagen}
                      alt={campo.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardTitle className="line-clamp-2">{campo.nombre}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {campo.descripcion}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Líder */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">Líder:</span>
                    <span className="ml-2 text-muted-foreground">{campo.lider.nombre}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">{campo.lider.correo}</span>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="flex gap-4 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{campo.estadisticas.total_proyectos}</span>
                    <span className="text-sm text-muted-foreground">Proyectos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">{campo.estadisticas.total_integrantes}</span>
                    <span className="text-sm text-muted-foreground">Integrantes</span>
                  </div>
                </div>

                {/* Botón Ver Detalle */}
                <Button asChild className="w-full">
                  <Link to={`/campos/${campo.id}`}>
                    Ver Detalle
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
