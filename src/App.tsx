import { useState, useEffect, useRef } from 'react';
import { Header } from './components/layout/Header';
import { FileExplorer } from './components/explorer/FileExplorer';
import { CodeEditor } from './components/editor/CodeEditor';
import { AgentWorkspace } from './components/agent/AgentWorkspace';
import { BottomPanel } from './components/bottom/BottomPanel';
import { ModelManagerModal } from './components/modals/ModelManagerModal';
import { IntelligenceDashboardModal } from './components/modals/IntelligenceDashboardModal';

import { TruthEngine } from './engine/truth-engine/TruthEngine';
import { CheckpointEngine } from './engine/git-engine/CheckpointEngine';
import { ModelManager } from './engine/model-router/ModelManager';
import { AgentOrchestrator } from './engine/agent-framework/AgentOrchestrator';
import type { FileMetadata, TruthEngineStats } from './engine/truth-engine/types';
import type { AgentRoleName, AgentEvent, PlanOutput } from './engine/agent-framework/types';
import type { AICheckpoint } from './engine/git-engine/types';
import { SAMPLE_PROJECT_FILES } from './data/sampleProject';

export function App() {
  // Master state
  const [filesState, setFilesState] = useState<Record<string, string>>({ ...SAMPLE_PROJECT_FILES });
  const [workspaceName, setWorkspaceName] = useState<string>('sample-project');
  const [openTabs, setOpenTabs] = useState<string[]>([
    'src/qwythos/agent_truth.qw',
    'src/index.ts',
    'src/services/AuthService.ts'
  ]);
  const [activeFilePath, setActiveFilePath] = useState<string>('src/qwythos/agent_truth.qw');
  const [selectedModel, setSelectedModel] = useState<string>('qwythos-max-reasoning');
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(true);
  const [activeAgent, setActiveAgent] = useState<AgentRoleName>('planner');

  // Modals state
  const [isModelManagerOpen, setIsModelManagerOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

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

  const [_events, setEvents] = useState<AgentEvent[]>([]);
  const [checkpoints, setCheckpoints] = useState<AICheckpoint[]>([]);
  const [latestPlan, setLatestPlan] = useState<PlanOutput | null>(null);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);

  // Initial Intelligence Indexing - single-pass instant initialization
  useEffect(() => {
    const initEngine = async () => {
      const orchestrator = new AgentOrchestrator(
        truthEngineRef.current,
        checkpointEngineRef.current,
        modelManagerRef.current,
        filesState
      );
      orchestratorRef.current = orchestrator;

      orchestrator.eventStream.subscribe((evt) => {
        setEvents(prev => [...prev, evt]);
      });

      const newStats = await truthEngineRef.current.rebuildFullIntelligence(filesState);
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

    if (activeFilePath === tabPath && nextTabs.length > 0) {
      setActiveFilePath(nextTabs[nextTabs.length - 1]);
    }
  };

  const handleFileChange = async (newContent: string) => {
    setFilesState(prev => ({ ...prev, [activeFilePath]: newContent }));
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
      handleCloseTab(path);
      truthEngineRef.current.scanner.removeFile(path);
      truthEngineRef.current.symbolGraph.removeFileSymbols(path);
      truthEngineRef.current.dependencyGraph.removeFileDependencies(path);
      refreshStats();
    }
  };

  // Open Local Folder
  const handleOpenFolder = async (newFiles: Record<string, string>, folderName: string) => {
    setWorkspaceName(folderName);
    setFilesState(newFiles);

    const firstFewFiles = Object.keys(newFiles).slice(0, 5);
    setOpenTabs(firstFewFiles);
    if (firstFewFiles[0]) setActiveFilePath(firstFewFiles[0]);

    const newStats = await truthEngineRef.current.rebuildFullIntelligence(newFiles);
    setStats(newStats);

    if (orchestratorRef.current) {
      orchestratorRef.current.eventStream.logEvent({
        agent: 'architect',
        action: 'opened_local_folder',
        reason: `Opened local workspace "${folderName}" with ${Object.keys(newFiles).length} source files. Project Truth Engine indexed cleanly.`,
        result: 'success'
      });
    }
  };

  // Reset to Sample Workspace
  const handleResetSampleWorkspace = async () => {
    setWorkspaceName('sample-project');
    setFilesState({ ...SAMPLE_PROJECT_FILES });
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

  // Run Autonomous Agent Pipeline
  const handleRunAutonomousGoal = async (objective: string) => {
    if (!orchestratorRef.current) return;
    setIsRunningPipeline(true);

    try {
      const result = await orchestratorRef.current.runAutonomousPipeline(objective);
      setLatestPlan(result.plan);
      setFilesState({ ...filesState });
      refreshStats();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunningPipeline(false);
    }
  };

  // Rollback Checkpoint
  const handleRollbackCheckpoint = async (checkpointId: string) => {
    const restored = checkpointEngineRef.current.rollbackCheckpoint(checkpointId);
    if (restored) {
      setFilesState(restored);
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
          files={fileMetadataList.length > 0 ? fileMetadataList : Object.keys(filesState).map(p => ({
            id: p,
            path: p,
            hash: 'syncing',
            size: filesState[p].length,
            mtime: Date.now(),
            language: 'typescript' as any,
            astVersion: 1,
            isStale: false
          }))}
          activeFilePath={activeFilePath}
          onSelectFile={handleSelectFile}
          onCreateFile={handleCreateFile}
          onDeleteFile={handleDeleteFile}
          onOpenFolder={handleOpenFolder}
          onResetSampleWorkspace={handleResetSampleWorkspace}
        />

        {/* Center: Full-Height Monaco Code & Live Diff Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CodeEditor
            filePath={activeFilePath}
            content={filesState[activeFilePath] || ''}
            openTabs={openTabs}
            onSelectTab={handleSelectFile}
            onCloseTab={handleCloseTab}
            onChangeContent={handleFileChange}
            onRunInlineEdit={(instruction) => handleRunAutonomousGoal(`Inline Edit: ${instruction}`)}
          />
        </div>

        {/* Right Sidebar: AI Agent Workspace with Live Reasoning */}
        <AgentWorkspace
          onRunAutonomousGoal={handleRunAutonomousGoal}
          isRunningPipeline={isRunningPipeline}
          latestPlan={latestPlan}
          activeAgent={activeAgent}
          onSelectAgent={setActiveAgent}
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
    </div>
  );
}
