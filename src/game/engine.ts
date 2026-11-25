/**
 * Lightbot Camp Studio 3D - Pure Game Logic & Execution Engine
 * Decoupled from UI components for high performance, testability, and determinism.
 */

import {
  BoardTile,
  CommandType,
  Direction,
  ExecutionStep,
  LevelConfig,
  ProgramState,
  RobotState,
} from './types';

// Direction vectors: 0: North (+Y), 1: East (+X), 2: South (-Y), 3: West (-X)
export const DIRECTION_DELTAS: Record<Direction, { dx: number; dy: number }> = {
  0: { dx: 0, dy: 1 },  // North
  1: { dx: 1, dy: 0 },  // East
  2: { dx: 0, dy: -1 }, // South
  3: { dx: -1, dy: 0 }, // West
};

export function getTurnLeftDirection(current: Direction): Direction {
  return ((current + 3) % 4) as Direction;
}

export function getTurnRightDirection(current: Direction): Direction {
  return ((current + 1) % 4) as Direction;
}

export function findTile(
  tiles: BoardTile[],
  x: number,
  y: number
): BoardTile | undefined {
  return tiles.find((t) => t.x === x && t.y === y);
}

export interface EngineResult {
  steps: ExecutionStep[];
  success: boolean;
  litCount: number;
  totalTargets: number;
  allTargetsLit: boolean;
  totalBlocksUsed: number;
  terminatedReason: 'COMPLETED' | 'STEP_LIMIT' | 'STACK_OVERFLOW' | 'EMPTY_PROGRAM';
}

const MAX_STEPS = 1000;
const MAX_CALL_STACK = 50;

export function countUsedBlocks(program: ProgramState, hasP1: boolean, hasP2: boolean): number {
  let count = program.main.length;
  if (hasP1) count += program.p1.length;
  if (hasP2) count += program.p2.length;
  return count;
}

export function calculateScore(
  allTargetsLit: boolean,
  litCount: number,
  totalTargets: number,
  usedBlocks: number,
  parBlocks: number,
  timeSeconds: number,
  parTimeSeconds: number,
  quizBonusScore: number = 0
): { totalScore: number; stars: number; breakdown: { base: number; blockBonus: number; timeBonus: number; quizBonus: number } } {
  const base = litCount * 1000 + (allTargetsLit ? 1000 : 0);
  
  if (!allTargetsLit) {
    return {
      totalScore: base + quizBonusScore,
      stars: 0,
      breakdown: { base, blockBonus: 0, timeBonus: 0, quizBonus: quizBonusScore },
    };
  }

  // Block bonus: rewarding brevity below or at par
  const blockDifference = (parBlocks * 1.5) - usedBlocks;
  const blockBonus = Math.max(0, Math.round(blockDifference * 100));

  // Time bonus: rewarding speedy execution (Best time wins!)
  const timeDifference = (parTimeSeconds * 1.5) - timeSeconds;
  const timeBonus = Math.max(0, Math.round(timeDifference * 25));

  const totalScore = base + blockBonus + timeBonus + quizBonusScore;

  // Star rating criteria
  let stars = 1;
  if (usedBlocks <= parBlocks && timeSeconds <= parTimeSeconds) {
    stars = 3;
  } else if (usedBlocks <= Math.ceil(parBlocks * 1.3) || timeSeconds <= Math.ceil(parTimeSeconds * 1.3)) {
    stars = 2;
  }

  return {
    totalScore,
    stars,
    breakdown: {
      base,
      blockBonus,
      timeBonus,
      quizBonus: quizBonusScore,
    },
  };
}

