import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { UserDialog } from '@/components/users/UserDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { camposService } from '@/services/camposService';
import { Semillero, semillerosService } from '@/services/semillerosService';
import { Usuario, usuariosService } from '@/services/usuariosService';
import {
  Edit,
  FolderOpen,
  Image as ImageIcon,
  Info,
  Mail,
  Plus,
  Power,
  Save,
  Trash2,
  Upload,
  Users,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CampoInvestigacion {
  id: number;
  nombre: string;
  descripcion?: string;
  ruta_imagen?: string;
  contacto?: string;
  activo: number;
  liderUsuario?: {
    id: number;
    nombre: string;
    correo: string;
  };
}

export default function MiSemillero() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [semillero, setSemillero] = useState<Semillero | null>(null);
  const [campos, setCampos] = useState<CampoInvestigacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    contacto: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  // Crear campo
  const [openCrearCampo, setOpenCrearCampo] = useState(false);
  const [crearCampoSubmitting, setCrearCampoSubmitting] = useState(false);
  const [nuevoCampo, setNuevoCampo] = useState({ 
    nombre: '', 
    descripcion: '', 
    lider: '',
    horario_reunion: '',
    contacto_email: '',
    contacto_redes_sociales: ''
  });
  const [nuevoCampoImagen, setNuevoCampoImagen] = useState<File | null>(null);
  const [nuevoCampoImagenPreview, setNuevoCampoImagenPreview] = useState<string>('');

  // Agregar integrante existente
  const [openAgregarExistente, setOpenAgregarExistente] = useState(false);
  const [campoSeleccionadoId, setCampoSeleccionadoId] = useState<number | null>(null);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<Usuario[]>([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);

  // Crear usuario y agregar
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [campoParaNuevoUsuario, setCampoParaNuevoUsuario] = useState<number | null>(null);

  useEffect(() => {
    // Solo cargar si el usuario es Admin Semillero (id_rol === 1)
    if (user && user.id_rol === 1) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [semilleroData, camposData] = await Promise.all([
        semillerosService.getMiSemillero(),
        semillerosService.getMisCampos()
      ]);
      
      // Verificar que el semillero pertenece al usuario autenticado
      const sem = semilleroData as any;
      const liderId = sem?.lider ?? sem?.liderUsuario?.id ?? sem?.lider_id ?? sem?.liderId;
      if (sem && user && liderId === user.id) {
        setSemillero(sem);
        setCampos(camposData || []);
        
        // Initialize form
        setFormData({
          nombre: semilleroData.nombre,
          descripcion: semilleroData.descripcion || '',
          contacto: semilleroData.contacto || ''
        });
        
        if (sem.ruta_imagen) {
          setImagePreview(sem.ruta_imagen);
        }
      } else {
        // Si no es el líder, no mostrar nada
        toast({
          title: 'Acceso denegado',
          description: 'No tienes un semillero asignado o no eres el líder.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error al cargar datos',
        description: error.response?.data?.message || 'No se pudo cargar la información del semillero',
        variant: 'destructive'
      });
      setSemillero(null);
      setCampos([]);
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

  const handleNuevoCampoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      setNuevoCampoImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNuevoCampoImagenPreview(reader.result as string);
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
      
      if (selectedImage) {
        data.append('imagen', selectedImage);
      }

      const updated = await semillerosService.actualizarMiSemillero(data);
      setSemillero(updated);
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

  const openCrearCampoDialog = () => setOpenCrearCampo(true);

  const handleCrearCampo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCampo.nombre.trim()) {
      toast({ title: 'Nombre requerido', description: 'Indica el nombre del campo', variant: 'destructive' });
      return;
    }

    if (!nuevoCampo.lider || !nuevoCampo.lider.trim()) {
      toast({ title: 'Líder requerido', description: 'Debes especificar el ID del usuario líder', variant: 'destructive' });
      return;
    }

    if (!nuevoCampo.descripcion.trim()) {
      toast({ title: 'Descripción requerida', description: 'Indica la descripción del campo', variant: 'destructive' });
      return;
    }

    try {
      setCrearCampoSubmitting(true);
      const data = new FormData();
      data.append('nombre', nuevoCampo.nombre);
      data.append('lider', nuevoCampo.lider);
      data.append('descripcion', nuevoCampo.descripcion);
      
      // Campos opcionales
      if (nuevoCampo.horario_reunion) {
        data.append('horario_reunion', nuevoCampo.horario_reunion);
      }
      if (nuevoCampo.contacto_email) {
        data.append('contacto_email', nuevoCampo.contacto_email);
      }
      if (nuevoCampo.contacto_redes_sociales) {
        data.append('contacto_redes_sociales', nuevoCampo.contacto_redes_sociales);
      }
      if (nuevoCampoImagen) {
        data.append('imagen', nuevoCampoImagen);
      }

      // id_semillero se auto-asigna en el backend basado en el usuario autenticado
      const created = await camposService.create(data);
      
      // Recargar campos
      const misCampos = await camposService.getMisCampos();
      setCampos(misCampos || []);
      setOpenCrearCampo(false);
      setNuevoCampo({ 
        nombre: '', 
        descripcion: '', 
        lider: '',
        horario_reunion: '',
        contacto_email: '',
        contacto_redes_sociales: ''
      });
      setNuevoCampoImagen(null);
      setNuevoCampoImagenPreview('');
      toast({ title: 'Campo creado', description: 'El campo de investigación fue creado correctamente' });
    } catch (error: any) {
      console.error('❌ Error al crear campo:', error);
      toast({ 
        title: 'Error al crear campo', 
        description: error.response?.data?.message || error.message || 'No fue posible crear el campo', 
        variant: 'destructive' 
      });
    } finally {
      setCrearCampoSubmitting(false);
    }
  };

  const openAgregarIntegranteExistente = async (idCampo: number) => {
    setCampoSeleccionadoId(idCampo);
    setOpenAgregarExistente(true);
    try {
      setUsuariosLoading(true);
      const resp = await camposService.getUsuariosDisponibles(idCampo, { buscar: '', rol: undefined, semillero: true });
      // asumir que resp.data o resp.usuarios
      const list = resp.usuarios || resp.users || resp.data || resp;
      setUsuariosDisponibles(list || []);
    } catch (error) {
      setUsuariosDisponibles([]);
      toast({ title: 'Error', description: 'No se pudo obtener la lista de usuarios disponibles', variant: 'destructive' });
    } finally {
      setUsuariosLoading(false);
    }
  };

  const handleAgregarExistente = async (id_usuario: number) => {
    if (!campoSeleccionadoId) return;
    try {
      await camposService.agregarIntegrante(campoSeleccionadoId, id_usuario);
      // refrescar integrantes o campos
      const misCampos = await camposService.getMisCampos();
      setCampos(misCampos || []);
      setOpenAgregarExistente(false);
      toast({ title: 'Integrante agregado', description: 'Usuario agregado correctamente al campo' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'No se pudo agregar el usuario', variant: 'destructive' });
    }
  };

  const handleCrearUsuarioYAgregar = (idCampo: number) => {
    setCampoParaNuevoUsuario(idCampo);
    setOpenUserDialog(true);
  };

  const onUserDialogSave = async (userData: any) => {
    // Build base payload
    const basePayload: any = {
      email: userData.email || userData.correo || '',
      nombre: userData.name || userData.nombre || '',
      apellido: userData.apellido || ''
    };
    if (userData.password) basePayload.password = userData.password;

    const mapRoleStringToId = (roleStr?: string) => {
      // conservative mapping: coordinator -> try Delegado (3) else fallback to Colaborador (4)
      if (roleStr === 'coordinator') return 3;
      return 4;
    };

    const tryCreate = async (id_rol?: number) => {
      const payload = { ...basePayload } as any;
      if (id_rol) payload.id_rol = id_rol;
      return await usuariosService.create(payload);
    };

    try {
      const desiredRoleId = mapRoleStringToId(userData.role as string | undefined);
      let created = await tryCreate(desiredRoleId);

      if (campoParaNuevoUsuario) {
        await camposService.agregarIntegrante(campoParaNuevoUsuario, created.id);
        const misCampos = await camposService.getMisCampos();
        setCampos(misCampos || []);
      }

      setOpenUserDialog(false);
      toast({ title: 'Usuario creado', description: 'Usuario creado y agregado al campo' });
    } catch (error: any) {
      const msg = error?.response?.data?.message || '';
      if (msg.toLowerCase().includes('permiso') || msg.toLowerCase().includes('rol')) {
        // try fallback to collaborator
        try {
          const fallback = await tryCreate(4);
          if (campoParaNuevoUsuario) {
            await camposService.agregarIntegrante(campoParaNuevoUsuario, fallback.id);
            const misCampos = await camposService.getMisCampos();
            setCampos(misCampos || []);
          }
          setOpenUserDialog(false);
          toast({ title: 'Usuario creado', description: 'Usuario creado con rol por defecto y agregado al campo' });
          return;
        } catch (err2: any) {
          toast({ title: 'Error al crear usuario', description: err2?.response?.data?.message || msg || 'No se pudo crear el usuario', variant: 'destructive' });
          return;
        }
      }

      toast({ title: 'Error al crear usuario', description: msg || 'No se pudo crear el usuario', variant: 'destructive' });
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Validar que el usuario sea Admin Semillero
  if (!user || user.id_rol !== 1) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para acceder a esta página. Solo los líderes de semillero pueden gestionar su semillero.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!semillero) {
    return (
      <div className="p-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No se encontró información del semillero. Contacta al administrador para que te asigne un semillero.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mi Semillero</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona la información de tu semillero de investigación
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
                    Actualiza los datos básicos de tu semillero
                  </CardDescription>
                </div>
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
                  
                  {editMode && (
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
                      value={formData.nombre}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      disabled={!editMode}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                      disabled={!editMode}
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
                      value={formData.contacto}
                      onChange={(e) => setFormData(prev => ({ ...prev, contacto: e.target.value }))}
                      disabled={!editMode}
                      placeholder="contacto@semillero.edu.co"
                    />
                  </div>

                  {/* Info no editable */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <Label className="text-muted-foreground">Líder</Label>
                      <p className="font-medium">
                        {semillero.liderUsuario?.nombre || user?.nombre}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {semillero.liderUsuario?.correo || user?.correo}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Línea de Investigación</Label>
                      <p className="font-medium">{semillero.linea?.nombre || 'No asignada'}</p>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                {editMode && (
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

        {/* Tab: Campos */}
        <TabsContent value="campos" className="space-y-4">
          <div className="flex items-center justify-between">
            <div />
            <div>
              <Button size="sm" onClick={openCrearCampoDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Campo
              </Button>
            </div>
          </div>
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
                <Card key={campo.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/campos/${campo.id}`)}>
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
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => openAgregarIntegranteExistente(campo.id)}>
                        Agregar existente
                      </Button>
                      <Button size="sm" onClick={() => handleCrearUsuarioYAgregar(campo.id)}>
                        Crear usuario y agregar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Dialog: Crear Campo */}
        <Dialog open={openCrearCampo} onOpenChange={setOpenCrearCampo}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Campo de Investigación</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCrearCampo} className="space-y-4">
              {/* Preview de imagen */}
              {nuevoCampoImagenPreview && (
                <div className="flex justify-center">
                  <img 
                    src={nuevoCampoImagenPreview} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg border-2 border-border"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="campo-nombre">
                  Nombre del Campo *
                </Label>
                <Input 
                  id="campo-nombre"
                  value={nuevoCampo.nombre} 
                  onChange={(e) => setNuevoCampo(prev => ({ ...prev, nombre: e.target.value }))} 
                  placeholder="Ej: Inteligencia Artificial"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="campo-lider">
                  ID del Líder (Usuario) *
                </Label>
                <Input 
                  id="campo-lider"
                  type="number"
                  value={nuevoCampo.lider} 
                  onChange={(e) => setNuevoCampo(prev => ({ ...prev, lider: e.target.value }))} 
                  placeholder="Ej: 2"
                  required 
                />
                <p className="text-xs text-muted-foreground">
                  ID del usuario que será líder del campo (debe tener rol 2)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="campo-descripcion">
                  Descripción *
                </Label>
                <Textarea 
                  id="campo-descripcion"
                  value={nuevoCampo.descripcion} 
                  onChange={(e) => setNuevoCampo(prev => ({ ...prev, descripcion: e.target.value }))} 
                  placeholder="Describe el campo de investigación..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="campo-imagen">
                  Imagen (JPG, PNG)
                </Label>
                <Input 
                  id="campo-imagen"
                  type="file" 
                  accept="image/jpeg,image/png" 
                  onChange={handleNuevoCampoImageChange}
                />
                <p className="text-xs text-muted-foreground">
                  Máximo 5MB. Formatos: JPG, PNG
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="campo-horario">
                  Horario de Reuniones
                </Label>
                <Input 
                  id="campo-horario"
                  value={nuevoCampo.horario_reunion} 
                  onChange={(e) => setNuevoCampo(prev => ({ ...prev, horario_reunion: e.target.value }))} 
                  placeholder="Ej: Lunes 3:00 PM - 5:00 PM"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="campo-email">
                  Email de Contacto
                </Label>
                <Input 
                  id="campo-email"
                  type="email"
                  value={nuevoCampo.contacto_email} 
                  onChange={(e) => setNuevoCampo(prev => ({ ...prev, contacto_email: e.target.value }))} 
                  placeholder="contacto@campo.edu"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="campo-redes">
                  Redes Sociales (JSON)
                </Label>
                <Textarea 
                  id="campo-redes"
                  value={nuevoCampo.contacto_redes_sociales} 
                  onChange={(e) => setNuevoCampo(prev => ({ ...prev, contacto_redes_sociales: e.target.value }))} 
                  placeholder='{"facebook": "url", "twitter": "url"}'
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Formato JSON con las redes sociales del campo
                </p>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => {
                    setOpenCrearCampo(false);
                    setNuevoCampo({ 
                      nombre: '', 
                      descripcion: '', 
                      lider: '',
                      horario_reunion: '',
                      contacto_email: '',
                      contacto_redes_sociales: ''
                    });
                    setNuevoCampoImagen(null);
                    setNuevoCampoImagenPreview('');
                  }}
                  disabled={crearCampoSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={crearCampoSubmitting}>
                  {crearCampoSubmitting ? 'Creando...' : 'Crear Campo'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog: Agregar integrante existente */}
        <Dialog open={openAgregarExistente} onOpenChange={setOpenAgregarExistente}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Agregar integrante existente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {usuariosLoading ? (
                <div>Cargando usuarios...</div>
              ) : usuariosDisponibles.length === 0 ? (
                <div>No hay usuarios disponibles</div>
              ) : (
                <div className="space-y-2">
                  {usuariosDisponibles.map((u) => (
                    <div key={u.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{u.nombre}</div>
                        <div className="text-sm text-muted-foreground">{u.email}</div>
                      </div>
                      <div>
                        <Button size="sm" onClick={() => handleAgregarExistente(u.id)}>Agregar</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenAgregarExistente(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: Crear usuario y agregar (UserDialog) */}
        <UserDialog open={openUserDialog} onOpenChange={setOpenUserDialog} onSave={onUserDialogSave} />
      </Tabs>
    </div>
  );
}
