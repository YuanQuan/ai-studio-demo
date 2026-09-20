import type { MergeCandidate, MergeCommand } from '../core/GameplayTypes';

export interface DebugStepRecord {
  step: number;
  activeCatIds: number[];
  spawnState: string;
  dropLockedElapsed: number;
  dangerState: string;
  dangerElapsed: number;
}

export interface DebugMergeRecord {
  step: number;
  candidates: MergeCandidate[];
  selected: MergeCommand[];
  consumedIds: number[];
}

export class DebugHarness {
  private readonly steps: DebugStepRecord[] = [];
  private readonly merges: DebugMergeRecord[] = [];
  private readonly messages: string[] = [];

  recordStep(record: DebugStepRecord): void {
    this.steps.push({ ...record, activeCatIds: [...record.activeCatIds] });
  }

  recordMerge(record: DebugMergeRecord): void {
    this.merges.push({
      step: record.step,
      candidates: record.candidates.map((candidate) => ({ ...candidate })),
      selected: record.selected.map((command) => ({
        ...command,
        resultPosition: { ...command.resultPosition },
      })),
      consumedIds: [...record.consumedIds],
    });
  }

  log(message: string): void {
    this.messages.push(message);
  }

  getStepRecords(): readonly DebugStepRecord[] {
    return this.steps;
  }

  getMergeRecords(): readonly DebugMergeRecord[] {
    return this.merges;
  }

  getMessages(): readonly string[] {
    return this.messages;
  }

  clear(): void {
    this.steps.length = 0;
    this.merges.length = 0;
    this.messages.length = 0;
  }
}
