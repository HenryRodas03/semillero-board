import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useAuth } from "@/contexts/AuthContext";
import { semillerosService } from "@/services/semillerosService";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, FolderOpen, Image as ImageIcon, Info, Loader2, Mail, Power, Save, Trash2, Upload, Users, X } from "lucide-react";
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
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [semillero, setSemillero] = useState<Semillero | null>(null);
  const [campos, setCampos] = useState<Campo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para edición (solo para rol 5)
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    contacto: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    loadSemillero();
  }, [user?.id_rol, id]);

  const loadSemillero = async () => {
    try {
      setLoading(true);
      let responseData;
      
      // Si es rol 5 (SuperAdmin), usar ver_detalle=true con el id del semillero
      if (user?.id_rol === 5 && id) {
        responseData = await semillerosService.getMiSemilleroSuperAdmin(parseInt(id));
      } 
      // Si es rol 1 (Admin Semillero), usar el endpoint de mi-semillero
      else if (user?.id_rol === 1) {
        responseData = await semillerosService.getMiSemillero();
      }
      // Para otros casos, usar el endpoint público con el ID
      else if (id) {
        responseData = await semillerosService.getPublicoById(parseInt(id));
      } else {
        throw new Error('No se pudo determinar qué semillero cargar');
      }
      
      console.log('Response data:', responseData);
      
      // Manejar diferentes estructuras de respuesta
      let semilleroData;
      let camposData = [];
      
      // Si la respuesta tiene la estructura {semillero: {...}, campos: [...]}
      if ((responseData as any).semillero && typeof (responseData as any).semillero === 'object') {
        console.log('Estructura: semillero separado');
        semilleroData = (responseData as any).semillero;
        camposData = Array.isArray((responseData as any).campos) ? (responseData as any).campos : [];
        console.log('Semillero data:', semilleroData);
        console.log('Campos data:', camposData);
      } 
      // Si la respuesta tiene campos dentro del objeto semillero
      else if ((responseData as any).campos && Array.isArray((responseData as any).campos)) {
        console.log('Estructura: campos dentro del semillero');
        semilleroData = responseData;
        camposData = (responseData as any).campos;
      }
      // Si es la respuesta directa del semillero
      else {
        console.log('Estructura: respuesta directa');
        semilleroData = responseData;
      }
      
      console.log('Final semilleroData:', semilleroData);
      console.log('Final camposData:', camposData);
      
      setSemillero(semilleroData);
      setCampos(Array.isArray(camposData) ? camposData : []);
      
      // Inicializar formulario
      setFormData({
        nombre: semilleroData.nombre || '',
        descripcion: semilleroData.descripcion || '',
        contacto: semilleroData.contacto || ''
      });
      
      if (semilleroData.ruta_imagen) {
        setImagePreview(semilleroData.ruta_imagen);
      }
    } catch (error) {
      console.error('Error al cargar semillero:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Imagen muy grande',
          description: 'La imagen no debe superar 5MB',
          variant: 'destructive'
        });
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast({
        title: 'Nombre requerido',
        description: 'El nombre del semillero es obligatorio',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const data = new FormData();
      data.append('nombre', formData.nombre);
      data.append('descripcion', formData.descripcion);
      data.append('contacto', formData.contacto);
      
      // Para rol 5, enviar también el id_semillero
      if (user?.id_rol === 5 && semillero?.id) {
        data.append('id_semillero', semillero.id.toString());
      }
      
      if (selectedImage) {
        data.append('imagen', selectedImage);
      }

      // Tanto rol 5 como rol 1 usan el mismo endpoint de actualización
      const updated = await semillerosService.actualizarMiSemillero(data);
      
      // Preservar el id original del semillero
      setSemillero({
        ...updated,
        id: semillero?.id || updated.id
      });
      
      setEditMode(false);
      setSelectedImage(null);
      
      toast({
        title: 'Éxito',
        description: 'Semillero actualizado correctamente'
      });
    } catch (error: any) {
      toast({
        title: 'Error al actualizar',
        description: error.response?.data?.message || 'No se pudo actualizar el semillero',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm('¿Estás seguro de eliminar la imagen del semillero?')) return;

    try {
      // Tanto rol 5 como rol 1 usan el mismo endpoint
      await semillerosService.eliminarImagenMiSemillero();
      
      setSemillero(prev => prev ? { ...prev, ruta_imagen: undefined } : null);
      setImagePreview('');
      setSelectedImage(null);
      
      toast({
        title: 'Éxito',
        description: 'Imagen eliminada correctamente'
      });
    } catch (error: any) {
      toast({
        title: 'Error al eliminar imagen',
        description: error.response?.data?.message || 'No se pudo eliminar la imagen',
        variant: 'destructive'
      });
    }
  };

  const handleToggleEstado = async () => {
    if (!semillero) return;
    
    const nuevoEstado = semillero.activo === 1 ? 0 : 1;
    const mensaje = nuevoEstado === 1 
      ? '¿Abrir el semillero para nuevos integrantes?' 
      : '¿Cerrar el semillero? No se permitirán nuevos integrantes';
    
    if (!confirm(mensaje)) return;

    try {
      // Tanto rol 5 como rol 1 usan el mismo endpoint
      await semillerosService.cambiarEstadoMiSemillero(nuevoEstado);
      
      setSemillero(prev => prev ? { ...prev, activo: nuevoEstado } : null);
      
      toast({
        title: 'Éxito',
        description: `Semillero ${nuevoEstado === 1 ? 'abierto' : 'cerrado'} correctamente`
      });
    } catch (error: any) {
      toast({
        title: 'Error al cambiar estado',
        description: error.response?.data?.message || 'No se pudo cambiar el estado',
        variant: 'destructive'
      });
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setSelectedImage(null);
    if (semillero) {
      setFormData({
        nombre: semillero.nombre,
        descripcion: semillero.descripcion || '',
        contacto: semillero.contacto || ''
      });
      setImagePreview(semillero.ruta_imagen || '');
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{semillero.nombre}</h1>
          <p className="text-muted-foreground mt-1">
            Información del semillero de investigación
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

        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Información del Semillero</CardTitle>
                  <CardDescription>
                    {user?.id_rol === 5 ? 'Actualiza los datos básicos del semillero' : 'Datos del semillero de investigación'}
                  </CardDescription>
                </div>
                {user?.id_rol === 5 && (
                  <div className="flex gap-2">
                    <Button
                      variant={semillero.activo === 1 ? 'outline' : 'default'}
                      size="sm"
                      onClick={handleToggleEstado}
                    >
                      <Power className="w-4 h-4 mr-2" />
                      {semillero.activo === 1 ? 'Cerrar' : 'Abrir'}
                    </Button>
                    {!editMode && (
                      <Button size="sm" onClick={() => setEditMode(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Imagen */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Logo del semillero"
                        className="w-48 h-48 object-cover rounded-lg border-2 border-border"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {editMode && user?.id_rol === 5 && (
                    <div className="flex gap-2">
                      <Label htmlFor="imagen" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                          <Upload className="w-4 h-4" />
                          Cambiar Imagen
                        </div>
                        <Input
                          id="imagen"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                          disabled={!editMode}
                        />
                      </Label>
                      
                      {imagePreview && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleDeleteImage}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Campos del formulario */}
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del Semillero *</Label>
                    <Input
                      id="nombre"
                      value={editMode ? formData.nombre : semillero.nombre}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      disabled={!editMode || user?.id_rol !== 5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={editMode ? formData.descripcion : (semillero.descripcion || '')}
                      onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                      disabled={!editMode || user?.id_rol !== 5}
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
                      value={editMode ? formData.contacto : (semillero.contacto || '')}
                      onChange={(e) => setFormData(prev => ({ ...prev, contacto: e.target.value }))}
                      disabled={!editMode || user?.id_rol !== 5}
                      placeholder="contacto@semillero.edu.co"
                    />
                  </div>

                  {/* Info no editable */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <Label className="text-muted-foreground">Líder</Label>
                      <p className="font-medium">{semillero.liderUsuario?.nombre || 'No asignado'}</p>
                      {semillero.liderUsuario?.correo && (
                        <p className="text-sm text-muted-foreground">{semillero.liderUsuario.correo}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Línea de Investigación</Label>
                      <p className="font-medium">{semillero.linea?.nombre || 'No asignada'}</p>
                    </div>
                  </div>
                </div>

                {/* Botones de acción - Solo para rol 5 en modo edición */}
                {editMode && user?.id_rol === 5 && (
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEdit}
                      disabled={submitting}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      <Save className="w-4 h-4 mr-2" />
                      {submitting ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

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
                  onClick={() => navigate(`/campos/${campo.id}`)}
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

      {/* Loading Overlay */}
      <LoadingOverlay isLoading={submitting} message="Guardando cambios..." />
    </div>
  );
}
