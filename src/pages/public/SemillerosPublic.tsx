import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { publicService } from "@/services/publicService";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SemillerosPublic() {
  const [semilleros, setSemilleros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSemilleros();
  }, []);

  const loadSemilleros = async () => {
    try {
      setLoading(true);
      const data = await publicService.getSemilleros();
      setSemilleros(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar semilleros:', error);
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
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Semilleros</span>
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
          <h1 className="text-4xl font-bold mb-4">Semilleros de Investigación</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explora nuestros semilleros de investigación y sus campos de estudio
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Cargando semilleros...</p>
            </div>
          </div>
        ) : semilleros.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No hay semilleros disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {semilleros.map((semillero) => (
              <Link key={semillero.id} to={`/public/semillero/${semillero.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {semillero.imagen && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={semillero.imagen}
                        alt={semillero.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{semillero.nombre}</CardTitle>
                      <Badge variant={semillero.activo === 1 ? 'default' : 'secondary'}>
                        {semillero.activo === 1 ? 'Abierto' : 'Cerrado'}
                      </Badge>
                    </div>
                    {semillero.linea && (
                      <CardDescription className="text-xs">
                        {semillero.linea.nombre}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {semillero.descripcion || 'Sin descripción'}
                    </p>
                    {semillero.liderUsuario && (
                      <p className="text-xs text-muted-foreground mt-3">
                        Líder: {semillero.liderUsuario.nombre}
                      </p>
                    )}
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
