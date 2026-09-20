export type RunState = 'RUNNING' | 'GAME_OVER';
export type SpawnState = 'AIMING' | 'DROP_LOCKED';
export type DangerState = 'SAFE' | 'WARNING';
export type CatLifecycle = 'ACTIVE' | 'PENDING_CONSUME' | 'CONSUMED';

export interface Vec2 {
  x: number;
  y: number;
}

export interface CatRuntimeState {
  runtimeId: number;
  level: number;
  lifecycle: CatLifecycle;
  position: Vec2;
  spawnedAtStep: number;
}

export interface ContactPair {
  a: number;
  b: number;
}

export interface MergeCandidate {
  sourceA: number;
  sourceB: number;
  sourceLevel: number;
}

export interface MergeCommand extends MergeCandidate {
  resultLevel: number;
  resultPosition: Vec2;
}

export interface StepObservation {
  contacts: ContactPair[];
  dangerousCatIds: number[];
  spawnExclusionClear: boolean;
}

export interface RunResult {
  finalScore: number;
  highestLevel: number;
  reason: 'DANGER_TIMEOUT';
}

export type GameplayEvent =
  | { type: 'RunStarted'; runId: number }
  | { type: 'AimChanged'; x: number }
  | { type: 'CatReleased'; runtimeId: number; level: number; x: number }
  | { type: 'SpawnUnlocked' }
  | {
      type: 'CatMergeSucceeded';
      sourceIds: [number, number];
      sourceLevel: number;
      resultId: number;
      resultLevel: number;
      scoreDelta: number;
      position: Vec2;
    }
  | { type: 'ScoreChanged'; score: number; delta: number }
  | { type: 'HighestLevelChanged'; level: number }
  | { type: 'DangerStarted' }
  | { type: 'DangerCleared' }
  | { type: 'DangerProgress'; elapsed: number; timeout: number }
  | { type: 'GameOver'; result: RunResult };
