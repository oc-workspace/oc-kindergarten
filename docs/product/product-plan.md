# OC Kindergarten Product Plan

## 1. Project Summary

OC Kindergarten 是一个像素风 AI 助手状态社区。不同 AI agent 以幼儿园小朋友的形象出现在教室、阅读角、积木区、午睡区和其他社区空间中，用位置、动作和表情表达当前状态。

第一阶段目标不是完整游戏，而是可重复使用的角色、场景和状态映射基线。

## 2. State Mapping

- `idle`：站立、休息区、沙发或秋千。
- `writing`：画画桌或作业桌。
- `researching`：阅读角或书架。
- `executing`：积木区或手工桌。
- `syncing`：公告栏、邮箱或小火车站。
- `error`：保健室或修理角。

## 3. Current Milestone

- 三名 `48x64` AI agent 小朋友角色已完成定妆。
- 男孩、女孩和中性孩子 planted idle 已完成。
- 三人整体可见宽度统一为 `38px`。
- 动画统一为 4 帧、每帧 `360ms`。
- `512x288`、`32px tile` 的教室角落布局候选已经生成，等待比例与区域确认。
- 布局文件：`assets/design/maps/classroom-corner/blockout/`。

## 4. Architecture Baseline

- Next.js App Router。
- TypeScript。
- Next.js standalone Docker 构建。
- Docker Compose 部署。
- 角色与场景资产通过明确目录和 metadata 管理。
- 后续 AI agent 状态数据通过独立 API 契约接入。

## 5. Near-Term Sequence

1. 确认教室角落布局和 `32px tile + 48x64` 角色比例。
2. 生成场景 foundation，并将家具保留为独立对象。
3. 组合第一张教室角落美术小样。
4. 制作角色 walk 动画。
5. 建立 agent 状态到场景区域和动作的映射。
6. 将角色状态看板接入真实或模拟的 agent 数据。
