/**
 * Lightbot Camp Studio 3D - Computing Science (วิทยาการคำนวณ) Quiz Modal
 * Requirements:
 * - 5 multiple-choice options (ตัวเลือก 5 ข้อ)
 * - Graded score & time bonus based on difficulty
 * - Pauses execution when walking past checkpoint tile, resumes after answering ("ตอบคำถามแล้วเดินต่อ")
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle,
  XCircle,
  ArrowRight,
  BrainCircuit,
  Zap,
} from 'lucide-react';
import { QuizQuestion } from '../game/quizQuestions';
import { soundManager } from '../audio/soundManager';

interface QuizModalProps {
  isOpen: boolean;
  question: QuizQuestion | null;
  onAnswer: (isCorrect: boolean, points: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  question,
  onAnswer,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  if (!isOpen || !question) return null;

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedIndex(index);
    setIsAnswered(true);

    const isCorrect = index === question.correctIndex;
    if (isCorrect) {
      soundManager.playLight(); // Happy high chime
    } else {
      soundManager.playBlocked(); // Error buzzer
    }
  };

  const handleContinue = () => {
    soundManager.playClick();
    const isCorrect = selectedIndex === question.correctIndex;
    const awardedPoints = isCorrect ? question.points : 0;
    
    // Reset state for next time
    setSelectedIndex(null);
    setIsAnswered(false);

    // Continue program execution ("ตอบคำถามแล้วเดินต่อ")
    onAnswer(isCorrect, awardedPoints);
  };

  const isCorrect = selectedIndex === question.correctIndex;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in zoom-in-95 duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-purple-500/60 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden text-slate-100 flex flex-col gap-5 my-auto">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-400/50 text-purple-300 shadow-lg shadow-purple-500/20">
              <BrainCircuit className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
                  วิทยาการคำนวณ {question.gradeLabel}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                  ความยาก: {question.difficulty} (+{question.points} แต้ม)
                </span>
              </div>
              <h2 className="text-lg font-bold text-white font-['Chakra_Petch',sans-serif]">
                จุดตรวจความคิด: {question.topic}
              </h2>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-cyan-300">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>ตอบถูกลดเวลา 5 วินาที!</span>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-100">
          <p className="text-base sm:text-lg font-semibold leading-relaxed">
            {question.question}
          </p>
        </div>

        {/* 5 Multiple Choice Options (ก, ข, ค, ง, จ) */}
        <div className="flex flex-col gap-2.5">
          {question.options.map((option, idx) => {
            let optionStyles = 'bg-slate-950/70 border-slate-800 hover:border-purple-500/60 hover:bg-slate-800/60 text-slate-200';

            if (isAnswered) {
              if (idx === question.correctIndex) {
                optionStyles = 'bg-emerald-950/80 border-emerald-400 text-emerald-200 font-bold shadow-lg shadow-emerald-500/20 scale-[1.01]';
              } else if (idx === selectedIndex) {
                optionStyles = 'bg-rose-950/80 border-rose-500 text-rose-200 line-through';
              } else {
                optionStyles = 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`
                  w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 cursor-pointer
                  flex items-center justify-between gap-3 text-sm sm:text-base font-medium select-none
                  disabled:cursor-default
                  ${optionStyles}
                `}
              >
                <span>{option}</span>
                {isAnswered && idx === question.correctIndex && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {isAnswered && idx === selectedIndex && idx !== question.correctIndex && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback & Continue Action */}
        {isAnswered && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 flex flex-col gap-3 p-4 rounded-2xl bg-slate-950/90 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-base sm:text-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span>ถูกต้องยอดเยี่ยม! รับ +{question.points} แต้ม และลดเวลา 5 วินาที</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-base sm:text-lg">
                    <HelpCircle className="w-5 h-5" />
                    <span>คำตอบที่ถูกต้องคือ {question.options[question.correctIndex].slice(0, 2)}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              💡 สรุปความรู้: {question.explanation}
            </p>

            {/* Continue walking button */}
            <button
              type="button"
              autoFocus
              onClick={handleContinue}
              className="w-full mt-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-400/40"
            >
              <span>ตอบคำถามเรียบร้อย & เดินหน้าต่อ</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
