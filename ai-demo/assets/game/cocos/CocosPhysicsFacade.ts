import {
  BoxCollider2D,
  CircleCollider2D,
  Color,
  Contact2DType,
  ERigidBody2DType,
  Graphics,
  Node,
  PhysicsSystem2D,
  RigidBody2D,
  Size,
  UITransform,
  Vec2 as CcVec2,
  Vec3,
} from 'cc';
import type { ContactPair, Vec2 } from '../core/GameplayTypes';
import type { PhysicsCatDescriptor, PhysicsFacade } from '../physics/PhysicsFacade';

export interface CocosPhysicsOptions {
  playableWidth: number;
  boardBottomY: number;
  boardTopY: number;
  spawnExclusionBottomY: number;
}

interface CatBody {
  node: Node;
  body: RigidBody2D;
  collider: CircleCollider2D;
  radius: number;
}

const CAT_COLORS = [
  new Color(246, 194, 143, 255),
  new Color(240, 167, 120, 255),
  new Color(160, 187, 205, 255),
  new Color(222, 180, 166, 255),
  new Color(142, 201, 184, 255),
  new Color(224, 151, 170, 255),
  new Color(164, 151, 181, 255),
  new Color(194, 172, 205, 255),
  new Color(118, 139, 172, 255),
  new Color(236, 205, 159, 255),
];

/** Cocos Creator 3.8.8 Physics2D 适配器。 */
export class CocosPhysicsFacade implements PhysicsFacade {
  private readonly cats = new Map<number, CatBody>();
  private readonly colliderToId = new Map<CircleCollider2D, number>();
  private readonly activeContacts = new Set<string>();
  private paused = false;

  constructor(
    private readonly catRoot: Node,
    private readonly playfieldRoot: Node,
    private readonly options: CocosPhysicsOptions,
  ) {
    const physics = PhysicsSystem2D.instance;
    physics.enable = true;
    physics.autoSimulation = false;
    physics.allowSleep = true;
    physics.fixedTimeStep = 1 / 60;
    physics.maxSubSteps = 1;
    physics.gravity = new CcVec2(0, -980);
    this.createBounds();
  }

  createCat(descriptor: PhysicsCatDescriptor): void {
    if (this.cats.has(descriptor.runtimeId)) return;
    const diameter = descriptor.diameterRatio * this.options.playableWidth;
    const radius = diameter * 0.5;
    const node = new Node(`Cat-${descriptor.runtimeId}-L${descriptor.level}`);
    node.layer = this.catRoot.layer;
    node.setParent(this.catRoot);
    node.setPosition(descriptor.position.x, descriptor.position.y, 0);

    const transform = node.addComponent(UITransform);
    transform.setContentSize(diameter, diameter);

    const graphics = node.addComponent(Graphics);
    this.drawCat(graphics, descriptor.level, radius);

    const body = node.addComponent(RigidBody2D);
    body.type = ERigidBody2DType.Dynamic;
    body.gravityScale = 1;
    body.linearDamping = descriptor.linearDamping;
    body.angularDamping = descriptor.angularDamping;
    body.allowSleep = true;
    body.enabledContactListener = true;

    const collider = node.addComponent(CircleCollider2D);
    collider.radius = radius;
    collider.density = Math.max(0.2, descriptor.massScale);
    collider.friction = descriptor.friction;
    collider.restitution = descriptor.restitution;
    collider.sensor = false;
    collider.apply();

    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    this.cats.set(descriptor.runtimeId, { node, body, collider, radius });
    this.colliderToId.set(collider, descriptor.runtimeId);
  }

  removeCat(runtimeId: number): void {
    const cat = this.cats.get(runtimeId);
    if (!cat) return;
    this.cats.delete(runtimeId);
    this.colliderToId.delete(cat.collider);
    for (const key of [...this.activeContacts]) {
      if (key.startsWith(`${runtimeId}:`) || key.endsWith(`:${runtimeId}`)) this.activeContacts.delete(key);
    }
    cat.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    cat.collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
    cat.collider.enabled = false;
    cat.body.enabled = false;
    cat.node.active = false;
    cat.node.destroy();
  }

  setCatPosition(runtimeId: number, position: Vec2): void {
    const cat = this.cats.get(runtimeId);
    if (!cat) return;
    cat.node.setPosition(position.x, position.y, 0);
  }

  getCatPosition(runtimeId: number): Vec2 | undefined {
    const cat = this.cats.get(runtimeId);
    if (!cat) return undefined;
    const p = cat.node.position;
    return { x: p.x, y: p.y };
  }

