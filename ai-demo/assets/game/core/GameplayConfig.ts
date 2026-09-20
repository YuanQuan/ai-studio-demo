export interface CatLevelConfig {
  level: number;
  diameterRatio: number;
  spawnWeight: number;
  mergeScore: number;
  massScale: number;
  restitution: number;
  friction: number;
  linearDamping: number;
  angularDamping: number;
}

export interface GameplayRulesConfig {
  fixedStepHz: number;
  minDropLockSec: number;
  dangerLineRatio: number;
  dangerTimeoutSec: number;
  maxDirectSpawnLevel: number;
  maxMergeLevel: number;
}

export interface GameplayConfig {
  levels: CatLevelConfig[];
  rules: GameplayRulesConfig;
}

const APPROVED_DIAMETERS = [0.09, 0.105, 0.125, 0.145, 0.17, 0.195, 0.225, 0.26, 0.3, 0.35];
const APPROVED_RESULT_SCORES = [0, 10, 20, 40, 80, 160, 320, 640, 1280, 2560];

export const DEFAULT_GAMEPLAY_CONFIG: GameplayConfig = {
  levels: APPROVED_DIAMETERS.map((diameterRatio, index) => {
    const level = index + 1;
    return {
      level,
      diameterRatio,
      spawnWeight: level <= 3 ? (level === 3 ? 0.3334 : 0.3333) : 0,
      mergeScore: APPROVED_RESULT_SCORES[index],
      massScale: 1,
      restitution: 0.05,
      friction: 0.45,
      linearDamping: 0.1,
      angularDamping: 0.1,
    };
  }),
  rules: {
    fixedStepHz: 60,
    minDropLockSec: 0.25,
    dangerLineRatio: 0.82,
    dangerTimeoutSec: 2,
    maxDirectSpawnLevel: 3,
    maxMergeLevel: 10,
  },
};

export function cloneGameplayConfig(config: GameplayConfig = DEFAULT_GAMEPLAY_CONFIG): GameplayConfig {
  return {
    rules: { ...config.rules },
    levels: config.levels.map((level) => ({ ...level })),
  };
}

export function validateGameplayConfig(config: GameplayConfig): void {
  const { rules, levels } = config;

  if (!Number.isInteger(rules.fixedStepHz) || rules.fixedStepHz <= 0) {
    throw new Error('fixedStepHz 必须为正整数');
  }
  if (rules.minDropLockSec < 0) throw new Error('minDropLockSec 不能为负数');
  if (!(rules.dangerLineRatio > 0 && rules.dangerLineRatio < 1)) {
    throw new Error('dangerLineRatio 必须位于 0 与 1 之间');
  }
  if (rules.dangerTimeoutSec <= 0) throw new Error('dangerTimeoutSec 必须大于 0');
  if (!Number.isInteger(rules.maxDirectSpawnLevel) || rules.maxDirectSpawnLevel < 1) {
    throw new Error('maxDirectSpawnLevel 必须为正整数');
  }
  if (!Number.isInteger(rules.maxMergeLevel) || rules.maxMergeLevel < 2) {
    throw new Error('maxMergeLevel 必须至少为 2');
  }
  if (levels.length !== rules.maxMergeLevel) {
    throw new Error('level 行数必须与 maxMergeLevel 一致');
  }

  let previousDiameter = 0;
  let totalSpawnWeight = 0;
  const seen = new Set<number>();

  for (const row of levels) {
    if (!Number.isInteger(row.level) || row.level < 1 || row.level > rules.maxMergeLevel) {
      throw new Error(`非法 level: ${row.level}`);
    }
    if (seen.has(row.level)) throw new Error(`重复 level: ${row.level}`);
    seen.add(row.level);
    if (row.diameterRatio <= previousDiameter) {
      throw new Error(`diameterRatio 必须严格递增，level=${row.level}`);
    }
    previousDiameter = row.diameterRatio;
    if (row.spawnWeight < 0) throw new Error(`spawnWeight 不能为负数，level=${row.level}`);
    if (row.level > rules.maxDirectSpawnLevel && row.spawnWeight > 0) {
      throw new Error(`超过直接投放上限的 level 不能有正 spawnWeight，level=${row.level}`);
    }
    if (row.mergeScore < 0) throw new Error(`mergeScore 不能为负数，level=${row.level}`);
    if (row.massScale <= 0) throw new Error(`massScale 必须大于 0，level=${row.level}`);
    if (row.restitution < 0 || row.restitution > 1) {
      throw new Error(`restitution 必须位于 0..1，level=${row.level}`);
    }
    if (row.friction < 0 || row.linearDamping < 0 || row.angularDamping < 0) {
      throw new Error(`物理调优字段不能为负数，level=${row.level}`);
    }
    if (row.level <= rules.maxDirectSpawnLevel) totalSpawnWeight += row.spawnWeight;
  }

  for (let level = 1; level <= rules.maxMergeLevel; level += 1) {
    if (!seen.has(level)) throw new Error(`缺少 level=${level}`);
  }
  if (totalSpawnWeight <= 0) throw new Error('直接投放池总权重必须大于 0');
}

export function getLevelConfig(config: GameplayConfig, level: number): CatLevelConfig {
  const row = config.levels[level - 1];
  if (!row || row.level !== level) throw new Error(`找不到 level=${level} 配置`);
  return row;
}

export function getFixedDt(config: GameplayConfig): number {
  return 1 / config.rules.fixedStepHz;
}
