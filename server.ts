/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { Project, Vote } from './src/types';

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), 'gamejam-db.json');

app.use(express.json());

// Game Jam Config - statically editable context for the teacher/organizer
const JAM_INFO = {
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
    "Se debe entregar un enlace de Itch.io público (jugable en navegador o descargable), un tráiler en YouTube (máx 2 minutos) y el Documento de Diseño de Juego (GDD)."
  ],
  criteria: [
    { name: "Jugabilidad (Gameplay)", key: "gameplay", description: "Mecánicas, fluidez, controles, sistema de juego y la experiencia de diversión general." },
    { name: "Diseño de Videojuego", key: "design", description: "Diseño de juego (Game Design), balance de mecánicas, curvas de aprendizaje y estructuración del ritmo." },
    { name: "Gráficos & Arte", key: "graphics", description: "Estética visual, estilo low-poly, animaciones, diseño de niveles y cohesión artística." },
    { name: "Audio & Música", key: "audio", description: "Efectos sonoros, música envolvente, atmósfera acústica e integración de sonido." },
    { name: "Innovación & Originalidad", key: "innovation", description: "Propuesta de valor única, mecánicas sorprendentes y giros creative de diseño." },
    { name: "Ajuste al Tema", key: "theme", description: "Qué tan bien explora y utiliza la premisa obligatoria de 'PARANOIA'." }
  ]
};

// Initial/default mock projects to make the portal look alive from day one
const DEFAULT_PROJECTS: Project[] = [];

// Helper to read and write database
function getProjects(): Project[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Create Database with default mock projects
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_PROJECTS, null, 2), 'utf-8');
      return DEFAULT_PROJECTS;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database file, returning default empty state", error);
    return DEFAULT_PROJECTS;
  }
}

function saveProjects(projects: Project[]): boolean {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(projects, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error("Error writing database file", error);
    return false;
  }
}

// Ensure the DB is initialized at startup
getProjects();

// ================= API ENDPOINTS =================

// 1. Get Game Jam Info Metadata
app.get('/api/jam-info', (req, res) => {
  res.json(JAM_INFO);
});

// 2. Get All Submitted Projects
app.get('/api/projects', (req, res) => {
  const projects = getProjects();
  res.json(projects);
});

// 3. Submit New Project
app.post('/api/projects', (req, res) => {
  try {
    const { teamName, teamMembers, gameTitle, description, itchUrl, youtubeUrl, gddUrl, genre, platform } = req.body;

    // Validation
    if (!teamName?.trim() || !gameTitle?.trim() || !itchUrl?.trim() || !youtubeUrl?.trim() || !gddUrl?.trim()) {
      return res.status(400).json({ error: "Faltan campos obligatorios. Asegúrate de rellenar el Nombre del Equipo, Título del Juego, Enlace de Itch.io, Tráiler de YouTube y Enlace del GDD." });
    }

    const projects = getProjects();
    
    // Create new project object
    const newProject: Project = {
      id: "project_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      teamName: teamName.trim(),
      teamMembers: Array.isArray(teamMembers) ? teamMembers.filter(m => m && m.trim()) : [],
      gameTitle: gameTitle.trim(),
      description: description?.trim() || "Sin descripción proporcionada.",
      itchUrl: itchUrl.trim(),
      youtubeUrl: youtubeUrl.trim(),
      gddUrl: gddUrl.trim(),
      genre: genre?.trim() || "Otros / General",
      platform: platform?.trim() || "PC / Navegador",
      submittedAt: new Date().toISOString(),
      votes: []
    };

    projects.push(newProject);
    saveProjects(projects);

    res.status(201).json(newProject);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al procesar la entrega del proyecto." });
  }
});

// 4. Submit Rating / Vote for a Project
app.post('/api/projects/:id/vote', (req, res) => {
  try {
    const projectId = req.params.id;
    const { voterName, gameplay, design, graphics, audio, innovation, theme, comment } = req.body;

    if (!voterName?.trim()) {
      return res.status(400).json({ error: "Por favor, introduce tu nombre para registrar tu voto." });
    }

    const cleanVote = (val: any) => {
      const num = parseInt(val, 10);
      if (isNaN(num)) return 5;
      return Math.max(1, Math.min(10, num));
    };

    const projects = getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) {
      return res.status(404).json({ error: "Proyecto de juego no encontrado." });
    }

    const newVote: Vote = {
      id: "vote_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      voterName: voterName.trim(),
      gameplay: cleanVote(gameplay),
      design: cleanVote(design),
      graphics: cleanVote(graphics),
      audio: cleanVote(audio),
      innovation: cleanVote(innovation),
      theme: cleanVote(theme),
      comment: comment?.trim() || "",
      votedAt: new Date().toISOString()
    };

    projects[projectIndex].votes.push(newVote);
    saveProjects(projects);

    res.status(200).json({ message: "Voto registrado correctamente.", vote: newVote, project: projects[projectIndex] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al registrar el voto." });
  }
});

// ================= VITE OR STATIC RUNTIME CONFIG =================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving production static built assets.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
