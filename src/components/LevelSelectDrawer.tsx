/**
 * Lightbot Camp Studio 3D - Level Selector Drawer
 * Allows swift navigation across all 12 levels categorized by grade bracket.
 */

import React, { useState } from 'react';
import {
  X,
  Star,
  Layers,
  ChevronRight,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';
import { GradeBracket, LevelConfig, LevelResult } from '../game/types';
import { LEVELS } from '../game/levels';
import { soundManager } from '../audio/soundManager';

interface LevelSelectDrawerProps {
  isOpen: boolean;
  currentLevelId: number;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
  completedLevels: Record<number, LevelResult>;
}

export const LevelSelectDrawer: React.FC<LevelSelectDrawerProps> = ({
  isOpen,
  currentLevelId,
  onSelectLevel,
  onClose,
  completedLevels,
}) => {
  const [filter, setFilter] = useState<'ALL' | GradeBracket>('ALL');

  if (!isOpen) return null;

  const filteredLevels = LEVELS.filter(
    (lvl) => filter === 'ALL' || lvl.gradeBracket === filter
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-700/80 p-5 shadow-2xl flex flex-col gap-4 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif]">
                เลือกด่านการแข่งขัน (12 ด่าน)
              </h2>
              <span className="text-xs text-slate-400">
                ไต่ระดับความท้าทายตามช่วงชั้น ป.1-3 / ป.4-6 / ม.1-3
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grade Bracket Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-medium">
          {[
            { id: 'ALL', label: 'ทั้งหมด' },
            { id: 'G1_3', label: 'ป.1–3' },
            { id: 'G4_6', label: 'ป.4–6' },
            { id: 'G7_9', label: 'ม.1–3' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                soundManager.playClick();
                setFilter(tab.id as 'ALL' | GradeBracket);
              }}
              className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Level Cards List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
          {filteredLevels.map((lvl) => {
            const isCurrent = lvl.id === currentLevelId;
            const res = completedLevels[lvl.id];
            const isCompleted = res && res.completed;

            return (
              <div
                key={lvl.id}
                onClick={() => {
                  soundManager.playClick();
                  onSelectLevel(lvl.id);
                  onClose();
                }}
                className={`
                  p-3 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col gap-2 group
                  ${
                    isCurrent
                      ? 'bg-cyan-950/50 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                      : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-cyan-400 border border-slate-700">
                      {lvl.id}
                    </span>
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {lvl.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((starNum) => (
                      <Star
                        key={starNum}
                        className={`w-3.5 h-3.5 ${
                          isCompleted && starNum <= res.stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {lvl.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-amber-300">
                      <Lightbulb className="w-3 h-3" />
                      {lvl.tiles.filter((t) => t.isLightTarget).length} จุด
                    </span>
                    {lvl.id >= 5 && (
                      <span className="flex items-center gap-1 text-emerald-300">
                        <TrendingUp className="w-3 h-3" />
                        Jump (H.1-3)
                      </span>
                    )}
                    {lvl.hasP1 && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800/80">
                        P1
                      </span>
                    )}
                    {lvl.hasP2 && (
                      <span className="px-1.5 py-0.2 rounded bg-pink-950/80 text-pink-300 border border-pink-800/80">
                        P2
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>{isCurrent ? 'กำลังเล่น' : 'เลือกลุย'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
