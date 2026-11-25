/**
 * Lightbot Camp Studio 3D - Program Editor & Execution Dock
 * Displays MAIN, P1, P2 slots, active step indicators, and execution controls.
 */

import React from 'react';
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Trash2,
  Undo2,
  Gauge,
  CheckCircle2,
} from 'lucide-react';
import { CommandType, ExecutionStep, LevelConfig, ProgramState } from '../game/types';
import { COMMANDS } from './CommandPalette';
import { soundManager } from '../audio/soundManager';

export type RoutineType = 'MAIN' | 'P1' | 'P2';

interface ProgramEditorProps {
  level: LevelConfig;
  program: ProgramState;
  activeRoutine: RoutineType;
  onSelectRoutine: (routine: RoutineType) => void;
  onRemoveCommand: (routine: RoutineType, index: number) => void;
  onClearRoutine: (routine: RoutineType) => void;
  onUndoCommand: (routine: RoutineType) => void;
  // Execution state
  isExecuting: boolean;
  isPaused: boolean;
  currentStep: ExecutionStep | null;
  speed: number;
  onSpeedChange: (speed: number) => void;
  // Trial run mode
  trialRunsLeft: number;
  isTrialMode: boolean;
  onToggleTrialMode: () => void;
  onRun: () => void;
  onPause: () => void;
  onResume: () => void;
  onStep: () => void;
  onReset: () => void;
}

