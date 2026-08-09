import React from 'react';
import { X, Sparkles, ExternalLink, Flame, Play } from 'lucide-react';

interface AwwwardsStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyInspiration: (siteName: string, prompt: string) => void;
}

export interface SiteInspiration {
  id: string;
  name: string;
  url: string;
  tag: string;
  description: string;
  prompt: string;
}

export const AWWWARDS_SITE_INSPIRATIONS: SiteInspiration[] = [
  {
    id: 'bruno-simon',
    name: 'Bruno Simon 3D World',
    url: 'https://bruno-simon.com/',
    tag: '3D Physics Canvas',
    description: 'Interactive 3D vehicle driving physics engine with dynamic canvas objects.',
    prompt: 'Implement a Bruno Simon inspired interactive 3D physics canvas with responsive vehicle/cursor deflection and 60fps WebGL rendering.'
  },
  {
    id: 'noomo-agency',
    name: 'Noomo Agency',
    url: 'https://noomoagency.com/',
    tag: '3D Storytelling',
    description: 'Cinematic 3D web storytelling with smooth spatial scroll transitions.',
    prompt: 'Implement a Noomo Agency inspired cinematic 3D scroll-driven narrative portfolio with volumetric lighting.'
  },
  {
    id: 'star-atlas',
    name: 'Star Atlas',
    url: 'https://staratlas.com/',
    tag: 'Cyberpunk Space Depth',
    description: 'Futuristic spatial particle depth, neon glowing grids, and sci-fi aesthetic.',
    prompt: 'Implement a Star Atlas sci-fi spatial depth background with floating neon particle kinetics and dark obsidian glassmorphism.'
  },
  {
    id: 'kprverse',
    name: 'KPR Verse',
    url: 'https://kprverse.com/',
    tag: 'Ambient Volumetric',
    description: 'Dark ambient lighting, floating 3D micro-elements, and responsive cursor fog.',
    prompt: 'Implement KPR Verse inspired ambient volumetric lighting and 3D floating orb physics.'
  },
  {
    id: 'resn-corn',
    name: 'Resn Corn Revolution',
    url: 'https://cornrevolution.resn.global/',
    tag: 'GLSL Fluid Shader',
    description: 'Award-winning fluid particle GLSL shader with 60fps wave kinetics.',
    prompt: 'Implement a Resn inspired 60fps GLSL fluid particle shader with mouse deflection and trigonometric wave kinetics.'
  },
  {
    id: 'abeto-messenger',
    name: 'Abeto Messenger',
    url: 'https://messenger.abeto.co/',
    tag: 'Glassmorphic Micro-UI',
    description: 'Tactile glassmorphism, ultra-clean floating docks, and liquid state switches.',
    prompt: 'Implement Abeto Messenger glassmorphic cards with dynamic blur, spotlight hover highlights, and tactile buttons.'
  },
  {
    id: 'op-al',
    name: 'Op.al',
    url: 'https://op.al/',
    tag: 'Kinetic Bento Layout',
    description: 'Sleek bento grid with dynamic tilt cards, spotlight glows, and magnetic cursor.',
    prompt: 'Implement Op.al inspired Bento Grid layout with 3D tilt effects (transform-style: preserve-3d) and magnetic hover buttons.'
  },
  {
    id: 'pangram-pangram',
    name: 'Pangram Pangram',
    url: 'https://pangrampangram.com/',
    tag: 'Kinetic Typography',
    description: 'Expressive variable font specimen lab with real-time letter deflection.',
    prompt: 'Implement Pangram Pangram kinetic typography hero headline with variable letter tracking and hover character deflection.'
  },
  {
    id: 'synchronized-studio',
    name: 'Synchronized Studio',
    url: 'https://synchronized.studio/',
    tag: 'Minimal Motion Design',
    description: 'High-end studio layout with smooth cursor magnetic tracking and project cards.',
    prompt: 'Implement Synchronized Studio minimal motion layout with magnetic cursor triggers and interactive project drawer.'
  },
  {
    id: 'persepolis-getty',
    name: 'Persepolis Getty',
    url: 'https://persepolis.getty.edu/',
    tag: 'Atmospheric Audio-Visual',
    description: 'Immersive historical 3D exploration with ambient spatial audio soundscapes.',
    prompt: 'Implement Persepolis inspired 3D visual exploration mode with spatial soundscape audio toggle.'
  },
  {
    id: 'igloo-inc',
    name: 'Igloo Inc',
    url: 'https://www.igloo.inc/',
    tag: 'Neo-Brutalist Cyber',
    description: 'High-contrast typography, floating 3D widgets, and tech deck cards.',
    prompt: 'Implement Igloo Inc neo-brutalist tech cards with crisp borders and glowing indicators.'
  },
  {
    id: 'matrue-cannabis',
    name: 'Matrue',
    url: 'https://matruecannabis.com/',
    tag: 'Tactile Liquid Motion',
    description: 'Smooth organic scroll transitions and liquid morphing visual cards.',
    prompt: 'Implement Matrue inspired organic liquid scroll transitions and glassmorphic modal cards.'
  }
];

export const AwwwardsStudioModal: React.FC<AwwwardsStudioModalProps> = ({
  isOpen,
  onClose,
  onApplyInspiration
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b0f19] border border-slate-800/90 rounded-2xl w-[820px] max-h-[88vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="h-14 px-5 border-b border-slate-800/80 flex items-center justify-between bg-[#070a12]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white tracking-tight flex items-center space-x-2">
                <span>AWWWARDS SITE OF THE YEAR INSPIRATION STUDIO</span>
                <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-800/50">
                  21 Top Sites
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Select any Site-of-the-Year design pattern to generate AI portfolio code into your active file.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Master Generator Banner */}
        <div className="p-4 bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-slate-950 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <div className="text-xs font-bold text-slate-100">Generate Full God-Tier Portfolio Spec</div>
              <div className="text-[11px] text-slate-400">Synthesizes all 21 Awwwards site inspirations into complete 60fps React 19 + WebGL code.</div>
            </div>
          </div>

          <button
            onClick={() => {
              onApplyInspiration('Full Awwwards Portfolio', 'Generate complete Awwwards Site of the Year portfolio with 3D canvas, Bento grid, kinetic typography, and magnetic cursor.');
              onClose();
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition-all shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Generate Full Portfolio</span>
          </button>
        </div>

        {/* Site Inspirations Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-2 gap-3.5 text-xs">
          {AWWWARDS_SITE_INSPIRATIONS.map((site) => (
            <div
              key={site.id}
              className="bg-[#070a12] p-3.5 rounded-xl border border-slate-800/80 hover:border-indigo-500/60 transition-all flex flex-col justify-between space-y-2.5 group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs group-hover:text-indigo-300 transition-colors">
                    {site.name}
                  </span>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-indigo-400 transition-colors p-1"
                    title={`Visit ${site.url}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/40 inline-block mt-1">
                  {site.tag}
                </span>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{site.description}</p>
              </div>

              <button
                onClick={() => {
                  onApplyInspiration(site.name, site.prompt);
                  onClose();
                }}
                className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white font-semibold text-[11px] transition-all border border-slate-800 hover:border-indigo-500 flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Apply {site.name} Style</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
