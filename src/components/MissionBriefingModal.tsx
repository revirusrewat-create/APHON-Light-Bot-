/**
 * Lightbot Camp Studio 3D - Mission Briefing Modal
 * Implements strict competition fair play rules:
 * 1. Shows clear objectives WITHOUT giving away navigation sequence spoilers.
 * 2. Fair timer holds at 00:00 until the team clicks "อ่านคำสั่งจบ & เริ่มจับเวลา".
 */

import React from 'react';
import {
  Lightbulb,
  Layers,
  Clock,
  Play,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { LevelConfig, TeamProfile } from '../game/types';
import { soundManager } from '../audio/soundManager';

interface MissionBriefingModalProps {
  isOpen: boolean;
  level: LevelConfig;
  team: TeamProfile | null;
  onStartTimer: () => void;
}

export const MissionBriefingModal: React.FC<MissionBriefingModalProps> = ({
  isOpen,
  level,
  team,
  onStartTimer,
}) => {
  if (!isOpen) return null;

  const targetCount = level.tiles.filter((t) => t.isLightTarget).length;
  const maxH = Math.max(...level.tiles.map((t) => t.height));

  const handleStart = () => {
    soundManager.playClick();
    onStartTimer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl overflow-hidden text-slate-100 flex flex-col gap-5">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono">
                {level.gradeLabel}
              </span>
              {team && (
                <span className="text-xs text-slate-400">
                  ทีมผู้เข้าแข่งขัน: <strong className="text-white">{team.name}</strong>
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide font-['Chakra_Petch',sans-serif]">
              {level.name}
            </h2>
          </div>
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <HelpCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Mission Objective (No Walk Spoilers) */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
          <div className="text-xs uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4" />
            <span>เป้าหมายภารกิจ (Mission Objective)</span>
          </div>
          <p className="text-sm text-slate-200 font-medium leading-relaxed">
            "{level.objective}"
          </p>
          <p className="text-xs text-slate-400 italic">
            * วิเคราะห์ผังสนาม 3 มิติ และวางแผนลำดับชุดคำสั่งด้วยตัวทีมเอง ห้ามเปิดเฉลย
          </p>
        </div>

        {/* Field Intelligence Grid */}
        <div className="grid grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center justify-center text-center">
            <Lightbulb className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-slate-400">จุดเป้าหมาย</span>
            <span className="font-bold text-white text-sm">{targetCount} ตำแหน่ง</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center justify-center text-center">
            <TrendingUp className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-slate-400">ระดับความสูง</span>
            <span className="font-bold text-white text-sm">H.0 {maxH > 0 ? `ถึง H.${maxH}` : '(พื้นราบ)'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center justify-center text-center">
            <Layers className="w-4 h-4 text-purple-400 mb-1" />
            <span className="text-slate-400">ฟังก์ชันที่ใช้ได้</span>
            <span className="font-bold text-white text-sm">
              MAIN{level.hasP1 ? ' + P1' : ''}{level.hasP2 ? ' + P2' : ''}
            </span>
          </div>
        </div>

        {/* Par Targets & Rules */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>เป้าหมายเวลา 3 ดาว: ≤ {level.parTimeSeconds} วินาที</span>
          </div>
          <div>
            <span>เป้าหมายบล็อก: ≤ {level.parBlocks} บล็อก</span>
          </div>
        </div>

        {/* Fair Play Timer Start Button */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={handleStart}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-cyan-500/25 transition-all duration-150 active:scale-98 cursor-pointer border border-cyan-300/40"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>อ่านคำสั่งจบ & เริ่มจับเวลา</span>
          </button>
          <span className="text-center text-[11px] text-slate-400">
            ระบบจะเริ่มนับเวลาการแข่งขันเมื่อกดปุ่มนี้ เพื่อความยุติธรรมเท่าเทียมทุกทีม
          </span>
        </div>
      </div>
    </div>
  );
};
