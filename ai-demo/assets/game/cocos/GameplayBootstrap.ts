import {
  _decorator,
  Color,
  Component,
  EventMouse,
  EventTouch,
  Game,
  game,
  Graphics,
  Label,
  Node,
  ResolutionPolicy,
  tween,
  UIOpacity,
  UITransform,
  Vec3,
  view,
} from 'cc';
import { GameplayClock } from '../core/GameplayClock';
import { DEFAULT_GAMEPLAY_CONFIG } from '../core/GameplayConfig';
import { GameplayRuntime } from '../core/GameplayRuntime';
import { GameplaySession } from '../core/GameplaySession';
import { MathRandomSource } from '../core/RandomSource';
import type { GameplayEvent } from '../core/GameplayTypes';
import { DebugHarness } from '../debug/DebugHarness';
import { CocosPhysicsFacade } from './CocosPhysicsFacade';

const { ccclass } = _decorator;

const WIDTH = 720;
const HEIGHT = 1280;
const PLAYABLE_WIDTH = 600;
const BOARD_BOTTOM = -500;
const BOARD_TOP = 460;
const SPAWN_Y = 410;
const SPAWN_EXCLUSION_BOTTOM = 350;
const DANGER_LINE_Y = BOARD_BOTTOM + (BOARD_TOP - BOARD_BOTTOM) * 0.82;
const PREVIEW_COLORS = [
  new Color(246, 194, 143, 255), new Color(240, 167, 120, 255), new Color(160, 187, 205, 255),
  new Color(222, 180, 166, 255), new Color(142, 201, 184, 255), new Color(224, 151, 170, 255),
  new Color(164, 151, 181, 255), new Color(194, 172, 205, 255), new Color(118, 139, 172, 255),
  new Color(236, 205, 159, 255),
];

@ccclass('GameplayBootstrap')
export class GameplayBootstrap extends Component {
  private runtime!: GameplayRuntime;
  private session!: GameplaySession;
  private clock!: GameplayClock;
  private physics!: CocosPhysicsFacade;
  private debugHarness!: DebugHarness;

  private playfieldRoot!: Node;
  private vfxRoot!: Node;
  private hudRoot!: Node;
  private currentPreview!: Node;
  private currentPreviewGraphics!: Graphics;
  private nextPreviewGraphics!: Graphics;
  private scoreLabel!: Label;
  private nextLabel!: Label;
  private dangerLabel!: Label;
  private debugLabel!: Label;
  private pauseLabel!: Label;
  private gameOverNode!: Node;
  private dangerGraphics!: Graphics;
  private paused = false;
  private pointerActive = false;

  onLoad(): void {
    view.setDesignResolutionSize(WIDTH, HEIGHT, ResolutionPolicy.SHOW_ALL);
    const canvasTransform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    canvasTransform.setContentSize(WIDTH, HEIGHT);

    this.buildSceneGraph();
    this.debugHarness = new DebugHarness();
    this.session = new GameplaySession(DEFAULT_GAMEPLAY_CONFIG, new MathRandomSource(), this.debugHarness);
    this.physics = new CocosPhysicsFacade(this.playfieldRoot.getChildByName('CatRoot')!, this.playfieldRoot, {
      playableWidth: PLAYABLE_WIDTH,
      boardBottomY: BOARD_BOTTOM,
      boardTopY: BOARD_TOP,
      spawnExclusionBottomY: SPAWN_EXCLUSION_BOTTOM,
    });
    this.runtime = new GameplayRuntime(this.session, this.physics);
    this.clock = new GameplayClock(this.session.fixedDt, 4, 0.1);

    this.bindInput();
    this.bindLifecycle();
    this.session.setAimX(0, -PLAYABLE_WIDTH / 2, PLAYABLE_WIDTH / 2, PLAYABLE_WIDTH);
    this.syncPresentation();
  }

  update(dt: number): void {
    if (!this.runtime || this.paused) return;
    this.clock.advance(dt, () => {
      const merges = this.runtime.fixedStep();
      for (const merge of merges) this.playMergeVfx(merge.resultId, merge.scoreDelta);
      this.consumeEvents();
    });
    this.syncPresentation();
  }

  onDestroy(): void {
    game.off(Game.EVENT_HIDE, this.onAppHide, this);
    game.off(Game.EVENT_SHOW, this.onAppShow, this);
  }

