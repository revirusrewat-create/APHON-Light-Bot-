/**
 * Lightbot Camp Studio 3D - Main Application
 * Features:
 * - 12 Progressive Championship Levels
 *   - Level 1: ด่านทดลองง่ายๆ เพื่อทำความคุ้นเคย
 *   - Level 2+: กระบวนการคิด 2 ชั้น (Double-Layer Logic) และไต่ระดับความยากจนครบทุกด่าน
 * - สิทธิ์ทดลองรันง่ายๆ 1 ครั้งต่อด่าน (Single Trial Run: 1 ครั้งเท่านั้น)
 * - คำถามวิทยาการคำนวณสำหรับ ป.4 - ม.3 ระหว่างเดินผ่าน ตอบคำถาม 5 ตัวเลือกแล้วเดินต่อ พร้อมนับคะแนนตามความยากง่าย
 * - กติกาตัดสินผู้ชนะ: "เวลาทีมใดดีที่สุด ชนะ" (Fastest Time Wins!)
 * - ระบบสรุปคะแนนตัวใหญ่ชัดเจน ดูง่ายที่สุด
 * - ลงทะเบียนทีม: เหลือเฉพาะชื่อทีมเท่านั้น
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CommandType,
  ExecutionStep,
  LevelConfig,
  LevelResult,
  ProgramState,
  TeamProfile,
  TeamScoreRecord,
} from './game/types';
import { LEVELS } from './game/levels';
import {
  calculateScore,
  countUsedBlocks,
  executeProgram,
} from './game/engine';
import { QUIZ_QUESTIONS, QuizQuestion } from './game/quizQuestions';
import { soundManager } from './audio/soundManager';
import { ThreeCanvas, CameraPreset } from './components/ThreeCanvas';
import { TopHUD } from './components/TopHUD';
import { CommandPalette } from './components/CommandPalette';
import { ProgramEditor, RoutineType } from './components/ProgramEditor';
import { MissionBriefingModal } from './components/MissionBriefingModal';
import { VictoryModal } from './components/VictoryModal';
import { TeamRegistrationModal } from './components/TeamRegistrationModal';
import { Matrix2DModal } from './components/Matrix2DModal';
import { LevelSelectDrawer } from './components/LevelSelectDrawer';
import { QuizModal } from './components/QuizModal';

const STORAGE_KEY_TEAMS = 'lightbot_camp_teams_v2';
const STORAGE_KEY_ACTIVE_TEAM = 'lightbot_camp_active_team_v2';
const STORAGE_KEY_MATRIX = 'lightbot_camp_matrix_v2';

export default function App() {
  // Current Level
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const currentLevel: LevelConfig = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];

  // Team Registration & Management (Name Only)
  const [savedTeams, setSavedTeams] = useState<TeamProfile[]>([]);
  const [activeTeam, setActiveTeam] = useState<TeamProfile | null>(null);
  const [teamScores, setTeamScores] = useState<TeamScoreRecord[]>([]);

  // Modals & Drawers
  const [isTeamModalOpen, setIsTeamModalOpen] = useState<boolean>(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState<boolean>(false);
  const [isLevelDrawerOpen, setIsLevelDrawerOpen] = useState<boolean>(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState<boolean>(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState<boolean>(false);
  const [lastVictoryResult, setLastVictoryResult] = useState<LevelResult | null>(null);

  // Single Trial Run state (1 ครั้งต่อด่าน)
  const [trialRunsLeft, setTrialRunsLeft] = useState<number>(1);
  const [isTrialMode, setIsTrialMode] = useState<boolean>(true);
  const [trialSuccessNotice, setTrialSuccessNotice] = useState<boolean>(false);

  // Computing Science Quiz Checkpoint state (ป.4 - ม.3)
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const [quizPointsEarned, setQuizPointsEarned] = useState<number>(0);
  const [answeredQuizSteps, setAnsweredQuizSteps] = useState<Set<number>>(new Set());

  // Audio state
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Camera preset
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('ISO');

  // Fair Play Stopwatch
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Program State
  const [program, setProgram] = useState<ProgramState>({
    main: [],
    p1: [],
    p2: [],
  });
  const [activeRoutine, setActiveRoutine] = useState<RoutineType>('MAIN');

  // Execution Simulation State
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1); // 1x, 2x, 4x
  const [currentStep, setCurrentStep] = useState<ExecutionStep | null>(null);
  const [stepProgress, setStepProgress] = useState<number>(0);
  const [litTileCoordinates, setLitTileCoordinates] = useState<Array<{ x: number; y: number }>>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const executionStepsRef = useRef<ExecutionStep[]>([]);
  const stepIndexRef = useRef<number>(0);
  const animTimerRef = useRef<number | null>(null);

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const storedTeams = localStorage.getItem(STORAGE_KEY_TEAMS);
      const storedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_TEAM);
      const storedMatrix = localStorage.getItem(STORAGE_KEY_MATRIX);

      if (storedTeams) {
        const parsedTeams: TeamProfile[] = JSON.parse(storedTeams);
        setSavedTeams(parsedTeams);
        if (storedActiveId) {
          const match = parsedTeams.find((t) => t.id === storedActiveId);
          if (match) setActiveTeam(match);
        } else if (parsedTeams.length > 0) {
          setActiveTeam(parsedTeams[0]);
        }
        setIsBriefingOpen(true);
      } else {
        // First turn: prompt registration modal
        setIsTeamModalOpen(true);
      }

      if (storedMatrix) {
        setTeamScores(JSON.parse(storedMatrix));
      }
    } catch {
      // Fallback silently
    }
  }, []);

  // Sync active team score record
  const getActiveTeamScores = useCallback((): Record<number, LevelResult> => {
    if (!activeTeam) return {};
    const record = teamScores.find((r) => r.teamId === activeTeam.id);
    return record ? record.levels : {};
  }, [activeTeam, teamScores]);

  // Fair stopwatch timer interval
  useEffect(() => {
    let interval: number | null = null;
    if (timerRunning) {
      interval = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 0.1);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  // Handle switching level
  const handleSelectLevel = (levelId: number) => {
    setCurrentLevelId(levelId);
    handleReset();
    setElapsedSeconds(0);
    setTimerRunning(false);
    setTrialRunsLeft(1);
    setIsTrialMode(true);
    setTrialSuccessNotice(false);
    setQuizPointsEarned(0);
    setAnsweredQuizSteps(new Set());
    setIsBriefingOpen(true);
    setIsVictoryOpen(false);
  };

  // Start Fair Timer after reading briefing
  const handleStartTimer = () => {
    setIsBriefingOpen(false);
    // If starting in official competition mode, start timer
    if (!isTrialMode) {
      setTimerRunning(true);
    }
  };

  // Program editing handlers
  const handleAddCommand = (cmd: CommandType) => {
    if (isExecuting) return;

    setProgram((prev) => {
      const targetRoutine = activeRoutine === 'MAIN' ? 'main' : activeRoutine === 'P1' ? 'p1' : 'p2';
      const capacity =
        activeRoutine === 'MAIN'
          ? currentLevel.mainCapacity
          : activeRoutine === 'P1'
          ? currentLevel.p1Capacity
          : currentLevel.p2Capacity;

      if (prev[targetRoutine].length >= capacity) {
        soundManager.playBlocked();
        return prev;
      }

      return {
        ...prev,
        [targetRoutine]: [...prev[targetRoutine], cmd],
      };
    });
  };

  const handleRemoveCommand = (routine: RoutineType, index: number) => {
    if (isExecuting) return;
    setProgram((prev) => {
      const key = routine === 'MAIN' ? 'main' : routine === 'P1' ? 'p1' : 'p2';
      const updated = [...prev[key]];
      updated.splice(index, 1);
      return { ...prev, [key]: updated };
    });
  };

  const handleClearRoutine = (routine: RoutineType) => {
    if (isExecuting) return;
    soundManager.playClick();
    setProgram((prev) => {
      const key = routine === 'MAIN' ? 'main' : routine === 'P1' ? 'p1' : 'p2';
      return { ...prev, [key]: [] };
    });
  };

  const handleUndoCommand = (routine: RoutineType) => {
    if (isExecuting) return;
    setProgram((prev) => {
      const key = routine === 'MAIN' ? 'main' : routine === 'P1' ? 'p1' : 'p2';
      const updated = [...prev[key]];
      updated.pop();
      return { ...prev, [key]: updated };
    });
  };

  // Reset execution
  const handleReset = () => {
    if (animTimerRef.current) {
      window.clearInterval(animTimerRef.current);
      animTimerRef.current = null;
    }
    setIsExecuting(false);
    setIsPaused(false);
    setCurrentStep(null);
    setStepProgress(0);
    setLitTileCoordinates([]);
    setIsCompleted(false);
    setAnsweredQuizSteps(new Set());
    stepIndexRef.current = 0;
  };

  // Toggle trial mode
  const handleToggleTrialMode = () => {
    if (trialRunsLeft > 0) {
      setIsTrialMode((prev) => !prev);
    }
  };

  // Handle Level Victory and Record into CAMP_MATRIX_2D
  const handleLevelVictory = (usedBlocks: number) => {
    setTimerRunning(false);
    setIsCompleted(true);

    // If it was a Trial Run:
    if (isTrialMode) {
      setTrialSuccessNotice(true);
      setIsTrialMode(false); // Switch to official mode
      return;
    }

    // Official competition run: calculate score & best time
    const scoreData = calculateScore(
      true,
      currentLevel.tiles.filter((t) => t.isLightTarget).length,
      currentLevel.tiles.filter((t) => t.isLightTarget).length,
      usedBlocks,
      currentLevel.parBlocks,
      elapsedSeconds,
      currentLevel.parTimeSeconds,
      quizPointsEarned
    );

    const levelResult: LevelResult = {
      levelId: currentLevel.id,
      completed: true,
      score: scoreData.totalScore,
      stars: scoreData.stars,
      timeSeconds: elapsedSeconds,
      blocksUsed: usedBlocks,
      timestamp: Date.now(),
    };

    setLastVictoryResult(levelResult);
    setIsVictoryOpen(true);

    // Save to CAMP_MATRIX_2D with Best Time prioritization
    if (activeTeam) {
      setTeamScores((prevScores) => {
        const existingIdx = prevScores.findIndex((s) => s.teamId === activeTeam.id);
        const currentRecord = existingIdx >= 0 ? prevScores[existingIdx] : null;

        const updatedLevels = { ...(currentRecord?.levels || {}) };
        // If current time is faster, or no prior result, update it
        const prevResult = updatedLevels[currentLevel.id];
        if (!prevResult || levelResult.timeSeconds < prevResult.timeSeconds) {
          updatedLevels[currentLevel.id] = levelResult;
        }

        const allLevelsArr = Object.values(updatedLevels);
        const totalScore = allLevelsArr.reduce((sum, l) => sum + l.score, 0);
        const totalStars = allLevelsArr.reduce((sum, l) => sum + l.stars, 0);
        const totalTime = allLevelsArr.reduce((sum, l) => sum + l.timeSeconds, 0);
        const bestTime = Math.min(...allLevelsArr.map((l) => l.timeSeconds));

        const updatedTeamRecord: TeamScoreRecord = {
          teamId: activeTeam.id,
          teamName: activeTeam.name,
          gradeBracket: activeTeam.gradeBracket,
          levels: updatedLevels,
          completedCount: allLevelsArr.length,
          totalScore,
          totalStars,
          bestTime: isFinite(bestTime) ? bestTime : totalTime,
          totalTime,
        };

        let newRecords: TeamScoreRecord[];
        if (existingIdx >= 0) {
          newRecords = [...prevScores];
          newRecords[existingIdx] = updatedTeamRecord;
        } else {
          newRecords = [...prevScores, updatedTeamRecord];
        }

        try {
          localStorage.setItem(STORAGE_KEY_MATRIX, JSON.stringify(newRecords));
        } catch {
          // ignore
        }
        return newRecords;
      });
    }
  };

  // Play a single execution step
  const executeStepAt = (index: number, steps: ExecutionStep[]) => {
    if (index >= steps.length) {
      setIsExecuting(false);
      return;
    }

    const step = steps[index];
    setCurrentStep(step);
    setLitTileCoordinates(step.litTileCoordinates);

    // Check for Computing Science Quiz Checkpoint Trigger ("ระหว่างเดินผ่าน")
    if (
      step.triggersQuiz &&
      QUIZ_QUESTIONS[currentLevel.id] &&
      !answeredQuizSteps.has(currentLevel.id)
    ) {
      // Pause simulation
      if (animTimerRef.current) {
        clearInterval(animTimerRef.current);
        animTimerRef.current = null;
      }
      setIsPaused(true);
      setActiveQuiz(QUIZ_QUESTIONS[currentLevel.id]);
      setIsQuizModalOpen(true);
      return;
    }

    // Trigger procedural audio based on physical robot action
    switch (step.action) {
      case 'MOVE':
        soundManager.playStep();
        break;
      case 'TURN_L':
      case 'TURN_R':
        soundManager.playTurn();
        break;
      case 'JUMP_UP':
      case 'JUMP_DOWN':
        soundManager.playJump();
        break;
      case 'LIGHT_ON':
        soundManager.playLight();
        break;
      case 'BLOCKED':
        soundManager.playBlocked();
        break;
    }

    // Check for victory condition
    if (step.allTargetsLit && step.action === 'LIGHT_ON') {
      const usedBlocks = countUsedBlocks(program, currentLevel.hasP1, currentLevel.hasP2);
      handleLevelVictory(usedBlocks);
    }
  };

  // Handle Quiz Answer ("ตอบคำถามแล้วเดินต่อ")
  const handleQuizAnswer = (isCorrect: boolean, points: number) => {
    setAnsweredQuizSteps((prev) => new Set(prev).add(currentLevel.id));
    setIsQuizModalOpen(false);

    if (isCorrect) {
      setQuizPointsEarned((prev) => prev + points);
      // Time bonus: reduce elapsed seconds by 5s for fast computational thinking!
      setElapsedSeconds((prev) => Math.max(0, prev - 5.0));
    }

    // Continue program execution ("ตอบคำถามแล้วเดินต่อ")
    setIsPaused(false);
    resumeSimulation();
  };

  // Resume Simulation Loop
  const resumeSimulation = () => {
    const stepDurationMs = speed === 1 ? 400 : speed === 2 ? 220 : 110;
    const progressIntervalMs = 20;
    let currentProgress = stepProgress;
    const steps = executionStepsRef.current;

    animTimerRef.current = window.setInterval(() => {
      currentProgress += progressIntervalMs / stepDurationMs;

      if (currentProgress >= 1) {
        currentProgress = 0;
        stepIndexRef.current += 1;

        if (stepIndexRef.current < steps.length) {
          executeStepAt(stepIndexRef.current, steps);
        } else {
          if (animTimerRef.current) {
            clearInterval(animTimerRef.current);
            animTimerRef.current = null;
          }
          setIsExecuting(false);
        }
      }

      setStepProgress(Math.min(1, currentProgress));
    }, progressIntervalMs);
  };

  // Run Program simulation
  const handleRun = () => {
    if (program.main.length === 0) return;

    // If running in Trial Mode, consume trial run
    if (isTrialMode) {
      setTrialRunsLeft(0);
    } else {
      // Official run: make sure stopwatch is ticking
      if (!timerRunning) {
        setTimerRunning(true);
      }
    }

    const result = executeProgram(currentLevel, program);
    if (result.steps.length === 0) return;

    executionStepsRef.current = result.steps;
    stepIndexRef.current = 0;
    setIsExecuting(true);
    setIsPaused(false);
    setTrialSuccessNotice(false);

    const stepDurationMs = speed === 1 ? 400 : speed === 2 ? 220 : 110;
    const progressIntervalMs = 20;
    let currentProgress = 0;

    executeStepAt(0, result.steps);

    if (animTimerRef.current) clearInterval(animTimerRef.current);

    animTimerRef.current = window.setInterval(() => {
      currentProgress += progressIntervalMs / stepDurationMs;

      if (currentProgress >= 1) {
        currentProgress = 0;
        stepIndexRef.current += 1;

        if (stepIndexRef.current < result.steps.length) {
          executeStepAt(stepIndexRef.current, result.steps);
        } else {
          if (animTimerRef.current) {
            clearInterval(animTimerRef.current);
            animTimerRef.current = null;
          }
          setIsExecuting(false);
        }
      }

      setStepProgress(Math.min(1, currentProgress));
    }, progressIntervalMs);
  };

  // Pause Program
  const handlePause = () => {
    if (animTimerRef.current) {
      clearInterval(animTimerRef.current);
      animTimerRef.current = null;
    }
    setIsPaused(true);
  };

  // Resume Program
  const handleResume = () => {
    if (!isExecuting) return;
    setIsPaused(false);
    resumeSimulation();
  };

  // Step-by-step Execution
  const handleStep = () => {
    if (!isExecuting) {
      const result = executeProgram(currentLevel, program);
      if (result.steps.length === 0) return;
      executionStepsRef.current = result.steps;
      stepIndexRef.current = 0;
      setIsExecuting(true);
      setIsPaused(true);
      executeStepAt(0, result.steps);
      setStepProgress(1);
    } else {
      stepIndexRef.current += 1;
      const steps = executionStepsRef.current;
      if (stepIndexRef.current < steps.length) {
        executeStepAt(stepIndexRef.current, steps);
        setStepProgress(1);
      } else {
        setIsExecuting(false);
      }
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        handleAddCommand('FORWARD');
      } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        handleAddCommand('TURN_LEFT');
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        handleAddCommand('TURN_RIGHT');
      } else if (e.key === ' ') {
        e.preventDefault();
        handleAddCommand('JUMP');
      } else if (e.key === 'l' || e.key === 'L') {
        handleAddCommand('LIGHT');
      } else if (e.key === '1' && currentLevel.hasP1) {
        handleAddCommand('P1');
      } else if (e.key === '2' && currentLevel.hasP2) {
        handleAddCommand('P2');
      } else if (e.key === 'Enter') {
        if (!isExecuting) handleRun();
      } else if (e.key === 'Escape') {
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLevel, activeRoutine, isExecuting]);

  // Save Team (Name Only)
  const handleSaveTeam = (team: TeamProfile) => {
    setActiveTeam(team);
    setSavedTeams((prev) => {
      const filtered = prev.filter((t) => t.id !== team.id);
      const updated = [team, ...filtered];
      try {
        localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(updated));
        localStorage.setItem(STORAGE_KEY_ACTIVE_TEAM, team.id);
      } catch {
        // ignore
      }
      return updated;
    });
    setIsTeamModalOpen(false);
    setIsBriefingOpen(true);
  };

  // Select Saved Team
  const handleSelectTeam = (teamId: string) => {
    const target = savedTeams.find((t) => t.id === teamId);
    if (target) {
      setActiveTeam(target);
      localStorage.setItem(STORAGE_KEY_ACTIVE_TEAM, target.id);
    }
    setIsTeamModalOpen(false);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
  };

  const completedMap = getActiveTeamScores();

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-950 font-['Kanit',sans-serif] text-slate-100 select-none">
      {/* 1. Top HUD Header */}
      <TopHUD
        level={currentLevel}
        activeTeam={activeTeam}
        elapsedSeconds={elapsedSeconds}
        timerRunning={timerRunning}
        litCount={litTileCoordinates.length}
        totalTargets={currentLevel.tiles.filter((t) => t.isLightTarget).length}
        cameraPreset={cameraPreset}
        onCameraPresetChange={setCameraPreset}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenLevelDrawer={() => setIsLevelDrawerOpen(true)}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        onOpenMatrixModal={() => setIsMatrixModalOpen(true)}
      />

      {/* 2. Main 3D Viewport (Upper screen) */}
      <main className="relative flex-1 w-full h-full min-h-0 bg-slate-950 overflow-hidden">
        <ThreeCanvas
          level={currentLevel}
          currentStep={currentStep}
          stepProgress={stepProgress}
          litTileCoordinates={litTileCoordinates}
          isExecuting={isExecuting}
          isCompleted={isCompleted}
          cameraPreset={cameraPreset}
          onCameraPresetChange={setCameraPreset}
        />

        {/* Floating Mission Objective & Thinking Layer Badge (Top Left of 3D Scene) */}
        <div className="absolute top-3 left-4 pointer-events-none max-w-sm hidden sm:block">
          <div className="p-3.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-xl flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                {currentLevel.gradeLabel}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
                {currentLevel.thinkingLayer}
              </span>
            </div>
            <p className="text-xs text-slate-100 font-medium leading-snug">
              {currentLevel.objective}
            </p>
          </div>
        </div>

        {/* Trial Run Notification Banner if completed in trial mode */}
        {trialSuccessNotice && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 p-3.5 px-6 rounded-2xl bg-purple-950/95 border-2 border-purple-400/80 shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-xl">🧪</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">ทดลองรันสำเร็จ 1 ครั้งเรียบร้อย!</span>
              <span className="text-xs text-purple-200">
                พร้อมแล้ว! สถิติเวลาจริงจะเริ่มนับเมื่อกดปุ่ม <strong>"เริ่มทำงาน (Run แข่งจริง)"</strong>
              </span>
            </div>
          </div>
        )}

        {/* Camera Preset Quick Bar (Floating Bottom-Right of 3D Scene) */}
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5 p-1 bg-slate-900/85 backdrop-blur-md rounded-xl border border-slate-700/60 shadow-lg text-xs">
          <span className="text-[10px] text-slate-400 font-mono px-1.5">มุมกล้อง:</span>
          <button
            type="button"
            onClick={() => setCameraPreset('ISO')}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              cameraPreset === 'ISO' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D 45°
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('TOP_DOWN')}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              cameraPreset === 'TOP_DOWN' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            แปลน 90°
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('FOLLOW')}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              cameraPreset === 'FOLLOW' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            ติดตาม
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('FREE')}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              cameraPreset === 'FREE' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            หมุนอิสระ
          </button>
        </div>
      </main>

      {/* 3. Lower Command & Program Dock (Ergonomic, No Viewport Occlusion) */}
      <footer className="w-full flex flex-col gap-2 p-3 bg-slate-950/95 border-t border-slate-800 shadow-2xl z-20">
        <div className="max-w-5xl mx-auto w-full flex flex-col gap-2">
          {/* Program Editor (MAIN, P1, P2 slots, trial run toggle & controls) */}
          <ProgramEditor
            level={currentLevel}
            program={program}
            activeRoutine={activeRoutine}
            onSelectRoutine={setActiveRoutine}
            onRemoveCommand={handleRemoveCommand}
            onClearRoutine={handleClearRoutine}
            onUndoCommand={handleUndoCommand}
            isExecuting={isExecuting}
            isPaused={isPaused}
            currentStep={currentStep}
            speed={speed}
            onSpeedChange={setSpeed}
            trialRunsLeft={trialRunsLeft}
            isTrialMode={isTrialMode}
            onToggleTrialMode={handleToggleTrialMode}
            onRun={handleRun}
            onPause={handlePause}
            onResume={handleResume}
            onStep={handleStep}
            onReset={handleReset}
          />

          {/* Command Palette (Block Picker) */}
          <CommandPalette
            level={currentLevel}
            onAddCommand={handleAddCommand}
            disabled={isExecuting}
          />
        </div>
      </footer>

      {/* 4. Modals & Drawers */}
      {/* Mission Briefing Modal (Fair Play Timer Start) */}
      <MissionBriefingModal
        isOpen={isBriefingOpen}
        level={currentLevel}
        team={activeTeam}
        onStartTimer={handleStartTimer}
      />

      {/* Computing Science Quiz Modal (ป.4 - ม.3 ระหว่างเดินผ่าน ตอบคำถามแล้วเดินต่อ) */}
      <QuizModal
        isOpen={isQuizModalOpen}
        question={activeQuiz}
        onAnswer={handleQuizAnswer}
      />

      {/* Victory Celebration Modal (ตัวใหญ่ ชัดเจน ดูง่ายที่สุด) */}
      <VictoryModal
        isOpen={isVictoryOpen}
        level={currentLevel}
        team={activeTeam}
        result={lastVictoryResult}
        quizPointsEarned={quizPointsEarned}
        onNextLevel={() => {
          if (currentLevelId < 12) {
            handleSelectLevel(currentLevelId + 1);
          }
        }}
        onRetry={() => {
          setIsVictoryOpen(false);
          handleReset();
          setElapsedSeconds(0);
          setTimerRunning(false);
          setIsBriefingOpen(true);
        }}
        onViewMatrix={() => {
          setIsVictoryOpen(false);
          setIsMatrixModalOpen(true);
        }}
        hasNextLevel={currentLevelId < 12}
      />

      {/* Team Registration Modal (ชื่อทีมเท่านั้น) */}
      <TeamRegistrationModal
        isOpen={isTeamModalOpen}
        activeTeam={activeTeam}
        savedTeams={savedTeams}
        onSaveTeam={handleSaveTeam}
        onSelectTeam={handleSelectTeam}
        onClose={() => setIsTeamModalOpen(false)}
        canClose={activeTeam !== null}
      />

      {/* CAMP_MATRIX_2D Tournament Leaderboard Modal (เวลาทีมใดดีที่สุด ชนะ) */}
      <Matrix2DModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        teamScores={teamScores}
        activeTeamId={activeTeam?.id || ''}
        onSelectTeam={handleSelectTeam}
        onNewTeam={() => {
          setIsMatrixModalOpen(false);
          setIsTeamModalOpen(true);
        }}
      />

      {/* Level Select Drawer */}
      <LevelSelectDrawer
        isOpen={isLevelDrawerOpen}
        currentLevelId={currentLevelId}
        onSelectLevel={handleSelectLevel}
        onClose={() => setIsLevelDrawerOpen(false)}
        completedLevels={completedMap}
      />
    </div>
  );
}
