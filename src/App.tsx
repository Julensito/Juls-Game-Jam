/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameJamInfo, Project } from './types';
import InfoTab from './components/InfoTab';
import SubmitFormTab from './components/SubmitFormTab';
import ProjectListTab from './components/ProjectListTab';
import { 
  Gamepad2, 
  BookOpen, 
  PlusCircle, 
  HelpCircle, 
  Calendar,
  AlertCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  Award,
  Sparkles,
  Info
} from 'lucide-react';

const FALLBACK_JAM_INFO: GameJamInfo = {
  title: "🎮 Juls Game Jam 2026",
  tagline: "¡Crea, supera límites y forja el futuro del videojuego low-poly!",
  description: "Una game jam interna personalizada diseñada exclusivamente para nuestros alumnos. Pon a prueba tus habilidades de diseño, programación, arte y narración en este festival intensivo de desarrollo.",
  startDate: "2026-05-25T09:00:00Z",
  endDate: "2026-06-02T17:00:00Z",
  theme: "👁️ PARANOIA",
  rules: [
    "El juego debe estar desarrollado dentro de las fechas de la jam.",
    "Solo se permite utilizar el motor de videojuegos Unity.",
    "Los assets de terceros (gráficos y sonido) deben estar declarados en los créditos, respetando sus licencias.",
    "El tamaño del equipo es indiferente.",
    "Se debe entregar un enlace de Itch.io público (jugable en navegador o descargable) y el Documento de Diseño de Juego (GDD). El tráiler de YouTube es opcional."
  ],
  criteria: [
    { name: "Jugabilidad (Gameplay)", key: "gameplay", description: "Mecánicas, fluidez, controles, sistema de juego y la experiencia de diversión general." },
    { name: "Diseño de Videojuego", key: "design", description: "Diseño de juego (Game Design), balance de mecánicas, curvas de aprendizaje y estructuración del ritmo." },
    { name: "Gráficos & Arte", key: "graphics", description: "Estética visual, estilo low-poly, animaciones, diseño de niveles y cohesión artística." },
    { name: "Audio & Música", key: "audio", description: "Efectos sonoros, música envolvente, atmósfera acústica e integración de sonido." },
    { name: "Innovación & Originalidad", key: "innovation", description: "Propuesta de valor única, mecánicas sorprendentes y giros creativos." },
    { name: "Ajuste al Tema", key: "theme", description: "Qué tan bien explora y utiliza la premisa obligatoria de 'PARANOIA'." }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'info' | 'projects' | 'submit'>('info');
  const [jamInfo, setJamInfo] = useState<GameJamInfo>(FALLBACK_JAM_INFO);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Real-time footer countdown string
  const [countdownString, setCountdownString] = useState('00D : 00H : 00M');

  // Fetch initial jam info and projects list
  const fetchData = async () => {
    try {
      // Fetch Jam Info
      const infoRes = await fetch('/api/jam-info');
      if (infoRes.ok) {
        const infoData = await infoRes.json();
        setJamInfo(infoData);
      }

      // Fetch Projects
      const projRes = await fetch('/api/projects');
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData);
      }
    } catch (err) {
      console.warn("Could not connect to backend server. Using client side state.", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s to reflect new submissions & live votes
    return () => clearInterval(interval);
  }, []);

  // Update Footer Countdown string
  useEffect(() => {
    const calcTimer = () => {
      const target = new Date(jamInfo.endDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdownString("Fase de votación cerrada");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);

      const dStr = String(days).padStart(2, '0');
      const hStr = String(hours).padStart(2, '0');
      const mStr = String(minutes).padStart(2, '0');

      setCountdownString(`${dStr}D : ${hStr}H : ${mStr}M`);
    };

    calcTimer();
    const tInterval = setInterval(calcTimer, 1000);
    return () => clearInterval(tInterval);
  }, [jamInfo.endDate]);

  const handleNewProjectSubmitted = (newProj: Project) => {
    setProjects(prev => [...prev, newProj]);
    setActiveTab('projects'); // Teleport user to explore games immediately to celebrate!
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#E4E4E7] flex flex-col font-sans selection:bg-indigo-550/25 selection:text-white">
      
      {/* 1. Header Navigation */}
      <nav className="flex items-center justify-between px-4 py-4 md:px-8 md:py-6 border-b border-white/10 shrink-0 sticky top-0 bg-[#0A0A0C]/90 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/30">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
          </div>
          <div>
            <span className="text-base md:text-xl font-bold tracking-tight text-white block">
              Juls <span className="text-indigo-500 font-normal">GameJam</span>
            </span>
            <span className="text-[9px] font-mono text-zinc-500 tracking-wide uppercase hidden md:inline">Panel del Estudiante 2026</span>
          </div>
        </div>

        {/* Navigation Tab Links (styled like classic modular links) */}
        <div className="flex gap-4 md:gap-8 text-xs md:text-sm font-medium uppercase tracking-widest text-zinc-400">
          <button 
            onClick={() => setActiveTab('info')}
            className={`cursor-pointer transition-all pb-1 border-b-2 hover:text-white ${activeTab === 'info' ? 'text-white border-indigo-500' : 'border-transparent text-zinc-400'}`}
          >
            Bases
          </button>
          
          <button 
            onClick={() => setActiveTab('submit')}
            className={`cursor-pointer transition-all pb-1 border-b-2 hover:text-white ${activeTab === 'submit' ? 'text-white border-indigo-500' : 'border-transparent text-zinc-400'}`}
          >
            Inscribirse
          </button>

          <button 
            onClick={() => setActiveTab('projects')}
            className={`cursor-pointer transition-all pb-1 border-b-2 hover:text-white relative ${activeTab === 'projects' ? 'text-white border-indigo-500' : 'border-transparent text-zinc-400'}`}
          >
            <span>Votar</span>
            {projects.length > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-indigo-600 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {projects.length}
              </span>
            )}
          </button>
        </div>

        {/* Right Action / user initials widget */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-zinc-900 border border-white/5 px-2.5 py-1 rounded-full text-zinc-400 font-mono hidden lg:inline-flex items-center gap-1">
            <Sparkles size={11} className="text-yellow-400 animate-pulse" />
            <span>Fase: Envíos & Votos</span>
          </span>
          <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-500/35 flex items-center justify-center text-indigo-300 font-black text-xs font-mono select-none" title="julen@andaluzia.es">
            JD
          </div>
        </div>
      </nav>

      {/* 2. Main Content Layout (Responsive Split screen or centered stream) */}
      <main className="flex-1 overflow-x-hidden flex flex-col">
        
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-40 space-y-4">
            <div className="w-10 h-10 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-xs text-zinc-500 font-mono">Conectando con el portal de Juls...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row flex-1">
            
            {/* Left/Aside supplementary step helper (Only visible in Info or Submit tab) */}
            {(activeTab === 'info' || activeTab === 'submit') && (
              <aside className="w-full lg:w-1/3 p-6 md:p-10 border-b lg:border-b-0 lg:border-r border-white/5 bg-[#0D0D0F] space-y-8 select-none">
                <div>
                  <h2 className="text-2xl md:text-3xl font-light mb-3 text-white">
                    Sube tu <span className="italic font-serif text-indigo-400 block lg:inline">creación</span>
                  </h2>
                  <p className="text-zinc-450 leading-relaxed text-xs md:text-sm font-sans">
                    Trabaja en equipo, exprime al máximo la temática secreta y comparte tu GDD, trailer y enlace de Itch.io. Una vez publicado, el jurado y compañeros calificarán tu trabajo.
                  </p>
                </div>

                <div className="space-y-6 pt-2">
                  <div className={`flex gap-4 items-center transition-all ${activeTab === 'submit' ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-mono font-bold">01</div>
                    <div>
                      <h3 className="text-xs md:text-sm font-bold text-zinc-100">Inscripción del Equipo</h3>
                      <p className="text-[10px] text-zinc-500">Define integrantes, roles y datos clave.</p>
                    </div>
                  </div>

                  <div className={`flex gap-4 items-center transition-all ${activeTab === 'submit' ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-serif italic font-bold">02</div>
                    <div>
                      <h3 className="text-xs md:text-sm font-bold text-zinc-100">Páginas y Enlaces</h3>
                      <p className="text-[10px] text-zinc-500">Tráiler y archivos ejecutables de Itch.io</p>
                    </div>
                  </div>

                  <div className={`flex gap-4 items-center transition-all ${activeTab === 'submit' ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-mono font-bold">03</div>
                    <div>
                      <h3 className="text-xs md:text-sm font-bold text-zinc-100">Documento GDD</h3>
                      <p className="text-[10px] text-zinc-500">Añade vuestro documento de diseño integral.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl space-y-3">
                    <h4 className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold flex items-center gap-1">
                      <Award size={12} />
                      <span>Criterios de Calificación Clave</span>
                    </h4>
                    <ul className="text-[11px] space-y-2 text-zinc-400 font-sans divide-y divide-white/5">
                      <li className="flex justify-between pt-1.5"><span>Jugabilidad (Gameplay)</span> <span className="text-zinc-300 font-semibold font-mono">10★ Máx</span></li>
                      <li className="flex justify-between pt-1.5"><span>Apartado Visual</span> <span className="text-zinc-300 font-semibold font-mono">10★ Máx</span></li>
                      <li className="flex justify-between pt-1.5"><span>Audio & Música</span> <span className="text-zinc-300 font-semibold font-mono">10★ Máx</span></li>
                      <li className="flex justify-between pt-1.5"><span>Innovación</span> <span className="text-zinc-300 font-semibold font-mono">10★ Máx</span></li>
                      <li className="flex justify-between pt-1.5"><span>Ajuste al Tema</span> <span className="text-zinc-300 font-semibold font-mono">10★ Máx</span></li>
                    </ul>
                  </div>
                </div>
              </aside>
            )}

            {/* Right main viewing stream panel */}
            <section className="flex-1 p-4 md:p-8 lg:p-10 bg-[#0A0A0C] overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeTab === 'info' && (
                    <InfoTab jamInfo={jamInfo} />
                  )}

                  {activeTab === 'submit' && (
                    <SubmitFormTab onSuccess={handleNewProjectSubmitted} />
                  )}

                  {activeTab === 'projects' && (
                    <ProjectListTab 
                      projects={projects}
                      criterias={jamInfo.criteria}
                      onVoteSuccess={fetchData}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </section>

          </div>
        )}
      </main>

      {/* 3. Footer Status Bar */}
      <footer className="bg-[#0D0D0F] border-t border-white/10 px-4 py-3 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-[10px] font-mono select-none">
        
        {/* Left side: System status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
            <span className="uppercase tracking-wider text-zinc-500">Base de Datos Online</span>
          </div>
          <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
          <div className="text-zinc-500 uppercase tracking-wider">
            Total Inscritos: <span className="text-zinc-200 font-bold">{projects.length} {projects.length === 1 ? 'juego' : 'juegos'}</span>
          </div>
        </div>

        {/* Right side: Phase countdown */}
        <div className="text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
          <Clock size={12} className="text-indigo-400" />
          <span>Fase finaliza en:</span>
          <span className="text-indigo-400 font-bold tracking-widest">{countdownString}</span>
        </div>
      </footer>

    </div>
  );
}
