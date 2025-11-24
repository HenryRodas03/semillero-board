import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                S4
              </div>
              <span className="text-xl font-bold">Semillero 4.0</span>
            </div>
            
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/public/semilleros" 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Semilleros
              </Link>
              <Link 
                to="/public/campos" 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Campos
              </Link>
              <Link 
                to="/public/contactos" 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Contactos
              </Link>
              <Link 
                to="/public/publicaciones" 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Publicaciones
              </Link>
            </nav>
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Gestión de Semilleros de Investigación
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Plataforma integral para administrar proyectos, tareas y colaboradores en semilleros de investigación universitarios
        </p>
        <p className="text-lg text-muted-foreground mb-8">
          Explora nuestros semilleros, campos de investigación y publicaciones
        </p>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Características Principales</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link to="/public/semilleros">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Semilleros</CardTitle>
                <CardDescription>
                  Gestiona múltiples semilleros y campos de investigación
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link to="/public/campos">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Target className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Proyectos</CardTitle>
                <CardDescription>
                  Organiza y monitorea proyectos de investigación
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link to="/public/contactos">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Colaboración</CardTitle>
                <CardDescription>
                  Trabaja en equipo con investigadores y estudiantes
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>

      {/* Publicaciones Section */}
      <section className="w-full py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FileText className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Publicaciones</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Explora las publicaciones académicas, eventos y logros de nuestros semilleros de investigación
            </p>
            <Button size="lg" asChild>
              <Link to="/public/publicaciones">Ver Publicaciones</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Semillero 4.0. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
