import { ContactosPublic } from "@/components/public/ContactosPublic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contactosService } from "@/services/contactosService";
import { publicService } from "@/services/publicService";
import { ArrowLeft, BookOpen, FolderKanban, Home, Loader2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function SemilleroPublicDetail() {
  const { id } = useParams<{ id: string }>();
  const [semillero, setSemillero] = useState<any>(null);
  const [contactos, setContactos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSemillero();
    }
  }, [id]);

  const loadSemillero = async () => {
    try {
      setLoading(true);
      const data = await publicService.getSemilleroDetalle(parseInt(id!));
      setSemillero(data);

      // Cargar contactos de todos los campos del semillero
      if (data.campos && data.campos.length > 0) {
        const allContactos = await Promise.all(
          data.campos.map((campo: any) => 
            contactosService.getByCampo(campo.id, true)
          )
        );
        // Aplanar el array de contactos
        setContactos(allContactos.flat());
      }
    } catch (error) {
      console.error('Error al cargar semillero:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-muted-foreground">Cargando información...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!semillero) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Semillero no encontrado</p>
                <Link to="/public/semilleros">
                  <Button className="mt-4">Volver a Semilleros</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Semilleros UCP</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost">
                  <Home className="h-4 w-4 mr-2" />
                  Inicio
                </Button>
              </Link>
              <Link to="/public/semilleros">
                <Button variant="ghost">Semilleros</Button>
              </Link>
              <Link to="/public/proyectos">
                <Button variant="ghost">Proyectos</Button>
              </Link>
              <Link to="/public/eventos">
                <Button variant="ghost">Eventos</Button>
              </Link>
              <Link to="/login">
                <Button>Iniciar Sesión</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Link to="/public/semilleros">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Semilleros
          </Button>
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4">{semillero.nombre}</h1>
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
                  <CardTitle>Campos de Investigación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {semillero.campos.map((campo: any) => (
                      <div key={campo.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-lg mb-2">{campo.nombre}</h3>
                        {campo.descripcion && (
                          <p className="text-muted-foreground text-sm">{campo.descripcion}</p>
                        )}
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
                  <CardTitle>Proyectos Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {semillero.proyectos.slice(0, 6).map((proyecto: any) => (
                      <div key={proyecto.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                        <h3 className="font-semibold mb-2">{proyecto.nombre}</h3>
                        {proyecto.descripcion && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {proyecto.descripcion}
                          </p>
                        )}
                        {proyecto.estado && (
                          <Badge variant="outline" className="mt-2">
                            {proyecto.estado}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  {semillero.proyectos.length > 6 && (
                    <div className="mt-4 text-center">
                      <Link to="/public/proyectos">
                        <Button variant="outline">Ver todos los proyectos</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Información del Coordinador */}
            {semillero.coordinador && (
              <Card>
                <CardHeader>
                  <CardTitle>Coordinador</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{semillero.coordinador.nombre}</p>
                      {semillero.coordinador.correo && (
                        <a 
                          href={`mailto:${semillero.coordinador.correo}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {semillero.coordinador.correo}
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contactos */}
            {contactos.length > 0 && (
              <ContactosPublic contactos={contactos} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
