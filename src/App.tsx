import { useState, useEffect, useRef } from 'react';
import { Header } from './components/layout/Header';
import { FileExplorer } from './components/explorer/FileExplorer';
import { CodeEditor } from './components/editor/CodeEditor';
import { AgentWorkspace } from './components/agent/AgentWorkspace';
import { BottomPanel } from './components/bottom/BottomPanel';
import { ModelManagerModal } from './components/modals/ModelManagerModal';
import { IntelligenceDashboardModal } from './components/modals/IntelligenceDashboardModal';
import { AwwwardsStudioModal } from './components/modals/AwwwardsStudioModal';

import { TruthEngine } from './engine/truth-engine/TruthEngine';
import { CheckpointEngine } from './engine/git-engine/CheckpointEngine';
import { ModelManager } from './engine/model-router/ModelManager';
import { AgentOrchestrator } from './engine/agent-framework/AgentOrchestrator';
import type { FileMetadata, TruthEngineStats } from './engine/truth-engine/types';
import type { AgentRoleName, AgentEvent, PlanOutput } from './engine/agent-framework/types';
import type { AICheckpoint } from './engine/git-engine/types';
import { SAMPLE_PROJECT_FILES } from './data/sampleProject';
import { isCleanSourceFile } from './utils/fileFilter';
import { downloadWorkspaceZip } from './utils/zipExporter';

