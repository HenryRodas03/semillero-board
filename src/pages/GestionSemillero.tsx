import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Semillero, semillerosService } from '@/services/semillerosService';
import {
  ArrowLeft,
  Calendar,
  FolderOpen,
  Info,
  Mail,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function GestionSemillero() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [semillero, setSemillero] = useState<Semillero | null>(null);
  const [campos, setCampos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSemillero();
    }
  }, [id]);

  const loadSemillero = async () => {
    try {
      setLoading(true);
      const data = await semillerosService.getById(Number(id));
      setSemillero(data);
      // Cargar campos del semillero
      const camposData = await semillerosService.getMisCampos();
      // Filtrar solo los campos que pertenecen a este semillero (por si acaso)
      setCampos(Array.isArray(camposData) ? camposData.filter(c => c.semillero_id === Number(id)) : []);
    } catch (error) {
      console.error('Error al cargar semillero:', error);
      setCampos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!semillero) {
    return (
      <div className="p-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No se encontró el semillero solicitado.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => navigate('/semilleros')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Semilleros
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/semilleros')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{semillero.nombre}</h1>
          <p className="text-muted-foreground mt-1">Gestión de semillero</p>
        </div>
        <Badge variant={semillero.activo === 1 ? 'default' : 'secondary'}>
          {semillero.activo === 1 ? 'Abierto' : 'Cerrado'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {semillero.ruta_imagen && (
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <img
                  src={semillero.ruta_imagen}
                  alt={semillero.nombre}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          </div>
        )}

        <div className={semillero.ruta_imagen ? 'md:col-span-2' : 'md:col-span-3'}>
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="mt-1">{semillero.descripcion || 'Sin descripción'}</p>
              </div>

              {semillero.linea && (
                <div>
                  <p className="text-sm text-muted-foreground">Línea de Investigación</p>
                  <p className="mt-1 font-medium">{semillero.linea.nombre}</p>
                </div>
              )}

              {semillero.liderUsuario && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Líder del Semillero
                  </p>
                  <p className="mt-1 font-medium">{semillero.liderUsuario.nombre}</p>
                  <p className="text-sm text-muted-foreground">{semillero.liderUsuario.correo}</p>
                </div>
              )}

              {semillero.contacto && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contacto
                  </p>
                  <p className="mt-1">{semillero.contacto}</p>
                </div>
              )}

              {semillero.created_at && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Fecha de creación
                  </p>
                  <p className="mt-1">{new Date(semillero.created_at).toLocaleDateString('es-ES')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="campos" className="w-full">
        <TabsList>
          <TabsTrigger value="campos">
            <FolderOpen className="w-4 h-4 mr-2" />
            Campos de Investigación ({campos.length})
          </TabsTrigger>
          <TabsTrigger value="integrantes">
            <Users className="w-4 h-4 mr-2" />
            Integrantes
          </TabsTrigger>
        </TabsList>

        {/* Tab: Campos */}
        <TabsContent value="campos">
          {campos.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No hay campos de investigación registrados</p>
                  <p className="text-sm mt-2">Los campos aparecerán aquí cuando se creen</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {campos.map((campo) => (
                <Card key={campo.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{campo.nombre}</CardTitle>
                        <CardDescription className="mt-2">
                          {campo.descripcion || 'Sin descripción'}
                        </CardDescription>
                      </div>
                      <Badge variant={campo.activo === 1 ? 'default' : 'secondary'}>
                        {campo.activo === 1 ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {campo.liderUsuario && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>Líder: {campo.liderUsuario.nombre}</span>
                        </div>
                      )}
                      {campo.contacto && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{campo.contacto}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Integrantes */}
        <TabsContent value="integrantes">
          <Card>
            <CardHeader>
              <CardTitle>Integrantes</CardTitle>
              <CardDescription>
                Lista de integrantes del semillero
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Contenido en desarrollo...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
