import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Semillero, semillerosService } from '@/services/semillerosService';
import { usuariosService } from '@/services/usuariosService';
import { lineasInvestigacionService } from '@/services/lineasInvestigacionService';
import { FolderOpen, Image as ImageIcon, Mail, Users, Plus, Upload, X, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MiSemillero from './MiSemillero';

export default function Semilleros() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [semilleros, setSemilleros] = useState<Semillero[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Estados para crear semillero
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [lineasInvestigacion, setLineasInvestigacion] = useState<any[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [loadingLineas, setLoadingLineas] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    contacto: '',
    lider: '',
    lineas_investigacion_id: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Estados para eliminar semillero
  const [semilleroToDelete, setSemilleroToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Cargar usuarios y líneas de investigación cuando se abre el dialog
  useEffect(() => {
    if (isCreateDialogOpen && user?.id_rol === 5) {
      loadUsuariosYLineas();
    }
  }, [isCreateDialogOpen, user]);

  const loadUsuariosYLineas = async () => {
    try {
      setLoadingUsuarios(true);
      setLoadingLineas(true);
      
      // Cargar usuarios
      const usuariosData = await usuariosService.getAll();
      console.log('Respuesta usuarios:', usuariosData);
      
      // El backend devuelve { total, users }
      if (usuariosData && Array.isArray((usuariosData as any).users)) {
        setUsuarios((usuariosData as any).users);
      } else if (Array.isArray(usuariosData)) {
        setUsuarios(usuariosData);
      } else {
        setUsuarios([]);
      }
      setLoadingUsuarios(false);

      // Cargar líneas de investigación
      const lineasData = await lineasInvestigacionService.getAll();
      console.log('Respuesta líneas:', lineasData);
      
      if (Array.isArray(lineasData)) {
        setLineasInvestigacion(lineasData);
      } else if (lineasData && Array.isArray((lineasData as any).lineas)) {
        setLineasInvestigacion((lineasData as any).lineas);
      } else {
        setLineasInvestigacion([]);
      }
      setLoadingLineas(false);
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      toast({
        title: 'Error al cargar datos',
        description: error.response?.data?.message || 'No se pudieron cargar usuarios y líneas',
        variant: 'destructive'
      });
      setLoadingUsuarios(false);
      setLoadingLineas(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Imagen muy grande',
        description: 'La imagen no debe superar 5MB',
        variant: 'destructive'
      });
      return;
    }

    setSelectedImage(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateSemillero = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre.trim()) {
      toast({
        title: 'Nombre requerido',
        description: 'El nombre del semillero es obligatorio',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.lider) {
      toast({
        title: 'Líder requerido',
        description: 'Debes seleccionar un líder para el semillero',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.lineas_investigacion_id) {
      toast({
        title: 'Línea de investigación requerida',
        description: 'Debes seleccionar una línea de investigación',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsCreating(true);

      const data = new FormData();
      data.append('nombre', formData.nombre.trim());
      data.append('lider', formData.lider);
      data.append('descripcion', formData.descripcion.trim());
      data.append('lineas_investigacion_id', formData.lineas_investigacion_id);
      
      if (formData.contacto.trim()) {
        data.append('contacto', formData.contacto.trim());
      }

      if (selectedImage) {
        data.append('imagen', selectedImage);
      }

      await semillerosService.create(data);

      toast({
        title: 'Éxito',
        description: 'Semillero creado correctamente'
      });

      // Recargar semilleros
      const updatedSemilleros = await semillerosService.getAll({ es_activo: true });
      setSemilleros(Array.isArray(updatedSemilleros) ? updatedSemilleros : []);

      // Cerrar dialog y resetear form
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error al crear semillero',
        description: error.response?.data?.message || 'No se pudo crear el semillero',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      contacto: '',
      lider: '',
      lineas_investigacion_id: ''
    });
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleDeleteSemillero = async () => {
    if (!semilleroToDelete) return;

    try {
      setIsDeleting(true);
      await semillerosService.delete(semilleroToDelete);

      toast({
        title: 'Éxito',
        description: 'Semillero eliminado correctamente'
      });

      // Recargar semilleros
      const updatedSemilleros = await semillerosService.getAll({ es_activo: true });
      setSemilleros(Array.isArray(updatedSemilleros) ? updatedSemilleros : []);

      setSemilleroToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Error al eliminar semillero',
        description: error.response?.data?.message || 'No se pudo eliminar el semillero',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
          {user?.id_rol === 5 && (
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#008042] hover:bg-[#025d31] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Crear Semillero
            </Button>
          )}
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
            <Card 
              key={semillero.id} 
              className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/semilleros/${semillero.id}`)}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                {semillero.ruta_imagen ? (
                  <img src={semillero.ruta_imagen} alt={semillero.nombre} className="w-16 h-16 object-cover rounded-lg border" />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-lg border flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{semillero.nombre}</CardTitle>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant={semillero.activo === 1 ? 'default' : 'secondary'}>
                      {semillero.activo === 1 ? 'Abierto' : 'Cerrado'}
                    </Badge>
                    {semillero.linea && <span className="text-xs text-muted-foreground truncate">{semillero.linea?.nombre}</span>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground line-clamp-3">{semillero.descripcion || 'Sin descripción'}</div>
                
                {/* Información del líder y contacto */}
                <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                  {semillero.liderUsuario && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Líder: {semillero.liderUsuario.nombre}</span>
                    </div>
                  )}
                  {semillero.contacto && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{semillero.contacto}</span>
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/semilleros/${semillero.id}`);
                    }}
                  >
                    Ver semillero
                  </Button>
                  {user?.id_rol === 5 && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSemilleroToDelete(semillero.id);
                      }}
                      title="Eliminar semillero"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para crear semillero */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Semillero</DialogTitle>
            <DialogDescription>
              Completa los datos para crear un nuevo semillero de investigación
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSemillero} className="space-y-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Semillero *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Semillero de Inteligencia Artificial"
                disabled={isCreating}
                required
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe el propósito y objetivos del semillero"
                rows={4}
                disabled={isCreating}
                required
              />
            </div>

            {/* Líder */}
            <div className="space-y-2">
              <Label htmlFor="lider">Líder del Semillero *</Label>
              <Select
                value={formData.lider}
                onValueChange={(value) => setFormData({ ...formData, lider: value })}
                disabled={isCreating || loadingUsuarios}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un líder" />
                </SelectTrigger>
                <SelectContent>
                  {loadingUsuarios ? (
                    <SelectItem value="loading" disabled>Cargando usuarios...</SelectItem>
                  ) : usuarios.length === 0 ? (
                    <SelectItem value="empty" disabled>No hay usuarios disponibles</SelectItem>
                  ) : (
                    usuarios.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id.toString()}>
                        {usuario.nombre} - {usuario.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Línea de Investigación */}
            <div className="space-y-2">
              <Label htmlFor="linea">Línea de Investigación *</Label>
              <Select
                value={formData.lineas_investigacion_id}
                onValueChange={(value) => setFormData({ ...formData, lineas_investigacion_id: value })}
                disabled={isCreating || loadingLineas}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una línea" />
                </SelectTrigger>
                <SelectContent>
                  {loadingLineas ? (
                    <SelectItem value="loading" disabled>Cargando líneas...</SelectItem>
                  ) : lineasInvestigacion.length === 0 ? (
                    <SelectItem value="empty" disabled>No hay líneas disponibles</SelectItem>
                  ) : (
                    lineasInvestigacion.map((linea) => (
                      <SelectItem key={linea.id} value={linea.id.toString()}>
                        {linea.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Contacto */}
            <div className="space-y-2">
              <Label htmlFor="contacto">Correo de Contacto (opcional)</Label>
              <Input
                id="contacto"
                type="email"
                value={formData.contacto}
                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                placeholder="contacto@ejemplo.com"
                disabled={isCreating}
              />
            </div>

            {/* Imagen */}
            <div className="space-y-2">
              <Label htmlFor="imagen">Imagen del Semillero (opcional)</Label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview('');
                      }}
                      disabled={isCreating}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-muted rounded-lg border flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="imagen"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isCreating}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Máximo 5MB. Formatos: JPG, PNG, GIF
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-[#008042] hover:bg-[#025d31] text-white"
              >
                {isCreating ? 'Creando...' : 'Crear Semillero'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Loading Overlay - debe estar fuera del dialog con z-index mayor */}
      {isCreating && (
        <LoadingOverlay isLoading={isCreating} message="Creando semillero..." />
      )}

      {/* AlertDialog para confirmar eliminación */}
      <AlertDialog open={!!semilleroToDelete} onOpenChange={() => setSemilleroToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El semillero y todos sus datos asociados serán eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSemillero}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loading Overlay para eliminación */}
      {isDeleting && (
        <LoadingOverlay isLoading={isDeleting} message="Eliminando semillero..." />
      )}
    </div>
  );
}
