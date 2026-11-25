/**
 * Lightbot Camp Studio 3D - Command Palette
 * Colorful, accessible command blocks with icons, tooltips, and click feedback.
 */

import React from 'react';
import {
  ArrowUp,
  RotateCcw,
  RotateCw,
  TrendingUp,
  Lightbulb,
  Boxes,
  Layers,
} from 'lucide-react';
import { CommandType, LevelConfig } from '../game/types';
import { soundManager } from '../audio/soundManager';

interface CommandPaletteProps {
  level: LevelConfig;
  onAddCommand: (cmd: CommandType) => void;
  disabled?: boolean;
}

interface CommandInfo {
  type: CommandType;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  hoverColor: string;
  borderColor: string;
  keyboardShortcut: string;
}

export const COMMANDS: CommandInfo[] = [
  {
    type: 'FORWARD',
    label: 'เดินหน้า',
    sublabel: 'Forward',
    icon: ArrowUp,
    color: 'bg-emerald-600/90 text-white',
    hoverColor: 'hover:bg-emerald-500 hover:shadow-emerald-500/30',
    borderColor: 'border-emerald-400/50',
    keyboardShortcut: 'W / ↑',
  },
  {
    type: 'TURN_LEFT',
    label: 'เลี้ยวซ้าย',
    sublabel: 'Left 90°',
    icon: RotateCcw,
    color: 'bg-indigo-600/90 text-white',
    hoverColor: 'hover:bg-indigo-500 hover:shadow-indigo-500/30',
    borderColor: 'border-indigo-400/50',
    keyboardShortcut: 'A / ←',
  },
  {
    type: 'TURN_RIGHT',
    label: 'เลี้ยวขวา',
    sublabel: 'Right 90°',
    icon: RotateCw,
    color: 'bg-indigo-600/90 text-white',
    hoverColor: 'hover:bg-indigo-500 hover:shadow-indigo-500/30',
    borderColor: 'border-indigo-400/50',
    keyboardShortcut: 'D / →',
  },
  {
    type: 'JUMP',
    label: 'กระโดด',
    sublabel: 'Jump (H±)',
    icon: TrendingUp,
    color: 'bg-amber-600/90 text-white',
    hoverColor: 'hover:bg-amber-500 hover:shadow-amber-500/30',
    borderColor: 'border-amber-400/50',
    keyboardShortcut: 'Space',
  },
  {
    type: 'LIGHT',
    label: 'เปิดไฟ',
    sublabel: 'Light Bulb',
    icon: Lightbulb,
    color: 'bg-cyan-600/90 text-white',
    hoverColor: 'hover:bg-cyan-500 hover:shadow-cyan-500/30',
    borderColor: 'border-cyan-400/50',
    keyboardShortcut: 'L',
  },
  {
    type: 'P1',
    label: 'เรียก P1',
    sublabel: 'Subroutine 1',
    icon: Boxes,
    color: 'bg-purple-600/90 text-white',
    hoverColor: 'hover:bg-purple-500 hover:shadow-purple-500/30',
    borderColor: 'border-purple-400/50',
    keyboardShortcut: '1',
  },
  {
    type: 'P2',
    label: 'เรียก P2',
    sublabel: 'Subroutine 2',
    icon: Layers,
    color: 'bg-pink-600/90 text-white',
    hoverColor: 'hover:bg-pink-500 hover:shadow-pink-500/30',
    borderColor: 'border-pink-400/50',
    keyboardShortcut: '2',
  },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  level,
  onAddCommand,
  disabled = false,
}) => {
  const availableCommands = COMMANDS.filter((cmd) => {
    if (cmd.type === 'P1') return level.hasP1;
    if (cmd.type === 'P2') return level.hasP2;
    return true;
  });

  const handleClick = (cmd: CommandType) => {
    if (disabled) return;
    soundManager.playClick();
    onAddCommand(cmd);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-xl">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1.5 border-r border-slate-700/60">
        <span>คลังคำสั่ง</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {availableCommands.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              type="button"
              disabled={disabled}
              onClick={() => handleClick(item.type)}
              title={`${item.label} (${item.sublabel}) - คีย์ลัด: ${item.keyboardShortcut}`}
              className={`
                group relative flex items-center gap-2 px-3 py-2 rounded-xl border font-medium text-sm
                transition-all duration-150 active:scale-95 shadow-md cursor-pointer
                disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
                ${item.color} ${item.borderColor} ${item.hoverColor}
              `}
            >
              <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              <div className="flex flex-col text-left leading-none">
                <span className="font-semibold text-xs">{item.label}</span>
                <span className="text-[10px] opacity-75 font-mono">{item.sublabel}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