  private buildSceneGraph(): void {
    for (const child of [...this.node.children]) {
      if (child.name !== 'Camera') child.destroy();
    }

    const background = this.makeLayer('Background');
    const bg = background.addComponent(Graphics);
    bg.fillColor = new Color(255, 243, 222, 255);
    bg.rect(-WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT);
    bg.fill();

    this.playfieldRoot = this.makeLayer('PlayfieldRoot');
    const playfieldTransform = this.playfieldRoot.addComponent(UITransform);
    playfieldTransform.setContentSize(WIDTH, HEIGHT);
    const board = new Node('BoardVisual');
    board.setParent(this.playfieldRoot);
    const boardG = board.addComponent(Graphics);
    boardG.fillColor = new Color(255, 249, 239, 230);
    boardG.roundRect(-PLAYABLE_WIDTH / 2, BOARD_BOTTOM, PLAYABLE_WIDTH, BOARD_TOP - BOARD_BOTTOM, 24);
    boardG.fill();
    boardG.strokeColor = new Color(217, 166, 111, 255);
    boardG.lineWidth = 10;
    boardG.roundRect(-PLAYABLE_WIDTH / 2, BOARD_BOTTOM, PLAYABLE_WIDTH, BOARD_TOP - BOARD_BOTTOM, 24);
    boardG.stroke();

    const catRoot = new Node('CatRoot');
    catRoot.layer = this.node.layer;
    catRoot.setParent(this.playfieldRoot);

    const dangerNode = new Node('DangerLine');
    dangerNode.layer = this.node.layer;
    dangerNode.setParent(this.playfieldRoot);
    this.dangerGraphics = dangerNode.addComponent(Graphics);
    this.drawDangerLine(false);

    const exclusionNode = new Node('SpawnExclusionDebug');
    exclusionNode.layer = this.node.layer;
    exclusionNode.setParent(this.playfieldRoot);
    const exclusionGraphics = exclusionNode.addComponent(Graphics);
    exclusionGraphics.strokeColor = new Color(133, 201, 184, 95);
    exclusionGraphics.lineWidth = 2;
    for (let x = -PLAYABLE_WIDTH / 2; x < PLAYABLE_WIDTH / 2; x += 24) {
      exclusionGraphics.moveTo(x, SPAWN_EXCLUSION_BOTTOM);
      exclusionGraphics.lineTo(Math.min(x + 12, PLAYABLE_WIDTH / 2), SPAWN_EXCLUSION_BOTTOM);
    }
    exclusionGraphics.stroke();

    this.vfxRoot = this.makeLayer('VfxRoot');
    this.hudRoot = this.makeLayer('HudRoot');

    this.scoreLabel = this.createLabel(this.hudRoot, 'Score', '0', 42, 0, 550, 260, 70);
    this.nextLabel = this.createLabel(this.hudRoot, 'Next', '下一只', 24, -245, 565, 150, 54);
    const nextPreview = new Node('NextPreview');
    nextPreview.layer = this.node.layer;
    nextPreview.setParent(this.hudRoot);
    nextPreview.setPosition(-245, 510, 0);
    this.nextPreviewGraphics = nextPreview.addComponent(Graphics);
    this.pauseLabel = this.createLabel(this.hudRoot, 'Pause', 'Ⅱ', 36, 260, 550, 90, 70);
    this.pauseLabel.node.on(Node.EventType.TOUCH_END, this.togglePause, this);
    this.pauseLabel.node.on(Node.EventType.MOUSE_UP, this.togglePause, this);

    this.dangerLabel = this.createLabel(this.hudRoot, 'Danger', '', 24, 0, DANGER_LINE_Y + 32, 180, 48);
    this.dangerLabel.color = new Color(241, 111, 103, 255);

    this.debugLabel = this.createLabel(this.hudRoot, 'Debug', '', 16, -210, -575, 400, 70);
    this.debugLabel.color = new Color(91, 74, 66, 180);
    const hintLabel = this.createLabel(this.hudRoot, 'InputHint', '按住拖动瞄准 · 松手投放', 18, 0, -575, 360, 44);
    hintLabel.color = new Color(91, 74, 66, 145);

    this.currentPreview = new Node('CurrentPreview');
    this.currentPreview.layer = this.node.layer;
    this.currentPreview.setParent(this.playfieldRoot);
    this.currentPreview.setPosition(0, SPAWN_Y, 0);
    this.currentPreviewGraphics = this.currentPreview.addComponent(Graphics);

    this.gameOverNode = new Node('GameOverOverlay');
    this.gameOverNode.layer = this.node.layer;
    this.gameOverNode.setParent(this.hudRoot);
    const overlayTransform = this.gameOverNode.addComponent(UITransform);
    overlayTransform.setContentSize(460, 260);
    const overlay = this.gameOverNode.addComponent(Graphics);
    overlay.fillColor = new Color(74, 61, 56, 185);
    overlay.roundRect(-230, -130, 460, 260, 30);
    overlay.fill();
    this.createLabel(this.gameOverNode, 'GameOverText', '游戏结束\n点击重开', 34, 0, 0, 380, 160);
    this.gameOverNode.active = false;
    this.gameOverNode.on(Node.EventType.TOUCH_END, this.restart, this);
    this.gameOverNode.on(Node.EventType.MOUSE_UP, this.restart, this);
  }

