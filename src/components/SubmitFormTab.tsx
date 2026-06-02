/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';
import { 
  Users, 
  Gamepad2, 
  Link, 
  Video, 
  FileText, 
  Plus, 
  Trash2, 
  Send, 
  Check, 
  AlertCircle, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface SubmitFormTabProps {
  onSuccess: (project: Project) => void;
}

const GENRES = [
  "Acción y Aventura",
  "Puzles / Rompecabezas",
  "Plataformas",
  "Estrategia / Rol (RPG)",
  "Terror / Suspenso",
  "Carreras / Deportes",
  "Novela Visual",
  "Incremental / Clicker / Otros"
];

const PLATFORMS = [
  "Navegador Web (HTML5)",
  "PC (Windows / Mac / Linux)",
  "Dispositivos Móviles (Android / iOS)",
  "VR (Realidad Virtual)",
  "Multiplataforma"
];

export default function SubmitFormTab({ onSuccess }: SubmitFormTabProps) {
  // Form details
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<string[]>(['']);
  const [gameTitle, setGameTitle] = useState('');
  const [genre, setGenre] = useState(GENRES[0]);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [itchUrl, setItchUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [gddUrl, setGddUrl] = useState('');
  const [description, setDescription] = useState('');

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedProject, setSubmittedProject] = useState<Project | null>(null);

  // Dynamic team member handling
  const addMember = () => {
    if (members.length < 4) {
      setMembers([...members, '']);
    }
  };

  const removeMember = (index: number) => {
    const updated = members.filter((_, i) => i !== index);
    setMembers(updated);
  };

  const handleMemberChange = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const validateUrls = () => {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    
    // Check if itch.io has itch.io in url
    if (!itchUrl.toLowerCase().includes('itch.io')) {
      return "El enlace de Itch.io debe ser una URL válida que contenga 'itch.io'";
    }
    // Check if youtube link has youtube/youtu.be only if provided
    if (youtubeUrl.trim() && !youtubeUrl.toLowerCase().includes('youtube.com') && !youtubeUrl.toLowerCase().includes('youtu.be')) {
      return "El enlace del Tráiler debe pertenecer a YouTube ('youtube.com' o 'youtu.be')";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Pre-validations
    if (!teamName.trim()) {
      setErrorMsg("El nombre del equipo es obligatorio.");
      return;
    }
    if (!gameTitle.trim()) {
      setErrorMsg("El título del juego es obligatorio.");
      return;
    }
    if (!itchUrl.trim() || !gddUrl.trim()) {
      setErrorMsg("Los enlaces de Itch.io y del Documento GDD son obligatorios.");
      return;
    }
    if (description.trim().length < 20) {
      setErrorMsg("Escribe una breve descripción del juego de al menos 20 caracteres.");
      return;
    }

    const urlError = validateUrls();
    if (urlError) {
      setErrorMsg(urlError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: teamName.trim(),
          teamMembers: members.filter(m => m.trim()),
          gameTitle: gameTitle.trim(),
          genre,
          platform,
          itchUrl: itchUrl.trim(),
          youtubeUrl: youtubeUrl.trim(),
          gddUrl: gddUrl.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error al enviar el juego.");
      }

      setSubmittedProject(data);
      onSuccess(data); // Propagate to parent to refresh listing
    } catch (err: any) {
      setErrorMsg(err.message || "No se pudo conectar con el servidor. Reinténtalo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTeamName('');
    setMembers(['']);
    setGameTitle('');
    setGenre(GENRES[0]);
    setPlatform(PLATFORMS[0]);
    setItchUrl('');
    setYoutubeUrl('');
    setGddUrl('');
    setDescription('');
    setSubmittedProject(null);
    setErrorMsg('');
  };

  if (submittedProject) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-w-2xl mx-auto bg-slate-900 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-6 shadow-2xl relative"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-b-full"></div>
        
        <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
          <Check size={32} className="animate-bounce" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">¡Proyecto Enviado con Éxito!</h2>
          <p className="text-sm text-slate-300">
            Tu videojuego <strong className="text-emerald-400 font-bold">"{submittedProject.gameTitle}"</strong> ha sido registrado correctamente para {submittedProject.teamName}.
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 text-left text-xs font-mono space-y-3.5 divide-y divide-slate-800/60">
          <div className="grid grid-cols-2 gap-2 pt-0">
            <span className="text-slate-400">Equipo:</span>
            <span className="text-white text-right font-medium">{submittedProject.teamName}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2.5">
            <span className="text-slate-400">Integrantes:</span>
            <span className="text-white text-right max-h-16 overflow-y-auto font-medium">
              {submittedProject.teamMembers.join(', ') || 'En solitario'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2.5">
            <span className="text-slate-400">Categoría & Soporte:</span>
            <span className="text-cyan-400 text-right font-medium">{submittedProject.genre} ({submittedProject.platform})</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2.5">
            <span className="text-slate-400">Página de Itch:</span>
            <a href={submittedProject.itchUrl} target="_blank" rel="noreferrer" className="text-indigo-400 text-right truncate underline hover:text-indigo-300">
              {submittedProject.itchUrl}
            </a>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Ya podéis ver vuestro proyecto en la pestaña de <strong className="text-slate-200">Proyectos</strong>, compartir vuestro enlace o empezar a jugar y calificar los videojuegos de otros compañeros. ¡Muchísima suerte!
        </p>

        <div className="flex gap-4 justify-center pt-4">
          <button
            onClick={handleResetForm}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition-all"
          >
            Enviar otro juego / Registrar otro equipo
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-purple-400" size={18} />
              Inscripción & Entrega de Videojuego
            </h2>
            <p className="text-xs text-slate-400 font-mono">Formulario oficial de entrega de proyectos para alumnos</p>
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-500 text-[10px] font-mono uppercase tracking-wider self-start md:self-center">
            <AlertCircle size={12} />
            <span>Única entrega por equipo</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Seccion 1: Datos del Equipo */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 font-mono flex items-center gap-2">
              <Users size={16} /> 1. Información del Equipo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="teamName">
                  Nombre del Equipo *
                </label>
                <input
                  id="teamName"
                  type="text"
                  required
                  placeholder="Ej: Toledo Pixel Knights"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Integrantes del Equipo (Máx 4)
                </label>
                <div className="space-y-2">
                  {members.map((member, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Miembro #${index + 1} (Nombre y Apellidos)`}
                        value={member}
                        onChange={(e) => handleMemberChange(index, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      {members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMember(index)}
                          className="p-2 border border-slate-800 hover:border-red-500/40 text-slate-500 hover:text-red-400 rounded-lg bg-slate-950 hover:bg-red-500/5 transition-all text-sm"
                          title="Eliminar miembro"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {members.length < 4 && (
                    <button
                      type="button"
                      onClick={addMember}
                      className="text-xs font-semibold font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-1 transition-colors hover:underline"
                    >
                      <Plus size={14} /> Añadir Integrante
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-800/70" />

          {/* Seccion 2: Datos del Juego */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-2">
              <Gamepad2 size={16} /> 2. Detalles del Videojuego
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="gameTitle">
                  Título del Videojuego *
                </label>
                <input
                  id="gameTitle"
                  type="text"
                  required
                  placeholder="Ej: Echoes of the Void, Spectral Bloom..."
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="genre">
                  Género Principal *
                </label>
                <select
                  id="genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  {GENRES.map(g => (
                    <option key={g} value={g} className="bg-slate-900">{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="platform">
                  Plataforma Principal de Destino *
                </label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  {PLATFORMS.map(p => (
                    <option key={p} value={p} className="bg-slate-900">{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="gddUrl">
                  Fichero / Enlace del GDD *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600">
                    <FileText size={15} />
                  </div>
                  <input
                    id="gddUrl"
                    type="url"
                    required
                    placeholder="Enlace a Google Doc, Notion, OneDrive..."
                    value={gddUrl}
                    onChange={(e) => setGddUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="itchUrl">
                  Página de Entrega de Itch.io *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600">
                    <Link size={15} />
                  </div>
                  <input
                    id="itchUrl"
                    type="url"
                    required
                    placeholder="https://nombre_usuario.itch.io/nombre-juego"
                    value={itchUrl}
                    onChange={(e) => setItchUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="youtubeUrl">
                  Enlace de Tráiler (YouTube - Opcional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600">
                    <Video size={15} />
                  </div>
                  <input
                    id="youtubeUrl"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="description">
                Sinopsis, Concepto e Instrucciones de Juego *
              </label>
              <textarea
                id="description"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cuéntanos la historia de tu juego, cómo se juega, los controles clave, y qué tecnologías habéis utilizado. ¿Cómo habéis integrado el tema 'revelando lo invisible'? (Mínimo 20 caracteres)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
              ></textarea>
            </div>
          </div>

          {/* Feedback Msg */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-red-950/25 border border-red-500/30 rounded-lg flex items-start gap-2.5 text-red-400 text-xs"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Action */}
          <div className="pt-2 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-purple-500/15 border border-purple-500/30 transition-all ${isSubmitting ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                  <span>Inscribiendo juego...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Subir Proyecto y Registrar Equipo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
