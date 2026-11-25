/**
 * Lightbot Camp Studio 3D - Types & Interfaces
 */

export type Direction = 0 | 1 | 2 | 3; // 0: North, 1: East, 2: South, 3: West

export type CommandType =
  | 'FORWARD'
  | 'TURN_LEFT'
  | 'TURN_RIGHT'
  | 'JUMP'
  | 'LIGHT'
  | 'P1'
  | 'P2';

export interface BoardTile {
  x: number;
  y: number;
  height: number; // 0, 1, 2, 3
  isLightTarget: boolean;
  isLit?: boolean;
  isQuizTrigger?: boolean;
}

export type GradeBracket = 'G1_3' | 'G4_6' | 'G7_9'; // ป.1-ป.3, ป.4-ป.6, ม.1-ม.3

export interface LevelConfig {
  id: number;
  name: string;
  gradeBracket: GradeBracket;
  gradeLabel: string;
  thinkingLayer: string; // e.g. 'ระดับเริ่มต้น 1 ชั้น', 'กระบวนการคิด 2 ชั้น', 'กระบวนการคิดหลายชั้น'
  description: string;
  objective: string;
  gridSize: { width: number; height: number };
  startPos: { x: number; y: number; height: number; direction: Direction };
  tiles: BoardTile[];
  mainCapacity: number;
  p1Capacity: number;
  p2Capacity: number;
  hasP1: boolean;
  hasP2: boolean;
  parBlocks: number;
  parTimeSeconds: number;
}

export interface RobotState {
  x: number;
  y: number;
  height: number;
  direction: Direction;
}

export interface ExecutionStep {
  stepIndex: number;
  command: CommandType;
  subroutine: 'MAIN' | 'P1' | 'P2';
  subroutineIndex: number;
  robotStateBefore: RobotState;
  robotStateAfter: RobotState;
  action: 'MOVE' | 'TURN_L' | 'TURN_R' | 'JUMP_UP' | 'JUMP_DOWN' | 'LIGHT_ON' | 'BLOCKED';
  litTileCoordinates: Array<{ x: number; y: number }>;
  allTargetsLit: boolean;
  triggersQuiz?: boolean;
  error?: string;
}

export interface ProgramState {
  main: CommandType[];
  p1: CommandType[];
  p2: CommandType[];
}

// Simplified TeamProfile: Team Name Only + Grade Bracket & Color
export interface TeamProfile {
  id: string;
  name: string; // ชื่อทีมเท่านั้น
  gradeBracket: GradeBracket;
  color: string;
  createdAt: number;
}

export interface LevelResult {
  levelId: number;
  completed: boolean;
  score: number;
  stars: number;
  timeSeconds: number;
  blocksUsed: number;
  timestamp: number;
}

export interface TeamScoreRecord {
  teamId: string;
  teamName: string;
  gradeBracket: GradeBracket;
  levels: Record<number, LevelResult>;
  completedCount: number;
  totalScore: number;
  totalStars: number;
  bestTime: number; // Lowest time among completed levels or total time
  totalTime: number;
}
