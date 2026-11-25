import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScore,
  executeProgram,
  getTurnLeftDirection,
  getTurnRightDirection,
} from './engine';
import { LEVELS } from './levels';
import { ProgramState } from './types';

test('Turning directions cycle correctly', () => {
  // 0: North, 1: East, 2: South, 3: West
  assert.equal(getTurnRightDirection(0), 1);
  assert.equal(getTurnRightDirection(1), 2);
  assert.equal(getTurnRightDirection(2), 3);
  assert.equal(getTurnRightDirection(3), 0);

  assert.equal(getTurnLeftDirection(0), 3);
  assert.equal(getTurnLeftDirection(3), 2);
  assert.equal(getTurnLeftDirection(2), 1);
  assert.equal(getTurnLeftDirection(1), 0);
});

test('Level 1: Forward movement and Light action successfully completes', () => {
  const level1 = LEVELS[0];
  const program: ProgramState = {
    main: ['FORWARD', 'FORWARD', 'LIGHT'],
    p1: [],
    p2: [],
  };

  const result = executeProgram(level1, program);
  assert.equal(result.success, true);
  assert.equal(result.allTargetsLit, true);
  assert.equal(result.litCount, 1);
  assert.equal(result.totalBlocksUsed, 3);
  assert.equal(result.steps.length, 3);
  assert.equal(result.steps[2].action, 'LIGHT_ON');
});

test('Level 1: Walking into void is blocked', () => {
  const level1 = LEVELS[0];
  const program: ProgramState = {
    main: ['FORWARD', 'FORWARD', 'FORWARD', 'FORWARD'],
    p1: [],
    p2: [],
  };

  const result = executeProgram(level1, program);
  assert.equal(result.success, false);
  const lastStep = result.steps[result.steps.length - 1];
  assert.equal(lastStep.action, 'BLOCKED');
});

test('Level 5: Jumping up height difference 1 succeeds, normal forward fails', () => {
  const level5 = LEVELS[4];
  // Walking forward without jump onto H.1 should be blocked
  const walkProgram: ProgramState = {
    main: ['FORWARD'],
    p1: [],
    p2: [],
  };
  const walkResult = executeProgram(level5, walkProgram);
  assert.equal(walkResult.steps[0].action, 'BLOCKED');

  // Jumping up should succeed
  const jumpProgram: ProgramState = {
    main: ['JUMP', 'LIGHT'],
    p1: [],
    p2: [],
  };
  const jumpResult = executeProgram(level5, jumpProgram);
  assert.equal(jumpResult.litCount, 1);
  assert.equal(jumpResult.steps[0].action, 'JUMP_UP');
  assert.equal(jumpResult.steps[1].action, 'LIGHT_ON');
});

test('Subroutine P1 executes and returns to main program', () => {
  const level6 = LEVELS[5];
  const program: ProgramState = {
    main: ['FORWARD', 'P1'],
    p1: ['TURN_LEFT', 'JUMP', 'LIGHT'],
    p2: [],
  };

  const result = executeProgram(level6, program);
  assert.ok(result.steps.length > 2);
  const p1Steps = result.steps.filter((s) => s.subroutine === 'P1');
  assert.equal(p1Steps.length, 3);
  assert.equal(p1Steps[0].command, 'TURN_LEFT');
  assert.equal(p1Steps[1].command, 'JUMP');
  assert.equal(p1Steps[2].command, 'LIGHT');
});

test('Scoring calculates base, block bonuses, and 3-star rating', () => {
  const scoreResult = calculateScore(
    true, // allTargetsLit
    2,    // litCount
    2,    // totalTargets
    5,    // usedBlocks
    6,    // parBlocks
    30,   // timeSeconds
    45    // parTimeSeconds
  );

  assert.ok(scoreResult.totalScore > 3000);
  assert.equal(scoreResult.stars, 3);
  assert.ok(scoreResult.breakdown.blockBonus > 0);
  assert.ok(scoreResult.breakdown.timeBonus > 0);
});

test('Level 5: Stepping onto quiz checkpoint tile triggers quiz gate', () => {
  const level5 = LEVELS[4];
  const program: ProgramState = {
    main: ['JUMP', 'FORWARD'],
    p1: [],
    p2: [],
  };

  const result = executeProgram(level5, program);
  const quizStep = result.steps.find((s) => s.triggersQuiz === true);
  assert.ok(quizStep !== undefined);
  assert.equal(quizStep.robotStateAfter.x, 3);
  assert.equal(quizStep.robotStateAfter.y, 1);
});

