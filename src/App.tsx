import { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { readDir } from '@tauri-apps/plugin-fs';
import './App.css';

interface FileEntry {
  name: string;
  isDirectory: boolean;
  path: string;
}

function App() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [error, setError] = useState<string>('');

  const getFileIcon = (isDirectory: boolean, fileName: string): string => {
    if (isDirectory) return '📁';

    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      'js': '📜',
      'ts': '📘',
      'json': '📋',
      'html': '🌐',
      'css': '🎨',
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️',
      'svg': '🖼️',
      'pdf': '📕',
      'txt': '📄',
      'md': '📝',
      'zip': '📦',
      'mp3': '🎵',
      'mp4': '🎬',
    };

    return iconMap[ext || ''] || '📄';
  };

  const getFileType = (isDirectory: boolean, fileName: string): string => {
    if (isDirectory) return '文件夹';

    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext ? ext.toUpperCase() : '文件';
  };

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: '选择文件夹',
      });

      if (!selected) {
        return;
      }

      const folderPath = selected as string;
      const entries = await readDir(folderPath);

      const fileEntries: FileEntry[] = entries.map(entry => ({
        name: entry.name,
        isDirectory: entry.isDirectory,
        path: `${folderPath}/${entry.name}`,
      }));

      // Sort: directories first, then alphabetically
      const sortedEntries = fileEntries.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      setFiles(sortedEntries);
      setCurrentPath(folderPath);
      setError('');
    } catch (err) {
      console.error('Error selecting folder:', err);
      setError(`错误：${err}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>📁 文件浏览器</h1>
        <p>选择文件夹并查看其中的文件</p>
      </div>

      <div className="controls">
        <button className="btn" onClick={handleSelectFolder}>
          选择文件夹
        </button>
        {currentPath && (
          <div className="current-path">
            <strong>当前路径：</strong>
            <span>{currentPath}</span>
          </div>
        )}
      </div>

      <div className="file-list">
        {error && <div className="error">{error}</div>}

        {!currentPath && !error && (
          <div className="empty-state">
            <div className="empty-state-icon">📂</div>
            <p>点击上方按钮选择一个文件夹</p>
          </div>
        )}

        {currentPath && files.length === 0 && !error && (
          <div className="empty-state">
            <p>此文件夹为空</p>
          </div>
        )}

        {files.length > 0 && (
          <>
            <h2>文件列表</h2>
            {files.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-icon">
                  {getFileIcon(file.isDirectory, file.name)}
                </div>
                <div className="file-name">{file.name}</div>
                <div className="file-type">
                  {getFileType(file.isDirectory, file.name)}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
