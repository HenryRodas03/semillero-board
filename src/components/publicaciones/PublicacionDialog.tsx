import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import React, { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  publication?: any | null;
  campos?: any[]; // lista de campos para seleccionar
  selectedCampoId?: number | null;
  campoDisabled?: boolean;
  onSave: (data: FormData, id?: number) => Promise<void> | void;
}

export function PublicacionDialog({ open, onOpenChange, publication, campos = [], selectedCampoId = null, campoDisabled = false, onSave }: Props) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('Evento');
  const [imagen1, setImagen1] = useState<File | null>(null);
  const [imagen2, setImagen2] = useState<File | null>(null);
  const [imagen3, setImagen3] = useState<File | null>(null);
  const [selectedCampo, setSelectedCampo] = useState<number | null>(selectedCampoId || null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (publication) {
      setTitulo(publication.titulo || '');
      setDescripcion(publication.descripcion || '');
      setTipo(publication.tipo || 'Evento');
      setImagen1(null);
      setImagen2(null);
      setImagen3(null);
      setSelectedCampo(publication.id_campo ?? selectedCampoId ?? null);
    } else {
      setTitulo('');
      setDescripcion('');
      setTipo('Evento');
      setImagen1(null);
      setImagen2(null);
      setImagen3(null);
      setSelectedCampo(selectedCampoId ?? null);
    }
  }, [publication, open, selectedCampoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica en cliente para evitar enviar campos vacíos
    const missing: string[] = [];
    if (!selectedCampo) missing.push('id_campo');
    if (!titulo || titulo.trim() === '') missing.push('titulo');
    if (!descripcion || descripcion.trim() === '') missing.push('descripcion');
    if (missing.length > 0) {
      // Mostrar alerta rápida; el padre también mostrará cualquier error del backend
      alert('Faltan campos requeridos: ' + missing.join(', '));
      return;
    }

    try {
      setSaving(true);
      
      const fd = new FormData();
      fd.append('titulo', titulo);
      fd.append('descripcion', descripcion);
      fd.append('tipo', tipo);
      fd.append('id_campo', String(selectedCampo));
      if (imagen1) fd.append('imagen_1', imagen1);
      if (imagen2) fd.append('imagen_2', imagen2);
      if (imagen3) fd.append('imagen_3', imagen3);

      // Loguear contenido del FormData para depuración (iterar entries)
      try {
        const entries: Array<string> = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const pair of (fd as any).entries()) {
          const key = pair[0];
          const value = pair[1];
          if (value instanceof File) entries.push(`${key}=File(${value.name})`);
          else entries.push(`${key}=${String(value)}`);
        }
        console.debug('PublicacionDialog - FormData:', entries.join(', '));
      } catch (err) {
        console.debug('PublicacionDialog - no se pudo leer FormData para debug');
      }

      await onSave(fd, publication?.id);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{publication ? 'Editar Publicación' : 'Nueva Publicación'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4} />
          </div>

          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <Input id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="id_campo">Campo de Investigación</Label>
            <select
              id="id_campo"
              className="w-full rounded-md border px-3 py-2"
              value={selectedCampo ?? ''}
              onChange={(e) => setSelectedCampo(e.target.value ? parseInt(e.target.value) : null)}
              disabled={Boolean(campoDisabled || (publication && publication.id_campo))}
            >
              <option value="">Selecciona un campo</option>
              {campos && campos.map((c: any) => (
                <option key={c.id} value={c.id}>{c.nombre || c.title || c.titulo}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Imagen 1</Label>
              <input type="file" accept="image/*" onChange={(e) => setImagen1(e.target.files?.[0] || null)} />
              {publication?.imagen_1 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={publication.imagen_1} alt="img1" className="w-full h-24 object-cover mt-2" />
              )}
            </div>
            <div>
              <Label>Imagen 2</Label>
              <input type="file" accept="image/*" onChange={(e) => setImagen2(e.target.files?.[0] || null)} />
              {publication?.imagen_2 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={publication.imagen_2} alt="img2" className="w-full h-24 object-cover mt-2" />
              )}
            </div>
            <div>
              <Label>Imagen 3</Label>
              <input type="file" accept="image/*" onChange={(e) => setImagen3(e.target.files?.[0] || null)} />
              {publication?.imagen_3 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={publication.imagen_3} alt="img3" className="w-full h-24 object-cover mt-2" />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={saving}
            >
              {saving ? 'Guardando...' : (publication ? 'Guardar' : 'Crear')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      
      {/* Loading Overlay */}
      <LoadingOverlay 
        isLoading={saving} 
        message={publication ? 'Actualizando publicación...' : 'Creando publicación...'} 
      />
    </Dialog>
  );
}

export default PublicacionDialog;
