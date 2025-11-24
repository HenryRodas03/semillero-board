import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { camposService } from "@/services/camposService";
import { proyectosService } from "@/services/proyectosService";
import { usuariosService } from "@/services/usuariosService";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { 
  Loader2, 
  ArrowLeft, 
  Users, 
  FolderKanban, 
  Clock, 
  Mail, 
  Share2,
  User,
  AlertCircle,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Proyecto {
  id: number;
  titulo: string;
  descripcion: string;
  imagen?: string;
  estado?: number;
  porcentaje_avance?: number;
  url?: string;
  fecha_creacion?: string;
  fecha_fin?: string;
}

interface Integrante {
  id: number;
  id_usuario: number;
  id_campo: number;
  id_rol: number;
  fecha_ingreso: string;
  fecha_salida: string | null;
  usuario: {
    id: number;
    nombre: string;
    correo: string;
  };
  rol: {
    id: number;
    nombre: string;
  };
}

interface Semillero {
  id: number;
  nombre: string;
  lider: number;
  ruta_imagen: string;
  descripcion: string;
  contacto: string;
  creado_en: string;
  lineas_investigacion_id: number;
  activo: number;
}

interface LiderUsuario {
  id: number;
  nombre: string;
  correo: string;
}

interface CampoDetail {
  id: number;
  nombre: string;
  descripcion: string;
  ruta_imagen: string | null;
  lider: number;
  id_semillero: number;
  horario_reunion: string | null;
  contacto_email: string | null;
  contacto_redes_sociales: any; // Puede ser string, null, o objeto vacío
  semillero?: Semillero;
  liderUsuario?: LiderUsuario;
  proyectos: Proyecto[];
  integrantes: Integrante[];
  acceso_completo: boolean;
}

interface CampoResponse {
  campo: CampoDetail;
}

export default function CampoDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [campo, setCampo] = useState<CampoDetail | null>(null);

  // Crear proyecto
  const [openCrearProyecto, setOpenCrearProyecto] = useState(false);
  const [crearProyectoSubmitting, setCrearProyectoSubmitting] = useState(false);
  const [nuevoProyecto, setNuevoProyecto] = useState({
    titulo: '',
    descripcion: '',
    id_estado: 1,
    url: '',
    ruta_foto: ''
  });

  // Crear integrante
  const [openCrearIntegrante, setOpenCrearIntegrante] = useState(false);
  const [crearIntegranteSubmitting, setCrearIntegranteSubmitting] = useState(false);
  const [rolesDisponibles, setRolesDisponibles] = useState<Array<{ id: number; nombre: string }>>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [nuevoIntegrante, setNuevoIntegrante] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    id_rol: 4 // Por defecto Colaborador
  });

  // Editar campo
  const [openEditarCampo, setOpenEditarCampo] = useState(false);
  const [editarCampoSubmitting, setEditarCampoSubmitting] = useState(false);
  const [integrantesParaLider, setIntegrantesParaLider] = useState<Integrante[]>([]);
  const [loadingIntegrantesLider, setLoadingIntegrantesLider] = useState(false);
  const [imagenCampo, setImagenCampo] = useState<File | null>(null);
  const [previewImagen, setPreviewImagen] = useState<string | null>(null);
  const [campoEditado, setCampoEditado] = useState({
    nombre: '',
    descripcion: '',
    lider: 0,
    horario_reunion: '',
    contacto_email: '',
    contacto_redes_sociales: '',
    activo: true
  });

  // Eliminar proyecto
  const [proyectoToDelete, setProyectoToDelete] = useState<number | null>(null);
  const [isDeletingProyecto, setIsDeletingProyecto] = useState(false);

  // Eliminar integrante
  const [integranteToDelete, setIntegranteToDelete] = useState<number | null>(null);
  const [isDeletingIntegrante, setIsDeletingIntegrante] = useState(false);

  // Helper para verificar si contacto_redes_sociales tiene contenido
  const hasRedesSociales = (redes: any): boolean => {
    if (!redes) return false;
    if (typeof redes === 'string' && redes.trim()) return true;
    if (typeof redes === 'object' && Object.keys(redes).length > 0) return true;
    return false;
  };

  // Helper para obtener el texto de redes sociales
  const getRedesSocialesText = (redes: any): string => {
    if (typeof redes === 'string') return redes;
    if (typeof redes === 'object') return JSON.stringify(redes);
    return '';
  };

  useEffect(() => {
    if (id) {
      loadCampoDetail();
    }
  }, [id]);

  useEffect(() => {
    // Cargar roles cuando se abre el modal de crear integrante
    if (openCrearIntegrante) {
      loadRolesDisponibles();
    }
  }, [openCrearIntegrante]);

  useEffect(() => {
    // Cargar integrantes cuando se abre el modal de editar campo
    if (openEditarCampo && id) {
      loadIntegrantesParaLider();
      // Pre-cargar los datos del campo
      if (campo) {
        // Formatear redes sociales
        let redesSociales = '';
        if (campo.contacto_redes_sociales) {
          if (typeof campo.contacto_redes_sociales === 'string' && campo.contacto_redes_sociales.trim()) {
            redesSociales = campo.contacto_redes_sociales;
          } else if (typeof campo.contacto_redes_sociales === 'object' && Object.keys(campo.contacto_redes_sociales).length > 0) {
            redesSociales = JSON.stringify(campo.contacto_redes_sociales);
          }
        }
        
        setCampoEditado({
          nombre: campo.nombre,
          descripcion: campo.descripcion,
          lider: campo.lider,
          horario_reunion: campo.horario_reunion || '',
          contacto_email: campo.contacto_email || '',
          contacto_redes_sociales: redesSociales,
          activo: true
        });
        setPreviewImagen(campo.ruta_imagen);
      }
    }
  }, [openEditarCampo, id, campo]);

  const loadCampoDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await camposService.getById(parseInt(id));
      console.log('📋 Detalle del campo:', response);
      
      // Manejar diferentes estructuras de respuesta
      const campoData = (response as CampoResponse).campo || (response as CampoDetail);
      setCampo(campoData);
    } catch (error: any) {
      console.error('❌ Error al cargar campo:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo cargar la información del campo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCrearProyecto = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nuevoProyecto.titulo.trim()) {
      toast({ 
        title: 'Título requerido', 
        description: 'El título del proyecto es obligatorio', 
        variant: 'destructive' 
      });
      return;
    }

    if (!nuevoProyecto.descripcion.trim()) {
      toast({ 
        title: 'Descripción requerida', 
        description: 'La descripción del proyecto es obligatoria', 
        variant: 'destructive' 
      });
      return;
    }

    if (!id) return;

    try {
      setCrearProyectoSubmitting(true);
      
      const proyectoData = {
        titulo: nuevoProyecto.titulo,
        descripcion: nuevoProyecto.descripcion,
        id_campo: parseInt(id),
        id_estado: nuevoProyecto.id_estado,
        url: nuevoProyecto.url || undefined,
        ruta_foto: nuevoProyecto.ruta_foto || undefined
      };

      console.log('📝 Creando proyecto:', proyectoData);
      
      await proyectosService.create(proyectoData);
      
      // Recargar el campo completo para actualizar proyectos
      await loadCampoDetail();
      
      // Cerrar modal y limpiar formulario
      setOpenCrearProyecto(false);
      setNuevoProyecto({
        titulo: '',
        descripcion: '',
        id_estado: 1,
        url: '',
        ruta_foto: ''
      });
      
      toast({ 
        title: 'Proyecto creado', 
        description: 'El proyecto se ha creado correctamente' 
      });
    } catch (error: any) {
      console.error('❌ Error al crear proyecto:', error);
      toast({ 
        title: 'Error al crear proyecto', 
        description: error.response?.data?.message || error.message || 'No se pudo crear el proyecto', 
        variant: 'destructive' 
      });
    } finally {
      setCrearProyectoSubmitting(false);
    }
  };

  const loadRolesDisponibles = async () => {
    try {
      setLoadingRoles(true);
      const response = await usuariosService.getRolesDisponibles();
      // Filtrar para excluir "Admin Semillero" (id: 1) y "Super Admin" (id: 5)
      const rolesFiltrados = response.roles.filter(rol => rol.id !== 1 && rol.id !== 5);
      setRolesDisponibles(rolesFiltrados);
    } catch (error: any) {
      console.error('❌ Error al cargar roles:', error);
      toast({
        title: 'Error al cargar roles',
        description: error.response?.data?.message || 'No se pudieron cargar los roles disponibles',
        variant: 'destructive'
      });
      setRolesDisponibles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleCrearIntegrante = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nuevoIntegrante.nombre.trim()) {
      toast({ 
        title: 'Nombre requerido', 
        description: 'El nombre completo es obligatorio', 
        variant: 'destructive' 
      });
      return;
    }

    if (!nuevoIntegrante.correo.trim()) {
      toast({ 
        title: 'Correo requerido', 
        description: 'El correo electrónico es obligatorio', 
        variant: 'destructive' 
      });
      return;
    }

    if (!nuevoIntegrante.contrasena.trim() || nuevoIntegrante.contrasena.length < 6) {
      toast({ 
        title: 'Contraseña inválida', 
        description: 'La contraseña debe tener al menos 6 caracteres', 
        variant: 'destructive' 
      });
      return;
    }

    if (!id) return;

    try {
      setCrearIntegranteSubmitting(true);
      
      const integranteData = {
        nombre: nuevoIntegrante.nombre.trim(),
        correo: nuevoIntegrante.correo.trim(),
        contrasena: nuevoIntegrante.contrasena,
        id_rol: nuevoIntegrante.id_rol,
        id_campo: parseInt(id)
      };

      console.log('👤 Creando integrante:', integranteData);
      
      await usuariosService.crearConCampo(integranteData);
      
      // Recargar el campo completo para actualizar integrantes
      await loadCampoDetail();
      
      // Cerrar modal y limpiar formulario
      setOpenCrearIntegrante(false);
      setNuevoIntegrante({
        nombre: '',
        correo: '',
        contrasena: '',
        id_rol: 4
      });
      
      toast({ 
        title: 'Integrante creado', 
        description: 'El integrante se ha agregado correctamente al campo' 
      });
    } catch (error: any) {
      console.error('❌ Error al crear integrante:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'No se pudo crear el integrante';
      toast({ 
        title: 'Error al crear integrante', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setCrearIntegranteSubmitting(false);
    }
  };

  const loadIntegrantesParaLider = async () => {
    if (!id) return;
    
    try {
      setLoadingIntegrantesLider(true);
      const response = await camposService.getIntegrantes(parseInt(id));
      console.log('👥 Integrantes para líder:', response);
      console.log('👥 Primer integrante estructura:', response[0]);
      setIntegrantesParaLider(response || []);
    } catch (error: any) {
      console.error('❌ Error al cargar integrantes:', error);
      toast({
        title: 'Error al cargar integrantes',
        description: error.response?.data?.message || 'No se pudieron cargar los integrantes',
        variant: 'destructive'
      });
      setIntegrantesParaLider([]);
    } finally {
      setLoadingIntegrantesLider(false);
    }
  };

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagenCampo(file);
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImagen(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditarCampo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!campoEditado.nombre.trim()) {
      toast({ 
        title: 'Nombre requerido', 
        description: 'El nombre del campo es obligatorio', 
        variant: 'destructive' 
      });
      return;
    }

    if (!campoEditado.descripcion.trim()) {
      toast({ 
        title: 'Descripción requerida', 
        description: 'La descripción del campo es obligatoria', 
        variant: 'destructive' 
      });
      return;
    }

    if (!id) return;

    try {
      setEditarCampoSubmitting(true);
      
      const formData = new FormData();
      formData.append('nombre', campoEditado.nombre.trim());
      formData.append('descripcion', campoEditado.descripcion.trim());
      formData.append('lider', campoEditado.lider.toString());
      
      if (campoEditado.horario_reunion) {
        formData.append('horario_reunion', campoEditado.horario_reunion);
      }
      
      if (campoEditado.contacto_email) {
        formData.append('contacto_email', campoEditado.contacto_email);
      }
      
      if (campoEditado.contacto_redes_sociales) {
        formData.append('contacto_redes_sociales', campoEditado.contacto_redes_sociales);
      }
      
      formData.append('activo', campoEditado.activo ? '1' : '0');
      
      if (imagenCampo) {
        formData.append('imagen', imagenCampo);
      }

      console.log('✏️ Editando campo:', campoEditado);
      
      await camposService.update(parseInt(id), formData);
      
      // Recargar el campo completo
      await loadCampoDetail();
      
      // Cerrar modal y limpiar
      setOpenEditarCampo(false);
      setImagenCampo(null);
      setPreviewImagen(null);
      
      toast({ 
        title: 'Campo actualizado', 
        description: 'El campo se ha actualizado correctamente' 
      });
    } catch (error: any) {
      console.error('❌ Error al editar campo:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'No se pudo actualizar el campo';
      toast({ 
        title: 'Error al editar campo', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setEditarCampoSubmitting(false);
    }
  };

  const handleDeleteProyecto = async () => {
    if (!proyectoToDelete) return;

    try {
      setIsDeletingProyecto(true);
      await proyectosService.delete(proyectoToDelete);
      
      toast({
        title: 'Éxito',
        description: 'Proyecto eliminado correctamente'
      });

      // Recargar el campo completo
      await loadCampoDetail();
      setProyectoToDelete(null);
    } catch (error: any) {
      console.error('❌ Error al eliminar proyecto:', error);
      toast({
        title: 'Error al eliminar proyecto',
        description: error.response?.data?.message || 'No se pudo eliminar el proyecto',
        variant: 'destructive'
      });
    } finally {
      setIsDeletingProyecto(false);
    }
  };

  const handleDeleteIntegrante = async () => {
    if (!integranteToDelete || !id) return;

    try {
      setIsDeletingIntegrante(true);
      await camposService.quitarIntegrante(parseInt(id), integranteToDelete);
      
      toast({
        title: 'Éxito',
        description: 'Integrante eliminado correctamente'
      });

      // Recargar el campo completo
      await loadCampoDetail();
      setIntegranteToDelete(null);
    } catch (error: any) {
      console.error('❌ Error al eliminar integrante:', error);
      toast({
        title: 'Error al eliminar integrante',
        description: error.response?.data?.message || 'No se pudo eliminar el integrante',
        variant: 'destructive'
      });
    } finally {
      setIsDeletingIntegrante(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campo) {
    return (
      <div className="p-6">
        {user?.id_rol !== 2 && (
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/campos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        )}
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <p className="text-lg font-medium">Campo no encontrado</p>
              <p className="text-sm text-muted-foreground mt-2">
                El campo solicitado no existe o no tienes permiso para verlo
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header con botón volver - Solo para roles que no son Líder de Campo */}
      <div className="flex items-center justify-between">
        {user?.id_rol !== 2 && (
          <Button asChild variant="ghost">
            <Link to="/campos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        )}
        {user?.id_rol === 2 && <div />}
        
        {/* Botón Editar Campo - Solo visible para Admin Semillero (1), Líder Campo (2) o Super Admin (5) */}
        {(user?.id_rol === 1 || user?.id_rol === 2 || user?.id_rol === 5) && (
          <Button 
            size="sm" 
            onClick={() => setOpenEditarCampo(true)}
            className="text-white"
            style={{ backgroundColor: '#008042' }}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Campo
          </Button>
        )}
      </div>

      {/* Información Principal */}
      <Card>
        <CardHeader>
          {campo.ruta_imagen && (
            <div className="w-full h-64 mb-4 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={campo.ruta_imagen}
                alt={campo.nombre}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl">{campo.nombre}</CardTitle>
              <CardDescription className="text-base">
                {campo.descripcion}
              </CardDescription>
            </div>
            {!campo.acceso_completo && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                Acceso Limitado
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />

          {/* Información de Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información de Contacto</h3>
            <div className="grid gap-3">
              {campo.horario_reunion && (
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Horario de Reunión</p>
                    <p className="text-sm text-muted-foreground">{campo.horario_reunion}</p>
                  </div>
                </div>
              )}
              
              {campo.contacto_email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email de Contacto</p>
                    <p className="text-sm text-muted-foreground">{campo.contacto_email}</p>
                  </div>
                </div>
              )}
              
              {hasRedesSociales(campo.contacto_redes_sociales) && (
                <div className="flex items-center gap-3">
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Redes Sociales</p>
                    <p className="text-sm text-muted-foreground">{getRedesSocialesText(campo.contacto_redes_sociales)}</p>
                  </div>
                </div>
              )}

              {campo.liderUsuario && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Líder del Campo</p>
                    <p className="text-sm text-muted-foreground">
                      {campo.liderUsuario.nombre} • {campo.liderUsuario.correo}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Estadísticas Rápidas */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FolderKanban className="h-4 w-4" />
                  Proyectos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{campo.proyectos.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Integrantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{campo.integrantes.length}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Proyectos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Proyectos ({campo.proyectos.length})
            </CardTitle>
            {/* Botón crear proyecto - Solo visible para Admin Semillero (1), Líder Campo (2) o Super Admin (5) */}
            {(user?.id_rol === 1 || user?.id_rol === 2 || user?.id_rol === 5) && (
              <Button 
                size="sm" 
                onClick={() => setOpenCrearProyecto(true)}
                className="shrink-0 text-white"
                style={{ backgroundColor: '#008042' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Proyecto
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {campo.proyectos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay proyectos en este campo
            </div>
          ) : (
            <div className="space-y-3">
              {campo.proyectos.map((proyecto) => (
                <Card key={proyecto.id} className="hover:shadow-md hover:border-primary/50 transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{proyecto.titulo}</CardTitle>
                        <CardDescription>{proyecto.descripcion}</CardDescription>
                      </div>
                      {proyecto.porcentaje_avance !== undefined && (
                        <Badge variant="secondary">
                          {proyecto.porcentaje_avance}% Avance
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {proyecto.url && (
                      <a 
                        href={proyecto.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        🔗 {proyecto.url}
                      </a>
                    )}
                    
                    {/* Botones de acción */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link to={`/projects/${proyecto.id}`}>
                          Ver Proyecto
                        </Link>
                      </Button>
                      
                      {/* Botón eliminar - Solo visible para Admin Semillero (1), Líder Campo (2) o SuperAdmin (5) */}
                      {(user?.id_rol === 1 || user?.id_rol === 2 || user?.id_rol === 5) && (
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProyectoToDelete(proyecto.id);
                          }}
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
        </CardContent>
      </Card>

      {/* Integrantes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Integrantes ({campo.integrantes.length})
            </CardTitle>
            {/* Botón crear integrante - Solo visible para Admin Semillero (1), Líder Campo (2) o Super Admin (5) */}
            {(user?.id_rol === 1 || user?.id_rol === 2 || user?.id_rol === 5) && (
              <Button 
                size="sm" 
                onClick={() => setOpenCrearIntegrante(true)}
                className="shrink-0 text-white"
                style={{ backgroundColor: '#008042' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Integrante
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {campo.integrantes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay integrantes registrados
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {campo.integrantes.map((integrante) => (
                <Card key={integrante.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {integrante.usuario.nombre}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {integrante.usuario.correo}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {integrante.rol.nombre}
                      </Badge>
                      
                      {/* Botón eliminar - Solo visible para Admin Semillero (1), Líder Campo (2) o SuperAdmin (5) */}
                      {(user?.id_rol === 1 || user?.id_rol === 2 || user?.id_rol === 5) && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIntegranteToDelete(integrante.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Crear Proyecto */}
      <Dialog open={openCrearProyecto} onOpenChange={setOpenCrearProyecto}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
            <DialogDescription>
              Completa la información del proyecto que deseas crear en este campo de investigación.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCrearProyecto} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proyecto-titulo">
                Título del Proyecto *
              </Label>
              <Input 
                id="proyecto-titulo"
                value={nuevoProyecto.titulo} 
                onChange={(e) => setNuevoProyecto(prev => ({ ...prev, titulo: e.target.value }))} 
                placeholder="Ej: Sistema de Gestión de Semilleros"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proyecto-descripcion">
                Descripción *
              </Label>
              <Textarea 
                id="proyecto-descripcion"
                value={nuevoProyecto.descripcion} 
                onChange={(e) => setNuevoProyecto(prev => ({ ...prev, descripcion: e.target.value }))} 
                placeholder="Describe el objetivo y alcance del proyecto..."
                rows={4}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proyecto-estado">
                Estado del Proyecto *
              </Label>
              <select
                id="proyecto-estado"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={nuevoProyecto.id_estado}
                onChange={(e) => setNuevoProyecto(prev => ({ ...prev, id_estado: Number(e.target.value) }))}
              >
                <option value={1}>En Progreso</option>
                <option value={2}>Finalizado</option>
                <option value={3}>Pausado</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Selecciona el estado inicial del proyecto
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proyecto-url">
                URL del Proyecto (opcional)
              </Label>
              <Input 
                id="proyecto-url"
                type="url"
                value={nuevoProyecto.url} 
                onChange={(e) => setNuevoProyecto(prev => ({ ...prev, url: e.target.value }))} 
                placeholder="https://github.com/usuario/proyecto"
              />
              <p className="text-xs text-muted-foreground">
                Enlace al repositorio, documentación o sitio web del proyecto
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proyecto-foto">
                URL de la Imagen (opcional)
              </Label>
              <Input 
                id="proyecto-foto"
                type="url"
                value={nuevoProyecto.ruta_foto} 
                onChange={(e) => setNuevoProyecto(prev => ({ ...prev, ruta_foto: e.target.value }))} 
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <p className="text-xs text-muted-foreground">
                URL de la imagen representativa del proyecto
              </p>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => {
                  setOpenCrearProyecto(false);
                  setNuevoProyecto({
                    titulo: '',
                    descripcion: '',
                    id_estado: 1,
                    url: '',
                    ruta_foto: ''
                  });
                }}
                disabled={crearProyectoSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={crearProyectoSubmitting}>
                {crearProyectoSubmitting ? 'Creando...' : 'Crear Proyecto'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Crear Integrante */}
      <Dialog open={openCrearIntegrante} onOpenChange={setOpenCrearIntegrante}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Integrante</DialogTitle>
            <DialogDescription>
              Crea un nuevo usuario y agrégalo automáticamente a este campo de investigación.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCrearIntegrante} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="integrante-nombre">
                Nombre Completo *
              </Label>
              <Input 
                id="integrante-nombre"
                value={nuevoIntegrante.nombre} 
                onChange={(e) => setNuevoIntegrante(prev => ({ ...prev, nombre: e.target.value }))} 
                placeholder="Ej: Juan Pérez García"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="integrante-correo">
                Correo Electrónico *
              </Label>
              <Input 
                id="integrante-correo"
                type="email"
                value={nuevoIntegrante.correo} 
                onChange={(e) => setNuevoIntegrante(prev => ({ ...prev, correo: e.target.value }))} 
                placeholder="ejemplo@ucp.edu.co"
                required
              />
              <p className="text-xs text-muted-foreground">
                Este correo será usado para iniciar sesión
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="integrante-contrasena">
                Contraseña *
              </Label>
              <Input 
                id="integrante-contrasena"
                type="password"
                value={nuevoIntegrante.contrasena} 
                onChange={(e) => setNuevoIntegrante(prev => ({ ...prev, contrasena: e.target.value }))} 
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                La contraseña debe tener al menos 6 caracteres
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="integrante-rol">
                Rol en el Campo *
              </Label>
              {loadingRoles ? (
                <div className="flex items-center justify-center py-3 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Cargando roles...</span>
                </div>
              ) : (
                <select
                  id="integrante-rol"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={nuevoIntegrante.id_rol}
                  onChange={(e) => setNuevoIntegrante(prev => ({ ...prev, id_rol: Number(e.target.value) }))}
                  required
                >
                  {rolesDisponibles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-muted-foreground">
                Define los permisos del integrante en este campo
              </p>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => {
                  setOpenCrearIntegrante(false);
                  setNuevoIntegrante({
                    nombre: '',
                    correo: '',
                    contrasena: '',
                    id_rol: 4
                  });
                }}
                disabled={crearIntegranteSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={crearIntegranteSubmitting || loadingRoles}
                style={{ backgroundColor: '#008042' }}
                className="text-white"
              >
                {crearIntegranteSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Integrante'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Campo */}
      <Dialog open={openEditarCampo} onOpenChange={setOpenEditarCampo}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Campo de Investigación</DialogTitle>
            <DialogDescription>
              Actualiza la información del campo de investigación
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditarCampo} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campo-nombre">
                Nombre del Campo *
              </Label>
              <Input 
                id="campo-nombre"
                value={campoEditado.nombre} 
                onChange={(e) => setCampoEditado(prev => ({ ...prev, nombre: e.target.value }))} 
                placeholder="Ej: Inteligencia Artificial"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="campo-descripcion">
                Descripción *
              </Label>
              <Textarea 
                id="campo-descripcion"
                value={campoEditado.descripcion} 
                onChange={(e) => setCampoEditado(prev => ({ ...prev, descripcion: e.target.value }))} 
                placeholder="Describe el campo de investigación..."
                rows={4}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="campo-lider">
                Líder del Campo *
              </Label>
              {loadingIntegrantesLider ? (
                <div className="flex items-center justify-center py-3 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Cargando integrantes...</span>
                </div>
              ) : (
                <select
                  id="campo-lider"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={campoEditado.lider}
                  onChange={(e) => setCampoEditado(prev => ({ ...prev, lider: Number(e.target.value) }))}
                  required
                >
                  <option value="">Selecciona un líder</option>
                  {integrantesParaLider.map((integrante) => {
                    console.log('🔍 Integrante en map:', integrante);
                    // Verificar si tiene la estructura usuario.id o directamente id
                    const usuarioId = integrante.usuario?.id || integrante.id_usuario || integrante.id;
                    const usuarioNombre = integrante.usuario?.nombre || 'Sin nombre';
                    const usuarioCorreo = integrante.usuario?.correo || '';
                    
                    return (
                      <option key={integrante.id} value={usuarioId}>
                        {usuarioNombre} {usuarioCorreo ? `(${usuarioCorreo})` : ''}
                      </option>
                    );
                  })}
                </select>
              )}
              <p className="text-xs text-muted-foreground">
                Selecciona el usuario que liderará este campo
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="campo-imagen">
                Imagen del Campo (opcional)
              </Label>
              <Input 
                id="campo-imagen"
                type="file"
                accept="image/*"
                onChange={handleImagenChange}
              />
              {previewImagen && (
                <div className="mt-2">
                  <img 
                    src={previewImagen} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Sube una imagen representativa del campo (JPG, PNG)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="campo-horario">
                Horario de Reunión (opcional)
              </Label>
              <Input 
                id="campo-horario"
                value={campoEditado.horario_reunion} 
                onChange={(e) => setCampoEditado(prev => ({ ...prev, horario_reunion: e.target.value }))} 
                placeholder="Ej: Lunes y Miércoles 3:00 PM - 5:00 PM"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="campo-email">
                Email de Contacto (opcional)
              </Label>
              <Input 
                id="campo-email"
                type="email"
                value={campoEditado.contacto_email} 
                onChange={(e) => setCampoEditado(prev => ({ ...prev, contacto_email: e.target.value }))} 
                placeholder="contacto@ucp.edu.co"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="campo-redes">
                Redes Sociales (opcional)
              </Label>
              <Textarea 
                id="campo-redes"
                value={campoEditado.contacto_redes_sociales} 
                onChange={(e) => setCampoEditado(prev => ({ ...prev, contacto_redes_sociales: e.target.value }))} 
                placeholder='{"facebook": "url", "instagram": "url"}'
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Puedes ingresar texto o JSON con las redes sociales
              </p>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => {
                  setOpenEditarCampo(false);
                  setImagenCampo(null);
                  setPreviewImagen(null);
                }}
                disabled={editarCampoSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={editarCampoSubmitting || loadingIntegrantesLider}
                style={{ backgroundColor: '#008042' }}
                className="text-white"
              >
                {editarCampoSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Campo'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Confirmar eliminación de proyecto */}
      <AlertDialog open={proyectoToDelete !== null} onOpenChange={() => setProyectoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El proyecto será eliminado permanentemente junto con todas sus actividades y tareas asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingProyecto}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProyecto}
              disabled={isDeletingProyecto}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingProyecto ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog: Confirmar eliminación de integrante */}
      <AlertDialog open={integranteToDelete !== null} onOpenChange={() => setIntegranteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El integrante será removido permanentemente de este campo de investigación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingIntegrante}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIntegrante}
              disabled={isDeletingIntegrante}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingIntegrante ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loading Overlays */}
      <LoadingOverlay 
        isLoading={crearProyectoSubmitting} 
        message="Creando proyecto..." 
      />
      <LoadingOverlay 
        isLoading={crearIntegranteSubmitting} 
        message="Agregando integrante..." 
      />
      <LoadingOverlay 
        isLoading={editarCampoSubmitting} 
        message="Actualizando campo..." 
      />
    </div>
  );
}
