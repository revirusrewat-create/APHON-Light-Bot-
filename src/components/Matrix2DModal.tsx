/**
 * Lightbot Camp Studio 3D - CAMP_MATRIX_2D Tournament Leaderboard Modal
 * Requirements:
 * - "เวลาทีมใดดีที่สุด ชนะ" -> Ranked primarily by Best / Lowest Time!
 * - "มีระบบสรุปคะแนนใก้ดูง่ายที่สุดตัวใหญ่ชัดเจน" -> Giant bold text, large podium, high contrast.
 * - "ปรับออก เหลือชื่อทีมเท่านั้น" -> Only Team Name shown.
 * - Compatible with Google Sheets CSV export.
 */

import React, { useState } from 'react';
import {
  Trophy,
  Download,
  Copy,
  Check,
  X,
  PlusCircle,
  Medal,
  Timer,
  Table,
  Crown,
} from 'lucide-react';
import { GradeBracket, TeamScoreRecord } from '../game/types';
import { soundManager } from '../audio/soundManager';

interface Matrix2DModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamScores: TeamScoreRecord[];
  activeTeamId: string;
  onSelectTeam: (teamId: string) => void;
  onNewTeam: () => void;
}

export const Matrix2DModal: React.FC<Matrix2DModalProps> = ({
  isOpen,
  onClose,
  teamScores,
  activeTeamId,
  onSelectTeam,
  onNewTeam,
}) => {
  const [copied, setCopied] = useState(false);
  const [bracketFilter, setBracketFilter] = useState<'ALL' | GradeBracket>('ALL');

  if (!isOpen) return null;

  // Filter & sort teams:
  // "เวลาทีมใดดีที่สุด ชนะ" -> More stars/completed levels first, then LOWEST/FASTEST TIME wins!
  const filteredTeams = teamScores
    .filter((t) => bracketFilter === 'ALL' || t.gradeBracket === bracketFilter)
    .sort((a, b) => {
      // 1. More completed levels first
      const countA = Object.keys(a.levels).length;
      const countB = Object.keys(b.levels).length;
      if (countA !== countB) return countB - countA;

      // 2. More stars first
      if (a.totalStars !== b.totalStars) return b.totalStars - a.totalStars;

      // 3. BEST / LOWEST TIME WINS (เวลาทีมใดดีที่สุด ชนะ)
      return a.totalTime - b.totalTime;
    });

  const top1 = filteredTeams[0];
  const top2 = filteredTeams[1];
  const top3 = filteredTeams[2];

  const formatTime = (secs: number) => {
    if (!secs || secs === 0) return '00:00.0';
    const mins = Math.floor(secs / 60);
    const remSecs = (secs % 60).toFixed(1);
    return `${mins.toString().padStart(2, '0')}:${remSecs.padStart(4, '0')}`;
  };

  const handleExportCSV = () => {
    soundManager.playClick();
    const headers = [
      'Rank',
      'Team Name',
      'Grade Bracket',
      'Total Time (s)',
      'Total Stars',
      'Total Score',
      'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11', 'L12',
    ];

    const rows = filteredTeams.map((team, idx) => {
      const levelCols = Array.from({ length: 12 }, (_, i) => {
        const lvlRes = team.levels[i + 1];
        if (!lvlRes || !lvlRes.completed) return '—';
        return `${lvlRes.timeSeconds.toFixed(1)}s (${lvlRes.score}pts)`;
      });

      return [
        idx + 1,
        `"${team.teamName.replace(/"/g, '""')}"`,
        team.gradeBracket === 'G1_3' ? 'ป.1-3' : team.gradeBracket === 'G4_6' ? 'ป.4-6' : 'ม.1-3',
        team.totalTime.toFixed(1),
        team.totalStars,
        team.totalScore,
        ...levelCols,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CAMP_MATRIX_2D_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyJSON = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(JSON.stringify(teamScores, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[94vh] bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden text-slate-100 flex flex-col gap-4 my-auto">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/25 border border-yellow-300">
              <Trophy className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Chakra_Petch',sans-serif] flex items-center gap-2">
                <span>สรุปผลการแข่งขัน: CAMP_MATRIX_2D</span>
              </h2>
              <span className="text-xs sm:text-sm text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                <Timer className="w-4 h-4" />
                กติกาตัดสิน: ทีมที่ทำเวลาดีที่สุดคือผู้ชนะ (Fastest Time Champions!)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer border border-emerald-400/40"
              title="ดาวน์โหลดไฟล์ CSV สำหรับเปิดบน Google Sheets"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออก Google Sheets (CSV)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyJSON}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก JSON'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onNewTeam();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all cursor-pointer border border-cyan-400/40"
            >
              <PlusCircle className="w-4 h-4" />
              <span>ลงทะเบียนทีมใหม่</span>
            </button>

            <button
              type="button"
              aria-label="ปิดหน้าต่าง Matrix 2D"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* GIANT PODIUM / TOP 3 WINNERS CALLOUT (ตัวใหญ่ ชัดเจน ดูง่ายที่สุด) */}
        {top1 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1st Place Champion - BIGGEST */}
            <div className="sm:order-2 p-4 rounded-2xl bg-gradient-to-b from-amber-950/80 to-slate-900 border-2 border-amber-400/90 shadow-xl shadow-amber-500/20 flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase mb-1">
                <Crown className="w-3.5 h-3.5 fill-slate-950" />
                แชมป์เปี้ยนอันดับ 1
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white truncate max-w-full">
                {top1.teamName}
              </h3>
              <div className="font-mono text-3xl sm:text-4xl font-black text-amber-400 drop-shadow my-1">
                {formatTime(top1.totalTime)} <span className="text-sm font-semibold text-amber-200">วิ</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <span className="text-amber-300 font-bold">⭐ {top1.totalStars} ดาว</span>
                <span>•</span>
                <span className="font-mono text-yellow-300">{top1.totalScore.toLocaleString()} แต้ม</span>
              </div>
            </div>

            {/* 2nd Place */}
            {top2 ? (
              <div className="sm:order-1 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-400/60 flex flex-col items-center text-center justify-center">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-0.5">
                  <Medal className="w-3.5 h-3.5 text-slate-300" /> อันดับ 2
                </span>
                <h4 className="text-lg font-bold text-white truncate max-w-full">{top2.teamName}</h4>
                <div className="font-mono text-2xl font-black text-slate-200">
                  {formatTime(top2.totalTime)} <span className="text-xs font-semibold">วิ</span>
                </div>
                <span className="text-[11px] text-slate-400">⭐ {top2.totalStars} ดาว • {top2.totalScore.toLocaleString()} แต้ม</span>
              </div>
            ) : <div className="sm:order-1" />}

            {/* 3rd Place */}
            {top3 ? (
              <div className="sm:order-3 p-3.5 rounded-2xl bg-slate-950/80 border border-amber-700/60 flex flex-col items-center text-center justify-center">
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1 mb-0.5">
                  <Medal className="w-3.5 h-3.5 text-amber-500" /> อันดับ 3
                </span>
                <h4 className="text-lg font-bold text-white truncate max-w-full">{top3.teamName}</h4>
                <div className="font-mono text-2xl font-black text-amber-400">
                  {formatTime(top3.totalTime)} <span className="text-xs font-semibold">วิ</span>
                </div>
                <span className="text-[11px] text-slate-400">⭐ {top3.totalStars} ดาว • {top3.totalScore.toLocaleString()} แต้ม</span>
              </div>
            ) : <div className="sm:order-3" />}
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold">ช่วงชั้น:</span>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', label: 'ทั้งหมด' },
              { id: 'G1_3', label: 'ป.1–ป.3' },
              { id: 'G4_6', label: 'ป.4–ป.6 (คำถามวิทย์คำนวณ)' },
              { id: 'G7_9', label: 'ม.1–ม.3 (คำถามวิทย์คำนวณ)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBracketFilter(tab.id as 'ALL' | GradeBracket)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
                  bracketFilter === tab.id
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-500/25'
                    : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Matrix 2D Table Container with BIG, CLEAR TYPOGRAPHY */}
        <div className="w-full flex-1 overflow-x-auto overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/80 text-xs sm:text-sm shadow-inner max-h-[50vh]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-900 border-b-2 border-slate-800 text-slate-300 font-bold uppercase text-xs z-10">
              <tr>
                <th className="py-3 px-3 text-center min-w-[50px]">อันดับ</th>
                <th className="py-3 px-4 min-w-[150px]">ชื่อทีม</th>
                <th className="py-3 px-3 text-center min-w-[60px]">ช่วงชั้น</th>
                <th className="py-3 px-4 text-center text-emerald-400 min-w-[110px] bg-emerald-950/30">
                  ⏱️ เวลารวม (ตัดสิน)
                </th>
                <th className="py-3 px-3 text-center text-amber-400 min-w-[70px]">ดาว ⭐</th>
                <th className="py-3 px-3 text-right text-yellow-400 min-w-[90px]">คะแนนรวม</th>
                {Array.from({ length: 12 }, (_, i) => (
                  <th key={i} className="py-3 px-2 text-center min-w-[50px] font-mono">
                    L{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-sm">
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={18} className="py-10 text-center text-slate-500 italic text-base">
                    ยังไม่มีข้อมูลทีมในหมวดนี้ กรุณาลงทะเบียนทีมและเริ่มการแข่งขัน
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team, idx) => {
                  const isActive = team.teamId === activeTeamId;
                  return (
                    <tr
                      key={team.teamId}
                      className={`
                        transition-colors hover:bg-slate-800/50 cursor-pointer
                        ${isActive ? 'bg-cyan-950/50 ring-2 ring-cyan-500' : ''}
                      `}
                      onClick={() => onSelectTeam(team.teamId)}
                    >
                      <td className="py-3 px-3 text-center font-bold text-base">
                        {idx === 0 ? (
                          <span className="text-amber-400 font-black text-lg">🥇 1</span>
                        ) : idx === 1 ? (
                          <span className="text-slate-300 font-bold text-base">🥈 2</span>
                        ) : idx === 2 ? (
                          <span className="text-amber-600 font-bold text-base">🥉 3</span>
                        ) : (
                          <span className="text-slate-400 font-normal">#{idx + 1}</span>
                        )}
                      </td>

                      {/* Team Name Only */}
                      <td className="py-3 px-4 font-sans font-bold text-white text-base">
                        <div className="flex items-center gap-2">
                          <span>{team.teamName}</span>
                          {isActive && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-cyan-500 text-slate-950 font-black">
                              ทีมคุณ
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center font-sans">
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-slate-200">
                          {team.gradeBracket === 'G1_3' ? 'ป.1-3' : team.gradeBracket === 'G4_6' ? 'ป.4-6' : 'ม.1-3'}
                        </span>
                      </td>

                      {/* Total Time - HIGHLIGHTED */}
                      <td className="py-3 px-4 text-center font-bold text-emerald-400 text-base bg-emerald-950/20">
                        {formatTime(team.totalTime)}
                      </td>

                      <td className="py-3 px-3 text-center text-amber-400 font-black text-base">
                        {team.totalStars}
                      </td>

                      <td className="py-3 px-3 text-right font-extrabold text-yellow-400 text-base">
                        {team.totalScore.toLocaleString()}
                      </td>

                      {/* 12 Level Columns */}
                      {Array.from({ length: 12 }, (_, i) => {
                        const res = team.levels[i + 1];
                        if (!res || !res.completed) {
                          return (
                            <td key={i} className="py-3 px-2 text-center text-slate-700 text-xs">
                              —
                            </td>
                          );
                        }
                        return (
                          <td key={i} className="py-3 px-2 text-center">
                            <div className="flex flex-col items-center leading-tight">
                              <span className="text-[11px] text-amber-400 font-bold">
                                {'★'.repeat(res.stars)}
                              </span>
                              <span className="text-[10px] text-emerald-300 font-mono">
                                {res.timeSeconds.toFixed(1)}s
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span className="font-bold text-emerald-400">
            * เกณฑ์ตัดสินผู้ชนะ: เรียงตามจำนวนด่านและดาวที่ผ่าน และ "ทีมที่ทำเวลารวมน้อยที่สุด" เป็นแชมป์เปี้ยน
          </span>
          <span>CAMP_MATRIX_2D • Lightbot Camp Studio 3D</span>
        </div>
      </div>
    </div>
  );
};
