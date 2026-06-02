/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, Vote } from '../types';
import { 
  Search, 
  Gamepad2, 
  Star, 
  Play, 
  ExternalLink, 
  FileText, 
  SlidersHorizontal,
  ThumbsUp, 
  MessageSquare, 
  Calendar, 
  Users, 
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Clock,
  Send,
  X,
  Plus
} from 'lucide-react';

interface ProjectListTabProps {
  projects: Project[];
  criterias: Array<{ name: string; key: string; description: string }>;
  onVoteSuccess: () => void;
}

export default function ProjectListTab({ projects, criterias, onVoteSuccess }: ProjectListTabProps) {
  // Navigation & list filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'votes'>('latest');
  
  // Selected project for Details & Rating modal
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // New review form states
  const [voterName, setVoterName] = useState('');
  const [comment, setComment] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({
    gameplay: 8,
    design: 8,
    graphics: 8,
    audio: 8,
    innovation: 8,
    theme: 8,
  });
  
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [voteErrorMsg, setVoteErrorMsg] = useState('');
  const [voteSuccessMsg, setVoteSuccessMsg] = useState('');

  // Extract all unique genres & platforms for filters
  const genres = ['All', ...Array.from(new Set(projects.map(p => p.genre).filter(Boolean)))];
  const platforms = ['All', ...Array.from(new Set(projects.map(p => p.platform).filter(Boolean)))];

  const activeProject = projects.find(p => p.id === activeProjectId);

  // Helper score calculator
  const getAverageScore = (proj: Project): number => {
    if (!proj.votes || proj.votes.length === 0) return 0;
    let totalAll = 0;
    proj.votes.forEach(v => {
      let sum = 0;
      let count = 0;
      criterias.forEach(c => {
        const value = (v as any)[c.key];
        if (typeof value === 'number') {
          sum += value;
          count++;
        }
      });
      const avgVote = count > 0 ? sum / count : 0;
      totalAll += avgVote;
    });
    return parseFloat((totalAll / proj.votes.length).toFixed(1));
  };

  const getCriterionAverage = (proj: Project, key: string): number => {
    if (!proj.votes || proj.votes.length === 0) return 0;
    const sum = proj.votes.reduce((acc, curr) => {
      const val = (curr as any)[key] || 0;
      return acc + val;
    }, 0);
    return parseFloat((sum / proj.votes.length).toFixed(1));
  };

  // Filter and Sort implementation
  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.gameTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.teamMembers.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGenre = selectedGenre === 'All' || p.genre === selectedGenre;
    const matchesPlatform = selectedPlatform === 'All' || p.platform === selectedPlatform;

    return matchesSearch && matchesGenre && matchesPlatform;
  }).sort((a, b) => {
    if (sortBy === 'rating') {
      return getAverageScore(b) - getAverageScore(a);
    }
    if (sortBy === 'votes') {
      return (b.votes?.length || 0) - (a.votes?.length || 0);
    }
    // "latest" submission
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });

  // Safe YouTube embedding URL extractor
  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    let videoId = null;
    // Standard and short youtube link regexes
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  // Cast rate submission
  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoteErrorMsg('');
    setVoteSuccessMsg('');

    if (!activeProjectId) return;
    if (!voterName.trim()) {
      setVoteErrorMsg('Por favor introduce tu nombre o alias para validar el voto.');
      return;
    }

    setIsSubmittingVote(true);
    try {
      const response = await fetch(`/api/projects/${activeProjectId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voterName: voterName.trim(),
          gameplay: ratings.gameplay,
          design: ratings.design,
          graphics: ratings.graphics,
          audio: ratings.audio,
          innovation: ratings.innovation,
          theme: ratings.theme,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo entregar la valoración.');
      }

      setVoteSuccessMsg('🎉 ¡Tu calificación ha sido registrada con éxito!');
      setComment('');
      // Keep name for convenience in browser memory session if needed
      onVoteSuccess(); // Trigger reload
    } catch (err: any) {
      setVoteErrorMsg(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const handleRatingChange = (key: string, val: number) => {
    setRatings(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-6">
      
      {/* Top filter utility block */}
      <div className="bg-[#0D0D0F] border border-white/10 rounded-xl p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Buscar por juego, equipo, integrante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-white/5 rounded-xl text-xs font-sans text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/80 transition-all"
            />
          </div>

          {/* Sorter */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <SlidersHorizontal size={14} className="text-zinc-500" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Ordenar:</span>
            <div className="flex bg-zinc-950 p-1 rounded-lg border border-white/5 text-[11px] font-medium font-sans">
              <button
                onClick={() => setSortBy('latest')}
                className={`px-3 py-1 rounded-md transition-all ${sortBy === 'latest' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Últimos
              </button>
              <button
                onClick={() => setSortBy('rating')}
                className={`px-3 py-1 rounded-md transition-all ${sortBy === 'rating' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Puntuación
              </button>
              <button
                onClick={() => setSortBy('votes')}
                className={`px-3 py-1 rounded-md transition-all ${sortBy === 'votes' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Opiniones
              </button>
            </div>
          </div>
        </div>

        {/* Categories selector horizontal roll */}
        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-white/5 text-[11px] font-mono leading-none">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Gamepad2 size={12} />
            <span>Género:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {genres.map(g => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-2.5 py-1 rounded-md font-sans transition-all ${selectedGenre === g ? 'bg-zinc-800 text-indigo-400 border border-indigo-500/30' : 'bg-transparent text-zinc-400 hover:text-zinc-200'}`}
              >
                {g === 'All' ? 'Todos los géneros' : g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-zinc-950/20 border border-white/5 rounded-2xl p-8 max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 text-zinc-500 flex items-center justify-center mx-auto text-xl font-serif italic">?</div>
          <div className="space-y-1">
            <h4 className="font-bold text-zinc-300 text-sm">Disculpas, no se encontraron proyectos</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-sans">Intenta ajustar tu búsqueda o sé el primer equipo en enviar vuestro juego redactando la ficha de inscripción.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => {
            const avg = getAverageScore(p);
            return (
              <motion.div
                key={p.id}
                layoutId={`card-${p.id}`}
                onClick={() => {
                  setActiveProjectId(p.id);
                  setVoteSuccessMsg('');
                  setVoteErrorMsg('');
                }}
                className="group relative bg-[#0D0D0F] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/40 cursor-pointer shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Visual Accent Hover Bar */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/40 transition-all duration-500"></div>
                
                <div className="space-y-4">
                  
                  {/* Category & Average rating floating badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase bg-zinc-950 px-2 py-0.5 border border-white/5 rounded">
                      {p.genre || 'Puzles'}
                    </span>
                    
                    {avg > 0 ? (
                      <div className="flex items-center gap-1 bg-yellow-500/5 px-2.5 py-0.5 rounded-full border border-yellow-500/20 text-yellow-500 font-mono text-[10px] font-bold">
                        <Star size={11} className="fill-current" />
                        <span>{avg}</span>
                        <span className="text-yellow-600">/10</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-600">Sin calificar</span>
                    )}
                  </div>

                  {/* Title and team info */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 font-sans tracking-tight transition-all truncate">
                      {p.gameTitle}
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium">
                      Por <span className="font-semibold text-zinc-300">{p.teamName}</span>
                    </p>
                  </div>

                  {/* Short snippet of description */}
                  <p className="text-xs text-zinc-500 font-sans leading-relaxed line-clamp-3">
                    {p.description}
                  </p>
                </div>

                {/* Card footer metrics */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <div className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300">
                    <MessageSquare size={13} />
                    <span>{p.votes?.length || 0} criticas</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-zinc-500 group-hover:text-indigo-400 transition-colors">
                    <span>Evaluar juego</span>
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Details Dialog overlay */}
      <AnimatePresence>
        {activeProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl bg-[#0A0A0C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Header inside modal */}
              <div className="sticky top-0 z-10 bg-[#0A0A0C] px-6 py-4 md:px-8 md:py-5 border-b border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase px-2 py-0.5 rounded bg-zinc-900 border border-white/5">
                      {activeProject.genre}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">{activeProject.platform}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-white">{activeProject.gameTitle}</h2>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    Presentado por <strong className="text-indigo-400">{activeProject.teamName}</strong> (Integrantes: {activeProject.teamMembers.join(', ') || 'En solitario'})
                  </p>
                </div>
                
                <button
                  onClick={() => setActiveProjectId(null)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg border border-white/5 transition-colors cursor-pointer"
                  title="Cerrar detalles"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body inside modal */}
              <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[75vh] overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-white/10">
                
                {/* Left pane: Project Showcase */}
                <div className="lg:col-span-7 p-6 md:p-8 space-y-6">
                  
                  {/* YouTube embedded trailer player */}
                  {getYouTubeEmbedUrl(activeProject.youtubeUrl) ? (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shadow-inner">
                      <iframe
                        title="Gameplay Trailer"
                        src={getYouTubeEmbedUrl(activeProject.youtubeUrl)!}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-xl bg-zinc-900/60 border border-white/5 flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <Play size={36} className="text-zinc-600" />
                      <div>
                        {activeProject.youtubeUrl?.trim() ? (
                          <>
                            <p className="text-xs text-zinc-400">Tráiler no disponible de forma integrada o enlace no válido.</p>
                            <a href={activeProject.youtubeUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 underline hover:text-indigo-300 inline-flex items-center gap-1 mt-1 font-mono">
                              Abrir enlace externo de trailer <ExternalLink size={10} />
                            </a>
                          </>
                        ) : (
                          <p className="text-xs text-zinc-400">No se ha proporcionado ningún tráiler de YouTube para este videojuego.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Play Game and GDD quick CTA buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <a
                      href={activeProject.itchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#fa5c5c] text-white hover:bg-[#ff6c6c] text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#fa5c5c]/10 tracking-widest uppercase transition-colors"
                    >
                      <Gamepad2 size={15} />
                      <span>Jugar en Itch.io</span>
                      <ExternalLink size={12} />
                    </a>

                    <a
                      href={activeProject.gddUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-zinc-800 text-white hover:bg-zinc-700 border border-white/5 text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 tracking-widest uppercase transition-colors"
                    >
                      <FileText size={15} />
                      <span>Leer GDD</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* Narrative details */}
                  <div className="space-y-2">
                    <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Sinopsis & Explicación</h3>
                    <p className="text-sm text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap selection:bg-indigo-500/30">
                      {activeProject.description}
                    </p>
                  </div>

                  {/* Rating Averages visual list */}
                  <div className="pt-4 border-t border-white/5 space-y-4">
                    <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Puntuaciones del Jurado y Alumnos</h3>
                    
                    {activeProject.votes.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">Nadie ha calificado este juego todavía. ¡Sé el primero!</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {criterias.map(cri => {
                          const val = getCriterionAverage(activeProject, cri.key);
                          return (
                            <div key={cri.key} className="bg-zinc-950/60 border border-white/5 p-3 rounded-lg flex flex-col justify-between">
                              <span className="text-[10px] text-zinc-500 font-sans block truncate" title={cri.name}>{cri.name}</span>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-lg font-black font-mono text-white">{val}</span>
                                <span className="text-[10px] font-mono text-zinc-500">/10</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right pane: Review Cast Form & Reviews stream */}
                <div className="lg:col-span-5 p-6 md:p-8 space-y-6 overflow-y-auto bg-zinc-950/30">
                  
                  {/* Form to submit a grade */}
                  <div className="space-y-5 bg-[#0D0D0F] border border-white/10 rounded-xl p-5 relative">
                    <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-1.5">
                      <Star size={13} className="text-yellow-500 fill-yellow-500" />
                      <span>Calificar este videojuego</span>
                    </h3>

                    {voteSuccessMsg ? (
                      <div className="p-4 bg-emerald-950/25 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg space-y-2">
                        <p className="font-semibold">{voteSuccessMsg}</p>
                        <p className="font-sans text-[11px] text-zinc-400">Gracias por tu opinión. Los promedios generales y la lista de comentarios han sido actualizados.</p>
                        <button
                          onClick={() => setVoteSuccessMsg('')}
                          className="text-[10px] font-mono text-emerald-400 hover:underline pt-1"
                        >
                          Escribir otra opinión
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleVoteSubmit} className="space-y-4">
                        
                        {/* Name Input */}
                        <div>
                          <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1.5">Tu Nombre / Alias *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Daniel Lozano"
                            value={voterName}
                            onChange={(e) => setVoterName(e.target.value)}
                            className="w-full px-3 py-1.5 bg-zinc-950 border border-white/5 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        {/* Ratings slider grid */}
                        <div className="space-y-3.5 pt-1">
                          {criterias.map(cri => {
                            const val = ratings[cri.key] || 5;
                            return (
                              <div key={cri.key} className="space-y-1">
                                <div className="flex justify-between items-center text-[10px] font-mono">
                                  <span className="text-zinc-400" title={cri.description}>{cri.name}</span>
                                  <span className="text-[#6366f1] font-bold">{val} / 10★</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    step="1"
                                    value={val}
                                    onChange={(e) => handleRatingChange(cri.key, parseInt(e.target.value))}
                                    className="w-full accent-[#6366f1] h-1 bg-zinc-900 rounded-lg cursor-pointer"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Comment Input */}
                        <div>
                          <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1.5">Reseña o Comentario (Opcional)</label>
                          <textarea
                            rows={3}
                            placeholder="¿Qué ha sido lo que más te ha gustado? ¿Algún comentario de feedback de mejora o consejo técnico?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-950 border border-white/5 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none font-sans"
                          ></textarea>
                        </div>

                        {voteErrorMsg && (
                          <div className="text-[10px] text-red-400 flex items-center gap-1.5 font-mono">
                            <X size={12} />
                            <span>{voteErrorMsg}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmittingVote}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-3 rounded-lg text-xs tracking-wider uppercase flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          {isSubmittingVote ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                              <span>Enviando voto...</span>
                            </>
                          ) : (
                            <>
                              <Send size={12} />
                              <span>Registrar Valoración</span>
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Reviews Stream list */}
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                      <MessageSquare size={13} />
                      <span>Mensajes & Críticas ({activeProject.votes.length})</span>
                    </h3>

                    <div className="space-y-3.5 max-h-[40vh] overflow-y-auto pr-1">
                      {activeProject.votes.length === 0 ? (
                        <p className="text-xs text-zinc-600 italic">No hay comentarios en este juego aún.</p>
                      ) : (
                        [...activeProject.votes].reverse().map(vt => {
                          const sumRatings = criterias.map(c => (vt as any)[c.key]).filter(val => typeof val === 'number');
                          const avgValue = sumRatings.length > 0 ? parseFloat((sumRatings.reduce((a, b) => a + b, 0) / sumRatings.length).toFixed(1)) : 0;
                          return (
                            <div key={vt.id} className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-zinc-200">{vt.voterName}</span>
                                <div className="flex items-center gap-1 text-yellow-500 text-xs font-mono font-bold">
                                  <Star size={11} className="fill-current" />
                                  <span>{avgValue}</span>
                                </div>
                              </div>
                              
                              {vt.comment ? (
                                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                                  "{vt.comment}"
                                </p>
                              ) : (
                                <p className="text-xs text-zinc-500 font-sans italic">Calificó sin dejar reseña escrita.</p>
                              )}

                              <div className="flex justify-between items-center text-[9px] font-mono text-zinc-600 pt-1">
                                <span title="Desglose de calificaciones">
                                  ⭐ {criterias.map(c => `${c.name.split(' ')[0].substring(0, 2)}:${(vt as any)[c.key] ?? 'N/A'}`).join(' ')}
                                </span>
                                <span>{new Date(vt.votedAt).toLocaleDateString('es-ES')}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>
              </div>
              
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
