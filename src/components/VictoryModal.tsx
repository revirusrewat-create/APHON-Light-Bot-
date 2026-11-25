/**
 * Lightbot Camp Studio 3D - Victory Celebration Modal
 * Requirement: "มีระบบสรุปคะแนนใก้ดูง่ายที่สุดตัวใหญ่ชัดเจน" (Giant, bold, crystal-clear score summary)
 * Highlights: Best Time, Stars, Quiz points, and Total Score.
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Star,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Zap,
  Timer,
  Boxes,
  BrainCircuit,
} from 'lucide-react';
import { LevelConfig, LevelResult, TeamProfile } from '../game/types';
import { soundManager } from '../audio/soundManager';

interface VictoryModalProps {
  isOpen: boolean;
  level: LevelConfig;
  team: TeamProfile | null;
  result: LevelResult | null;
  quizPointsEarned?: number;
  onNextLevel: () => void;
  onRetry: () => void;
  onViewMatrix: () => void;
  hasNextLevel: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  level,
  team,
  result,
  quizPointsEarned = 0,
  onNextLevel,
  onRetry,
  onViewMatrix,
  hasNextLevel,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundManager.playVictory();

      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#38bdf8', '#facc15', '#a855f7'],
        });

        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 60,
            origin: { x: 0 },
            colors: ['#38bdf8', '#facc15'],
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 60,
            origin: { x: 1 },
            colors: ['#06b6d4', '#ec4899'],
          });
        }, 250);
      } catch {
        // fallback
      }
    }
  }, [isOpen]);

  if (!isOpen || !result) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = (secs % 60).toFixed(1);
    return `${mins.toString().padStart(2, '0')}:${remSecs.padStart(4, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in zoom-in-95 duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-slate-100 flex flex-col items-center text-center gap-5 my-auto">
        {/* Glow halo */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Team Name & Level Header */}
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ทีมผู้ชนะ: {team?.name || 'ทีมผู้แข่งขัน'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide font-['Chakra_Petch',sans-serif]">
            พิชิต {level.name}
          </h2>
        </div>

        {/* Giant Best Time Callout (เวลาทีมใดดีที่สุด ชนะ) */}
        <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-2 border-emerald-400/70 shadow-lg shadow-emerald-500/20 flex flex-col items-center">
          <span className="text-xs sm:text-sm font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Timer className="w-4 h-4 text-emerald-400" />
            สถิติเวลาที่ทำได้ (ตัดสินผู้ชนะ)
          </span>
          <div className="font-mono text-4xl sm:text-5xl font-black text-white tracking-tight text-emerald-400 drop-shadow-md">
            {formatTime(result.timeSeconds)} <span className="text-xl sm:text-2xl font-bold text-emerald-300">วินาที</span>
          </div>
          <span className="text-[11px] text-slate-300 mt-1">
            * ระบบจัดอันดับผู้ชนะเลิศโดยให้ทีมที่มีเวลาน้อยที่สุดขึ้นอันดับ 1
          </span>
        </div>

        {/* Giant Star Rating */}
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((starNum) => {
            const isFilled = starNum <= result.stars;
            return (
              <div
                key={starNum}
                className={`p-2.5 rounded-2xl border-2 transition-all duration-300 ${
                  isFilled
                    ? 'bg-amber-500/20 border-amber-400 text-amber-400 scale-110 shadow-xl shadow-amber-500/30'
                    : 'bg-slate-800/40 border-slate-800 text-slate-700'
                }`}
              >
                <Star className={`w-10 h-10 ${isFilled ? 'fill-amber-400' : ''}`} />
              </div>
            );
          })}
        </div>

        {/* Clear Big Score Breakdown Card (ตัวใหญ่ ชัดเจน ดูง่ายที่สุด) */}
        <div className="w-full p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col gap-3 text-sm">
          {/* Base Points */}
          <div className="flex items-center justify-between text-slate-300 border-b border-slate-800/80 pb-2">
            <span className="flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              คะแนนเปิดไฟสำเร็จทุกจุด
            </span>
            <span className="font-mono font-bold text-white text-base">
              +{level.tiles.filter((t) => t.isLightTarget).length * 1000 + 1000}
            </span>
          </div>

          {/* Block Bonus */}
          <div className="flex items-center justify-between text-slate-300 border-b border-slate-800/80 pb-2">
            <span className="flex items-center gap-2 font-medium">
              <Boxes className="w-4 h-4 text-emerald-400" />
              โบนัสประหยัดบล็อก ({result.blocksUsed} / {level.parBlocks} บล็อก)
            </span>
            <span className="font-mono font-bold text-emerald-400 text-base">
              +{Math.max(0, Math.round((level.parBlocks * 1.5 - result.blocksUsed) * 100))}
            </span>
          </div>

          {/* Quiz Bonus if applicable */}
          {quizPointsEarned > 0 && (
            <div className="flex items-center justify-between text-purple-300 border-b border-slate-800/80 pb-2 font-semibold">
              <span className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                โบนัสตอบคำถามวิทยาการคำนวณ
              </span>
              <span className="font-mono font-bold text-purple-300 text-base">
                +{quizPointsEarned}
              </span>
            </div>
          )}

          {/* Total Score - GIANT */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              คะแนนรวมประจำด่าน
            </span>
            <span className="font-mono text-3xl sm:text-4xl font-black text-yellow-400">
              {result.score.toLocaleString()} <span className="text-sm font-semibold text-amber-300">แต้ม</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 pt-1">
          {hasNextLevel && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onNextLevel();
              }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-base tracking-wide shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-400/40"
            >
              <span>ลุยด่านถัดไป</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onRetry();
              }}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>เล่นซ้ำทำเวลาให้เร็วขึ้น</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onViewMatrix();
              }}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 text-slate-950 text-xs sm:text-sm font-black shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>ตารางเวลา Matrix 2D</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
