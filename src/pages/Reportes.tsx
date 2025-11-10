import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { camposService } from "@/services/camposService";
import { proyectosService } from "@/services/proyectosService";
import { reportesService } from "@/services/reportesService";
import { format } from "date-fns";
import {
    CheckSquare,
    Download,
    FileSpreadsheet,
    FileText,
    FolderKanban,
    Loader2,
    TrendingUp,
    Users
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Reportes() {
  const { user } = useAuth();
  const [campos, setCampos] = useState<any[]>([]);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [selectedCampoId, setSelectedCampoId] = useState<number | null>(null);
  const [selectedProyectoId, setSelectedProyectoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCampoId) {
      loadProyectos();
    }
  }, [selectedCampoId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const camposData = await camposService.getAll();
      
      setCampos(camposData);
      if (camposData.length > 0) {
        setSelectedCampoId(camposData[0].id);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProyectos = async () => {
    if (!selectedCampoId) return;
    
    try {
      const data = await proyectosService.getAll();
      // Filtrar por campo si es necesario
      setProyectos(data);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    }
  };

  const generarReporte = async (tipo: string, formato: 'pdf' | 'excel') => {
    try {
      setGeneratingReport(`${tipo}-${formato}`);
      
      let blob: Blob;
      let nombreArchivo: string;
      const fecha = format(new Date(), "yyyy-MM-dd_HHmm");

      if (tipo === 'proyecto' && selectedProyectoId) {
        if (formato === 'pdf') {
          blob = await reportesService.generarReportePDF(selectedProyectoId);
          nombreArchivo = `reporte_proyecto_${selectedProyectoId}_${fecha}.pdf`;
        } else {
          blob = await reportesService.generarReporteExcel(selectedProyectoId);
          nombreArchivo = `reporte_proyecto_${selectedProyectoId}_${fecha}.xlsx`;
        }
      } else if (tipo === 'proyectos' && selectedCampoId) {
        const params = { id_campo: selectedCampoId };
        blob = formato === 'pdf'
          ? await reportesService.exportarPDFGeneral('proyectos', params)
          : await reportesService.exportarExcelGeneral('proyectos', params);
        nombreArchivo = `reporte_proyectos_campo_${selectedCampoId}_${fecha}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
      } else if (tipo === 'actividades' && selectedCampoId) {
        const params = selectedProyectoId 
          ? { id_proyecto: selectedProyectoId }
          : { id_campo: selectedCampoId };
        blob = formato === 'pdf'
          ? await reportesService.exportarPDFGeneral('actividades', params)
          : await reportesService.exportarExcelGeneral('actividades', params);
        nombreArchivo = `reporte_actividades_${fecha}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
      } else if (tipo === 'miembros') {
        const params = selectedCampoId 
          ? { id_campo: selectedCampoId }
          : { id_semillero: user?.id_semillero };
        blob = formato === 'pdf'
          ? await reportesService.exportarPDFGeneral('miembros', params)
          : await reportesService.exportarExcelGeneral('miembros', params);
        nombreArchivo = `reporte_miembros_${fecha}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
      } else {
        toast({
          title: "Error",
          description: "Selecciona los filtros necesarios para generar el reporte",
          variant: "destructive",
        });
        return;
      }

      reportesService.descargarArchivo(blob, nombreArchivo);
      
      toast({
        title: "Reporte generado",
        description: `El archivo ${nombreArchivo} se ha descargado correctamente`,
      });
    } catch (error) {
      console.error('Error al generar reporte:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isGenerating = (tipo: string, formato: string) => {
    return generatingReport === `${tipo}-${formato}`;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Sistema de Reportes</h1>
        <p className="text-muted-foreground">
          Genera reportes detallados en PDF o Excel sobre proyectos, actividades y miembros
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Selecciona el campo y proyecto (opcional) para generar reportes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Campo de Investigación</label>
              <Select
                value={selectedCampoId?.toString() || ""}
                onValueChange={(value) => {
                  setSelectedCampoId(parseInt(value));
                  setSelectedProyectoId(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un campo" />
                </SelectTrigger>
                <SelectContent>
                  {campos.map((campo) => (
                    <SelectItem key={campo.id} value={campo.id.toString()}>
                      {campo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Proyecto (opcional)</label>
              <Select
                value={selectedProyectoId?.toString() || "todos"}
                onValueChange={(value) => setSelectedProyectoId(value === "todos" ? null : parseInt(value))}
                disabled={!selectedCampoId || proyectos.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los proyectos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los proyectos</SelectItem>
                  {proyectos.map((proyecto) => (
                    <SelectItem key={proyecto.id} value={proyecto.id.toString()}>
                      {proyecto.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Reportes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {/* Reporte de Proyectos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-100">
                <FolderKanban className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Reporte de Proyectos</CardTitle>
                <CardDescription>
                  {selectedProyectoId ? 'Proyecto específico' : 'Todos los proyectos del campo'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Incluye información detallada de proyectos, estado, prioridad, fechas y progreso.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => generarReporte(selectedProyectoId ? 'proyecto' : 'proyectos', 'pdf')}
                disabled={!selectedCampoId || !!generatingReport}
                className="flex-1"
              >
                {isGenerating(selectedProyectoId ? 'proyecto' : 'proyectos', 'pdf') ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                PDF
              </Button>
              <Button
                onClick={() => generarReporte(selectedProyectoId ? 'proyecto' : 'proyectos', 'excel')}
                disabled={!selectedCampoId || !!generatingReport}
                variant="outline"
                className="flex-1"
              >
                {isGenerating(selectedProyectoId ? 'proyecto' : 'proyectos', 'excel') ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                )}
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reporte de Actividades */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-100">
                <CheckSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Reporte de Actividades</CardTitle>
                <CardDescription>
                  {selectedProyectoId ? 'Del proyecto seleccionado' : 'Del campo de investigación'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Lista de tareas, estado, prioridad, responsables y fechas de entrega.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => generarReporte('actividades', 'pdf')}
                disabled={!selectedCampoId || !!generatingReport}
                className="flex-1"
              >
                {isGenerating('actividades', 'pdf') ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                PDF
              </Button>
              <Button
                onClick={() => generarReporte('actividades', 'excel')}
                disabled={!selectedCampoId || !!generatingReport}
                variant="outline"
                className="flex-1"
              >
                {isGenerating('actividades', 'excel') ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                )}
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reporte de Miembros */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Reporte de Miembros</CardTitle>
                <CardDescription>
                  Del campo o semillero seleccionado
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Listado de integrantes con roles, proyectos asignados y datos de contacto.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => generarReporte('miembros', 'pdf')}
                disabled={!!generatingReport}
                className="flex-1"
              >
                {isGenerating('miembros', 'pdf') ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                PDF
              </Button>
              <Button
                onClick={() => generarReporte('miembros', 'excel')}
                disabled={!!generatingReport}
                variant="outline"
                className="flex-1"
              >
                {isGenerating('miembros', 'excel') ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                )}
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-blue-900">Información</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-900">
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">PDF</Badge>
                <span>Formato ideal para visualización e impresión</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">Excel</Badge>
                <span>Formato editable para análisis de datos</span>
              </li>
              <li className="flex items-start gap-2">
                <Download className="h-4 w-4 mt-0.5" />
                <span>Los reportes se descargan automáticamente</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
