"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuthModal } from "@/components/auth-modal"
import { UserMenu } from "@/components/user-menu"
import { ContactForm } from "@/components/contact-form"
import { ChatbotButton } from "@/components/chatbot-button"
import {
  Code2,
  Smartphone,
  Palette,
  Lightbulb,
  Github,
  Linkedin,
  Mail,
  MessageCircle,
  ExternalLink,
  Menu,
  X,
  Star,
  Quote,
  User,
} from "lucide-react"

const ParticleSystem = () => {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number }>>([])

  useEffect(() => {
    const particleArray = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 15,
    }))
    setParticles(particleArray)
  }, [])

  return (
    <div className="particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle animate-particle"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

const LoadingScreen = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-glow">
          <h1 className="font-playfair text-4xl font-bold mb-4">Isaac Muaco Dev</h1>
        </div>
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  )
}

const Navigation = ({ isMenuOpen, setIsMenuOpen }: { isMenuOpen: boolean; setIsMenuOpen: (open: boolean) => void }) => {
  const { user, loading } = useAuth()

  const navItems = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "Sobre" },
    { href: "#services", label: "Serviços" },
    { href: "#portfolio", label: "Portfólio" },
    { href: "#testimonials", label: "Depoimentos" },
    { href: "#contact", label: "Contato" },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b border-border z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-playfair text-2xl font-bold animate-float">Isaac Muaco Dev</div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-foreground hover:text-accent transition-colors duration-300 font-source-sans"
              >
                {item.label}
              </a>
            ))}
            {!loading &&
              (user ? (
                <UserMenu />
              ) : (
                <AuthModal>
                  <Button
                    variant="outline"
                    className="hover:bg-accent hover:text-accent-foreground transition-all duration-300 animate-glow bg-transparent"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Entrar
                  </Button>
                </AuthModal>
              ))}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 md:hidden">
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-2xl font-source-sans text-foreground hover:text-accent transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-8 border-t border-border/20">
              {!loading &&
                (user ? (
                  <div className="text-center space-y-4">
                    <p className="text-lg font-source-sans text-muted-foreground">
                      Olá, {user.displayName?.split(" ")[0] || "Usuário"}
                    </p>
                    <UserMenu />
                  </div>
                ) : (
                  <AuthModal>
                    <Button
                      variant="outline"
                      size="lg"
                      className="hover:bg-accent hover:text-accent-foreground transition-all duration-300 animate-glow bg-transparent"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Entrar
                    </Button>
                  </AuthModal>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const services = [
    {
      icon: <Code2 className="w-8 h-8" />,
      title: "Desenvolvimento Web",
      description: "Sites modernos e responsivos com as melhores tecnologias",
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Apps Mobile",
      description: "Aplicativos nativos e híbridos para iOS e Android",
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "UI/UX Design",
      description: "Interfaces intuitivas e experiências memoráveis",
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Consultoria em TI",
      description: "Soluções estratégicas para transformação digital",
    },
  ]

  const projects = [
    {
      title: "E-commerce Platform",
      description: "Plataforma completa de vendas online",
      image: "/modern-ecommerce-website.png",
      tags: ["React", "Node.js", "MongoDB"],
      github: "#",
      demo: "#",
    },
    {
      title: "Mobile Banking App",
      description: "Aplicativo bancário com segurança avançada",
      image: "/mobile-banking-app.png",
      tags: ["React Native", "Firebase", "Stripe"],
      github: "#",
      demo: "#",
    },
    {
      title: "AI Dashboard",
      description: "Dashboard inteligente com análise de dados",
      image: "/ai-analytics-dashboard.png",
      tags: ["Next.js", "Python", "TensorFlow"],
      github: "#",
      demo: "#",
    },
  ]

  const testimonials = [
    {
      name: "Maria Silva",
      role: "CEO, TechStart",
      content: "Isaac transformou nossa visão em uma plataforma incrível. Profissionalismo e qualidade excepcionais!",
      rating: 5,
    },
    {
      name: "João Santos",
      role: "Diretor, InnovaCorp",
      content: "Trabalho impecável e entrega no prazo. Recomendo Isaac para qualquer projeto de desenvolvimento.",
      rating: 5,
    },
    {
      name: "Ana Costa",
      role: "Fundadora, StartupXYZ",
      content: "A expertise técnica do Isaac e sua capacidade de entender nossas necessidades foram fundamentais.",
      rating: 5,
    },
  ]

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      <ParticleSystem />
      <Navigation isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <ChatbotButton />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-float">
              <h1 className="font-playfair text-6xl md:text-8xl font-bold mb-6 text-balance">Isaac Muaco Dev</h1>
              <p className="font-source-sans text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
                Desenvolvedor apaixonado por tecnologia e inovação
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="animate-glow font-source-sans text-lg px-8 py-4 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Contrate-me Agora
                  <ExternalLink className="ml-2 w-5 h-5" />
                </Button>
                <AuthModal>
                  <Button
                    variant="outline"
                    size="lg"
                    className="font-source-sans text-lg px-8 py-4 hover:bg-accent hover:text-accent-foreground transition-all duration-300 bg-transparent"
                  >
                    <User className="mr-2 w-5 h-5" />
                    Acesso Exclusivo
                  </Button>
                </AuthModal>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-playfair text-4xl font-bold mb-6">Sobre Isaac Muaco</h2>
                <p className="font-source-sans text-lg text-muted-foreground mb-6 leading-relaxed">
                  Olá! Eu sou Isaac Muaco, um desenvolvedor apaixonado por tecnologia e inovação. Com experiência em
                  desenvolvimento web, apps mobile e soluções criativas em TI, transformo ideias em projetos reais,
                  funcionais e esteticamente impressionantes.
                </p>
                <p className="font-source-sans text-lg text-muted-foreground mb-8 leading-relaxed">
                  Minha missão é entregar serviços digitais de alta qualidade, combinando performance, design moderno e
                  experiência do usuário. Sempre buscando aprender, explorar novas tecnologias e superar desafios, estou
                  pronto para criar soluções que façam a diferença.
                </p>

                {/* Social Links */}
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="hover:bg-accent hover:text-accent-foreground transition-colors bg-transparent"
                  >
                    <a href="https://www.facebook.com/isaac.muaco582" target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="hover:bg-accent hover:text-accent-foreground transition-colors bg-transparent"
                  >
                    <Github className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="hover:bg-accent hover:text-accent-foreground transition-colors bg-transparent"
                  >
                    <a href="mailto:isaacmuaco582@gmail.com">
                      <Mail className="w-5 h-5" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="hover:bg-accent hover:text-accent-foreground transition-colors bg-transparent"
                  >
                    <a href="https://wa.me/244947541761" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-80 h-80 rounded-full overflow-hidden animate-float border-4 border-accent">
                    <img
                      src="/professional-developer-portrait-isaac-muaco.png"
                      alt="Isaac Muaco"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-4xl font-bold mb-4">Serviços</h2>
              <p className="font-source-sans text-lg text-muted-foreground max-w-2xl mx-auto">
                Soluções completas para transformar suas ideias em realidade digital
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-border/50"
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-accent group-hover:animate-glow mb-4 flex justify-center">{service.icon}</div>
                    <h3 className="font-playfair text-xl font-bold mb-3">{service.title}</h3>
                    <p className="font-source-sans text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Section */}
        <section id="portfolio" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-4xl font-bold mb-4">Portfólio</h2>
              <p className="font-source-sans text-lg text-muted-foreground max-w-2xl mx-auto">
                Alguns dos projetos que desenvolvi com paixão e dedicação
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <Card key={index} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative overflow-hidden">
                    <img
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                      <Button size="sm" variant="secondary">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Demo
                      </Button>
                      <Button size="sm" variant="outline">
                        <Github className="w-4 h-4 mr-2" />
                        Código
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-playfair text-xl font-bold mb-2">{project.title}</h3>
                    <p className="font-source-sans text-muted-foreground mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-4xl font-bold mb-4">Depoimentos</h2>
              <p className="font-source-sans text-lg text-muted-foreground max-w-2xl mx-auto">
                O que meus clientes dizem sobre meu trabalho
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Quote className="w-8 h-8 text-accent mr-3" />
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                    <p className="font-source-sans text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                    <div>
                      <p className="font-playfair font-bold">{testimonial.name}</p>
                      <p className="font-source-sans text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-4xl font-bold mb-4">Contato</h2>
              <p className="font-source-sans text-lg text-muted-foreground max-w-2xl mx-auto">
                Vamos transformar sua ideia em realidade juntos
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <ContactForm />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-foreground text-background py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="font-playfair text-2xl font-bold mb-4 animate-glow">Isaac Muaco Dev</div>
              <p className="font-source-sans text-background/80 mb-6">
                Transformando ideias em soluções digitais excepcionais
              </p>

              <div className="flex justify-center space-x-6 mb-8">
                <a
                  href="https://www.facebook.com/isaac.muaco582"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/80 hover:text-accent transition-colors"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="#" className="text-background/80 hover:text-accent transition-colors">
                  <Github className="w-6 h-6" />
                </a>
                <a
                  href="mailto:isaacmuaco582@gmail.com"
                  className="text-background/80 hover:text-accent transition-colors"
                >
                  <Mail className="w-6 h-6" />
                </a>
                <a
                  href="https://wa.me/244947541761"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/80 hover:text-accent transition-colors"
                >
                  <MessageCircle className="w-6 h-6" />
                </a>
              </div>

              <div className="border-t border-background/20 pt-6">
                <p className="font-source-sans text-background/60 text-sm">
                  © 2024 Isaac Muaco Dev. Todos os direitos reservados.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
