import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Semillero, semillerosService } from '@/services/semillerosService';
import { FolderOpen, Image as ImageIcon, Mail, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MiSemillero from './MiSemillero';

export default function Semilleros() {
  const { user } = useAuth();
  const [semilleros, setSemilleros] = useState<Semillero[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSemilleros = async () => {
      setLoading(true);
      try {
        const data = await semillerosService.getAll({ es_activo: true });
        setSemilleros(Array.isArray(data) ? data : []);
      } catch {
        setSemilleros([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSemilleros();
  }, []);

  // Si el usuario es líder de semillero, renderizamos aquí la vista de MiSemillero
  if (user && user.id_rol === 1) {
    return <MiSemillero />;
  }

  const filtered = semilleros.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (s.nombre || '').toLowerCase().includes(q) ||
      (s.descripcion || '').toLowerCase().includes(q) ||
      (s.liderUsuario?.nombre || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold leading-tight">Semilleros</h1>
          <p className="text-sm text-muted-foreground">Explora semilleros públicos y descubre líderes y líneas de trabajo.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input placeholder="Buscar por nombre, descripción o líder..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full sm:w-72" />
          <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => setQuery('')}>Limpiar</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg border bg-card animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No se encontraron semilleros que coincidan</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((semillero) => (
            <Card key={semillero.id} className="relative overflow-hidden hover:shadow-lg transition-shadow" >
              <div
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/semilleros/${semillero.id}`)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/semilleros/${semillero.id}`)}
                className="absolute inset-0 z-10 bg-transparent"
                aria-hidden
              />
              <div className="relative z-0">
                <CardHeader className="flex flex-row items-center gap-4">
                  {semillero.ruta_imagen ? (
                    <img src={semillero.ruta_imagen} alt={semillero.nombre} className="w-16 h-16 object-cover rounded-lg border" />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded-lg border flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-lg truncate">{semillero.nombre}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={semillero.activo === 1 ? 'default' : 'secondary'}>
                        {semillero.activo === 1 ? 'Abierto' : 'Cerrado'}
                      </Badge>
                      {semillero.linea && <span className="text-xs text-muted-foreground">{semillero.linea?.nombre}</span>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground line-clamp-3 mb-3">{semillero.descripcion || 'Sin descripción'}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {semillero.liderUsuario && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>Líder: {semillero.liderUsuario.nombre}</span>
                        </div>
                      )}
                      {semillero.contacto && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{semillero.contacto}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/semilleros/${semillero.id}`)}>
                        Ver semillero
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
