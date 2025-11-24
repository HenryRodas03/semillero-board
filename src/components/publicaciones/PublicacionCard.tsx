import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Image as ImageIcon, User } from 'lucide-react';
import { useState } from 'react';

interface Props {
  publicacion: any;
  onEdit?: (p: any) => void;
  onDelete?: (id: number) => void;
}

export function PublicacionCard({ publicacion, onEdit, onDelete }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Recopilar todas las imágenes disponibles
  const imagenes = [
    publicacion.imagen_1,
    publicacion.imagen_2,
    publicacion.imagen_3,
  ].filter(Boolean); // Filtrar valores null/undefined

  const hasMultipleImages = imagenes.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imagenes.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imagenes.length) % imagenes.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Carrusel de imágenes */}
      <div className="relative w-full h-48 bg-gray-100 group">
        {imagenes.length > 0 ? (
          <>
            <img
              src={imagenes[currentImageIndex]}
              alt={`${publicacion.titulo} - imagen ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Controles de navegación (solo si hay múltiples imágenes) */}
            {hasMultipleImages && (
              <>
                {/* Botones anterior/siguiente */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Indicadores de puntos */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {imagenes.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-white w-6'
                          : 'bg-white/60 hover:bg-white/80'
                      }`}
                      aria-label={`Ir a imagen ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Contador de imágenes */}
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  <span>{currentImageIndex + 1}/{imagenes.length}</span>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sin imágenes</p>
            </div>
          </div>
        )}
      </div>

      {/* Contenido de la card */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-1">{publicacion.titulo}</h3>
            <Badge variant="secondary" className="mt-1 text-xs">
              {publicacion.tipo || 'Evento'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {publicacion.descripcion || 'Sin descripción'}
        </p>

        {/* Información adicional */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {publicacion.campo_nombre && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Campo:</span>
              <span className="line-clamp-1">{publicacion.campo_nombre}</span>
            </div>
          )}
          
          {publicacion.autor_nombre && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="line-clamp-1">{publicacion.autor_nombre}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(publicacion.fecha_publicacion).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Botones de acción */}
      {(onEdit || onDelete) && (
        <CardFooter className="pt-3 border-t flex gap-2">
          {onEdit && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onEdit(publicacion)}
              className="flex-1"
            >
              Editar
            </Button>
          )}
          {onDelete && (
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => onDelete(publicacion.id)}
              className="flex-1"
            >
              Eliminar
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

export default PublicacionCard;
