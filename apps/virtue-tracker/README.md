# 美德训练 · Virtue Tracker

基于本杰明·富兰克林十三美德训练法的习惯养成 App。支持 **iPhone（iOS）**、**Android** 原生安装，也可通过浏览器/PWA 使用。

## 核心理念

- **每周专注一项习惯**：其余习惯本周不追踪
- **每日打卡**：做到了 ✓，没做到 ✗
- **循环训练**：所有习惯过一遍后，从头再来
- **自定义习惯**：不限于 13 项，可一次性添加
- **毕业退出**：习惯养成后可选择退出

## 三种使用方式

| 方式 | 适合场景 |
|------|----------|
| **iOS 原生 App** | iPhone 正式使用，可上架 App Store |
| **Android 原生 App** | 安卓手机，可上架 Google Play |
| **PWA 添加到主屏幕** | 暂无 Mac 时，iPhone 可临时安装 |

---

## 一、iPhone 原生 App（推荐）

### 前置条件

- **Mac 电脑** + **Xcode**（iOS 打包必须在 macOS 上完成）
- [Apple 开发者账号](https://developer.apple.com)（真机测试免费账号即可，上架需付费 $99/年）

### 构建步骤

```bash
cd apps/virtue-tracker
npm install
npm run ios          # 构建并打开 Xcode
```

在 Xcode 中：

1. 选择你的 iPhone 作为运行目标
2. 点击 **Run ▶** 安装到手机
3. 首次安装：手机 **设置 → 通用 → VPN与设备管理** 信任开发者

### 上架 App Store

1. Xcode → Product → Archive
2. 通过 App Store Connect 提交审核
3. Bundle ID：`com.virtuetracker.app`

---

## 二、Android 原生 App

### 前置条件

- [Android Studio](https://developer.android.com/studio)
- JDK 17+

### 构建步骤

```bash
cd apps/virtue-tracker
npm install
npm run android      # 构建并打开 Android Studio
```

在 Android Studio 中点击 **Run ▶**，连接手机或模拟器即可。

### 上架 Google Play

1. Build → Generate Signed Bundle / APK
2. 上传 AAB 到 Google Play Console

---

## 三、PWA 添加到 iPhone 主屏幕（无需 Mac）

若暂时没有 Mac，可先用此方式在 iPhone 上使用：

1. 部署到 HTTPS 服务器（或本地局域网访问）
2. iPhone 用 **Safari** 打开网址
3. 点击 **分享 → 添加到主屏幕**
4. 图标会出现在桌面，可离线使用

本地预览：

```bash
npm run dev
# 同一 WiFi 下 iPhone 访问 http://你的电脑IP:5174
```

---

## 开发命令

```bash
npm run dev          # 浏览器开发
npm run build        # 构建 Web 版
npm run icons        # 生成 App 图标
npm run build:mobile # 构建 + 同步到 iOS/Android
npm run cap:sync     # 仅同步 Web 资源到原生项目
npm run ios          # 打开 Xcode
npm run android      # 打开 Android Studio
```

## 技术架构

- **UI**：React + Vite + TypeScript
- **原生壳**：Capacitor 7（一套代码，iOS + Android 双端）
- **PWA**：vite-plugin-pwa（浏览器安装备选）
- **数据**：localStorage，完全离线，无需服务器

## 项目结构

```
apps/virtue-tracker/
├── src/              # React 应用源码
├── public/           # 静态资源、PWA 图标
├── resources/        # Capacitor 原生图标源文件
├── ios/              # Xcode 工程（npm run ios 后生成）
├── android/          # Android Studio 工程
└── capacitor.config.ts
```

## 数据存储

所有数据保存在设备本地，换机不会自动同步。后续可扩展 iCloud / Google Drive 备份。
