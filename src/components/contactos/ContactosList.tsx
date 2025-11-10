import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Contacto } from "@/services/contactosService";
import {
    Edit,
    Eye,
    EyeOff,
    Facebook,
    Globe,
    GripVertical,
    Instagram,
    Linkedin,
    Link as LinkIcon,
    Mail,
    MessageCircle,
    MoreVertical,
    Phone,
    Trash2,
    Twitter,
} from "lucide-react";
import { useState } from "react";

interface ContactosListProps {
  contactos: Contacto[];
  onEdit: (contacto: Contacto) => void;
  onDelete: (id: number) => void;
  onReorder: (contactos: Contacto[]) => void;
}

export function ContactosList({ contactos, onEdit, onDelete, onReorder }: ContactosListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const getIcon = (tipo: string) => {
    const iconClass = "h-5 w-5";
    switch (tipo) {
      case "Email":
        return <Mail className={iconClass} />;
      case "Teléfono":
        return <Phone className={iconClass} />;
      case "WhatsApp":
        return <MessageCircle className={iconClass} />;
      case "LinkedIn":
        return <Linkedin className={iconClass} />;
      case "Facebook":
        return <Facebook className={iconClass} />;
      case "Twitter":
        return <Twitter className={iconClass} />;
      case "Instagram":
        return <Instagram className={iconClass} />;
      case "Sitio Web":
        return <Globe className={iconClass} />;
      default:
        return <LinkIcon className={iconClass} />;
    }
  };

  const getIconColor = (tipo: string) => {
    const colors: Record<string, string> = {
      Email: "text-blue-600 bg-blue-100",
      Teléfono: "text-green-600 bg-green-100",
      WhatsApp: "text-green-600 bg-green-100",
      LinkedIn: "text-blue-700 bg-blue-100",
      Facebook: "text-blue-600 bg-blue-100",
      Twitter: "text-sky-500 bg-sky-100",
      Instagram: "text-pink-600 bg-pink-100",
      "Sitio Web": "text-purple-600 bg-purple-100",
      Otro: "text-gray-600 bg-gray-100",
    };
    return colors[tipo] || "text-gray-600 bg-gray-100";
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newContactos = [...contactos];
    const [draggedItem] = newContactos.splice(draggedIndex, 1);
    newContactos.splice(dropIndex, 0, draggedItem);

    // Actualizar el orden basándose en la nueva posición
    const reorderedContactos = newContactos.map((contacto, index) => ({
      ...contacto,
      orden: index,
    }));

    onReorder(reorderedContactos);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const formatValue = (tipo: string, valor: string) => {
    if (tipo === "WhatsApp" || tipo === "Teléfono") {
      return valor;
    }
    if (tipo === "Email") {
      return valor;
    }
    if (["LinkedIn", "Facebook", "Twitter", "Instagram", "Sitio Web"].includes(tipo)) {
      // Extraer el nombre de usuario de la URL si es posible
      try {
        const url = new URL(valor);
        const path = url.pathname.replace(/^\//, "");
        return path || valor;
      } catch {
        return valor;
      }
    }
    return valor;
  };

  const getClickableLink = (tipo: string, valor: string) => {
    if (tipo === "Email") return `mailto:${valor}`;
    if (tipo === "Teléfono") return `tel:${valor.replace(/\s/g, "")}`;
    if (tipo === "WhatsApp") return `https://wa.me/${valor.replace(/[^\d]/g, "")}`;
    if (valor.startsWith("http")) return valor;
    return null;
  };

  if (contactos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No hay contactos registrados para este campo
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Haz clic en "Agregar Contacto" para comenzar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ordenar contactos por el campo 'orden'
  const sortedContactos = [...contactos].sort((a, b) => a.orden - b.orden);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          {sortedContactos.map((contacto, index) => {
            const link = getClickableLink(contacto.tipo, contacto.valor);
            
            return (
              <div
                key={contacto.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center gap-4 p-4 rounded-lg border bg-card
                  hover:bg-accent/50 transition-colors cursor-move
                  ${draggedIndex === index ? "opacity-50" : ""}
                  ${dragOverIndex === index ? "border-blue-500 border-2" : ""}
                `}
              >
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>

                {/* Icon */}
                <div className={`p-3 rounded-full ${getIconColor(contacto.tipo)}`}>
                  {getIcon(contacto.tipo)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{contacto.tipo}</p>
                    {!contacto.es_publico && (
                      <Badge variant="secondary" className="text-xs">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Privado
                      </Badge>
                    )}
                    {contacto.es_publico && (
                      <Badge variant="outline" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        Público
                      </Badge>
                    )}
                  </div>
                  
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm break-all"
                    >
                      {formatValue(contacto.tipo, contacto.valor)}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground break-all">
                      {formatValue(contacto.tipo, contacto.valor)}
                    </p>
                  )}
                  
                  {contacto.descripcion && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {contacto.descripcion}
                    </p>
                  )}
                </div>

                {/* Order Badge */}
                <Badge variant="outline" className="text-xs">
                  #{contacto.orden}
                </Badge>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(contacto)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(contacto.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Arrastra los contactos para reordenarlos. 
            El orden se aplicará en las vistas públicas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
