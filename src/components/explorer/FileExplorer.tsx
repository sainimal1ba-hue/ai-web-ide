import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, Plus, Trash2, AlertCircle, ChevronRight, ChevronDown, FolderInput, RotateCcw, Sparkles } from 'lucide-react';
import type { FileMetadata } from '../../engine/truth-engine/types';
import { isCleanSourceFile } from '../../utils/fileFilter';

interface FileExplorerProps {
  files: FileMetadata[];
  activeFilePath: string;
  onSelectFile: (path: string) => void;
  onCreateFile: () => void;
  onDeleteFile: (path: string) => void;
  onOpenFolder: (newFiles: Record<string, string>, folderName: string) => void;
  onResetSampleWorkspace: () => void;
}

interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: Record<string, TreeNode>;
  fileMeta?: FileMetadata;
}

const IGNORED_DIRECTORIES = new Set(['node_modules', '.git', '.next', '.turbo', 'turbopack', 'dist', 'build', 'out', '.vite', 'coverage', '.idea']);

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFilePath,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onOpenFolder,
  onResetSampleWorkspace
}) => {
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (folderPath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedFolders(prev => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  const buildTree = (): TreeNode => {
    const root: TreeNode = { name: 'root', path: '', isFolder: true, children: {} };

    files.forEach((file) => {
      const parts = file.path.split('/');
      const filename = parts[parts.length - 1];
      if (!isCleanSourceFile(filename, file.path)) return;

      let current = root;

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const currentPath = parts.slice(0, index + 1).join('/');

        if (isLast) {
          current.children[part] = {
            name: part,
            path: file.path,
            isFolder: false,
            children: {},
            fileMeta: file
          };
        } else {
          if (!current.children[part]) {
            current.children[part] = {
              name: part,
              path: currentPath,
              isFolder: true,
              children: {}
            };
          }
          current = current.children[part];
        }
      });
    });

    return root;
  };

  const handleOpenLocalFolder = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker();
        const loadedFiles: Record<string, string> = {};

        const readDirRecursive = async (handle: any, relativePath: string = '') => {
          for await (const entry of handle.values()) {
            const entryPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
            
            if (entry.kind === 'file') {
              if (isCleanSourceFile(entry.name, entryPath)) {
                try {
                  const file = await entry.getFile();
                  if (file.size < 2 * 1024 * 1024) {
                    const text = await file.text();
                    loadedFiles[entryPath] = text;
                  }
                } catch (e) {}
              }
            } else if (entry.kind === 'directory' && !IGNORED_DIRECTORIES.has(entry.name.toLowerCase())) {
              await readDirRecursive(entry, entryPath);
            }
          }
        };

        await readDirRecursive(dirHandle);

        if (Object.keys(loadedFiles).length > 0) {
          onOpenFolder(loadedFiles, dirHandle.name);
        } else {
          alert('No supported source files found in selected directory.');
        }
      } else {
        alert('File System Access API not supported in this browser environment.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Folder picker error:', err);
      }
    }
  };

  const treeRoot = buildTree();
  const hasFiles = files.length > 0 && Object.keys(treeRoot.children).length > 0;

  const renderTree = (node: TreeNode, depth: number = 0) => {
    const sortedKeys = Object.keys(node.children).sort((a, b) => {
      const childA = node.children[a];
      const childB = node.children[b];
      if (childA.isFolder && !childB.isFolder) return -1;
      if (!childA.isFolder && childB.isFolder) return 1;
      return a.localeCompare(b);
    });

    return (
      <div className="space-y-0.5">
        {sortedKeys.map((key) => {
          const child = node.children[key];
          const isCollapsed = collapsedFolders[child.path];

          if (child.isFolder) {
            return (
              <div key={child.path} className="space-y-0.5">
                <div
                  onClick={(e) => toggleFolder(child.path, e)}
                  className="flex items-center space-x-1.5 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800/70 rounded cursor-pointer font-medium select-none transition-colors"
                  style={{ paddingLeft: `${depth * 10 + 8}px` }}
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}

                  {isCollapsed ? (
                    <Folder className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  ) : (
                    <FolderOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  )}
                  <span className="truncate font-mono text-[11px]">{child.name}</span>
                </div>

                {!isCollapsed && renderTree(child, depth + 1)}
              </div>
            );
          }

          // File Node
          const isActive = child.path === activeFilePath;
          const fileMeta = child.fileMeta;
          const isQwythos = child.name.endsWith('.qw') || child.name.endsWith('.qwythos');

          return (
            <div
              key={child.path}
              onClick={() => onSelectFile(child.path)}
              className={`group flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer transition-all ${
                isActive
                  ? 'bg-indigo-600/25 text-indigo-200 font-semibold border-l-2 border-indigo-400 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
              }`}
              style={{ paddingLeft: `${(depth + 1) * 10 + 8}px` }}
            >
              <div className="flex items-center space-x-2 truncate">
                {isQwythos ? (
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 animate-pulse" />
                ) : (
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                )}
                <span className="truncate font-mono text-[11px]">{child.name}</span>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                {fileMeta?.isStale ? (
                  <span title="Stale Hash: External edit detected" className="flex items-center">
                    <AlertCircle className="w-3 h-3 text-amber-400 animate-pulse" />
                  </span>
                ) : (
                  <span title={`SHA-256: ${fileMeta?.hash.slice(0, 8)}`} className="text-[10px] text-slate-600 font-mono group-hover:text-slate-400">
                    {fileMeta?.hash.slice(0, 4)}
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(child.path);
                  }}
                  title="Delete file"
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-950 text-slate-500 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col h-full select-none font-sans">
      {/* Explorer Header */}
      <div className="h-10 px-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
          <Folder className="w-3.5 h-3.5 text-indigo-400" />
          <span>PROJECT FILES</span>
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={onCreateFile}
            title="New File"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Folder Open Toolbar */}
      <div className="p-2 border-b border-slate-800/80 bg-slate-900/40 flex space-x-1.5">
        <button
          onClick={handleOpenLocalFolder}
          className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2.5 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[11px] font-semibold transition-all shadow-md shadow-indigo-600/20"
        >
          <FolderInput className="w-3.5 h-3.5" />
          <span>Open Folder</span>
        </button>

        <button
          onClick={onResetSampleWorkspace}
          title="Load Sample Workspace"
          className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* File Tree List or Empty Workspace Indicator */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {hasFiles ? (
          renderTree(treeRoot)
        ) : (
          <div className="p-4 text-center space-y-2 text-slate-500">
            <p className="text-xs">No files in workspace.</p>
            <p className="text-[11px] text-slate-600">Click <strong>"Open Folder"</strong> to open a local repository, or click <strong>"+"</strong> to create a new file.</p>
          </div>
        )}
      </div>
    </div>
  );
};
