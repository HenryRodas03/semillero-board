import PublicacionCard from '@/components/publicaciones/PublicacionCard';
import PublicacionDialog from '@/components/publicaciones/PublicacionDialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { camposService } from '@/services/camposService';
import publicacionesService from '@/services/publicacionesService';
import { useEffect, useState } from 'react';

export default function Publicaciones() {
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [campoId, setCampoId] = useState<number | null>(null);
  const [camposList, setCamposList] = useState<any[]>([]);
  const [campoDisabled, setCampoDisabled] = useState(false);
  const [dialogSelectedCampoId, setDialogSelectedCampoId] = useState<number | null>(null);
  const [loadingCampos, setLoadingCampos] = useState(false);
  const [loadingPublicaciones, setLoadingPublicaciones] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Cargar campos y publicaciones al iniciar
    loadInitialData();
  }, [user]);

  // Cargar datos iniciales
  const loadInitialData = async () => {
    if (!user) return;
    
    try {
      // Primero cargar publicaciones (sin filtro)
      await loadPublicaciones();
      
      // Luego cargar campos según el rol
      if (user.id_rol === 2) {
        // Líder de campo: cargar solo su campo
        await loadMiCampo();
      } else {
        // Líder de semillero o SuperAdmin: cargar sus campos
        await loadCamposUsuario();
      }
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    }
  };

  // Cargar publicaciones (con o sin filtro de campo)
  const loadPublicaciones = async (idCampo?: number | null) => {
    try {
      setLoadingPublicaciones(true);
      console.debug('Publicaciones: Cargando publicaciones, campo=', idCampo);
      
      // Usar el servicio con params si hay filtro
      const params = idCampo ? { id_campo: idCampo } : undefined;
      const response = await publicacionesService.getAll(params);
      
      console.debug('Publicaciones: response=', response);
      
      // Extraer array de publicaciones de la respuesta
      let publicacionesArray: any[] = [];
      if (Array.isArray(response)) {
        publicacionesArray = response;
      } else if (response && Array.isArray(response.publicaciones)) {
        publicacionesArray = response.publicaciones;
      } else if (response && response.data && Array.isArray(response.data)) {
        publicacionesArray = response.data;
      }
      
      setPublicaciones(publicacionesArray);
    } catch (error: any) {
      console.error('Error al cargar publicaciones:', error);
      toast({ 
        title: 'Error', 
        description: 'No se pudieron cargar las publicaciones', 
        variant: 'destructive' 
      });
    } finally {
      setLoadingPublicaciones(false);
    }
  };

  // Cargar mi campo (solo para líder de campo - rol 2)
  const loadMiCampo = async () => {
    try {
      const miCampoResp = await camposService.getMiCampo();
      const miCampo = (miCampoResp && (miCampoResp.campo || miCampoResp)) || null;
      
      if (miCampo && miCampo.id) {
        setCamposList([miCampo]);
        setCampoDisabled(true);
        console.debug('Publicaciones: miCampo=', miCampo);
      }
    } catch (error) {
      console.error('Error al cargar mi campo:', error);
    }
  };

  // Cargar campos del usuario (líder de semillero - rol 1 o SuperAdmin - rol 5)
  const loadCamposUsuario = async () => {
    if (loadingCampos) return;
    
    try {
      setLoadingCampos(true);
      console.debug('Publicaciones: Cargando campos del usuario...');
      
      const response = await camposService.getMisCamposUsuario();
      console.debug('Publicaciones: response getMisCamposUsuario=', response);
      
      // Extraer el array de campos según la estructura de respuesta
      let camposArray: any[] = [];
      
      if (Array.isArray(response)) {
        camposArray = response;
      } else if (response && Array.isArray(response.campos)) {
        camposArray = response.campos;
      } else if (response && response.data && Array.isArray(response.data)) {
        camposArray = response.data;
      }
      
      console.debug('Publicaciones: campos extraídos=', camposArray);
      
      if (camposArray.length > 0) {
        setCamposList(camposArray);
        setCampoDisabled(false);
      } else {
        toast({
          title: 'Sin campos',
          description: 'No tienes campos de investigación disponibles',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error al cargar campos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los campos de investigación',
        variant: 'destructive'
      });
    } finally {
      setLoadingCampos(false);
    }
  };

  const loadByCampo = async (id: number) => {
    try {
      const data = await publicacionesService.getByCampo(id);
      setPublicaciones(data);
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: 'No se pudieron cargar las publicaciones', variant: 'destructive' });
    }
  };

  // Manejar filtro por campo (badge click)
  const handleCampoFilter = async (id: number | null) => {
    setCampoId(id);
    setDialogSelectedCampoId(id);
    await loadPublicaciones(id);
  };

  const handleCreate = async () => {
    setEditing(null);
    
    // Si no es líder de campo (rol 2), cargar los campos cuando abre el formulario
    if (user?.id_rol !== 2 && camposList.length === 0) {
      await loadCamposUsuario();
    }
    
    // Si el usuario solo tiene un campo, seleccionarlo por defecto
    setDialogSelectedCampoId(campoDisabled && camposList.length === 1 ? camposList[0].id : null);
    setDialogOpen(true);
  };

  const handleEdit = (p: any) => {
    setEditing(p);
    // asegurar que el select tenga el campo de la publicación
    setDialogSelectedCampoId(p.id_campo ?? null);
    setDialogOpen(true);
  };

  const handleSave = async (formData: FormData, id?: number) => {
    try {
      if (id) {
        await publicacionesService.update(id, formData);
        toast({ title: 'Éxito', description: 'Publicación actualizada' });
      } else {
        await publicacionesService.create(formData);
        toast({ title: 'Éxito', description: 'Publicación creada' });
      }
      // Recargar publicaciones con el filtro actual
      await loadPublicaciones(campoId);
      setDialogOpen(false);
      setEditing(null);
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: error.response?.data?.mensaje || 'Error al guardar', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Publicaciones</h1>
          <p className="text-muted-foreground">Publicaciones del campo</p>
        </div>
        <div>
          <Button onClick={handleCreate}>Nueva Publicación</Button>
        </div>
      </div>

      {/* Lista de campos del semillero (chips) */}
      <div>
        <h2 className="text-lg font-medium">Campos del Semillero</h2>
        {camposList.length === 0 ? (
          <div className="mt-2">
            {user?.id_rol === 2 ? (
              <p className="text-sm text-muted-foreground">No tienes un campo asignado.</p>
            ) : (
              <div className="flex gap-2">
                <p className="text-sm text-muted-foreground">Cargando campos...</p>
                {!loadingCampos && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={loadCamposUsuario}
                  >
                    Reintentar
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mt-2">
            {/* Badge "Todos" para ver todas las publicaciones */}
            <button
              onClick={() => handleCampoFilter(null)}
              className={`px-3 py-1 rounded-full border transition-colors text-sm ${
                campoId === null 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white text-foreground hover:bg-gray-100 border-gray-300'
              }`}
            >
              Todos
            </button>
            
            {/* Badges de campos */}
            {camposList.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCampoFilter(c.id)}
                className={`px-3 py-1 rounded-full border transition-colors text-sm ${
                  campoId === c.id 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-white text-foreground hover:bg-gray-100 border-gray-300'
                }`}
              >
                {c.nombre || c.name || `Campo ${c.id}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid de publicaciones */}
      {loadingPublicaciones ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] mb-2" role="status">
              <span className="sr-only">Cargando...</span>
            </div>
            <p className="text-sm text-muted-foreground">Cargando publicaciones...</p>
          </div>
        </div>
      ) : publicaciones.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {campoId ? 'No hay publicaciones en este campo' : 'No hay publicaciones disponibles'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicaciones.map((p) => (
            <PublicacionCard 
              key={p.id} 
              publicacion={p} 
              onEdit={handleEdit} 
              onDelete={async (id) => {
                try {
                  await publicacionesService.delete(id);
                  toast({ title: 'Eliminada', description: 'Publicación eliminada' });
                  await loadPublicaciones(campoId);
                } catch (error: any) {
                  toast({ title: 'Error', description: error.response?.data?.mensaje || 'Error al eliminar', variant: 'destructive' });
                }
              }} 
            />
          ))}
        </div>
      )}

      <PublicacionDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditing(null); }}
        publication={editing}
        campos={camposList}
        selectedCampoId={dialogSelectedCampoId}
        campoDisabled={campoDisabled}
        onSave={handleSave}
      />
    </div>
  );
}
