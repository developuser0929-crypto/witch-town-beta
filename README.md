# 女巫镇 - Salem 1692 无主持人助手

线上地址：https://witch.s2im7pl7e.xyz

当前版本：v1.0.1-beta

基于桌游《猎巫镇 Salem 1692》的网页版主持人工具。替代真人主持人，自动化黎明/夜晚闭眼流程，玩家使用实体卡牌进行线下游戏。

v1.0.1-beta 分支开始接入标准版完整牌堆。该分支不包含任何空白审判牌或空白主牌。

## 项目结构

```
女巫镇/
├── index.html    # 页面、联网、主持流程
├── rules-engine.js # v1.0.1-beta 标准牌堆与规则引擎
├── CNAME         # GitHub Pages 自定义域名配置（自动生成，不要删）
└── README.md
```

静态文件架构，无构建工具、无依赖安装、无后端。浏览器直接运行。

## 技术栈

| 技术 | 用途 |
|------|------|
| PeerJS (CDN) | P2P WebRTC 通信，玩家设备间直连 |
| Web Speech API | TTS 旁白语音（房主设备播放） |
| sessionStorage | 断线重连 + 房主状态恢复 |
| GitHub Pages | 静态托管 + HTTPS |

## 部署信息

| 项目 | 值 |
|------|-----|
| 仓库 | github.com/developuser0929-crypto/witch-town |
| 域名 | witch.s2im7pl7e.xyz |
| 域名商 | Dynadot（NS 指向 Cloudflare） |
| DNS | Cloudflare，CNAME: witch → developuser0929-crypto.github.io（DNS only） |
| HTTPS | GitHub Pages 自动管理，已开启 Enforce HTTPS |

## 日常维护

### 修改代码后部署

```bash
cd /Users/simple/女巫镇
# 编辑 index.html
git add index.html
git commit -m "描述你的改动"
git push
# 等 1-2 分钟 GitHub Pages 自动部署
```

### 本地测试

```bash
cd /Users/simple/女巫镇
python3 -m http.server 8090
# 浏览器打开 http://localhost:8090
# 多开标签页模拟多玩家
```

注意：本地测试 PeerJS 连接需要联网（依赖公共信令服务器 0.peerjs.com）。

### 域名续费

- 域名 s2im7pl7e.xyz 到期日：2027/03/30（Dynadot）
- Cloudflare DNS 免费，无需续费
- GitHub Pages 免费，无需续费

### GitHub Token

推送代码需要 token 认证。如果 token 过期：
1. https://github.com/settings/tokens → Generate new token (classic)
2. 勾选 repo 权限
3. 更新 remote URL：
```bash
git remote set-url origin https://developuser0929-crypto:新TOKEN@github.com/developuser0929-crypto/witch-town.git
```

## 功能清单

### 房间管理
- 房主创建房间（6位房间码）
- 玩家输入房间码加入
- 座位排序（大厅 + 白天均可调整）
- 断线自动重连（手机唤醒/回到前台后主动恢复，避免把临时不可达误判为房间不存在）
- 房主刷新后从 sessionStorage 恢复游戏状态

### 身份系统
- 四种身份：普通村民 / 女巫 / 警长 / 女巫+警长
- 身份查看按钮（右下角锁图标）
- 身份历史追踪（游戏结束时展示完整转变链）

### 黎明阶段
- TTS 旁白引导全流程
- 女巫互认同伴 + 选择黑猫放置目标
- 多女巫需全员一致投票

### 夜晚阶段
- 完整 async 流程：闭眼→女巫杀人→警长保护→睁眼→公布保护对象→自首→结算
- 每个阶段间 3-5 秒停顿
- 多女巫实时投票（显示彼此选择，全员一致确认）
- 警长唯一性保证 + 翻出后永久跳过
- 自首倒计时 15 秒 + Host 超时兜底，被警长保护者自动跳过自首

### 传染阶段
- 三步流程：获得什么牌 → 失去什么牌 → 确认变更
- 显示上家/下家名字
- 黑猫持有者额外提醒
- Host 端验证（警长/女巫牌得失守恒检查）
- 异常时可回滚让所有人重新填写

### 游戏管理（房主）
- 翻出女巫牌（死亡）
- 翻出警长牌（永久失效）
- 身份牌全翻完（死亡）
- 标记死亡
- 转移黑猫
- 黎明/夜晚按钮二次确认，防止误触
- 自动胜负判定（全女巫=女巫胜 / 无女巫=村民胜）

### v1.0.1-beta 牌局规则引擎
- 开房可选择“有角色版”或“无角色版”
- 4-10 人按官方标准审判牌配置自动发牌
- 标准主牌堆不包含空白牌：红牌、绿牌、蓝牌、黑牌共 59 张
- 黑猫为唯一实体蓝牌，开局/黎明放置后不会留在牌堆中产生第二张
- Host 保存权威牌局状态，客户端只同步自己的手牌和审判牌内容
- 支持回到前台、网络恢复、心跳失效后的主动同步请求

### 游戏结束
- 分阵营展示所有玩家
- 显示完整身份转变历史（初始身份 → 第N轮传染: X→Y）
- 重新开始

## 已知限制

1. **PeerJS 公共信令服务器**：首次连接可能较慢（1-3秒），依赖 0.peerjs.com 的可用性。如果该服务不稳定，可以考虑自建 PeerJS Server。
2. **房主是核心节点**：所有游戏逻辑在房主设备运行。房主设备性能差或网络不稳会影响所有人。
3. **TTS 语音**：依赖设备系统的中文语音包，不同手机效果不同。iOS 通常较好，部分 Android 可能没有中文语音。
4. **纯信任制**：身份选择和传染报告依赖玩家诚实，工具无法验证实体卡牌内容。

## 可能的后续优化

- [ ] 自建 PeerJS Server 提升连接速度和稳定性
- [ ] 添加背景音乐/音效素材（替代纯 Web Audio 合成音）
- [ ] 支持更多角色（豪华版的 Charlatan/Gravedigger/Inquisitor 等）
- [ ] 游戏记录导出（JSON/截图）
- [ ] PWA 支持（添加到主屏幕，离线缓存静态资源）
