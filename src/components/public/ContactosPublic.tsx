import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Contacto } from "@/services/contactosService";
import {
    Facebook,
    Globe,
    Instagram,
    Linkedin,
    Link as LinkIcon,
    Mail,
    MessageCircle,
    Phone,
    Twitter,
} from "lucide-react";

interface ContactosPublicProps {
  contactos: Contacto[];
  titulo?: string;
  className?: string;
}

export function ContactosPublic({ contactos, titulo = "Información de Contacto", className = "" }: ContactosPublicProps) {
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
      Email: "text-blue-600 bg-blue-100 hover:bg-blue-200",
      Teléfono: "text-green-600 bg-green-100 hover:bg-green-200",
      WhatsApp: "text-green-600 bg-green-100 hover:bg-green-200",
      LinkedIn: "text-blue-700 bg-blue-100 hover:bg-blue-200",
      Facebook: "text-blue-600 bg-blue-100 hover:bg-blue-200",
      Twitter: "text-sky-500 bg-sky-100 hover:bg-sky-200",
      Instagram: "text-pink-600 bg-pink-100 hover:bg-pink-200",
      "Sitio Web": "text-purple-600 bg-purple-100 hover:bg-purple-200",
      Otro: "text-gray-600 bg-gray-100 hover:bg-gray-200",
    };
    return colors[tipo] || "text-gray-600 bg-gray-100 hover:bg-gray-200";
  };

  const getClickableLink = (tipo: string, valor: string) => {
    if (tipo === "Email") return `mailto:${valor}`;
    if (tipo === "Teléfono") return `tel:${valor.replace(/\s/g, "")}`;
    if (tipo === "WhatsApp") {
      const phone = valor.replace(/[^\d]/g, "");
      return `https://wa.me/${phone}`;
    }
    if (valor.startsWith("http")) return valor;
    
    // Si no es una URL completa pero parece ser un link de red social
    if (["LinkedIn", "Facebook", "Twitter", "Instagram"].includes(tipo) && !valor.startsWith("http")) {
      const baseUrls: Record<string, string> = {
        LinkedIn: "https://linkedin.com/in/",
        Facebook: "https://facebook.com/",
        Twitter: "https://twitter.com/",
        Instagram: "https://instagram.com/",
      };
      return `${baseUrls[tipo]}${valor}`;
    }
    
    return valor;
  };

  const formatLabel = (tipo: string, valor: string) => {
    if (tipo === "Email" || tipo === "Teléfono" || tipo === "WhatsApp") {
      return valor;
    }
    
    // Para redes sociales, intentar extraer el username
    try {
      if (valor.startsWith("http")) {
        const url = new URL(valor);
        const path = url.pathname.replace(/^\//, "").replace(/\/$/, "");
        return path || valor;
      }
    } catch {
      // Si no es una URL válida, retornar tal cual
    }
    
    return valor;
  };

  // Filtrar solo contactos públicos y ordenar
  const contactosPublicos = contactos
    .filter(c => c.es_publico)
    .sort((a, b) => a.orden - b.orden);

  if (contactosPublicos.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contactosPublicos.map((contacto) => {
            const link = getClickableLink(contacto.tipo, contacto.valor);
            const isClickable = link !== contacto.valor;

            return (
              <div key={contacto.id}>
                {isClickable ? (
                  <a
                    href={link}
                    target={contacto.tipo === "Email" || contacto.tipo === "Teléfono" ? undefined : "_blank"}
                    rel={contacto.tipo === "Email" || contacto.tipo === "Teléfono" ? undefined : "noopener noreferrer"}
                  >
                    <Button
                      variant="outline"
                      className={`w-full justify-start gap-3 h-auto py-3 px-4 ${getIconColor(contacto.tipo)} transition-colors`}
                    >
                      <div className="flex-shrink-0">
                        {getIcon(contacto.tipo)}
                      </div>
                      <div className="flex-1 text-left overflow-hidden">
                        <p className="text-sm font-medium">{contacto.tipo}</p>
                        <p className="text-xs truncate opacity-90">
                          {formatLabel(contacto.tipo, contacto.valor)}
                        </p>
                        {contacto.descripcion && (
                          <p className="text-xs opacity-75 mt-1">
                            {contacto.descripcion}
                          </p>
                        )}
                      </div>
                    </Button>
                  </a>
                ) : (
                  <div className={`w-full flex items-start gap-3 rounded-md border p-3 ${getIconColor(contacto.tipo)}`}>
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(contacto.tipo)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium">{contacto.tipo}</p>
                      <p className="text-xs break-all opacity-90">
                        {contacto.valor}
                      </p>
                      {contacto.descripcion && (
                        <p className="text-xs opacity-75 mt-1">
                          {contacto.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