export const ProgramEditor: React.FC<ProgramEditorProps> = ({
  level,
  program,
  activeRoutine,
  onSelectRoutine,
  onRemoveCommand,
  onClearRoutine,
  onUndoCommand,
  isExecuting,
  isPaused,
  currentStep,
  speed,
  onSpeedChange,
  trialRunsLeft,
  isTrialMode,
  onToggleTrialMode,
  onRun,
  onPause,
  onResume,
  onStep,
  onReset,
}) => {
  const currentList = activeRoutine === 'MAIN' ? program.main : activeRoutine === 'P1' ? program.p1 : program.p2;
  const currentCapacity = activeRoutine === 'MAIN' ? level.mainCapacity : activeRoutine === 'P1' ? level.p1Capacity : level.p2Capacity;

  // Calculate total used blocks across all routines
  let totalBlocks = program.main.length;
  if (level.hasP1) totalBlocks += program.p1.length;
  if (level.hasP2) totalBlocks += program.p2.length;

  const isUnderPar = totalBlocks <= level.parBlocks;

  const getCommandInfo = (cmd: CommandType) => {
    return COMMANDS.find((c) => c.type === cmd) || COMMANDS[0];
  };

  const handleSpeedToggle = () => {
    soundManager.playClick();
    if (speed === 1) onSpeedChange(2);
    else if (speed === 2) onSpeedChange(4);
    else onSpeedChange(1);
  };

  return (
    <div className="w-full flex flex-col gap-2 p-3 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-2xl">
      {/* Top Header: Routine Tabs & Par Counter */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSelectRoutine('MAIN')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer
              ${
                activeRoutine === 'MAIN'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/50'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700'
              }
            `}
          >
            <span>MAIN (โปรแกรมหลัก)</span>
            <span className="px-1.5 py-0.5 rounded-md bg-black/40 text-[11px] font-mono">
              {program.main.length}/{level.mainCapacity}
            </span>
          </button>

          {level.hasP1 && (
            <button
              type="button"
              onClick={() => onSelectRoutine('P1')}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer
                ${
                  activeRoutine === 'P1'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400/50'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700'
                }
              `}
            >
              <span>P1 (ฟังก์ชันย่อย 1)</span>
              <span className="px-1.5 py-0.5 rounded-md bg-black/40 text-[11px] font-mono">
                {program.p1.length}/{level.p1Capacity}
              </span>
            </button>
          )}

          {level.hasP2 && (
            <button
              type="button"
              onClick={() => onSelectRoutine('P2')}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer
                ${
                  activeRoutine === 'P2'
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30 border border-pink-400/50'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700'
                }
              `}
            >
              <span>P2 (ฟังก์ชันย่อย 2)</span>
              <span className="px-1.5 py-0.5 rounded-md bg-black/40 text-[11px] font-mono">
                {program.p2.length}/{level.p2Capacity}
              </span>
            </button>
          )}
        </div>

        {/* Par & Block Count Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border
              ${
                isUnderPar
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
              }
            `}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              จำนวนบล็อกรวม: <strong className="font-bold">{totalBlocks}</strong> (เป้า 3 ดาว: ≤ {level.parBlocks})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={isExecuting || currentList.length === 0}
              onClick={() => {
                soundManager.playClick();
                onUndoCommand(activeRoutine);
              }}
              title="ลบคำสั่งล่าสุด (Undo)"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:pointer-events-none cursor-pointer border border-slate-700"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={isExecuting || currentList.length === 0}
              onClick={() => {
                soundManager.playClick();
                onClearRoutine(activeRoutine);
              }}
              title="ล้างคำสั่งในช่องนี้ทั้งหมด"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-300 disabled:opacity-40 disabled:pointer-events-none cursor-pointer border border-slate-700"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Slots Container: Displays placed commands and empty capacity placeholders */}
      <div className="min-h-[72px] max-h-[140px] overflow-y-auto p-2 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-wrap gap-1.5 content-start">
        {currentList.length === 0 ? (
          <div className="w-full h-14 flex items-center justify-center text-xs text-slate-500 italic">
            ยังไม่มีบล็อกคำสั่งใน {activeRoutine} — คลิกคำสั่งจากแผงด้านล่างเพื่อเพิ่ม
          </div>
        ) : (
          currentList.map((cmd, idx) => {
            const info = getCommandInfo(cmd);
            const Icon = info.icon;
            const isActiveStep =
              isExecuting &&
              currentStep &&
              currentStep.subroutine === activeRoutine &&
              currentStep.subroutineIndex === idx;

            return (
              <div
                key={`${cmd}-${idx}`}
                onClick={() => {
                  if (!isExecuting) {
                    soundManager.playClick();
                    onRemoveCommand(activeRoutine, idx);
                  }
                }}
                className={`
                  group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold select-none
                  transition-all duration-150 cursor-pointer shadow-sm border
                  ${info.color} ${info.borderColor}
                  ${
                    isActiveStep
                      ? 'ring-2 ring-white scale-110 shadow-lg shadow-cyan-400/60 z-10 brightness-125'
                      : 'hover:brightness-110'
                  }
                `}
                title="คลิกเพื่อลบคำสั่งนี้"
              >
                <span className="text-[10px] font-mono opacity-60">#{idx + 1}</span>
                <Icon className="w-3.5 h-3.5" />
                <span>{info.label}</span>
                <span className="hidden group-hover:inline-block ml-0.5 text-xs text-red-200">×</span>
              </div>
            );
          })
        )}

        {/* Subtle empty capacity slots */}
        {Array.from({ length: Math.max(0, currentCapacity - currentList.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-10 h-8 rounded-lg border border-dashed border-slate-800/80 flex items-center justify-center text-[10px] font-mono text-slate-700 select-none"
          >
            {currentList.length + i + 1}
          </div>
        ))}
      </div>

      {/* Bottom Execution Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center flex-wrap gap-2">
          {/* Trial / Official Mode Toggle */}
          <button
            type="button"
            disabled={isExecuting || trialRunsLeft === 0}
            onClick={() => {
              soundManager.playClick();
              onToggleTrialMode();
            }}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer
              ${
                trialRunsLeft === 0
                  ? 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed opacity-60'
                  : isTrialMode
                  ? 'bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-md shadow-purple-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }
            `}
            title={trialRunsLeft > 0 ? 'สิทธิ์ทดลองรัน 1 ครั้งโดยไม่เริ่มจับเวลาแข่งขัน' : 'ใช้สิทธิ์ทดลองในด่านนี้แล้ว'}
          >
            <span>{isTrialMode ? '🧪 โหมดทดลอง (1 ครั้ง)' : '⚡ โหมดแข่งขันจริง'}</span>
            <span className="px-1.5 py-0.2 rounded-md bg-black/40 text-[10px] font-mono">
              {trialRunsLeft}/1
            </span>
          </button>

          {/* Run / Resume / Pause */}
          {!isExecuting || isPaused ? (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                if (isPaused) onResume();
                else onRun();
              }}
              disabled={program.main.length === 0}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-xs uppercase tracking-wider
                shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border
                ${
                  isTrialMode
                    ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/25 border-purple-400/50'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25 border-emerald-400/50'
                }
              `}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>
                {isPaused
                  ? 'เล่นต่อ'
                  : isTrialMode
                  ? 'ทดลองรัน (1 ครั้ง)'
                  : 'เริ่มทำงาน (Run แข่งจริง)'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onPause();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer border border-amber-400/50"
            >
              <Pause className="w-4 h-4" />
              <span>หยุดชั่วคราว</span>
            </button>
          )}

          {/* Step Button */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onStep();
            }}
            disabled={program.main.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700"
            title="ทำงานทีละ 1 คำสั่ง"
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>ทีละก้าว (Step)</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onReset();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all active:scale-95 cursor-pointer border border-slate-700"
            title="รีเซ็ตตำแหน่งหุ่นยนต์และเริ่มใหม่"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>เริ่มใหม่ (Reset)</span>
          </button>
        </div>

        {/* Speed Multiplier */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSpeedToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition-all cursor-pointer border border-slate-700"
            title="ปรับความเร็วการจำลอง"
          >
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>ความเร็ว: <strong className="text-cyan-400 font-bold">{speed}x</strong></span>
          </button>
        </div>
      </div>
    </div>
  );
};
