import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserDialog } from '@/components/users/UserDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { camposService } from '@/services/camposService';
import { proyectosService } from '@/services/proyectosService';
import { usuariosService } from '@/services/usuariosService';
import { Edit, Image as ImageIcon, Plus, Save, Trash2, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function CampoDetailLider() {
  const { id } = useParams();
  const campoId = Number(id);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [campo, setCampo] = useState<any>(null);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [integrantes, setIntegrantes] = useState<any[]>([]);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ nombre: '', descripcion: '', contacto: '' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // agregar integrantes
  const [openAgregarExistente, setOpenAgregarExistente] = useState(false);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<any[]>([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  // map of selected role per usuario in the "Agregar existente" dialog
  const [usuariosRoleMap, setUsuariosRoleMap] = useState<Record<number, number>>({});

  // roles constants (based on DB)
  const ROLE_DELEGADO = 3;
  const ROLE_COLABORADOR = 4;

  // crear usuario
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [hideRoleOnUserDialog, setHideRoleOnUserDialog] = useState(false);
  const [openCreateRoleSelector, setOpenCreateRoleSelector] = useState(false);
  const [selectedRoleForCreate, setSelectedRoleForCreate] = useState<number>(ROLE_COLABORADOR);

  // cambiar líder del campo
  const [openChangeLider, setOpenChangeLider] = useState(false);
  const [lideresDisponibles, setLideresDisponibles] = useState<any[]>([]);
  const [lideresLoading, setLideresLoading] = useState(false);
  const [selectedLeaderId, setSelectedLeaderId] = useState<number | null>(null);
  
  // Confirmación personalizada
  const [openConfirm, setOpenConfirm] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  
  // Diálogo informativo (por ejemplo: editar pendiente)
  const [openInfoDialog, setOpenInfoDialog] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  // Crear proyecto
  const [openCrearProyecto, setOpenCrearProyecto] = useState(false);
  const [crearProyectoSubmitting, setCrearProyectoSubmitting] = useState(false);
  const [nuevoProyecto, setNuevoProyecto] = useState({
    titulo: '',
    descripcion: '',
    id_estado: 1, // Por defecto: 1 - En Progreso
    url: '',
    ruta_foto: ''
  });

  useEffect(() => {
    if (!campoId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campoId]);

  const { user } = useAuth();

  const isSemilleroLeader = (() => {
    if (!user || !campo) return false;
    const s = campo.semillero || campo.semilleros || campo.semillero_info || null;
    const leaderId = s?.liderUsuario?.id || s?.lider || s?.lider_id || null;
    return leaderId && user.id === leaderId;
  })();

  const load = async () => {
    try {
      setLoading(true);
      const detalle = await camposService.getDetalleLider(campoId);
      // Normalizar
      const c = detalle?.campo || detalle || null;
      setCampo(c);
      setForm({ nombre: c?.nombre || '', descripcion: c?.descripcion || '', contacto: c?.contacto || '' });
      setImagePreview(c?.ruta_imagen || '');

      const proyectosResp = await camposService.getProyectos(campoId, true);
      const projs = proyectosResp?.projects || proyectosResp?.proyectos || proyectosResp || [];
      setProyectos(Array.isArray(projs) ? projs : []);

      const integrantesResp = await camposService.getIntegrantes(campoId);
      const ints = integrantesResp?.integrantes || integrantesResp?.members || integrantesResp || [];
      setIntegrantes(Array.isArray(ints) ? ints : []);
    } catch (error: any) {
      toast({ title: 'Error', description: 'No se pudo cargar la información del campo', variant: 'destructive' });
      setCampo(null);
      setProyectos([]);
      setIntegrantes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const data = new FormData();
      data.append('nombre', form.nombre);
      data.append('descripcion', form.descripcion || '');
      data.append('contacto', form.contacto || '');
      if (selectedImage) data.append('imagen', selectedImage);
      await camposService.update(campoId, data as any);
      toast({ title: 'Guardado', description: 'Campo actualizado correctamente' });
      setEditMode(false);
      await load();
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'No se pudo guardar el campo', variant: 'destructive' });
    }
  };

  const openAgregar = async () => {
    setOpenAgregarExistente(true);
    try {
      setUsuariosLoading(true);
      const resp = await camposService.getUsuariosDisponibles(campoId, { semillero: true });
      const rawList = resp?.usuarios || resp?.users || resp?.data || resp || [];
      const list = Array.isArray(rawList) ? rawList : [];
      // dedupe by id-like keys (id, id_usuario, usuario_id)
      const deduped = Array.from(
        new Map(list.map((u: any) => {
          const key = u?.id ?? u?.id_usuario ?? u?.usuario_id ?? JSON.stringify(u);
          return [key, u];
        })).values()
      );
      setUsuariosDisponibles(deduped);
      // initialize role map default -> colaborador
      const map: Record<number, number> = {};
      deduped.forEach((u: any, idx: number) => {
        const idKey = u?.id ?? u?.id_usuario ?? u?.usuario_id ?? idx;
        map[idKey] = ROLE_COLABORADOR;
      });
      setUsuariosRoleMap(map);
    } catch (error) {
      setUsuariosDisponibles([]);
      toast({ title: 'Error', description: 'No se pudo obtener usuarios disponibles', variant: 'destructive' });
    } finally {
      setUsuariosLoading(false);
    }
  };

  const handleAgregarExistente = async (id_usuario: number) => {
    try {
      const id_rol = usuariosRoleMap[id_usuario] || ROLE_COLABORADOR;
  await camposService.agregarIntegrante(campoId, id_usuario);
      toast({ title: 'Agregado', description: 'Usuario añadido al campo' });
      setOpenAgregarExistente(false);
      await load();
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'No se pudo agregar usuario', variant: 'destructive' });
    }
  };

  const promptQuitar = (id_integrante: number) => {
    setConfirmTargetId(id_integrante);
    setOpenConfirm(true);
  };

  const executeQuitar = async () => {
    if (!confirmTargetId) return;
    try {
      setConfirmLoading(true);
      await camposService.quitarIntegrante(campoId, confirmTargetId);
      toast({ title: 'Eliminado', description: 'Integrante eliminado' });
      setOpenConfirm(false);
      setConfirmTargetId(null);
      await load();
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'No se pudo eliminar el integrante', variant: 'destructive' });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCrearUsuarioYAgregar = () => {
    // first pick role (Delegado / Colaborador)
    setOpenCreateRoleSelector(true);
  };

  const onUserDialogSave = async (userData: any) => {
    // Build base payload from dialog data
    const basePayload: any = {
      email: userData.email || userData.correo || '',
      nombre: userData.name || userData.nombre || '',
      apellido: userData.apellido || ''
    };
    if (userData.password) basePayload.password = userData.password;

    // Try creating with selected role first; if backend rejects due to permissions, fallback to collaborator or without id_rol
    const tryCreateWithRole = async (id_rol?: number) => {
      const payload = { ...basePayload } as any;
      if (id_rol) payload.id_rol = id_rol;
      return await usuariosService.create(payload);
    };

    try {
      const roleToTry = selectedRoleForCreate || ROLE_COLABORADOR;
      let created = await tryCreateWithRole(roleToTry);
      // If created but backend didn't accept role assignment, still proceed to add to campo
  await camposService.agregarIntegrante(campoId, created.id).catch(() => {
        // ignore integrante add error here; we'll show message below if needed
      });
      toast({ title: 'Usuario creado', description: 'Usuario creado y agregado al campo' });
      setOpenUserDialog(false);
      setOpenCreateRoleSelector(false);
      await load();
    } catch (error: any) {
      const msg = error?.response?.data?.message || '';
      // If backend complains about permissions for chosen role, try fallback to collaborator
      if (msg.toLowerCase().includes('permiso') || msg.toLowerCase().includes('rol')) {
        try {
          const fallbackRole = ROLE_COLABORADOR;
          const createdFallback = await tryCreateWithRole(fallbackRole);
          await camposService.agregarIntegrante(campoId, createdFallback.id);
          toast({ title: 'Usuario creado', description: 'Usuario creado con rol por defecto y agregado al campo' });
          setOpenUserDialog(false);
          setOpenCreateRoleSelector(false);
          await load();
          return;
        } catch (err2: any) {
          // fallback also failed, show original message
          toast({ title: 'Error', description: err2?.response?.data?.message || msg || 'No se pudo crear usuario', variant: 'destructive' });
          return;
        }
      }

      // Generic error
      toast({ title: 'Error', description: msg || 'No se pudo crear usuario', variant: 'destructive' });
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

    try {
      setCrearProyectoSubmitting(true);
      
      const proyectoData = {
        titulo: nuevoProyecto.titulo,
        descripcion: nuevoProyecto.descripcion,
        id_campo: campoId,
        id_estado: nuevoProyecto.id_estado,
        url: nuevoProyecto.url || undefined,
        ruta_foto: nuevoProyecto.ruta_foto || undefined
      };

      console.log('📝 Creando proyecto:', proyectoData);
      
      const created = await proyectosService.create(proyectoData);
      
      console.log('✅ Proyecto creado exitosamente:', created);
      
      // Recargar proyectos
      await load();
      
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!campo) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No se encontró información del campo.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="relative">
        <Card className="overflow-visible">
          <div className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-40 h-40 rounded-lg overflow-hidden border bg-muted flex items-center justify-center shrink-0">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt={campo.nombre} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-semibold leading-tight">{campo.nombre}</h2>
                <p className="text-sm text-muted-foreground mt-2">{campo.descripcion}</p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">Contacto</div>
                    <div className="font-medium">{campo.contacto || 'No informado'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Administrador</div>
                    <div className="font-medium">{campo.liderUsuario?.nombre || 'No asignado'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="absolute top-4 right-4 flex gap-2">
          {!editMode ? (
            <Button onClick={() => setEditMode(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </>
          )}
        </div>

        {editMode && (
          <div className="mt-4">
            <Card>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre</Label>
                      <Input value={form.nombre} onChange={(e) => setForm(prev => ({ ...prev, nombre: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Contacto</Label>
                      <Input value={form.contacto} onChange={(e) => setForm(prev => ({ ...prev, contacto: e.target.value }))} />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Descripción</Label>
                      <Textarea value={form.descripcion} onChange={(e) => setForm(prev => ({ ...prev, descripcion: e.target.value }))} rows={4} />
                    </div>
                    <div>
                      <Label>Imagen</Label>
                      <Input type="file" accept="image/*" onChange={handleImageChange} />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
            <div className="mt-3 flex gap-2">
              {(isSemilleroLeader || user?.id_rol === 1 || campo.liderUsuario?.id === user?.id) && (
                <Button size="sm" variant="outline" onClick={async () => {
                  setOpenChangeLider(true);
                  try {
                    setLideresLoading(true);
                    const resp = await camposService.getLideresDisponibles(campoId);
                    const rawList = resp?.lideres || resp?.users || resp || [];
                    const list = Array.isArray(rawList) ? rawList : [];
                    const deduped = Array.from(
                      new Map(list.map((l: any) => {
                        const key = l?.id ?? l?.id_usuario ?? l?.usuario_id ?? JSON.stringify(l);
                        return [key, l];
                      })).values()
                    );
                    setLideresDisponibles(deduped);
                    setSelectedLeaderId(campo.liderUsuario?.id || campo.lider || campo.lider_id || null);
                  } catch (err) {
                    setLideresDisponibles([]);
                    toast({ title: 'Error', description: 'No se pudieron cargar líderes disponibles', variant: 'destructive' });
                  } finally {
                    setLideresLoading(false);
                  }
                }}>Cambiar líder</Button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Proyectos en curso</CardTitle>
                <CardDescription>Proyectos asociados al campo</CardDescription>
              </div>
              {/* Botón crear proyecto - Solo visible para Admin Semillero (1) o Líder Campo (2) */}
              {(user?.id_rol === 1 || user?.id_rol === 2) && (
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
            {proyectos.length === 0 ? (
                <div className="text-muted-foreground">No hay proyectos activos</div>
              ) : (
              <div className="space-y-3">
                {proyectos.map((p) => (
                  <div key={p.id} className="border rounded p-3 bg-white">
                    <div className="font-medium">{p.nombre || p.title}</div>
                    <div className="text-sm text-muted-foreground">{p.descripcion || p.summary || ''}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-full">
              <div className="text-left">
                <CardTitle>Integrantes</CardTitle>
                <CardDescription>Gestiona los miembros del campo</CardDescription>
              </div>
                  <div className="flex justify-center gap-2 mt-3">
                    {(isSemilleroLeader || user?.id_rol === 1 || campo.liderUsuario?.id === user?.id) && (
                      <>
                        <Button size="sm" onClick={openAgregar} className="bg-green-600 hover:bg-green-700 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar existente
                        </Button>
                        <Button size="sm" onClick={handleCrearUsuarioYAgregar} className="bg-green-600 hover:bg-green-700 text-white">
                          <Users className="w-4 h-4 mr-2" />
                          Crear usuario y agregar
                        </Button>
                      </>
                    )}
                  </div>
            </div>
          </CardHeader>
          <CardContent className="max-h-[48vh] overflow-auto">
            {integrantes.length === 0 ? (
              <div className="text-muted-foreground">No hay integrantes</div>
            ) : (
              <div className="space-y-3">
                {integrantes.map((i) => (
                  <div key={i.id} className="flex items-center justify-between border rounded p-3 bg-white">
                    <div>
                      <div className="font-medium">{i.nombre || i.name}</div>
                      <div className="text-sm text-muted-foreground">{i.email || i.correo}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setInfoMessage('Editar integrante - pendiente'); setOpenInfoDialog(true); }}>Editar</Button>
                      <Button size="sm" variant="destructive" onClick={() => promptQuitar(i.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Quitar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog: Agregar existente */}
      <Dialog open={openAgregarExistente} onOpenChange={setOpenAgregarExistente}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Agregar usuario existente</DialogTitle>
              <DialogDescription>Selecciona un usuario y asigna su rol antes de agregarlo al campo.</DialogDescription>
            </DialogHeader>
          <div className="space-y-4">
            {usuariosLoading ? (
              <div>Cargando usuarios...</div>
            ) : usuariosDisponibles.length === 0 ? (
              <div>No hay usuarios disponibles</div>
            ) : (
              usuariosDisponibles.map((u, idx) => {
                const idKey = Number(u?.id ?? u?.id_usuario ?? u?.usuario_id ?? idx);
                return (
                  <div key={String(idKey)} className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium">{u.nombre || u.name}</div>
                      <div className="text-sm text-muted-foreground">{u.email || u.correo}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="rounded border px-2 py-1"
                        value={usuariosRoleMap[idKey] || ROLE_COLABORADOR}
                        onChange={(e) => setUsuariosRoleMap(prev => ({ ...prev, [idKey]: Number(e.target.value) }))}
                      >
                        <option value={ROLE_COLABORADOR}>Colaborador</option>
                        <option value={ROLE_DELEGADO}>Delegado</option>
                      </select>
                      <Button size="sm" onClick={() => handleAgregarExistente(idKey)}>Agregar</Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAgregarExistente(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        {/* Dialog: Select role before creating user */}
        <Dialog open={openCreateRoleSelector} onOpenChange={setOpenCreateRoleSelector}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Seleccionar rol para el nuevo integrante</DialogTitle>
              <DialogDescription>Escoge si el nuevo integrante será Colaborador o Delegado.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <div>
                <label className="flex items-center gap-2">
                  <input type="radio" name="roleCreate" value={ROLE_COLABORADOR} checked={selectedRoleForCreate === ROLE_COLABORADOR} onChange={() => setSelectedRoleForCreate(ROLE_COLABORADOR)} />
                  <span className="ml-2">Colaborador</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="radio" name="roleCreate" value={ROLE_DELEGADO} checked={selectedRoleForCreate === ROLE_DELEGADO} onChange={() => setSelectedRoleForCreate(ROLE_DELEGADO)} />
                  <span className="ml-2">Delegado</span>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenCreateRoleSelector(false)}>Cancelar</Button>
              <Button onClick={() => { setOpenCreateRoleSelector(false); setHideRoleOnUserDialog(true); setOpenUserDialog(true); }}>Continuar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: Change leader */}
        <Dialog open={openChangeLider} onOpenChange={setOpenChangeLider}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Cambiar líder del campo</DialogTitle>
              <DialogDescription>Selecciona un nuevo líder para el campo.</DialogDescription>
            </DialogHeader>
            <div className="py-2">
              {lideresLoading ? (
                <div>Cargando líderes...</div>
              ) : lideresDisponibles.length === 0 ? (
                <div>No hay líderes disponibles</div>
              ) : (
                <div className="space-y-2">
                  {lideresDisponibles.map((l) => (
                    <label key={l.id} className="flex items-center gap-2 p-2 border rounded">
                      <input type="radio" name="liderSelect" checked={selectedLeaderId === l.id} onChange={() => setSelectedLeaderId(l.id)} />
                      <div>
                        <div className="font-medium">{l.nombre || l.name}</div>
                        <div className="text-sm text-muted-foreground">{l.email || l.correo}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenChangeLider(false)}>Cancelar</Button>
              <Button onClick={async () => {
                if (!selectedLeaderId) return toast({ title: 'Error', description: 'Seleccione un líder', variant: 'destructive' });
                try {
                  await camposService.cambiarLider(campoId, selectedLeaderId);
                  toast({ title: 'Actualizado', description: 'Líder del campo actualizado' });
                  setOpenChangeLider(false);
                  await load();
                } catch (err: any) {
                  toast({ title: 'Error', description: err?.response?.data?.message || 'No se pudo cambiar el líder', variant: 'destructive' });
                }
              }}>Cambiar líder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: Confirmación quitar integrante */}
        <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Confirmar eliminación</DialogTitle>
              <DialogDescription>Confirma que deseas quitar al integrante del campo.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>¿Estás seguro que deseas eliminar al integrante del campo? Esta acción no se puede deshacer.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setOpenConfirm(false); setConfirmTargetId(null); }}>Cancelar</Button>
              <Button className="ml-2" variant="destructive" onClick={executeQuitar} disabled={confirmLoading}>
                {confirmLoading ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: Info (editar pendiente) */}
        <Dialog open={openInfoDialog} onOpenChange={setOpenInfoDialog}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Información</DialogTitle>
              <DialogDescription>Detalles e información sobre la acción seleccionada.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>{infoMessage}</p>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpenInfoDialog(false)}>Aceptar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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

      {/* Dialog: Crear usuario */}
  <UserDialog open={openUserDialog} onOpenChange={(v) => { setOpenUserDialog(v); if (!v) setHideRoleOnUserDialog(false); }} hideRoleSelector={hideRoleOnUserDialog} onSave={onUserDialogSave} />
    </div>
  );
}
