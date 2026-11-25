/**
 * Lightbot Camp Studio 3D - Top HUD Navigation Bar
 * Displays level metadata, fair stopwatch, camera presets, audio toggle, and team status.
 */

import React from 'react';
import {
  Volume2,
  VolumeX,
  Trophy,
  Users,
  Compass,
  Eye,
  Camera,
  Layers,
  Sparkles,
  Timer,
  Lightbulb,
} from 'lucide-react';
import { LevelConfig, TeamProfile } from '../game/types';
import { CameraPreset } from './ThreeCanvas';
import { soundManager } from '../audio/soundManager';

interface TopHUDProps {
  level: LevelConfig;
  activeTeam: TeamProfile | null;
  elapsedSeconds: number;
  timerRunning: boolean;
  litCount: number;
  totalTargets: number;
  cameraPreset: CameraPreset;
  onCameraPresetChange: (preset: CameraPreset) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLevelDrawer: () => void;
  onOpenTeamModal: () => void;
  onOpenMatrixModal: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  level,
  activeTeam,
  elapsedSeconds,
  timerRunning,
  litCount,
  totalTargets,
  cameraPreset,
  onCameraPresetChange,
  isMuted,
  onToggleMute,
  onOpenLevelDrawer,
  onOpenTeamModal,
  onOpenMatrixModal,
}) => {
  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  const getGradeBadgeColor = (grade: string) => {
    if (grade.includes('ป.1')) return 'bg-sky-500/20 text-sky-300 border-sky-400/40';
    if (grade.includes('ป.4')) return 'bg-amber-500/20 text-amber-300 border-amber-400/40';
    return 'bg-purple-500/20 text-purple-300 border-purple-400/40';
  };

  return (
    <header className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg select-none z-20">
      {/* Left: Brand & Level Navigator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-md shadow-cyan-500/20 border border-cyan-400/40">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-sm leading-tight text-white tracking-wide font-['Chakra_Petch',sans-serif]">
              LIGHTBOT CAMP 3D
            </h1>
            <span className="text-[10px] text-cyan-400 font-medium">STUDIO EDITION</span>
          </div>
        </div>

        {/* Level Switcher Button */}
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onOpenLevelDrawer();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 transition-all cursor-pointer shadow-sm group"
        >
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getGradeBadgeColor(level.gradeLabel)}`}>
            {level.gradeLabel}
          </span>
          <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
            {level.name}
          </span>
          <Layers className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 ml-1 transition-colors" />
        </button>
      </div>

      {/* Center: Fair Stopwatch & Objectives */}
      <div className="flex items-center gap-3">
        {/* Fair Stopwatch */}
        <div
          className={`
            flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-xs shadow-inner transition-colors
            ${
              timerRunning
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }
          `}
          title={timerRunning ? 'ตัวจับเวลากำลังทำงาน' : 'เวลารอเริ่ม (กดอ่านคำสั่งจบเพื่อเริ่ม)'}
        >
          <Timer className={`w-4 h-4 ${timerRunning ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="font-bold text-sm tracking-wider">{formatTime(elapsedSeconds)}</span>
          <span className="text-[10px] opacity-75">{timerRunning ? 'กำลังแข่ง' : 'รอเริ่ม'}</span>
        </div>

        {/* Light Targets Progress */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-medium">
          <Lightbulb className={`w-4 h-4 ${litCount === totalTargets && totalTargets > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-400'}`} />
          <span>
            เป้าหมาย: <strong className="font-bold text-cyan-300">{litCount}</strong> / {totalTargets} จุด
          </span>
        </div>
      </div>

      {/* Right: Camera Presets, Audio Toggle, Team Info & Matrix 2D */}
      <div className="flex items-center gap-2">
        {/* Camera View Switcher Buttons */}
        <div className="flex items-center p-0.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onCameraPresetChange('ISO');
            }}
            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              cameraPreset === 'ISO' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="มุมมอง 3D ไอโซเมตริก (45°)"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onCameraPresetChange('TOP_DOWN');
            }}
            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              cameraPreset === 'TOP_DOWN' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="มุมมองแปลนด้านบน (Top-Down 90°)"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onCameraPresetChange('FOLLOW');
            }}
            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              cameraPreset === 'FOLLOW' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="มุมมองติดตามหลังหุ่นยนต์ (Follow Cam)"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Audio Mute/Unmute */}
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onToggleMute();
          }}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
          title={isMuted ? 'เปิดเสียงเอฟเฟกต์' : 'ปิดเสียงเอฟเฟกต์'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Active Team Badge / Register button */}
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onOpenTeamModal();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span className="max-w-[110px] truncate text-slate-200">
            {activeTeam ? activeTeam.name : 'ลงชื่อทีม'}
          </span>
        </button>

        {/* Matrix 2D & Leaderboard button */}
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onOpenMatrixModal();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          title="ดูกระดานคะแนนรวม CAMP_MATRIX_2D และตารางผู้นำ"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Matrix 2D</span>
        </button>
      </div>
    </header>
  );
};
