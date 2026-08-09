# Antigravity AI IDE — Local-First Multi-Agent AI Development Platform

> **THE AI MUST ALWAYS OPERATE ON CURRENT PROJECT TRUTH.**  
> The system never blindly trusts an old conversation, stale context window, cached code representation, or previous generated response. Physical file hashes, AST structure, symbol reference graphs, and Git checkpoints are the ultimate source of truth.

---

## 🌟 Key Features

- **Project Truth Engine**: Direct SHA-256 hash tracking, language-aware AST parsing, symbol graph indexing, and import/export dependency DAG mapping with automated staleness invalidation.
- **Qwythos Language & AI Integration**: First-class support for `.qw` and `.qwythos` files (`agent`, `truth`, `intent`, `struct`, `fn` constructs) alongside flagship models (`Qwythos: Max Reasoning` & `Qwythos-1`).
- **Native Folder Opening**: Open any local directory using `showDirectoryPicker()` to recursively crawl, index, and render collapsible tree structures.
- **Multi-Agent Orchestration**: Autonomous pipeline loop (`PLANNER` → `CHECKPOINT` → `CODER` → `TEST` → `REVIEWER`) with streaming append-only activity timeline logging.
- **Atomic Checkpoints & Rollbacks**: Pre-AI operation snapshots with 1-click restore capability.
- **Local Apple Silicon & Privacy Mode**: Supports MLX, Ollama (`http://localhost:11434`), Hugging Face GGUF model registry with memory profiling, and strict local privacy mode.
- **Modern Desktop Shell**: Monaco Code Editor, inline `Cmd+K` AI diff modal with Accept/Reject, interactive terminal emulator, problems AST diagnostics, test runner, and intelligence dashboard.

---

## 🚀 Getting Started

### Installation & Local Run

```bash
# Clone the repository
git clone https://github.com/sainimal1ba-hue/ai-web-ide.git
cd ai-web-ide

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

### Verification & Production Build

```bash
# Type check
npx tsc --noEmit

# Production build
npm run build
```

---

## 🛠 Tech Stack

- **Frontend & UI**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Monaco Editor (`@monaco-editor/react`).
- **Build System**: Vite, `@tailwindcss/vite`.
- **Engine Architecture**: TypeScript AST Parser, SHA-256 Hash Verifier, Symbol Graph Indexer, Dependency Graph DAG, Multi-Agent Orchestrator, Controlled Tool Sandbox.