  private bindInput(): void {
    this.playfieldRoot.on(Node.EventType.TOUCH_START, (e: EventTouch) => this.pointerBegin(e.getUILocation().x), this);
    this.playfieldRoot.on(Node.EventType.TOUCH_MOVE, (e: EventTouch) => this.pointerMove(e.getUILocation().x), this);
    this.playfieldRoot.on(Node.EventType.TOUCH_END, (e: EventTouch) => this.pointerEnd(e.getUILocation().x), this);
    this.playfieldRoot.on(Node.EventType.TOUCH_CANCEL, () => { this.pointerActive = false; }, this);

    this.playfieldRoot.on(Node.EventType.MOUSE_DOWN, (e: EventMouse) => this.pointerBegin(e.getLocationX()), this);
    this.playfieldRoot.on(Node.EventType.MOUSE_MOVE, (e: EventMouse) => {
      if (this.pointerActive) this.pointerMove(e.getLocationX());
    }, this);
    this.playfieldRoot.on(Node.EventType.MOUSE_UP, (e: EventMouse) => this.pointerEnd(e.getLocationX()), this);
  }

  private bindLifecycle(): void {
    game.on(Game.EVENT_HIDE, this.onAppHide, this);
    game.on(Game.EVENT_SHOW, this.onAppShow, this);
  }

  private onAppHide(): void {
    this.setPaused(true);
    this.pointerActive = false;
  }

  private onAppShow(): void {
    this.setPaused(false);
  }

  private pointerBegin(screenX: number): void {
    if (this.paused || this.session.runState !== 'RUNNING' || this.session.spawn.state !== 'AIMING') return;
    this.pointerActive = true;
    this.applyAim(screenX);
  }

  private pointerMove(screenX: number): void {
    if (!this.pointerActive || this.paused) return;
    this.applyAim(screenX);
  }

  private pointerEnd(screenX: number): void {
    if (!this.pointerActive) return;
    this.pointerActive = false;
    if (this.paused || this.session.runState !== 'RUNNING' || this.session.spawn.state !== 'AIMING') return;
    this.applyAim(screenX);
    try {
      this.runtime.releaseCurrent(SPAWN_Y);
      this.consumeEvents();
      this.syncPresentation();
    } catch (error) {
      console.warn('[Gameplay] 投放被拒绝', error);
    }
  }

  private applyAim(screenX: number): void {
    const localX = (screenX / Math.max(1, view.getVisibleSize().width) - 0.5) * WIDTH;
    try {
      this.session.setAimX(localX, -PLAYABLE_WIDTH / 2, PLAYABLE_WIDTH / 2, PLAYABLE_WIDTH);
    } catch {
      return;
    }
    this.syncCurrentPreview();
  }

  private togglePause(): void {
    if (this.session.runState !== 'RUNNING') return;
    this.setPaused(!this.paused);
  }

  private setPaused(paused: boolean): void {
    this.paused = paused;
    this.runtime.setPaused(paused);
    this.clock.setPaused(paused);
    this.pauseLabel.string = paused ? '▶' : 'Ⅱ';
    if (paused) this.dangerLabel.string = '已暂停';
    else this.syncPresentation();
  }

  private restart(): void {
    this.gameOverNode.active = false;
    this.paused = false;
    this.clock.reset();
    this.runtime.restart(0);
    this.session.setAimX(0, -PLAYABLE_WIDTH / 2, PLAYABLE_WIDTH / 2, PLAYABLE_WIDTH);
    this.consumeEvents();
    this.syncPresentation();
  }

  private consumeEvents(): void {
    for (const event of this.session.drainEvents()) this.handleEvent(event);
  }

  private handleEvent(event: GameplayEvent): void {
    if (event.type === 'DangerStarted') this.drawDangerLine(true);
    if (event.type === 'DangerCleared') this.drawDangerLine(false);
    if (event.type === 'GameOver') {
      this.gameOverNode.active = true;
      this.pointerActive = false;
    }
  }

  private syncPresentation(): void {
    const snapshot = this.session.snapshot();
    this.scoreLabel.string = `${snapshot.score}`;
    this.nextLabel.string = `下一只  L${snapshot.spawn.nextLevel}`;
    this.drawPreview(this.nextPreviewGraphics, snapshot.spawn.nextLevel, 28, 255);
    if (!this.paused) {
      this.dangerLabel.string = snapshot.dangerState === 'WARNING'
        ? `危险 ${(snapshot.dangerElapsed / this.session.config.rules.dangerTimeoutSec * 100).toFixed(0)}%`
        : '';
    }
    this.drawDangerLine(snapshot.dangerState === 'WARNING');
    this.debugLabel.string = `step ${snapshot.step}  ${snapshot.spawn.state}\n危险 ${snapshot.dangerElapsed.toFixed(2)}s  猫 ${snapshot.activeCatIds.length}`;
    this.syncCurrentPreview();
  }

