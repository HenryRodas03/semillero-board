import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { semillerosService } from "@/services/semillerosService";
import { ArrowLeft, FolderOpen, Image as ImageIcon, Info, Loader2, Mail, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Lider {
  nombre: string;
  correo: string;
}

interface Campo {
  id: number;
  nombre: string;
  descripcion?: string;
  ruta_imagen?: string;
  contacto?: string;
  activo: number;
  liderUsuario?: Lider;
}

interface Semillero {
  id: number;
  nombre: string;
  descripcion?: string;
  ruta_imagen?: string;
  contacto?: string;
  activo: number;
  liderUsuario?: Lider;
  linea?: {
    nombre: string;
  };
}

export default function SemilleroDetail() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [semillero, setSemillero] = useState<Semillero | null>(null);
  const [campos, setCampos] = useState<Campo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSemillero();
    }
  }, [id]);

  const loadSemillero = async () => {
    try {
      setLoading(true);
      // Cargar semillero usando el servicio público que incluye los campos
      const data = await semillerosService.getPublicoById(parseInt(id!));
      
      // El servicio público devuelve el semillero con sus campos incluidos
      setSemillero(data);
      
      // Si el semillero tiene campos, extraerlos
      if ((data as any).campos && Array.isArray((data as any).campos)) {
        setCampos((data as any).campos);
      } else {
        setCampos([]);
      }
    } catch (error) {
      console.error('Error al cargar semillero:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!semillero) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Semillero no encontrado</p>
              <Button className="mt-4" onClick={() => navigate('/semilleros')}>
                Volver a Semilleros
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Botón de regreso - solo para rol 5 */}
      {user?.id_rol === 5 && (
        <Button 
          variant="ghost" 
          className="mb-2"
          onClick={() => navigate('/semilleros')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Semilleros
        </Button>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{user?.id_rol === 5 ? semillero.nombre : 'Mi Semillero'}</h1>
          <p className="text-muted-foreground mt-1">
            {user?.id_rol === 5 
              ? 'Información del semillero de investigación' 
              : 'Gestiona la información de tu semillero de investigación'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={semillero.activo === 1 ? 'default' : 'secondary'}>
            {semillero.activo === 1 ? 'Abierto' : 'Cerrado'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">
            <Info className="w-4 h-4 mr-2" />
            Información
          </TabsTrigger>
          <TabsTrigger value="campos">
            <FolderOpen className="w-4 h-4 mr-2" />
            Campos de Investigación ({campos.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab: Información */}
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Información del Semillero</CardTitle>
                  <CardDescription>
                    Datos del semillero de investigación
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Imagen */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {semillero.ruta_imagen ? (
                      <img
                        src={semillero.ruta_imagen}
                        alt="Logo del semillero"
                        className="w-48 h-48 object-cover rounded-lg border-2 border-border"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Campos del formulario - Solo lectura */}
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del Semillero *</Label>
                    <Input
                      id="nombre"
                      value={semillero.nombre}
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={semillero.descripcion || ''}
                      disabled
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contacto">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Correo de Contacto
                    </Label>
                    <Input
                      id="contacto"
                      type="email"
                      value={semillero.contacto || ''}
                      disabled
                      placeholder="contacto@semillero.edu.co"
                    />
                  </div>

                  {/* Info no editable */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <Label className="text-muted-foreground">Líder</Label>
                      <p className="font-medium">
                        {semillero.liderUsuario?.nombre || 'No asignado'}
                      </p>
                      {semillero.liderUsuario?.correo && (
                        <p className="text-sm text-muted-foreground">
                          {semillero.liderUsuario.correo}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Línea de Investigación</Label>
                      <p className="font-medium">{semillero.linea?.nombre || 'No asignada'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Campos */}
        <TabsContent value="campos" className="space-y-4">
          {campos.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No hay campos de investigación registrados</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {campos.map((campo) => (
                <Card 
                  key={campo.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => navigate(`/public/campos/${campo.id}`)}
                >
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
      </Tabs>
    </div>
  );
}
        {semillero.descripcion && (
          <p className="text-xl text-blue-100">{semillero.descripcion}</p>
        )}
        <div className="flex items-center gap-4 mt-6">
          <Badge variant="secondary" className="bg-white/20 text-white">
            <Users className="h-4 w-4 mr-2" />
            {semillero.campos?.length || 0} Campo{semillero.campos?.length !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white">
            <FolderKanban className="h-4 w-4 mr-2" />
            {semillero.proyectos?.length || 0} Proyecto{semillero.proyectos?.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Campos de Investigación */}
          {semillero.campos && semillero.campos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Campos de Investigación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {semillero.campos.map((campo: any) => (
                    <div 
                      key={campo.id} 
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/public/campos/${campo.id}`)}
                    >
                      <div className="flex items-start gap-4">
                        {campo.ruta_imagen && (
                          <img
                            src={campo.ruta_imagen}
                            alt={campo.nombre}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1">{campo.nombre}</h3>
                          {campo.descripcion && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {campo.descripcion}
                            </p>
                          )}
                          {campo.lider && (
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4" />
                              <span>Líder: {campo.lider.nombre}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Proyectos */}
          {semillero.proyectos && semillero.proyectos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5" />
                  Proyectos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {semillero.proyectos.map((proyecto: any) => (
                    <div
                      key={proyecto.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold mb-2">{proyecto.titulo}</h3>
                      {proyecto.descripcion && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {proyecto.descripcion}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline">{proyecto.estado || 'En desarrollo'}</Badge>
                        {proyecto.campo && (
                          <span className="text-xs text-muted-foreground">
                            {proyecto.campo.nombre}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Información */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {semillero.lider && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Líder del Semillero</p>
                  <p className="font-semibold">{semillero.lider.nombre}</p>
                  {semillero.lider.correo && (
                    <p className="text-sm text-muted-foreground">{semillero.lider.correo}</p>
                  )}
                </div>
              )}

              {semillero.linea && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Línea de Investigación</p>
                  <p className="font-semibold">{semillero.linea.nombre}</p>
                </div>
              )}

              {semillero.contacto && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Contacto</p>
                  <p className="text-sm">{semillero.contacto}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contactos */}
          {contactos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contactos</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactosPublic contactos={contactos} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
