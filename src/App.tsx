import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/Layout/AppLayout";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CampoDetail from "./pages/CampoDetail";
import CampoDetailLider from "./pages/CampoDetailLider";
import Campos from "./pages/Campos";
import Contactos from "./pages/Contactos";
import Dashboard from "./pages/Dashboard";
import Eventos from "./pages/Eventos";
import LandingPage from "./pages/LandingPage";
import MisCampos from "./pages/MisCampos";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import Publicaciones from "./pages/Publicaciones";
import Reportes from "./pages/Reportes";
import SemilleroDetail from "./pages/SemilleroDetail";
import Semilleros from "./pages/Semilleros";
import Tasks from "./pages/Tasks";
import Users from "./pages/Users";

// Admin Pages
import AdminSemilleros from "./pages/AdminSemilleros";

// Public Pages
import CampoPublicDetail from "./pages/CampoPublicDetail";
import ProyectoPublicDetail from "./pages/ProyectoPublicDetail";
import EventosPublic from "./pages/public/EventosPublic";
import SemilleroPublicDetail from "./pages/public/SemilleroPublicDetail";
import PublicacionPublicDetail from "./pages/PublicacionPublicDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/public/semillero/:id" element={<SemilleroPublicDetail />} />
            <Route path="/public/campo/:id" element={<CampoPublicDetail />} />
            <Route path="/public/proyecto/:id" element={<ProyectoPublicDetail />} />
            <Route path="/public/publicacion/:id" element={<PublicacionPublicDetail />} />
            <Route path="/public/eventos" element={<EventosPublic />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/proyectos" element={<AppLayout><Projects /></AppLayout>} />
            <Route path="/tareas" element={<AppLayout><Tasks /></AppLayout>} />
            <Route path="/usuarios" element={<AppLayout><Users /></AppLayout>} />
            <Route path="/semilleros" element={<AppLayout><Semilleros /></AppLayout>} />
            <Route path="/semilleros/:id" element={<AppLayout><SemilleroDetail /></AppLayout>} />
            <Route path="/campos" element={<AppLayout><Campos /></AppLayout>} />
            <Route path="/campos/:id" element={<AppLayout><CampoDetail /></AppLayout>} />
            <Route path="/mis-campos" element={<AppLayout><MisCampos /></AppLayout>} />
            <Route path="/campo/:id" element={<AppLayout><CampoDetailLider /></AppLayout>} />
            <Route path="/eventos" element={<AppLayout><Eventos /></AppLayout>} />
            <Route path="/contactos" element={<AppLayout><Contactos /></AppLayout>} />
            <Route path="/publicaciones" element={<AppLayout><Publicaciones /></AppLayout>} />
            <Route path="/reportes" element={<AppLayout><Reportes /></AppLayout>} />

            {/* Admin Routes */}
            <Route path="/admin/semilleros" element={<AppLayout><AdminSemilleros /></AppLayout>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