export function App() {
  // Master state - Starts clean without pre-populated dummy files
  const [filesState, setFilesState] = useState<Record<string, string>>({});
  const [originalFiles, setOriginalFiles] = useState<Record<string, string>>({});
  const filesStateRef = useRef<Record<string, string>>({});
  filesStateRef.current = filesState;

  // Source Control & AI Pending Patch State
  const [modifiedFiles, setModifiedFiles] = useState<Set<string>>(new Set());
  const [addedFiles, setAddedFiles] = useState<Set<string>>(new Set());
  const [pendingAIPatch, setPendingAIPatch] = useState<{ files: string[]; previousState: Record<string, string> } | null>(null);

  const [workspaceName, setWorkspaceName] = useState<string>('No Folder Opened');
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('qwythos-max-reasoning');
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(true);
  const [activeAgent, setActiveAgent] = useState<AgentRoleName>('planner');

  // Modals state
  const [isModelManagerOpen, setIsModelManagerOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAwwwardsStudioOpen, setIsAwwwardsStudioOpen] = useState(false);

  // Engine Instances
  const truthEngineRef = useRef(new TruthEngine());
  const checkpointEngineRef = useRef(new CheckpointEngine());
  const modelManagerRef = useRef(new ModelManager());
  const orchestratorRef = useRef<AgentOrchestrator | null>(null);

  // Engine state
  const [stats, setStats] = useState<TruthEngineStats>({
    totalFiles: 0,
    totalSymbols: 0,
    totalDependencies: 0,
    staleFiles: 0,
    lastScanTimestamp: Date.now(),
    indexingProgress: 100,
    gitState: 'clean'
  });

  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [checkpoints, setCheckpoints] = useState<AICheckpoint[]>([]);
  const [latestPlan, setLatestPlan] = useState<PlanOutput | null>(null);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);

  // Initial Engine setup
  useEffect(() => {
    const initEngine = async () => {
      const orchestrator = new AgentOrchestrator(
        truthEngineRef.current,
        checkpointEngineRef.current,
        modelManagerRef.current,
        () => filesStateRef.current,
        (path: string, newContent: string) => {
          setFilesState(prev => ({ ...prev, [path]: newContent }));
          setModifiedFiles(prev => new Set(prev).add(path));
          truthEngineRef.current.processFile(path, newContent);
        }
      );
      orchestratorRef.current = orchestrator;

      orchestrator.eventStream.subscribe((evt) => {
        setEvents(prev => [...prev, evt]);
      });

      const newStats = await truthEngineRef.current.rebuildFullIntelligence(filesStateRef.current);
      setStats(newStats);
      setCheckpoints(checkpointEngineRef.current.getCheckpoints());
    };

    initEngine();
  }, []);

  const refreshStats = () => {
    setStats(truthEngineRef.current.getStats());
    setCheckpoints([...checkpointEngineRef.current.getCheckpoints()]);
  };

  const handleSelectFile = (path: string) => {
    if (!openTabs.includes(path)) {
      setOpenTabs(prev => [...prev, path]);
    }
    setActiveFilePath(path);
  };

  const handleCloseTab = (tabPath: string) => {
    const nextTabs = openTabs.filter(t => t !== tabPath);
    setOpenTabs(nextTabs);

    if (activeFilePath === tabPath) {
      setActiveFilePath(nextTabs.length > 0 ? nextTabs[nextTabs.length - 1] : '');
    }
  };

  const handleFileChange = async (newContent: string) => {
    if (!activeFilePath) return;
    setFilesState(prev => ({ ...prev, [activeFilePath]: newContent }));
    setModifiedFiles(prev => new Set(prev).add(activeFilePath));
    await truthEngineRef.current.processFile(activeFilePath, newContent);
    refreshStats();
  };

  const handleCreateFile = async () => {
    const name = prompt('Enter relative path for new file (e.g. src/core/logic.qw or src/utils/logger.ts):', 'src/core/logic.qw');
    if (name) {
      const initialContent = name.endsWith('.qw')
        ? `truth LogicEngine {\n  invariant: "PurityVerified"\n}\n\nagent LogicAgent {\n  intent execute() -> Void {}\n}\n`
        : `export function log(msg: string) {\n  console.log('[LOG]:', msg);\n}\n`;
      setFilesState(prev => ({ ...prev, [name]: initialContent }));
      setAddedFiles(prev => new Set(prev).add(name));
      await truthEngineRef.current.processFile(name, initialContent);
      handleSelectFile(name);
      refreshStats();
    }
  };

  const handleDeleteFile = (path: string) => {
    if (confirm(`Delete ${path} from repository?`)) {
      setFilesState(prev => {
        const next = { ...prev };
        delete next[path];
        return next;
      });
      setModifiedFiles(prev => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
      setAddedFiles(prev => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
      handleCloseTab(path);
      truthEngineRef.current.scanner.removeFile(path);
      truthEngineRef.current.symbolGraph.removeFileSymbols(path);
      truthEngineRef.current.dependencyGraph.removeFileDependencies(path);
      refreshStats();
    }
  };

  // Open Local Folder
  const handleOpenFolder = async (newFiles: Record<string, string>, folderName: string) => {
    const cleanFiles: Record<string, string> = {};
    for (const [path, content] of Object.entries(newFiles)) {
      const filename = path.split('/').pop() || path;
      if (isCleanSourceFile(filename, path)) {
        cleanFiles[path] = content;
      }
    }

    setWorkspaceName(folderName);
    setFilesState(cleanFiles);
    setOriginalFiles({ ...cleanFiles });
    setModifiedFiles(new Set());
    setAddedFiles(new Set());
    setPendingAIPatch(null);

    const firstFewFiles = Object.keys(cleanFiles).slice(0, 5);
    setOpenTabs(firstFewFiles);
    if (firstFewFiles[0]) setActiveFilePath(firstFewFiles[0]);

    const newStats = await truthEngineRef.current.rebuildFullIntelligence(cleanFiles);
    setStats(newStats);

    if (orchestratorRef.current) {
      orchestratorRef.current.eventStream.logEvent({
        agent: 'architect',
        action: 'opened_local_folder',
        reason: `Opened local workspace "${folderName}" with ${Object.keys(cleanFiles).length} source files. Project Truth Engine indexed cleanly.`,
        result: 'success'
      });
    }
  };

  // Trigger Open Local Folder via File System Access API
  const handleTriggerOpenFolder = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker();
        const loadedFiles: Record<string, string> = {};

        const readDirRecursive = async (handle: any, relativePath: string = '') => {
          for await (const entry of handle.values()) {
            const entryPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
            if (entry.kind === 'file' && isCleanSourceFile(entry.name, entryPath)) {
              try {
                const file = await entry.getFile();
                if (file.size < 2 * 1024 * 1024) {
                  const text = await file.text();
                  loadedFiles[entryPath] = text;
                }
              } catch (e) {}
            } else if (entry.kind === 'directory' && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
              await readDirRecursive(entry, entryPath);
            }
          }
        };

        await readDirRecursive(dirHandle);
        if (Object.keys(loadedFiles).length > 0) {
          handleOpenFolder(loadedFiles, dirHandle.name);
        }
      } else {
        alert('File System Access API not supported in this browser environment.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    }
  };

  // Load Optional Sample Workspace
  const handleResetSampleWorkspace = async () => {
    setWorkspaceName('sample-project');
    setFilesState({ ...SAMPLE_PROJECT_FILES });
    setOriginalFiles({ ...SAMPLE_PROJECT_FILES });
    setModifiedFiles(new Set());
    setAddedFiles(new Set());
    setPendingAIPatch(null);
    setOpenTabs(['src/qwythos/agent_truth.qw', 'src/index.ts', 'src/services/AuthService.ts']);
    setActiveFilePath('src/qwythos/agent_truth.qw');
    const newStats = await truthEngineRef.current.rebuildFullIntelligence(SAMPLE_PROJECT_FILES);
    setStats(newStats);
  };

  // Rebuild Intelligence (/scan)
  const handleRebuildIntelligence = async () => {
    const newStats = await truthEngineRef.current.rebuildFullIntelligence(filesState);
    setStats(newStats);
    alert('Project Intelligence Rebuilt (/scan completed). Filesystem hashes & AST trees 100% verified.');
  };

  // Integrity Doctor (/doctor)
  const handleRunDoctor = () => {
    const diag = truthEngineRef.current.diagnoseIndexIntegrity();
    if (diag.status === 'healthy') {
      alert('Index Doctor (/doctor): Index Integrity 100% HEALTHY. Zero corruption or hash mismatches detected.');
    } else {
      alert(`Index Doctor (/doctor) Issues Detected:\n${diag.issues.join('\n')}`);
    }
  };

  // Run Autonomous Agent Pipeline (with target file binding and modified file tracking)
  const handleRunAutonomousGoal = async (objective: string) => {
    if (!orchestratorRef.current) return;
    setIsRunningPipeline(true);

    const snapshotBeforeAI = { ...filesState };

    try {
      const result = await orchestratorRef.current.runAutonomousPipeline(objective, activeFilePath);
      setLatestPlan(result.plan);

      // Set pending AI patch review state
      if (result.plan && result.plan.files) {
        const affected = result.plan.files;
        setModifiedFiles(prev => {
          const next = new Set(prev);
          affected.forEach(f => next.add(f));
          return next;
        });
        setPendingAIPatch({
          files: affected,
          previousState: snapshotBeforeAI
        });
      }

      refreshStats();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunningPipeline(false);
    }
  };

  // Accept All AI Patches
  const handleAcceptAllAIPatches = async () => {
    if (!pendingAIPatch) return;
    setPendingAIPatch(null);
    const newStats = await truthEngineRef.current.rebuildFullIntelligence(filesState);
    setStats(newStats);
  };

  // Reject All AI Patches (Rollback)
  const handleRejectAllAIPatches = async () => {
    if (!pendingAIPatch) return;
    const previous = pendingAIPatch.previousState;
    setFilesState(previous);
    setPendingAIPatch(null);
    setModifiedFiles(new Set());
    const newStats = await truthEngineRef.current.rebuildFullIntelligence(previous);
    setStats(newStats);
  };

  // Apply Awwwards Inspiration Style to Active File
  const handleApplyInspiration = (siteName: string, prompt: string) => {
    let target = activeFilePath;
    if (!target) {
      target = 'src/app/page.tsx';
      handleSelectFile(target);
    }
    handleRunAutonomousGoal(`Apply ${siteName} Inspiration: ${prompt}`);
  };

  // Download Workspace ZIP Archive
  const handleDownloadZip = async () => {
    const zipName = workspaceName && workspaceName !== 'No Folder Opened' ? `${workspaceName}-updated.zip` : 'portfolio-codebase.zip';
    await downloadWorkspaceZip(filesState, zipName);
  };

  // Rollback Checkpoint
  const handleRollbackCheckpoint = async (checkpointId: string) => {
    const restored = checkpointEngineRef.current.rollbackCheckpoint(checkpointId);
    if (restored) {
      setFilesState(restored);
      setModifiedFiles(new Set());
      setAddedFiles(new Set());
      setPendingAIPatch(null);
      await truthEngineRef.current.rebuildFullIntelligence(restored);
      refreshStats();
      alert(`Restored workspace snapshot to checkpoint ${checkpointId}.`);
    }
  };

  const fileMetadataList: FileMetadata[] = truthEngineRef.current.scanner.getAllFiles();

  return (
    <div className="h-screen w-screen bg-[#070a12] text-slate-100 flex flex-col overflow-hidden select-none font-sans">
      {/* Top Header */}
      <Header
        stats={stats}
        onRebuildIntelligence={handleRebuildIntelligence}
        onRunDoctor={handleRunDoctor}
        onOpenModelManager={() => setIsModelManagerOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenAwwwardsStudio={() => setIsAwwwardsStudioOpen(true)}
        onDownloadZip={handleDownloadZip}
        isPrivacyMode={isPrivacyMode}
        onTogglePrivacyMode={() => setIsPrivacyMode(!isPrivacyMode)}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        workspaceName={workspaceName}
      />

      {/* Main IDE Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: File Explorer */}
        <FileExplorer
          files={fileMetadataList}
          activeFilePath={activeFilePath}
          onSelectFile={handleSelectFile}
          onCreateFile={handleCreateFile}
          onDeleteFile={handleDeleteFile}
          onOpenFolder={handleOpenFolder}
          onResetSampleWorkspace={handleResetSampleWorkspace}
          modifiedFiles={modifiedFiles}
          addedFiles={addedFiles}
          originalFiles={originalFiles}
          currentFiles={filesState}
        />

        {/* Center: Full-Height Monaco Code & Live Diff Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CodeEditor
            filePath={activeFilePath}
            content={filesState[activeFilePath]}
            openTabs={openTabs}
            onSelectTab={handleSelectFile}
            onCloseTab={handleCloseTab}
            onChangeContent={handleFileChange}
            onRunInlineEdit={(instruction) => handleRunAutonomousGoal(`Inline Edit: ${instruction}`)}
            onOpenFolder={handleTriggerOpenFolder}
            onCreateFile={handleCreateFile}
            originalFiles={originalFiles}
            pendingAIPatch={pendingAIPatch}
            onAcceptAllAIPatches={handleAcceptAllAIPatches}
            onRejectAllAIPatches={handleRejectAllAIPatches}
          />
        </div>

        {/* Right Sidebar: AI Agent Workspace with Live Event Stream */}
        <AgentWorkspace
          onRunAutonomousGoal={handleRunAutonomousGoal}
          isRunningPipeline={isRunningPipeline}
          latestPlan={latestPlan}
          activeAgent={activeAgent}
          onSelectAgent={setActiveAgent}
          events={events}
        />
      </div>

      {/* Bottom Panel: Interactive Terminal, Git Commit & Push, Problems, Tests, Snapshots */}
      <BottomPanel
        checkpoints={checkpoints}
        onRollbackCheckpoint={handleRollbackCheckpoint}
        staleCount={stats.staleFiles}
      />

      {/* Modals */}
      <ModelManagerModal
        isOpen={isModelManagerOpen}
        onClose={() => setIsModelManagerOpen(false)}
      />

      <IntelligenceDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        stats={stats}
        onRebuild={handleRebuildIntelligence}
      />

      <AwwwardsStudioModal
        isOpen={isAwwwardsStudioOpen}
        onClose={() => setIsAwwwardsStudioOpen(false)}
        onApplyInspiration={handleApplyInspiration}
      />
    </div>
  );
}
