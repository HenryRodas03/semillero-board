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
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadUserCampo();
  }, [user]);

  // Si cambia la selección del diálogo (por ejemplo al editar o crear), recargar publicaciones del campo seleccionado
  useEffect(() => {
    if (dialogSelectedCampoId) {
      setCampoId(dialogSelectedCampoId);
    }
  }, [dialogSelectedCampoId]);

  useEffect(() => {
    if (campoId) loadByCampo(campoId);
  }, [campoId]);

  const loadUserCampo = async () => {
    if (!user) return;
    try {
      console.debug('Publicaciones: user=', user);
      // Intentar obtener los campos del semillero (si es líder de semillero)
      const misCampos = await camposService.getMisCampos();
      console.debug('Publicaciones: misCampos=', misCampos);
      if (Array.isArray(misCampos) && misCampos.length > 0) {
        setCamposList(misCampos);
        setCampoDisabled(false);
        setDialogSelectedCampoId(null);
        // Si solo hay un campo, seleccionarlo y cargar sus publicaciones
        if (misCampos.length === 1) {
          const only = misCampos[0];
          setCampoId(only.id);
          await loadByCampo(only.id);
        }
        // No fijamos campoId; el usuario puede elegir
        return;
      }

      // Si no hay misCampos, intentar obtener mi campo (si es líder de campo)
      const miCampoResp = await camposService.getMiCampo();
      // miCampoResp puede venir como objeto con campo dentro o como el propio campo
      const miCampo = (miCampoResp && (miCampoResp.campo || miCampoResp)) || null;
      if (miCampo && miCampo.id) {
        setCamposList([miCampo]);
        setCampoDisabled(true);
        setCampoId(miCampo.id);
        setDialogSelectedCampoId(miCampo.id);
        console.debug('Publicaciones: miCampo=', miCampo);
        // Cargar publicaciones automáticamente del campo del que es líder
        await loadByCampo(miCampo.id);
        return;
      }

      // Fallback: cargar todos los campos (si tiene permisos/admin)
      const all = await camposService.getAll();
      console.debug('Publicaciones: all campos=', all);
      setCamposList(Array.isArray(all) ? all : []);
      setCampoDisabled(false);
    } catch (error) {
      console.error(error);
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

  const handleCreate = () => {
    setEditing(null);
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
      // Recargar publicaciones del campo actual o del campo seleccionado por defecto
      const reloadId = dialogSelectedCampoId ?? campoId ?? (camposList.length === 1 ? camposList[0].id : null);
      if (reloadId) await loadByCampo(reloadId);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publicaciones.map((p) => (
          <PublicacionCard key={p.id} publicacion={p} onEdit={handleEdit} onDelete={async (id) => {
            try {
              await publicacionesService.delete(id);
              toast({ title: 'Eliminada', description: 'Publicación eliminada' });
              if (campoId) loadByCampo(campoId);
            } catch (error: any) {
              toast({ title: 'Error', description: error.response?.data?.mensaje || 'Error al eliminar', variant: 'destructive' });
            }
          }} />
        ))}
      </div>

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
