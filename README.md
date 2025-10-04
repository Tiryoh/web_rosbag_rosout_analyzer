# ROSbag Rosout Analyzer - Web Application

Browser-based ROSbag analyzer that runs entirely in the browser using WebAssembly. No installation, no server, no WSL required - just open in any modern browser!

## ✨ Features

- 🌐 **100% Browser-based** - No server or backend required
- 📦 **Drag & Drop** - Simply drag your .bag file to analyze
- 🔍 **Advanced Filtering** - Filter by nodes, severity, keywords, or regex patterns
- 📊 **Statistics** - Visual statistics and top node analysis
- 💾 **Export** - Export filtered results to CSV, JSON, or TXT
- 🎨 **Modern UI** - Clean, responsive interface with dark mode support
- ⚡ **Fast** - Powered by WebAssembly for native-like performance
- 🔁 **Supported ROS versions** - Currently supports ROS1 (rosbag). ROS2 (rosbag2) support is TODO.

## 🚀 Quick Start

### Option 1: Live Demo

Open the live demo at: [https://rosbag-rosout-analyzer.pages.dev](https://rosbag-rosout-analyzer.pages.dev)

### Option 2: Development Mode

```bash
cd web-app
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

### Option 3: Build for Production

```bash
cd web-app
npm install
npm run build
```

The built files will be in `dist/` folder. You can serve them with any static web server, or just open `dist/index.html` directly in your browser.

### Option 4: Use Pre-built (Coming Soon)

Download the latest release and open `index.html` in your browser.

## 📋 How to Use

1. **Upload ROSbag File**
   - Click the upload area or drag & drop your .bag file
   - The tool will automatically detect rosout topics

2. **Apply Filters**
   - Select filter mode (OR/AND)
   - Choose severity levels (DEBUG, INFO, WARN, ERROR, FATAL)
   - Select specific nodes
   - Add keywords or regex patterns
   - Click "Apply Filters"

3. **View Results**
   - Browse filtered messages in the table
   - Toggle statistics view for insights
   - Messages are color-coded by severity

4. **Export Results**
   - Choose format: CSV (Excel compatible), JSON, or TXT
   - Download filtered results instantly

## 🛠️ Technology Stack

- **React + TypeScript** - Modern UI framework with type safety
- **Vite** - Lightning-fast build tool
- **@foxglove/rosbag** - ROSbag parser compiled to WebAssembly
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Beautiful icon set

## 🔧 Development

### Prerequisites

- Node.js 18+ and npm

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📝 License

This repository is released under the MIT License, see [LICENSE](LICENSE).
Unless attributed otherwise, everything in this repository is under the MIT License.

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.
