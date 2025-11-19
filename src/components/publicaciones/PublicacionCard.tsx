import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  publicacion: any;
  onEdit?: (p: any) => void;
  onDelete?: (id: number) => void;
}

export function PublicacionCard({ publicacion, onEdit, onDelete }: Props) {
  return (
    <Card className="p-4">
      <div className="flex gap-4">
        <div className="w-28 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
          {publicacion.imagen_1 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={publicacion.imagen_1} alt={publicacion.titulo} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Sin imagen</div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold">{publicacion.titulo}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{publicacion.descripcion}</p>
          <div className="text-xs text-muted-foreground mt-2">{new Date(publicacion.fecha_publicacion).toLocaleDateString()}</div>
        </div>

        <div className="flex flex-col gap-2">
          {onEdit && (
            <Button size="sm" variant="ghost" onClick={() => onEdit(publicacion)}>
              Editar
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="destructive" onClick={() => onDelete(publicacion.id)}>
              Eliminar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default PublicacionCard;