  stepAndCollectContacts(fixedDt: number): ContactPair[] {
    if (this.paused) return [];
    const physics = PhysicsSystem2D.instance;
    physics.physicsWorld.syncSceneToPhysics();
    physics.step(fixedDt);
    physics.physicsWorld.syncPhysicsToScene();
    return [...this.activeContacts].map((key) => {
      const [a, b] = key.split(':').map(Number);
      return { a, b };
    });
  }

  queryDangerousCatIds(dangerLineRatio: number): number[] {
    const localLineY = this.options.boardBottomY
      + (this.options.boardTopY - this.options.boardBottomY) * dangerLineRatio;
    const lineY = this.playfieldRoot.worldPosition.y + localLineY;
    const ids: number[] = [];
    for (const [id, cat] of this.cats) {
      const aabb = cat.collider.worldAABB;
      if (aabb.y + aabb.height > lineY) ids.push(id);
    }
    return ids;
  }

  isSpawnExclusionClear(lastDroppedRuntimeId?: number): boolean {
    if (lastDroppedRuntimeId === undefined) return true;
    const cat = this.cats.get(lastDroppedRuntimeId);
    if (!cat) return true;
    const aabb = cat.collider.worldAABB;
    const exclusionBottomWorldY = this.playfieldRoot.worldPosition.y + this.options.spawnExclusionBottomY;
    return aabb.y + aabb.height <= exclusionBottomWorldY;
  }

  pause(paused: boolean): void {
    this.paused = paused;
  }

  reset(): void {
    for (const id of [...this.cats.keys()]) this.removeCat(id);
    this.activeContacts.clear();
  }

  getNode(runtimeId: number): Node | undefined {
    return this.cats.get(runtimeId)?.node;
  }

  private onBeginContact(self: CircleCollider2D, other: CircleCollider2D): void {
    const a = this.colliderToId.get(self);
    const b = this.colliderToId.get(other);
    if (a === undefined || b === undefined || a === b) return;
    this.activeContacts.add(this.pairKey(a, b));
  }

  private onEndContact(self: CircleCollider2D, other: CircleCollider2D): void {
    const a = this.colliderToId.get(self);
    const b = this.colliderToId.get(other);
    if (a === undefined || b === undefined || a === b) return;
    this.activeContacts.delete(this.pairKey(a, b));
  }

  private pairKey(a: number, b: number): string {
    return a < b ? `${a}:${b}` : `${b}:${a}`;
  }

  private createBounds(): void {
    const width = this.options.playableWidth;
    const height = this.options.boardTopY - this.options.boardBottomY;
    const wall = 28;
    this.createStaticBox('Floor', 0, this.options.boardBottomY - wall * 0.5, width + wall * 2, wall);
    this.createStaticBox('WallLeft', -width * 0.5 - wall * 0.5, this.options.boardBottomY + height * 0.5, wall, height + wall * 2);
    this.createStaticBox('WallRight', width * 0.5 + wall * 0.5, this.options.boardBottomY + height * 0.5, wall, height + wall * 2);
  }

  private createStaticBox(name: string, x: number, y: number, width: number, height: number): void {
    const node = new Node(name);
    node.layer = this.playfieldRoot.layer;
    node.setParent(this.playfieldRoot);
    node.setPosition(x, y, 0);
    const collider = node.addComponent(BoxCollider2D);
    collider.size = new Size(width, height);
    collider.friction = 0.5;
    collider.restitution = 0.03;
    collider.apply();
  }

  private drawCat(graphics: Graphics, level: number, radius: number): void {
    const body = CAT_COLORS[Math.max(0, Math.min(CAT_COLORS.length - 1, level - 1))];
    graphics.clear();
    graphics.fillColor = body;
    graphics.circle(0, 0, radius * 0.94);
    graphics.fill();

    graphics.fillColor = body;
    graphics.moveTo(-radius * 0.58, radius * 0.60);
    graphics.lineTo(-radius * 0.20, radius * 0.94);
    graphics.lineTo(-radius * 0.05, radius * 0.52);
    graphics.close();
    graphics.fill();
    graphics.moveTo(radius * 0.58, radius * 0.60);
    graphics.lineTo(radius * 0.20, radius * 0.94);
    graphics.lineTo(radius * 0.05, radius * 0.52);
    graphics.close();
    graphics.fill();

    graphics.fillColor = new Color(74, 61, 56, 255);
    graphics.circle(-radius * 0.28, radius * 0.10, Math.max(2, radius * 0.06));
    graphics.circle(radius * 0.28, radius * 0.10, Math.max(2, radius * 0.06));
    graphics.fill();
    graphics.lineWidth = Math.max(2, radius * 0.035);
    graphics.strokeColor = new Color(91, 74, 66, 255);
    graphics.circle(0, 0, radius * 0.94);
    graphics.stroke();
  }
}
