export interface AimInputIntentSink {
  beginAim(x: number): void;
  moveAim(x: number): void;
  releaseAim(x: number): void;
  cancelAim(): void;
  requestPause(): void;
}

/**
 * UI/平台输入只负责把“按住/拖动/松手”转换成意图。
 * 是否允许释放仍由 GameplaySession / SpawnController 判定。
 */
export interface AimInputAdapter {
  bind(sink: AimInputIntentSink): void;
  unbind(): void;
  setEnabled(enabled: boolean): void;
  /** 暂停/后台时必须主动取消旧 Pointer Gesture。 */
  cancelActiveGesture(): void;
}
