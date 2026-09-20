export interface PlatformLifecycleSink {
  onPauseChanged(paused: boolean): void;
}

/**
 * Web / WeChat / Douyin 生命周期差异只能在 Adapter 层处理。
 * 核心玩法不得直接调用 wx.* / tt.*。
 */
export interface PlatformLifecycleAdapter {
  bind(sink: PlatformLifecycleSink): void;
  unbind(): void;
}
