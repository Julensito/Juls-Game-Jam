/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { GameJamInfo } from '../types';
import CountdownTimer from './CountdownTimer';
import { 
  Gamepad2, 
  Calendar, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Trophy, 
  Terminal,
  Share2,
  Clock,
  Award
} from 'lucide-react';

interface InfoTabProps {
  jamInfo: GameJamInfo;
}

export default function InfoTab({ jamInfo }: InfoTabProps) {
  // Animation variants for staggered list
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Intro Hero Section */}
      <motion.div 
        variants={itemVariants}
        className="relative bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 overflow-hidden shadow-2xl backdrop-blur-md"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="relative text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-xs font-mono">
            <Sparkles size={13} className="animate-spin" style={{ animationDuration: '3s' }} />
            <span>Game Jam Activa de Alumnos</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-200 to-cyan-400 tracking-tight leading-none">
            {jamInfo.title}
          </h1>
          
          <p className="text-sm md:text-base text-cyan-300 font-medium italic tracking-wide">
            "{jamInfo.tagline}"
          </p>
          
          <p className="text-sm md:text-base text-slate-300 antialiased leading-relaxed">
            {jamInfo.description}
          </p>

          <div className="pt-4 border-t border-slate-800/60">
            <CountdownTimer targetDate={jamInfo.endDate} />
          </div>
        </div>
      </motion.div>

      {/* Theme Announcement */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/40 border border-purple-500/30 rounded-2xl p-6 md:p-8 shadow-xl relative"
      >
        <div className="absolute top-3 right-3">
          <Terminal className="text-purple-400 animate-pulse" size={20} />
        </div>
        <div className="space-y-3">
          <span className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-widest block">Tema de la Game Jam:</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {jamInfo.theme}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
            Tu videojuego debe incorporar el concepto de <strong className="text-cyan-400">Paranoia</strong>: explora la desconfianza, las percepciones alteradas, la tensión psicológica y la distorsión de la realidad. ¡Sé creativo con la limitación!
          </p>
        </div>
      </motion.div>

      {/* Two Columns: Requirements & Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rules & Deliveries */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Bases y Normas</h3>
              <p className="text-xs text-slate-400 font-mono">Requisitos obligatorios para las entregas</p>
            </div>
          </div>

          <ul className="space-y-4">
            {jamInfo.rules.map((rule, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-300 leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>

          <div className="p-4 bg-slate-800/30 border border-slate-700/40 rounded-xl space-y-2">
            <h4 className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} /> Fechas Clave del Calendario:
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-1">
              <div>
                <span className="text-slate-400 block mb-0.5">Inicio y Revelación:</span>
                <span className="text-white font-medium">Lunes 25 de Mayo (09:00)</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Fecha Límite de Entrega:</span>
                <span className="text-white font-medium">Martes 2 de Junio (17:00)</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Deliverables Box */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 flex flex-col justify-between space-y-6"
        >
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                <Gamepad2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sube Tu Juego</h3>
                <p className="text-xs text-slate-400 font-mono">Requisitos del Portal de Envío</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Para validar tu videojuego, cada equipo debe rellenar el formulario de registro con la siguiente información:
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-lg bg-[#fa5c5c]/10 text-[#fa5c5c] border border-[#fa5c5c]/20 flex items-center justify-center font-bold text-xs font-mono">Itch</div>
                <div className="text-xs">
                  <span className="text-slate-200 font-semibold block">Enlace de Itch.io</span>
                  <span className="text-slate-400">Página pública del juego con opción jugable.</span>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center font-bold text-xs font-mono">YT</div>
                <div className="text-xs">
                  <span className="text-slate-200 font-semibold block">Trailer de YouTube</span>
                  <span className="text-slate-400">Video promocional o de jugabilidad de máx 2 mins.</span>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-xs font-mono">GDD</div>
                <div className="text-xs">
                  <span className="text-slate-200 font-semibold block">Documento de Diseño (GDD)</span>
                  <span className="text-slate-400">PDF, Google Doc o Markdown con los detalles del diseño.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2.5 text-xs text-indigo-300 font-mono italic">
            <Trophy size={14} className="animate-bounce" />
            <span>Jurado de selección compuesto por profesores y votación popular.</span>
          </div>
        </motion.div>
      </div>

      {/* Evaluation Criteria Section (Bento Grid) */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="text-purple-400" size={20} />
          <h3 className="text-xl font-bold text-white">Criterios de Calificación</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {jamInfo.criteria.map((crt, idx) => {
            // Distinct accents for visual flavor
            const colorClasses = [
              { bg: 'from-purple-950/20 to-purple-900/10 border-purple-500/20', text: 'text-purple-400' },
              { bg: 'from-cyan-950/20 to-cyan-900/10 border-cyan-500/20', text: 'text-cyan-400' },
              { bg: 'from-indigo-950/20 to-indigo-900/10 border-indigo-500/20', text: 'text-indigo-400' },
              { bg: 'from-emerald-950/20 to-emerald-900/10 border-emerald-500/20', text: 'text-emerald-400' },
              { bg: 'from-violet-950/20 to-violet-900/10 border-violet-500/20', text: 'text-violet-400' },
            ];
            const cls = colorClasses[idx % colorClasses.length];

            return (
              <div 
                key={crt.key}
                className={`bg-gradient-to-b ${cls.bg} border rounded-xl p-5 hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between`}
              >
                <div>
                  <span className="text-xs font-mono text-slate-400 block mb-1">Criterio 0{idx + 1}</span>
                  <h4 className={`text-base font-bold ${cls.text} mb-2`}>{crt.name}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{crt.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Puntuación</span>
                  <span className="text-slate-200">1 - 10 estrellas</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
