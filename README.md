# 图片模板生成器

> 企业内部使用的在线图片模板生成工具，支持图片编辑、文字叠加、多尺寸预览等功能

## 🚀 功能特性

### 1. 图片上传与处理
- ✅ 支持拖拽上传图片文件
- ✅ 支持 JPG、PNG、GIF、WebP 等常见格式
- ✅ 自动压缩转换为 JPG 格式
- ✅ 文件大小限制：10MB
- ✅ 实时预览上传的图片

### 2. 图片编辑功能
- ✅ 可视化裁剪工具
- ✅ 支持拖拽调整裁剪区域
- ✅ 提供快速比例预设（正方形、16:9、3:4）
- ✅ 实时预览编辑效果
- ✅ 可调整裁剪区域大小和位置

### 3. 文字叠加功能
- ✅ 支持多行文字输入
- ✅ 文字颜色自定义（十六进制颜色选择器）
- ✅ 字体大小调节（12px - 72px）
- ✅ 文字对齐方式（左对齐、居中、右对齐）
- ✅ 边距设置（上、右、下、左）
- ✅ 拖拽定位文字位置
- ✅ 实时预览文字效果

### 4. 字体管理
- ✅ 内置系统字体（Arial、Georgia 等）
- ✅ 支持上传自定义字体文件
- ✅ 支持 TTF、OTF、WOFF、WOFF2 格式
- ✅ 字体加载状态反馈

### 5. 多尺寸预览与下载
- ✅ 默认预设尺寸（496×310px、400×400px、800×400px）
- ✅ 自定义尺寸添加功能
- ✅ 自定义尺寸保存（会话内保持）
- ✅ 同时输出多种尺寸预览
- ✅ 单个尺寸下载
- ✅ 批量下载所有尺寸
- ✅ 自动应用文字叠加到所有尺寸

### 6. 用户界面设计
- ✅ Apple 简洁风格设计
- ✅ 白色主题配色
- ✅ 大圆角设计元素
- ✅ 流畅的微动效交互
- ✅ 响应式布局设计
- ✅ 进度指示器引导

## 🛠️ 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI 库**: React 18 + TypeScript
- **样式方案**: Tailwind CSS
- **动画库**: Framer Motion
- **图标库**: Lucide React
- **文件处理**: React Dropzone
- **颜色选择**: React Colorful
- **Canvas 操作**: HTML5 Canvas API

## 📦 安装与运行

### 环境要求
- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
npm start
```

## 📝 使用说明

### 基本工作流程

1. **上传图片**
   - 拖拽图片文件到上传区域
   - 或点击选择文件按钮
   - 系统自动压缩为 JPG 格式

2. **编辑图片**
   - 使用可视化裁剪工具调整图片
   - 拖拽裁剪框改变位置
   - 调整裁剪框大小
   - 应用裁剪效果

3. **添加文字**
   - 输入要叠加的文字内容
   - 选择字体和大小
   - 设置文字颜色和对齐方式
   - 拖拽定位文字位置
   - 调整边距设置

4. **预览与下载**
   - 查看所有尺寸的预览效果
   - 添加自定义输出尺寸
   - 下载单个或全部尺寸图片

### 高级功能

#### 自定义字体上传
1. 准备字体文件（支持 .ttf、.otf、.woff、.woff2）
2. 在文字设置面板点击"选择字体文件"
3. 上传成功后字体将出现在字体列表中
4. 选择自定义字体应用到文字

#### 自定义尺寸设置
1. 在预览页面点击"自定义尺寸"按钮
2. 输入尺寸名称、宽度和高度
3. 点击"添加"保存新尺寸
4. 新尺寸将出现在预览列表中

## 🎨 设计特点

### Apple 风格设计系统
- **圆角设计**: 统一使用大圆角（16px-40px）
- **阴影效果**: 柔和的投影增强层次感
- **微动效**: 悬停和点击时的缩放动画
- **简洁布局**: 大量留白，清晰的信息层级
- **系统字体**: 使用 SF Pro Display 等苹果系统字体

### 交互设计
- **拖拽操作**: 文件上传、图片裁剪、文字定位
- **实时预览**: 所有操作都有即时视觉反馈
- **进度指示**: 清晰的步骤引导和状态提示
- **响应式**: 适配不同屏幕尺寸

## 🔧 关键技术实现

### 图片压缩处理
```javascript
// 使用 Canvas API 压缩图片为 JPG
const compressImageToJPG = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx?.drawImage(img, 0, 0)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], 
            file.name.replace(/\.[^/.]+$/, '.jpg'), 
            { type: 'image/jpeg' }
          )
          resolve(compressedFile)
        }
      }, 'image/jpeg', 0.8)
    }
    
    img.src = URL.createObjectURL(file)
  })
}
```

### 文字叠加渲染
```javascript
// 在 Canvas 上绘制文字叠加
textOverlays.forEach((overlay) => {
  ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}`
  ctx.fillStyle = overlay.color
  ctx.textAlign = overlay.align
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 4
  
  const x = (overlay.x / 100) * targetWidth
  const y = (overlay.y / 100) * targetHeight
  
  ctx.fillText(overlay.text, x, y)
})
```

## 📋 更新日志

### Version 0.1.0 (2024-01-20)
**初始版本发布**

#### 核心功能
- ✅ 图片上传与拖拽支持
- ✅ 自动 JPG 压缩转换
- ✅ 可视化图片裁剪工具
- ✅ 文字叠加编辑器
- ✅ 自定义字体上传
- ✅ 多尺寸预览生成
- ✅ 批量下载功能

#### 界面设计
- ✅ Apple 风格 UI 设计
- ✅ Tailwind CSS 样式系统
- ✅ Framer Motion 动画效果
- ✅ 响应式布局适配

#### 技术架构
- ✅ Next.js 14 App Router
- ✅ TypeScript 类型系统
- ✅ 组件化架构设计
- ✅ Canvas 图片处理

## 🐛 已知问题与限制

### 当前限制
1. **文件大小**: 限制 10MB 以内的图片文件
2. **字体格式**: 仅支持 TTF、OTF、WOFF、WOFF2 格式
3. **会话存储**: 自定义尺寸和字体不会永久保存
4. **浏览器兼容**: 需要现代浏览器支持 Canvas API

### 计划改进
- [ ] 增加更多图片格式支持
- [ ] 添加图片滤镜效果
- [ ] 支持图层管理
- [ ] 增加模板保存功能
- [ ] 添加用户账户系统

## 🤝 贡献指南

### 开发规范
1. 使用 TypeScript 进行类型检查
2. 遵循 ESLint 代码规范
3. 组件采用函数式编程
4. 保持良好的代码注释

### 提交规范
- feat: 新功能
- fix: 修复问题
- docs: 文档更新
- style: 样式调整
- refactor: 代码重构

## 📄 许可证

本项目仅供企业内部使用，未经授权不得外传或商用。

## 👥 开发团队

- **项目开发**: AI Assistant
- **技术栈**: Next.js + TypeScript + Tailwind CSS
- **设计风格**: Apple 简洁风格

---

**最后更新**: 2024年1月20日 