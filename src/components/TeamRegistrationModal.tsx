/**
 * Lightbot Camp Studio 3D - Team Registration Modal
 * Requirement: "ปรับออก เหลือชื่อทีมเท่านั้น" (Only keep Team Name, remove members and school)
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  X,
  Check,
  Zap,
} from 'lucide-react';
import { GradeBracket, TeamProfile } from '../game/types';
import { soundManager } from '../audio/soundManager';

interface TeamRegistrationModalProps {
  isOpen: boolean;
  activeTeam: TeamProfile | null;
  savedTeams: TeamProfile[];
  onSaveTeam: (team: TeamProfile) => void;
  onSelectTeam: (teamId: string) => void;
  onClose: () => void;
  canClose: boolean;
}

const COLOR_OPTIONS = [
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#3b82f6', // Blue
];

export const TeamRegistrationModal: React.FC<TeamRegistrationModalProps> = ({
  isOpen,
  activeTeam,
  savedTeams,
  onSaveTeam,
  onSelectTeam,
  onClose,
  canClose,
}) => {
  const [name, setName] = useState(activeTeam?.name || '');
  const [gradeBracket, setGradeBracket] = useState<GradeBracket>(activeTeam?.gradeBracket || 'G1_3');
  const [color, setColor] = useState(activeTeam?.color || COLOR_OPTIONS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundManager.playClick();
    const newTeam: TeamProfile = {
      id: activeTeam?.id || `team_${Date.now()}`,
      name: name.trim(),
      gradeBracket,
      color,
      createdAt: activeTeam?.createdAt || Date.now(),
    };

    onSaveTeam(newTeam);
  };

  const handleQuickPreset = (presetName: string, presetGrade: GradeBracket) => {
    soundManager.playClick();
    setName(presetName);
    setGradeBracket(presetGrade);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-7 shadow-2xl overflow-hidden text-slate-100 flex flex-col gap-6 my-auto">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 shadow-md shadow-cyan-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                ลงชื่อทีมแข่งขัน
              </h2>
              <span className="text-xs text-slate-400">
                กรอกชื่อทีมเพื่อเข้าสู่สนามประลองและบันทึกสถิติเวลาที่ดีที่สุด
              </span>
            </div>
          </div>
          {canClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Saved Teams Quick Switcher */}
        {savedTeams.length > 0 && (
          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400">ทีมที่ลงทะเบียนไว้แล้ว:</span>
            <div className="flex flex-wrap gap-2">
              {savedTeams.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    onSelectTeam(t.id);
                  }}
                  className={`
                    flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer
                    ${
                      activeTeam?.id === t.id
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }
                  `}
                >
                  <span
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: t.color }}
                  />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Registration Form - ONLY TEAM NAME */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Team Name Input - BIG & PROMINENT */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>ชื่อทีมผู้เข้าแข่งขัน <span className="text-red-400">*</span></span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="พิมพ์ชื่อทีมของคุณที่นี่ เช่น CyberBot Alpha..."
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border-2 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-base font-semibold shadow-inner transition-colors"
            />
          </div>

          {/* Grade Bracket Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>ช่วงชั้นการแข่งขัน</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { key: 'G1_3', label: 'ป.1–ป.3', desc: 'ด่าน 1-4' },
                  { key: 'G4_6', label: 'ป.4–ป.6', desc: 'ด่าน 5-8' },
                  { key: 'G7_9', label: 'ม.1–ม.3', desc: 'ด่าน 9-12' },
                ] as const
              ).map((g) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setGradeBracket(g.key)}
                  className={`
                    p-2.5 rounded-2xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center
                    ${
                      gradeBracket === g.key
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-500/30 ring-2 ring-cyan-400/50'
                        : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700'
                    }
                  `}
                >
                  <span className="font-bold text-sm">{g.label}</span>
                  <span className="text-[11px] opacity-80">{g.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Team Color Theme */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-300">สีประจำทีม:</span>
            <div className="flex items-center gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                    color === c ? 'border-white scale-125 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
            <span>ตัวอย่างชื่อทีม:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('หุ่นยนต์จิ๋ว ป.1-3', 'G1_3')}
                className="hover:text-cyan-400 underline cursor-pointer"
              >
                ทีม ป.1-3
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleQuickPreset('RoboChampion ป.4-6', 'G4_6')}
                className="hover:text-cyan-400 underline cursor-pointer"
              >
                ทีม ป.4-6
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleQuickPreset('Nexus Master ม.1-3', 'G7_9')}
                className="hover:text-cyan-400 underline cursor-pointer"
              >
                ทีม ม.1-3
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-base tracking-wide shadow-xl shadow-cyan-500/25 transition-all cursor-pointer border border-cyan-400/40"
          >
            เข้าสู่สนามแข่งขัน
          </button>
        </form>
      </div>
    </div>
  );
};