export function executeProgram(
  level: LevelConfig,
  program: ProgramState
): EngineResult {
  const usedBlocks = countUsedBlocks(program, level.hasP1, level.hasP2);
  const targetTiles = level.tiles.filter((t) => t.isLightTarget);
  const totalTargets = targetTiles.length;

  if (program.main.length === 0) {
    return {
      steps: [],
      success: false,
      litCount: 0,
      totalTargets,
      allTargetsLit: false,
      totalBlocksUsed: usedBlocks,
      terminatedReason: 'EMPTY_PROGRAM',
    };
  }

  let robot: RobotState = { ...level.startPos };
  const litTileKeys = new Set<string>();

  const steps: ExecutionStep[] = [];
  
  // Call stack structure
  interface StackFrame {
    subroutine: 'MAIN' | 'P1' | 'P2';
    pc: number; // program counter index
  }

  const callStack: StackFrame[] = [{ subroutine: 'MAIN', pc: 0 }];
  let stepCounter = 0;
  let terminatedReason: EngineResult['terminatedReason'] = 'COMPLETED';

  while (callStack.length > 0) {
    if (stepCounter >= MAX_STEPS) {
      terminatedReason = 'STEP_LIMIT';
      break;
    }

    const frame = callStack[callStack.length - 1];
    const routine = frame.subroutine === 'MAIN' ? program.main : frame.subroutine === 'P1' ? program.p1 : program.p2;

    if (frame.pc >= routine.length) {
      callStack.pop();
      continue;
    }

    const cmd = routine[frame.pc];
    const subroutineIndex = frame.pc;
    frame.pc++; // Advance instruction pointer for current frame

    const beforeState: RobotState = { ...robot };
    let afterState: RobotState = { ...robot };
    let action: ExecutionStep['action'] = 'MOVE';
    let stepError: string | undefined = undefined;

    switch (cmd) {
      case 'FORWARD': {
        const delta = DIRECTION_DELTAS[robot.direction];
        const nx = robot.x + delta.dx;
        const ny = robot.y + delta.dy;
        const targetTile = findTile(level.tiles, nx, ny);

        if (targetTile && targetTile.height === robot.height) {
          afterState = {
            ...robot,
            x: nx,
            y: ny,
          };
          robot = afterState;
          action = 'MOVE';
        } else {
          // Blocked: cannot walk across differing heights or into the void
          action = 'BLOCKED';
          stepError = targetTile
            ? `ไม่สามารถเดินไปยังความสูงระดับ ${targetTile.height} จากระดับ ${robot.height} ได้ (ต้องใช้คำสั่งกระโดด)`
            : 'ไม่สามารถเดินตกขอบสนามได้';
        }
        break;
      }

      case 'TURN_LEFT': {
        const newDir = getTurnLeftDirection(robot.direction);
        afterState = { ...robot, direction: newDir };
        robot = afterState;
        action = 'TURN_L';
        break;
      }

      case 'TURN_RIGHT': {
        const newDir = getTurnRightDirection(robot.direction);
        afterState = { ...robot, direction: newDir };
        robot = afterState;
        action = 'TURN_R';
        break;
      }

      case 'JUMP': {
        const delta = DIRECTION_DELTAS[robot.direction];
        const nx = robot.x + delta.dx;
        const ny = robot.y + delta.dy;
        const targetTile = findTile(level.tiles, nx, ny);

        if (!targetTile) {
          action = 'BLOCKED';
          stepError = 'ไม่สามารถกระโดดตกขอบสนามได้';
        } else if (targetTile.height === robot.height + 1) {
          // Jump UP 1 height unit
          afterState = {
            ...robot,
            x: nx,
            y: ny,
            height: targetTile.height,
          };
          robot = afterState;
          action = 'JUMP_UP';
        } else if (targetTile.height < robot.height) {
          // Jump DOWN to lower platform
          afterState = {
            ...robot,
            x: nx,
            y: ny,
            height: targetTile.height,
          };
          robot = afterState;
          action = 'JUMP_DOWN';
        } else {
          // Cannot jump: flat ground requires walk, or height difference > 1
          action = 'BLOCKED';
          stepError = targetTile.height === robot.height
            ? 'พื้นระดับเดียวกันไม่ต้องกระโดด ให้ใช้คำสั่งเดินหน้า'
            : `ความสูงต่างกันมากเกินไป (จากระดับ ${robot.height} ไป ${targetTile.height})`;
        }
        break;
      }

      case 'LIGHT': {
        const currentTile = findTile(level.tiles, robot.x, robot.y);
        const tileKey = `${robot.x},${robot.y}`;

        if (currentTile && currentTile.isLightTarget) {
          if (litTileKeys.has(tileKey)) {
            litTileKeys.delete(tileKey);
          } else {
            litTileKeys.add(tileKey);
          }
          action = 'LIGHT_ON';
        } else {
          action = 'BLOCKED';
          stepError = 'ช่องนี้ไม่ใช่จุดเป้าหมายเปิดไฟ';
        }
        break;
      }

      case 'P1': {
        if (!level.hasP1 || program.p1.length === 0) {
          action = 'BLOCKED';
          stepError = 'ฟังก์ชัน P1 ยังว่างอยู่';
        } else if (callStack.length >= MAX_CALL_STACK) {
          terminatedReason = 'STACK_OVERFLOW';
          action = 'BLOCKED';
          stepError = 'การเรียกฟังก์ชันซ้อนกันลึกเกินไป (Stack Overflow)';
        } else {
          callStack.push({ subroutine: 'P1', pc: 0 });
          // Note: P1 call is a control-flow jump, recorded as step
          action = 'MOVE';
        }
        break;
      }

      case 'P2': {
        if (!level.hasP2 || program.p2.length === 0) {
          action = 'BLOCKED';
          stepError = 'ฟังก์ชัน P2 ยังว่างอยู่';
        } else if (callStack.length >= MAX_CALL_STACK) {
          terminatedReason = 'STACK_OVERFLOW';
          action = 'BLOCKED';
          stepError = 'การเรียกฟังก์ชันซ้อนกันลึกเกินไป (Stack Overflow)';
        } else {
          callStack.push({ subroutine: 'P2', pc: 0 });
          action = 'MOVE';
        }
        break;
      }
    }

    const currentLitCoords = Array.from(litTileKeys).map((k) => {
      const [x, y] = k.split(',').map(Number);
      return { x, y };
    });

    const allTargetsLit = targetTiles.length > 0 && targetTiles.every((t) => litTileKeys.has(`${t.x},${t.y}`));

    const targetTileAfter = findTile(level.tiles, afterState.x, afterState.y);
    const triggersQuiz =
      (action === 'MOVE' || action === 'JUMP_UP' || action === 'JUMP_DOWN') &&
      Boolean(targetTileAfter?.isQuizTrigger);

    steps.push({
      stepIndex: stepCounter++,
      command: cmd,
      subroutine: frame.subroutine,
      subroutineIndex,
      robotStateBefore: beforeState,
      robotStateAfter: afterState,
      action,
      litTileCoordinates: currentLitCoords,
      allTargetsLit,
      triggersQuiz,
      error: stepError,
    });

    // If all targets are lit and we successfully reached victory
    if (allTargetsLit && action === 'LIGHT_ON') {
      // Mission accomplished!
      break;
    }

    if (terminatedReason === 'STACK_OVERFLOW') {
      break;
    }
  }

  const finalLitCount = litTileKeys.size;
  const finalAllLit = targetTiles.length > 0 && targetTiles.every((t) => litTileKeys.has(`${t.x},${t.y}`));

  return {
    steps,
    success: finalAllLit,
    litCount: finalLitCount,
    totalTargets,
    allTargetsLit: finalAllLit,
    totalBlocksUsed: usedBlocks,
    terminatedReason,
  };
}
