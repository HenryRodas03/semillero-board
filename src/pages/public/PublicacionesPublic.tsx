import PublicacionCard from '@/components/publicaciones/PublicacionCard';
import { Button } from '@/components/ui/button';
import publicacionesService from '@/services/publicacionesService';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PublicacionesPublic() {
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPublicaciones();
  }, []);

  const loadPublicaciones = async () => {
    try {
      setLoading(true);
      const response = await publicacionesService.getAll();
      
      // Extraer array de publicaciones
      let publicacionesArray: any[] = [];
      if (Array.isArray(response)) {
        publicacionesArray = response;
      } else if (response && Array.isArray(response.publicaciones)) {
        publicacionesArray = response.publicaciones;
      }
      
      setPublicaciones(publicacionesArray);
    } catch (error) {
      console.error('Error al cargar publicaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 border-b">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                S4
              </div>
              <span className="text-xl font-bold">Publicaciones</span>
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
          <h1 className="text-4xl font-bold mb-4">Publicaciones</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explora las publicaciones académicas, eventos y logros de nuestros semilleros de investigación
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-2" />
              <p className="text-sm text-muted-foreground">Cargando publicaciones...</p>
            </div>
          </div>
        ) : publicaciones.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No hay publicaciones disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicaciones.map((p) => (
              <PublicacionCard 
                key={p.id} 
                publicacion={p}
              />
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
