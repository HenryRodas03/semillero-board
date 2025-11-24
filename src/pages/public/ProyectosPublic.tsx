import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { publicService, CampoPublico } from "@/services/publicService";
import { ArrowLeft, Loader2, Mail, Target, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ProyectosPublic() {
  const [campos, setCampos] = useState<CampoPublico[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCampos();
  }, []);

  const loadCampos = async () => {
    try {
      setLoading(true);
      const data = await publicService.getCampos();
      setCampos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar campos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Inicio
            </Button>
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Campos de Investigación</span>
            </div>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/login">Iniciar Sesión</Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Campos de Investigación</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre los campos de investigación y sus proyectos activos
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Cargando campos...</p>
            </div>
          </div>
        ) : campos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No hay campos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campos.map((campo) => (
              <Link key={campo.id} to={`/public/campo/${campo.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {campo.ruta_imagen && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={campo.ruta_imagen}
                        alt={campo.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{campo.nombre}</CardTitle>
                      <Badge variant={campo.activo === 1 ? 'default' : 'secondary'}>
                        {campo.activo === 1 ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    {campo.semillero?.nombre && (
                      <CardDescription className="text-xs">
                        {campo.semillero.nombre}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {campo.descripcion || 'Sin descripción'}
                    </p>
                    
                    <div className="space-y-2 text-xs text-muted-foreground">
                      {campo.liderUsuario && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>Líder: {campo.liderUsuario.nombre}</span>
                        </div>
                      )}
                      {campo.liderUsuario?.correo && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{campo.liderUsuario.correo}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Semillero 4.0. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
