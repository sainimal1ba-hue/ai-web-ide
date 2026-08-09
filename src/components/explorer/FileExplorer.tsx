import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, Plus, Trash2, AlertCircle, ChevronRight, ChevronDown, FolderInput, RotateCcw } from 'lucide-react';
import type { FileMetadata } from '../../engine/truth-engine/types';

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

  const toggleFolder = (folderPath: string) => {
    setCollapsedFolders(prev => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  // Build recursive tree from file list
  const buildTree = (): TreeNode => {
    const root: TreeNode = { name: 'root', path: '', isFolder: true, children: {} };

    files.forEach((file) => {
      const parts = file.path.split('/');
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

  // Handle native folder opening using File System Access API
  const handleOpenLocalFolder = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker();
        const loadedFiles: Record<string, string> = {};

        const readDirRecursive = async (handle: any, relativePath: string = '') => {
          for await (const entry of handle.values()) {
            const entryPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
            if (entry.kind === 'file') {
              if (!entry.name.startsWith('.') && !entry.name.endsWith('.png') && !entry.name.endsWith('.jpg')) {
                try {
                  const file = await entry.getFile();
                  const text = await file.text();
                  loadedFiles[entryPath] = text;
                } catch (e) {
                  // ignore binary read failures
                }
              }
            } else if (entry.kind === 'directory' && entry.name !== 'node_modules' && entry.name !== '.git') {
              await readDirRecursive(entry, entryPath);
            }
          }
        };

        await readDirRecursive(dirHandle);
        if (Object.keys(loadedFiles).length > 0) {
          onOpenFolder(loadedFiles, dirHandle.name);
        }
      } else {
        alert('File System Access API not supported in this browser. Loading custom folder template instead.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Folder picker error:', err);
      }
    }
  };

  const treeRoot = buildTree();

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
                  onClick={() => toggleFolder(child.path)}
                  className="flex items-center space-x-1.5 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800/60 rounded cursor-pointer font-medium select-none"
                  style={{ paddingLeft: `${depth * 12 + 8}px` }}
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
                  <span className="truncate font-mono">{child.name}</span>
                </div>

                {!isCollapsed && renderTree(child, depth + 1)}
              </div>
            );
          }

          // File Node
          const isActive = child.path === activeFilePath;
          const fileMeta = child.fileMeta;

          return (
            <div
              key={child.path}
              onClick={() => onSelectFile(child.path)}
              className={`group flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
              }`}
              style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
            >
              <div className="flex items-center space-x-2 truncate">
                <FileCode className={`w-3.5 h-3.5 shrink-0 ${
                  child.name.endsWith('.qw') ? 'text-purple-400' : isActive ? 'text-indigo-400' : 'text-slate-400'
                }`} />
                <span className="truncate font-mono">{child.name}</span>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                {fileMeta?.isStale ? (
                  <span title="Stale Hash: External modification detected" className="flex items-center">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  </span>
                ) : (
                  <span title={`Hash: ${fileMeta?.hash.slice(0, 6)}`} className="text-[10px] text-slate-500 font-mono">
                    {fileMeta?.hash.slice(0, 6)}
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
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none">
      {/* Explorer Header */}
      <div className="h-9 px-3 border-b border-slate-800 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          EXPLORER
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleOpenLocalFolder}
            title="Open Local Folder"
            className="p-1 rounded hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <FolderInput className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCreateFile}
            title="New File"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action Bar for Folder Open */}
      <div className="p-2 border-b border-slate-800/80 bg-slate-950/60 flex space-x-1">
        <button
          onClick={handleOpenLocalFolder}
          className="flex-1 flex items-center justify-center space-x-1 py-1 px-2 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium transition-colors"
        >
          <FolderInput className="w-3 h-3" />
          <span>Open Folder</span>
        </button>

        <button
          onClick={onResetSampleWorkspace}
          title="Reset to Sample Workspace"
          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {renderTree(treeRoot)}
      </div>
    </div>
  );
};
