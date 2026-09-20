import type { CatRegistry } from './CatRegistry';
import type { ContactPair, MergeCandidate, MergeCommand } from './GameplayTypes';

export interface MergeResolution {
  eligibleCandidates: MergeCandidate[];
  selectedCommands: MergeCommand[];
  consumedSourceIds: number[];
}

function stablePairKey(a: number, b: number): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

export class MergeResolver {
  constructor(private readonly maxMergeLevel: number) {}

  resolve(registry: CatRegistry, contacts: ContactPair[]): MergeResolution {
    const deduped = new Map<string, MergeCandidate>();

    for (const contact of contacts) {
      if (contact.a === contact.b) continue;
      const a = registry.get(contact.a);
      const b = registry.get(contact.b);
      if (!a || !b) continue;
      if (a.lifecycle !== 'ACTIVE' || b.lifecycle !== 'ACTIVE') continue;
      if (a.level !== b.level) continue;
      if (a.level >= this.maxMergeLevel) continue;

      const sourceA = Math.min(a.runtimeId, b.runtimeId);
      const sourceB = Math.max(a.runtimeId, b.runtimeId);
      deduped.set(stablePairKey(sourceA, sourceB), {
        sourceA,
        sourceB,
        sourceLevel: a.level,
      });
    }

    const eligibleCandidates = [...deduped.values()].sort((left, right) => {
      if (left.sourceLevel !== right.sourceLevel) return right.sourceLevel - left.sourceLevel;
      if (left.sourceA !== right.sourceA) return left.sourceA - right.sourceA;
      return left.sourceB - right.sourceB;
    });

    const consumedThisStep = new Set<number>();
    const selectedCommands: MergeCommand[] = [];

    for (const candidate of eligibleCandidates) {
      if (consumedThisStep.has(candidate.sourceA) || consumedThisStep.has(candidate.sourceB)) {
        continue;
      }

      const a = registry.get(candidate.sourceA);
      const b = registry.get(candidate.sourceB);
      if (!a || !b || a.lifecycle !== 'ACTIVE' || b.lifecycle !== 'ACTIVE') continue;

      consumedThisStep.add(candidate.sourceA);
      consumedThisStep.add(candidate.sourceB);
      selectedCommands.push({
        ...candidate,
        resultLevel: candidate.sourceLevel + 1,
        resultPosition: {
          x: (a.position.x + b.position.x) / 2,
          y: (a.position.y + b.position.y) / 2,
        },
      });
    }

    return {
      eligibleCandidates,
      selectedCommands,
      consumedSourceIds: [...consumedThisStep].sort((a, b) => a - b),
    };
  }
}
