#!/usr/bin/env bash
set -euo pipefail

VERSION="${COCOS_CREATOR_VERSION:-3.8.8}"
EXPECTED_VERSION="3.8.8"
EXPECTED_SHA="411f98df047c25902f93440d4b22925c2fb65461"
ENGINE_REPO="https://github.com/cocos/cocos-engine.git"

if [ "$VERSION" != "$EXPECTED_VERSION" ]; then
  echo "错误：本项目固定 Cocos Creator/Engine 版本为 $EXPECTED_VERSION，当前请求为 $VERSION。"
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENGINE_DIR="$PROJECT_ROOT/.cocos/engine/$VERSION/cocos-engine"

if ! command -v git >/dev/null 2>&1; then
  echo "错误：未找到 git。"
  exit 3
fi

if [ ! -d "$ENGINE_DIR/.git" ]; then
  mkdir -p "$(dirname "$ENGINE_DIR")"
  echo "拉取 Cocos Engine $VERSION 到 $ENGINE_DIR"
  git clone --depth 1 --branch "$VERSION" "$ENGINE_REPO" "$ENGINE_DIR"
fi

ACTUAL_SHA="$(git -C "$ENGINE_DIR" rev-parse HEAD)"
if [ "$ACTUAL_SHA" != "$EXPECTED_SHA" ]; then
  echo "错误：Cocos Engine commit 不匹配。"
  echo "期望：$EXPECTED_SHA"
  echo "实际：$ACTUAL_SHA"
  exit 4
fi

echo "Cocos Engine $VERSION 校验通过：$ACTUAL_SHA"

if [ "${INSTALL_ENGINE_DEPS:-0}" = "1" ]; then
  if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    echo "错误：安装引擎依赖需要 Node.js/npm。Cocos Engine 3.8.8 要求 Node.js >= 18。"
    exit 5
  fi
  echo "安装 Cocos Engine npm 依赖..."
  if [ -f "$ENGINE_DIR/package-lock.json" ]; then
    (cd "$ENGINE_DIR" && npm ci)
  else
    (cd "$ENGINE_DIR" && npm install)
  fi
fi

echo "完成。默认仍建议使用 Cocos Creator 3.8.8 内置引擎；只有需要自定义引擎时才在 Creator 的引擎管理器中指向："
echo "$ENGINE_DIR"
