# Markitdown 文档转换工具

一个基于Web的文档转换工具，支持将多种文件格式转换为Markdown格式。

## 功能特性

- 📁 **多格式支持**: PDF, PowerPoint, Word, Excel, 图片(JPG/PNG/GIF), 音频(MP3/WAV), HTML, CSV, JSON, XML, ZIP, EPub
- 🖥️ **现代化界面**: 拖拽上传，实时预览，进度显示
- 🔄 **批量转换**: 支持同时上传和转换多个文件
- 💾 **一键保存**: 转换结果可直接下载为Markdown文件
- 🐳 **Docker集成**: 使用Docker容器进行安全的文档转换

## 项目结构

```
markdownUI/
├── index.html          # 前端主页面
├── script.js           # 前端JavaScript逻辑
├── styles.css          # 前端样式文件
├── server.py           # Flask后端服务器
└── README.md           # 项目说明文档
```

## 技术栈

### 前端
- **HTML5**: 页面结构
- **CSS3**: 样式设计
- **JavaScript**: 交互逻辑
- **Fetch API**: 与后端通信

### 后端
- **Flask**: Python Web框架
- **Flask-CORS**: 跨域请求支持
- **Docker**: 文档转换容器

## 安装和运行

### 前提条件

1. **Python 3.7+**
2. **Docker Desktop** (需要安装并运行)
3. **Markitdown Docker镜像** (需要提前构建)

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd markdownUI
```

2. 安装Python依赖
```bash
pip install flask flask-cors
```

3. 构建Markitdown Docker镜像 (需要先有markitdown项目)
```bash
# 假设markitdown项目在同级目录
cd ../markitdown
docker build -t markitdown:latest .
```

4. 启动后端服务器
```bash
python server.py
```

5. 打开前端页面
在浏览器中打开 `index.html` 文件

## 使用方法

1. **上传文件**: 拖拽文件到上传区域或点击选择文件
2. **测试连接**: 点击"测试服务器连接"按钮确认后端服务正常
3. **开始转换**: 点击"开始转换"按钮开始转换过程
4. **预览结果**: 转换完成后在预览区域查看Markdown内容
5. **保存文件**: 点击"保存文件"按钮下载转换结果

## API接口

### POST /convert
转换文件为Markdown格式

**请求参数:**
- `file`: 要转换的文件 (multipart/form-data)

**响应:**
- 成功: 返回Markdown文件下载
- 失败: 返回JSON错误信息

### POST /convert (测试)
测试服务器连接

**请求参数:**
- `test`: true (application/json)

## 配置说明

### 服务器配置
- **主机**: 0.0.0.0 (监听所有接口)
- **端口**: 8181
- **调试模式**: 启用 (生产环境应禁用)

### CORS配置
- 允许所有来源的跨域请求
- 支持OPTIONS预检请求

## 故障排除

### 常见问题

1. **服务器连接失败**
   - 检查Docker Desktop是否运行
   - 确认markitdown镜像已正确构建
   - 验证端口8181未被占用

2. **转换失败**
   - 检查输入文件格式是否支持
   - 查看服务器日志获取详细错误信息

3. **CORS错误**
   - 确保后端服务器正常运行
   - 检查网络连接

### 日志查看

后端服务器会输出详细日志，包括:
- 请求接收和处理状态
- 文件转换进度
- 错误和异常信息

## 开发说明

### 添加新文件格式支持

1. 在 `index.html` 中更新 `accept` 属性
2. 确保Docker镜像支持该格式的转换
3. 测试转换功能

### 自定义样式

修改 `styles.css` 文件来自定义界面样式:
- 颜色主题
- 布局结构  
- 响应式设计

### 扩展API功能

在 `server.py` 中添加新的路由和处理逻辑

## 许可证

本项目采用 MIT 许可证 - 查看 LICENSE 文件了解详情

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 版本历史

- v1.0.0 (2024-01-01)
  - 初始版本发布
  - 支持基本文件转换功能
  - 实现Web界面

## 相关项目

- [markitdown](https://github.com/your-username/markitdown): 核心文档转换引擎

---

如有问题，请提交 [Issue](https://github.com/your-username/markdownUI/issues) 或联系开发团队。