  private syncCurrentPreview(): void {
    const snapshot = this.session.snapshot();
    this.currentPreview.active = snapshot.runState === 'RUNNING';
    this.currentPreview.setPosition(snapshot.spawn.aimX, SPAWN_Y, 0);
    const row = this.session.config.levels[snapshot.spawn.currentLevel - 1];
    const radius = PLAYABLE_WIDTH * row.diameterRatio * 0.5;
    const g = this.currentPreviewGraphics;
    g.clear();
    const previewColor = PREVIEW_COLORS[Math.max(0, Math.min(PREVIEW_COLORS.length - 1, snapshot.spawn.currentLevel - 1))];
    g.fillColor = new Color(previewColor.r, previewColor.g, previewColor.b, snapshot.spawn.state === 'AIMING' ? 220 : 100);
    g.circle(0, 0, radius * 0.9);
    g.fill();
    g.strokeColor = new Color(91, 74, 66, 180);
    g.lineWidth = 3;
    g.circle(0, 0, radius * 0.9);
    g.stroke();
  }

  private drawPreview(graphics: Graphics, level: number, radius: number, alpha: number): void {
    const color = PREVIEW_COLORS[Math.max(0, Math.min(PREVIEW_COLORS.length - 1, level - 1))];
    graphics.clear();
    graphics.fillColor = new Color(color.r, color.g, color.b, alpha);
    graphics.circle(0, 0, radius);
    graphics.fill();
    graphics.strokeColor = new Color(91, 74, 66, Math.min(210, alpha));
    graphics.lineWidth = 2;
    graphics.circle(0, 0, radius);
    graphics.stroke();
  }

  private drawDangerLine(warning: boolean): void {
    if (!this.dangerGraphics) return;
    const g = this.dangerGraphics;
    g.clear();
    g.strokeColor = warning ? new Color(241, 111, 103, 255) : new Color(133, 201, 184, 165);
    g.lineWidth = warning ? 5 : 3;
    for (let x = -PLAYABLE_WIDTH / 2 + 12; x < PLAYABLE_WIDTH / 2 - 12; x += 30) {
      g.moveTo(x, DANGER_LINE_Y);
      g.lineTo(Math.min(x + 16, PLAYABLE_WIDTH / 2 - 12), DANGER_LINE_Y);
    }
    g.stroke();
  }

  private playMergeVfx(runtimeId: number, scoreDelta: number): void {
    const catNode = this.physics.getNode(runtimeId);
    if (!catNode) return;
    catNode.setScale(new Vec3(0.88, 0.88, 1));
    tween(catNode).to(0.1, { scale: new Vec3(1.06, 1.06, 1) }).to(0.08, { scale: Vec3.ONE }).start();

    const p = catNode.position;
    const flash = new Node(`MergeVfx-${runtimeId}`);
    flash.layer = this.node.layer;
    flash.setParent(this.vfxRoot);
    flash.setPosition(p.x, p.y, 0);
    const gfx = flash.addComponent(Graphics);
    gfx.fillColor = new Color(255, 214, 107, 190);
    gfx.circle(0, 0, 32);
    gfx.fill();
    const opacity = flash.addComponent(UIOpacity);
    opacity.opacity = 220;
    flash.setScale(0.5, 0.5, 1);
    tween(flash)
      .to(0.22, { scale: new Vec3(1.8, 1.8, 1) })
      .call(() => flash.destroy())
      .start();

    const score = this.createLabel(this.vfxRoot, `ScoreVfx-${runtimeId}`, `+${scoreDelta}`, 22, p.x, p.y + 35, 120, 44);
    const scoreNode = score.node;
    tween(scoreNode).by(0.35, { position: new Vec3(0, 55, 0) }).call(() => scoreNode.destroy()).start();
  }

  private makeLayer(name: string): Node {
    const node = new Node(name);
    node.layer = this.node.layer;
    node.setParent(this.node);
    return node;
  }

  private createLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number): Label {
    const node = new Node(name);
    node.layer = this.node.layer;
    node.setParent(parent);
    node.setPosition(x, y, 0);
    const transform = node.addComponent(UITransform);
    transform.setContentSize(width, height);
    const label = node.addComponent(Label);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = Math.round(fontSize * 1.25);
    label.color = new Color(74, 61, 56, 255);
    return label;
  }
}
