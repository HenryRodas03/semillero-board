import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { proyectosService } from "@/services/proyectosService";
import { actividadesService } from "@/services/actividadesService";
import { camposService } from "@/services/camposService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { ArrowLeft, Loader2, User, Calendar, AlertCircle, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Integrante {
  id: number;
  nombre: string;
  correo?: string;
  usuario?: {
    id: number;
    nombre: string;
    correo: string;
  };
}

interface Actividad {
  id: number;
  titulo: string;
  descripcion: string;
  id_estado: number;
  estado: string;
  prioridad: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_fin?: string | null; // Fecha de finalización de la actividad
  integrante?: Integrante;
  responsable_id?: number; // ID del usuario responsable
}

interface ActividadesResponse {
  success: boolean;
  proyecto: {
    id: number;
    titulo: string;
  };
  actividades: Actividad[];
  total: number;
  estadisticas: {
    completadas: number;
    en_progreso: number;
    pendientes: number;
  };
}

export default function ProyectoActividades() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [data, setData] = useState<ActividadesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [projectCampoId, setProjectCampoId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
  const [loadingIntegrantes, setLoadingIntegrantes] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actividadToEdit, setActividadToEdit] = useState<Actividad | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'Media',
    id_estado: 1,
    id_integrante: undefined as number | undefined,
    fecha_creacion: '',
    fecha_fin: ''
  });

  useEffect(() => {
    console.log('🔄 useEffect disparado, id:', id);
    loadProjectData();
  }, [id]);

  useEffect(() => {
    // Cargar integrantes cuando se abre cualquier diálogo y tenemos el campo ID
    if ((isDialogOpen || isEditDialogOpen) && projectCampoId) {
      loadIntegrantes();
    }
  }, [isDialogOpen, isEditDialogOpen, projectCampoId]);

  useEffect(() => {
    // Cuando se cargan los integrantes y tenemos una actividad para editar,
    // buscar el integrante correcto y actualizar el formulario
    if (actividadToEdit && integrantes.length > 0 && !loadingIntegrantes) {
      console.log('🔄 Buscando integrante para edición...');
      console.log('👤 responsable_id de la actividad:', actividadToEdit.responsable_id);
      console.log('📋 Integrantes disponibles:', integrantes);
      
      if (actividadToEdit.responsable_id) {
        // Buscar el integrante cuyo usuario.id coincida con responsable_id
        const integranteEncontrado = integrantes.find(
          i => i.usuario?.id === actividadToEdit.responsable_id
        );
        
        console.log('🔍 Integrante encontrado:', integranteEncontrado);
        
        if (integranteEncontrado) {
          setFormData(prev => ({
            ...prev,
            id_integrante: integranteEncontrado.id
          }));
          console.log('✅ ID de integrante establecido:', integranteEncontrado.id);
        } else {
          console.log('⚠️ No se encontró integrante con usuario.id =', actividadToEdit.responsable_id);
        }
      }
    }
  }, [integrantes, actividadToEdit, loadingIntegrantes]);

  const loadProjectData = async () => {
    if (!id) {
      console.log('⚠️ No hay ID de proyecto');
      return;
    }
    
    try {
      setLoading(true);
      
      // Cargar datos del proyecto para obtener el título
      console.log('📋 Cargando datos del proyecto:', id);
      const projectData = await proyectosService.getById(parseInt(id));
      console.log('✅ Datos del proyecto:', projectData);
      const titulo = projectData?.titulo || (projectData as any)?.project?.titulo || 'Proyecto';
      const campoId = projectData?.id_campo || (projectData as any)?.project?.id_campo;
      setProjectTitle(titulo);
      setProjectCampoId(campoId);
      
      // Cargar actividades
      console.log('📋 Cargando actividades del proyecto:', id);
      const response = await proyectosService.getActividades(parseInt(id));
      console.log('✅ Respuesta completa del backend:', response);
      
      // Verificar si la respuesta es un array directo o un objeto con estructura
      let dataToSet;
      
      if (Array.isArray(response)) {
        // Si el backend devuelve un array directo, construimos la estructura esperada
        console.log('🔄 Backend devolvió array directo, transformando...');
        const actividades = response;
        dataToSet = {
          proyecto: {
            id: parseInt(id),
            titulo: titulo
          },
          actividades: actividades,
          total: actividades.length,
          estadisticas: {
            pendientes: actividades.filter((a: any) => a.id_estado === 1).length,
            en_progreso: actividades.filter((a: any) => a.id_estado === 2).length,
            completadas: actividades.filter((a: any) => a.id_estado === 3).length,
          }
        };
      } else if (response?.actividades) {
        // Si tiene la estructura correcta, la usamos tal cual
        console.log('✅ Backend devolvió estructura correcta');
        dataToSet = response;
      } else {
        console.error('❌ Formato de respuesta desconocido:', response);
        setError('Formato de datos incorrecto del servidor');
        return;
      }
      
      console.log('📊 Datos parseados:', {
        proyecto: dataToSet?.proyecto,
        total: dataToSet?.total,
        actividades: dataToSet?.actividades?.length,
        estadisticas: dataToSet?.estadisticas
      });
      
      setData(dataToSet);
      console.log('✅ Estado actualizado con data:', dataToSet);
    } catch (error: any) {
      console.error('❌ Error al cargar actividades:', error);
      console.error('❌ Detalles del error:', error.response?.data || error.message);
      setError('No se pudieron cargar las actividades del proyecto');
    } finally {
      setLoading(false);
      console.log('🏁 Loading finalizado');
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    if (!prioridad) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (prioridad.toLowerCase()) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoBadgeColor = (idEstado: number) => {
    // Debug: Ver qué valores llegan
    console.log('🎨 Badge Color - id_estado:', idEstado);
    
    // Usar colores directos
    switch (idEstado) {
      case 3: return { bg: '#16a34a', hover: '#15803d' }; // Verde - Finalizada
      case 2: return { bg: '#2563eb', hover: '#1d4ed8' }; // Azul - En progreso
      case 1: return { bg: '#4b5563', hover: '#374151' }; // Gris - Pendiente
      default: return { bg: '#6b7280', hover: '#4b5563' }; // Gris default
    }
  };

  const getEstadoBadgeStyle = (idEstado: number) => {
    const colors = getEstadoBadgeColor(idEstado);
    return {
      backgroundColor: colors.bg,
      color: 'white',
      borderColor: 'transparent'
    };
  };

  const getEstadoNombre = (idEstado: number): string => {
    switch (idEstado) {
      case 1: return 'Pendiente';
      case 2: return 'En Progreso';
      case 3: return 'Finalizada';
      default: return 'Desconocido';
    }
  };

  // Función para manejar el drag and drop
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Si no hay destino, no hacer nada
    if (!destination) {
      setIsDragging(false);
      return;
    }

    // Si se suelta en el mismo lugar, no hacer nada
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      setIsDragging(false);
      return;
    }

    // Mapear droppableId a id_estado
    const estadoMap: { [key: string]: number } = {
      'pendientes': 1,
      'enProgreso': 2,
      'finalizadas': 3,
    };

    const nuevoEstadoId = estadoMap[destination.droppableId];
    const actividadId = parseInt(draggableId);

    console.log('🎯 Drag end:', {
      actividadId,
      desde: source.droppableId,
      hacia: destination.droppableId,
      nuevoEstadoId
    });

    try {
      // Actualizar en el backend
      await actividadesService.cambiarEstado(actividadId, nuevoEstadoId);

      // Actualizar el estado local
      if (data && data.actividades) {
        const actividadesActualizadas = data.actividades.map(act => 
          act.id === actividadId 
            ? { ...act, id_estado: nuevoEstadoId, estado: getEstadoNombre(nuevoEstadoId) }
            : act
        );

        setData({
          ...data,
          actividades: actividadesActualizadas,
          estadisticas: {
            pendientes: actividadesActualizadas.filter(a => a.id_estado === 1).length,
            en_progreso: actividadesActualizadas.filter(a => a.id_estado === 2).length,
            completadas: actividadesActualizadas.filter(a => a.id_estado === 3).length,
          }
        });
      }

      toast({
        title: "✅ Estado actualizado",
        description: `La actividad se movió a ${getEstadoNombre(nuevoEstadoId)}`,
      });

    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo actualizar el estado de la actividad",
        variant: "destructive",
      });
    } finally {
      setIsDragging(false);
    }
  };

  const onDragStart = () => {
    setIsDragging(true);
  };

  // Función para cargar integrantes del campo
  const loadIntegrantes = async () => {
    if (!projectCampoId) {
      console.log('⚠️ No hay ID de campo para cargar integrantes');
      return;
    }

    try {
      setLoadingIntegrantes(true);
      console.log('👥 Cargando integrantes del campo:', projectCampoId);
      const response = await camposService.getIntegrantes(projectCampoId);
      console.log('✅ Integrantes cargados:', response);
      console.log('🔍 IDs disponibles:', response.map((i: any) => i.id));
      setIntegrantes(response || []);
    } catch (error) {
      console.error('❌ Error al cargar integrantes:', error);
      toast({
        title: "Advertencia",
        description: "No se pudieron cargar los integrantes",
        variant: "destructive",
      });
      setIntegrantes([]);
    } finally {
      setLoadingIntegrantes(false);
    }
  };

  // Función para crear una nueva actividad
  const handleCrearActividad = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    if (!formData.titulo.trim()) {
      toast({
        title: "❌ Error",
        description: "El título es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (!formData.descripcion.trim()) {
      toast({
        title: "❌ Error",
        description: "La descripción es obligatoria",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      
      const payload = {
        id_proyecto: parseInt(id),
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        id_estado: formData.id_estado,
        prioridad: formData.prioridad,
        ...(formData.id_integrante && { id_integrante: formData.id_integrante }),
        ...(formData.fecha_creacion && { fecha_creacion: formData.fecha_creacion }),
        ...(formData.fecha_fin && { fecha_fin: formData.fecha_fin }),
      };

      const response = await actividadesService.crearActividad(payload);
      
      // Recargar actividades
      await loadProjectData();
      
      // Cerrar diálogo y resetear formulario
      setIsDialogOpen(false);
      setFormData({
        titulo: '',
        descripcion: '',
        prioridad: 'Media',
        id_estado: 1,
        id_integrante: undefined,
        fecha_creacion: '',
        fecha_fin: ''
      });
      
      toast({
        title: "✅ Actividad creada",
        description: `"${response.actividad?.titulo || formData.titulo}" se creó exitosamente`,
      });

    } catch (error: any) {
      console.error('❌ Error al crear actividad:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "No se pudo crear la actividad";
      toast({
        title: "❌ Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditarActividad = (actividad: Actividad) => {
    console.log('📝 Editando actividad:', actividad);
    console.log('👤 Integrante actual:', actividad.integrante);
    console.log('📅 fecha_creacion:', actividad.fecha_creacion);
    console.log('📅 fecha_fin:', actividad.fecha_fin);
    
    setActividadToEdit(actividad);
    
    // Formatear fechas al formato YYYY-MM-DD para inputs tipo date
    const formatearFecha = (fecha: string | null | undefined): string => {
      if (!fecha) return '';
      try {
        // Convertir "2025-11-17 03:18:56" a "2025-11-17"
        const fechaFormateada = fecha.split(' ')[0];
        console.log(`✅ Fecha formateada: ${fecha} → ${fechaFormateada}`);
        return fechaFormateada;
      } catch (e) {
        console.error('❌ Error formateando fecha:', fecha, e);
        return '';
      }
    };
    
    // Pre-cargar el formulario con los datos básicos
    // El integrante lo buscaremos después de que se carguen
    setFormData({
      titulo: actividad.titulo,
      descripcion: actividad.descripcion,
      prioridad: actividad.prioridad || 'Media',
      id_estado: actividad.id_estado,
      id_integrante: undefined, // Lo estableceremos en el useEffect
      fecha_creacion: formatearFecha(actividad.fecha_creacion),
      fecha_fin: formatearFecha(actividad.fecha_fin) // Usar fecha_fin, no fecha_actualizacion
    });
    
    console.log('📝 FormData inicial:', {
      fecha_creacion: formatearFecha(actividad.fecha_creacion),
      fecha_fin: formatearFecha(actividad.fecha_fin)
    });
    
    setIsEditDialogOpen(true);
  };

  const handleActualizarActividad = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!actividadToEdit) return;
    
    if (!formData.titulo.trim()) {
      toast({
        title: "❌ Error",
        description: "El título es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (!formData.descripcion.trim()) {
      toast({
        title: "❌ Error",
        description: "La descripción es obligatoria",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsEditing(true);
      
      const payload = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        id_estado: formData.id_estado,
        prioridad: formData.prioridad,
        ...(formData.id_integrante && { id_integrante: formData.id_integrante }),
        ...(formData.fecha_creacion && { fecha_creacion: formData.fecha_creacion }),
        ...(formData.fecha_fin && { fecha_fin: formData.fecha_fin }),
      };

      await actividadesService.actualizarActividad(actividadToEdit.id, payload);
      
      // Recargar actividades
      await loadProjectData();
      
      // Cerrar diálogo y resetear
      setIsEditDialogOpen(false);
      setActividadToEdit(null);
      setFormData({
        titulo: '',
        descripcion: '',
        prioridad: 'Media',
        id_estado: 1,
        id_integrante: undefined,
        fecha_creacion: '',
        fecha_fin: ''
      });
      
      toast({
        title: "✅ Actividad actualizada",
        description: `"${formData.titulo}" se actualizó exitosamente`,
      });

    } catch (error: any) {
      console.error('❌ Error al actualizar actividad:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "No se pudo actualizar la actividad";
      toast({
        title: "❌ Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleEliminarActividad = async (actividadId: number, titulo: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la actividad "${titulo}"?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      
      await actividadesService.eliminarActividad(actividadId);
      
      // Recargar actividades
      await loadProjectData();
      
      toast({
        title: "✅ Actividad eliminada",
        description: `"${titulo}" se eliminó exitosamente`,
      });

    } catch (error: any) {
      console.error('❌ Error al eliminar actividad:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "No se pudo eliminar la actividad";
      toast({
        title: "❌ Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Agrupar actividades por estado
  const actividadesPorEstado = {
    pendientes: data?.actividades?.filter(a => a.id_estado === 1) || [],
    enProgreso: data?.actividades?.filter(a => a.id_estado === 2) || [],
    finalizadas: data?.actividades?.filter(a => a.id_estado === 3) || [],
  };

  console.log('🗂️ Actividades agrupadas:', actividadesPorEstado);
  console.log('📊 Data actual:', data);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error || 'No se encontraron actividades'}</p>
            <Link to={`/public/proyecto/${id}`}>
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Proyecto
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/public/proyecto/${id}`}>
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Proyecto
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{data?.proyecto?.titulo || 'Cargando...'}</h1>
          <p className="text-gray-500 mt-1">Tablero de Actividades</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{data?.total || 0}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-500">{data?.estadisticas?.pendientes || 0}</p>
              <p className="text-sm text-gray-500">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{data?.estadisticas?.en_progreso || 0}</p>
              <p className="text-sm text-gray-500">En Progreso</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{data?.estadisticas?.completadas || 0}</p>
              <p className="text-sm text-gray-500">Finalizadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tablero Kanban */}
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna Pendientes */}
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 flex items-center justify-between">
              <span>Pendientes</span>
              <Badge variant="secondary">{actividadesPorEstado.pendientes.length}</Badge>
            </h3>
          </div>
          <Droppable droppableId="pendientes">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                  snapshot.isDraggingOver ? 'bg-gray-100' : ''
                }`}
              >
                {actividadesPorEstado.pendientes.map((actividad, index) => (
                  <Draggable
                    key={actividad.id.toString()}
                    draggableId={actividad.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`hover:shadow-md transition-shadow ${
                          snapshot.isDragging ? 'shadow-xl rotate-2' : ''
                        }`}
                      >
                        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                          <CardTitle className="text-base font-semibold">{actividad.titulo}</CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditarActividad(actividad)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleEliminarActividad(actividad.id, actividad.titulo)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-gray-600">{actividad.descripcion}</p>
                          
                          <div className="flex items-center justify-between">
                            <Badge className={getPrioridadColor(actividad.prioridad)} variant="outline">
                              {actividad.prioridad || 'Sin prioridad'}
                            </Badge>
                            <Badge style={getEstadoBadgeStyle(actividad.id_estado)} className="border-transparent">
                              {actividad.estado || getEstadoNombre(actividad.id_estado)}
                            </Badge>
                          </div>

                          {actividad.integrante && (
                            <div className="flex items-center text-sm text-gray-500 pt-2 border-t">
                              <User className="h-4 w-4 mr-2" />
                              <span>{actividad.integrante.nombre}</span>
                            </div>
                          )}

                          <div className="flex items-center text-xs text-gray-400">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(actividad.fecha_creacion).toLocaleDateString('es-ES')}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {actividadesPorEstado.pendientes.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-8">No hay actividades pendientes</p>
                )}
              </div>
            )}
          </Droppable>
        </div>

        {/* Columna En Progreso */}
        <div className="space-y-4">
          <div className="bg-blue-100 rounded-lg p-4">
            <h3 className="font-semibold text-blue-700 flex items-center justify-between">
              <span>En Progreso</span>
              <Badge variant="secondary" className="bg-blue-500 text-white">{actividadesPorEstado.enProgreso.length}</Badge>
            </h3>
          </div>
          <Droppable droppableId="enProgreso">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                  snapshot.isDraggingOver ? 'bg-blue-50' : ''
                }`}
              >
                {actividadesPorEstado.enProgreso.map((actividad, index) => (
                  <Draggable
                    key={actividad.id.toString()}
                    draggableId={actividad.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`hover:shadow-md transition-shadow border-blue-200 ${
                          snapshot.isDragging ? 'shadow-xl rotate-2' : ''
                        }`}
                      >
                        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                          <CardTitle className="text-base font-semibold">{actividad.titulo}</CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditarActividad(actividad)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleEliminarActividad(actividad.id, actividad.titulo)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-gray-600">{actividad.descripcion}</p>
                          
                          <div className="flex items-center justify-between">
                            <Badge className={getPrioridadColor(actividad.prioridad)} variant="outline">
                              {actividad.prioridad || 'Sin prioridad'}
                            </Badge>
                            <Badge style={getEstadoBadgeStyle(actividad.id_estado)} className="border-transparent">
                              {actividad.estado || getEstadoNombre(actividad.id_estado)}
                            </Badge>
                          </div>

                          {actividad.integrante && (
                            <div className="flex items-center text-sm text-gray-500 pt-2 border-t">
                              <User className="h-4 w-4 mr-2" />
                              <span>{actividad.integrante.nombre}</span>
                            </div>
                          )}

                          <div className="flex items-center text-xs text-gray-400">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(actividad.fecha_actualizacion).toLocaleDateString('es-ES')}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {actividadesPorEstado.enProgreso.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-8">No hay actividades en progreso</p>
                )}
              </div>
            )}
          </Droppable>
        </div>

        {/* Columna Finalizadas */}
        <div className="space-y-4">
          <div className="bg-green-100 rounded-lg p-4">
            <h3 className="font-semibold text-green-700 flex items-center justify-between">
              <span>Finalizadas</span>
              <Badge variant="secondary" className="bg-green-500 text-white">{actividadesPorEstado.finalizadas.length}</Badge>
            </h3>
          </div>
          <Droppable droppableId="finalizadas">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                  snapshot.isDraggingOver ? 'bg-green-50' : ''
                }`}
              >
                {actividadesPorEstado.finalizadas.map((actividad, index) => (
                  <Draggable
                    key={actividad.id.toString()}
                    draggableId={actividad.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`hover:shadow-md transition-shadow border-green-200 ${
                          snapshot.isDragging ? 'shadow-xl rotate-2' : ''
                        }`}
                      >
                        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                          <CardTitle className="text-base font-semibold">{actividad.titulo}</CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditarActividad(actividad)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleEliminarActividad(actividad.id, actividad.titulo)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-gray-600">{actividad.descripcion}</p>
                          
                          <div className="flex items-center justify-between">
                            <Badge className={getPrioridadColor(actividad.prioridad)} variant="outline">
                              {actividad.prioridad || 'Sin prioridad'}
                            </Badge>
                            <Badge style={getEstadoBadgeStyle(actividad.id_estado)} className="border-transparent">
                              {actividad.estado || getEstadoNombre(actividad.id_estado)}
                            </Badge>
                          </div>

                          {actividad.integrante && (
                            <div className="flex items-center text-sm text-gray-500 pt-2 border-t">
                              <User className="h-4 w-4 mr-2" />
                              <span>{actividad.integrante.nombre}</span>
                            </div>
                          )}

                          <div className="flex items-center text-xs text-gray-400">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(actividad.fecha_actualizacion).toLocaleDateString('es-ES')}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {actividadesPorEstado.finalizadas.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-8">No hay actividades finalizadas</p>
                )}
              </div>
            )}
          </Droppable>
        </div>
      </div>
      </DragDropContext>

      {/* Botón flotante para crear actividad */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nueva Actividad</DialogTitle>
            <DialogDescription>
              Completa los campos para crear una nueva actividad en el proyecto
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCrearActividad} className="space-y-4">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="titulo"
                placeholder="Ej: Diseño de la base de datos"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="descripcion"
                placeholder="Describe la actividad en detalle..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={4}
                required
              />
            </div>

            {/* Prioridad y Estado */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select
                  value={formData.prioridad}
                  onValueChange={(value) => setFormData({ ...formData, prioridad: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_estado">Estado Inicial</Label>
                <Select
                  value={formData.id_estado.toString()}
                  onValueChange={(value) => setFormData({ ...formData, id_estado: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Pendiente</SelectItem>
                    <SelectItem value="2">En Progreso</SelectItem>
                    <SelectItem value="3">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Integrante Asignado */}
            <div className="space-y-2">
              <Label htmlFor="id_integrante">Integrante Asignado (opcional)</Label>
              {loadingIntegrantes ? (
                <div className="flex items-center justify-center py-2 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Cargando integrantes...</span>
                </div>
              ) : integrantes.length === 0 ? (
                <div className="py-2 px-3 border rounded-md text-sm text-gray-500">
                  No hay integrantes disponibles en este campo
                </div>
              ) : (
                <Select
                  value={formData.id_integrante?.toString() || "sin-asignar"}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    id_integrante: value === "sin-asignar" ? undefined : parseInt(value)
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un integrante" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                    {integrantes.map((integrante) => (
                      <SelectItem key={integrante.id} value={integrante.id.toString()}>
                        {integrante.nombre} {integrante.correo ? `(${integrante.correo})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_creacion">Fecha de Inicio</Label>
                <Input
                  id="fecha_creacion"
                  type="date"
                  value={formData.fecha_creacion}
                  onChange={(e) => setFormData({ ...formData, fecha_creacion: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_fin">Fecha de Fin</Label>
                <Input
                  id="fecha_fin"
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                className="bg-[#ffd429] hover:bg-[#ffcc00] text-black"
                onClick={() => setIsDialogOpen(false)}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#008042] hover:bg-[#025d31] text-black"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Actividad'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Actividad */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Actividad</DialogTitle>
            <DialogDescription>
              Modifica los campos que desees actualizar de la actividad.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleActualizarActividad} className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="edit-titulo">Título *</Label>
              <Input
                id="edit-titulo"
                placeholder="Ej: Implementar módulo de autenticación"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="edit-descripcion">Descripción *</Label>
              <Textarea
                id="edit-descripcion"
                placeholder="Describe los detalles de la actividad..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={4}
                required
              />
            </div>

            {/* Prioridad y Estado */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-prioridad">Prioridad</Label>
                <Select
                  value={formData.prioridad}
                  onValueChange={(value) => setFormData({ ...formData, prioridad: value })}
                >
                  <SelectTrigger id="edit-prioridad">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baja">Baja</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-estado">Estado</Label>
                <Select
                  value={formData.id_estado.toString()}
                  onValueChange={(value) => setFormData({ ...formData, id_estado: parseInt(value) })}
                >
                  <SelectTrigger id="edit-estado">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Pendiente</SelectItem>
                    <SelectItem value="2">En Progreso</SelectItem>
                    <SelectItem value="3">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Integrante Asignado */}
            <div className="space-y-2">
              <Label htmlFor="edit-id_integrante">Integrante Asignado (opcional)</Label>
              {loadingIntegrantes ? (
                <div className="flex items-center justify-center py-2 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Cargando integrantes...</span>
                </div>
              ) : integrantes.length === 0 ? (
                <div className="py-2 px-3 border rounded-md text-sm text-gray-500">
                  No hay integrantes disponibles en este campo
                </div>
              ) : (
                <Select
                  value={formData.id_integrante?.toString() || "sin-asignar"}
                  onValueChange={(value) => {
                    console.log('🔄 Cambiando integrante a:', value);
                    setFormData({ 
                      ...formData, 
                      id_integrante: value === "sin-asignar" ? undefined : parseInt(value)
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un integrante" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                    {integrantes.map((integrante) => {
                      console.log('🔹 Opción:', integrante.id, integrante.nombre, '- Seleccionado?', integrante.id.toString() === formData.id_integrante?.toString());
                      return (
                        <SelectItem key={integrante.id} value={integrante.id.toString()}>
                          {integrante.nombre} {integrante.correo ? `(${integrante.correo})` : ''}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fecha_creacion">Fecha de Inicio (opcional)</Label>
                <Input
                  id="edit-fecha_creacion"
                  type="date"
                  value={formData.fecha_creacion}
                  onChange={(e) => setFormData({ ...formData, fecha_creacion: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-fecha_fin">Fecha de Fin (opcional)</Label>
                <Input
                  id="edit-fecha_fin"
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  min={formData.fecha_creacion}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                className="bg-[#ffd429] hover:bg-[#ffcc00] text-black"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setActividadToEdit(null);
                }}
                disabled={isEditing}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#008042] hover:bg-[#025d31] text-black"
                disabled={isEditing}
              >
                {isEditing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Actividad'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Loading Overlays */}
      <LoadingOverlay 
        isLoading={isCreating} 
        message="Creando actividad..." 
      />
      <LoadingOverlay 
        isLoading={isEditing} 
        message="Actualizando actividad..." 
      />
    </div>
  );
}
