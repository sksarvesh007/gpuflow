"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { FileCode, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Type for our file structure
export type FileMap = {
  [filename: string]: {
    language: string;
    content: string;
  };
};

interface IDEProps {
  files: FileMap;
  setFiles: (files: FileMap) => void;
}

export function IDE({ files, setFiles }: IDEProps) {
  const [activeFile, setActiveFile] = useState("main.py");
  const [newFileName, setNewFileName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Handle content changes in the editor
  const handleEditorChange = (value: string | undefined) => {
    setFiles({
      ...files,
      [activeFile]: { ...files[activeFile], content: value || "" },
    });
  };

  // Add a new file
  const addNewFile = () => {
    if (!newFileName) return setIsCreating(false);
    if (files[newFileName]) return alert("File already exists");

    setFiles({
      ...files,
      [newFileName]: { language: "python", content: "# New file" },
    });
    setActiveFile(newFileName);
    setNewFileName("");
    setIsCreating(false);
  };

  // Delete a file (prevent deleting main.py)
  const deleteFile = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (name === "main.py") return alert("Cannot delete main entry point");

    const newFiles = { ...files };
    delete newFiles[name];
    setFiles(newFiles);
    if (activeFile === name) setActiveFile("main.py");
  };

  return (
    <div className="flex h-[600px] border border-slate-800 rounded-lg overflow-hidden bg-[#1e1e1e]">
      {/* LEFT SIDEBAR: FILE EXPLORER */}
      <div className="w-64 bg-[#252526] flex flex-col border-r border-slate-800">
        <div className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
          <span>Explorer</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 hover:bg-slate-700"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-0.5 p-2">
            {Object.keys(files).map((fileName) => (
              <div
                key={fileName}
                onClick={() => setActiveFile(fileName)}
                className={cn(
                  "flex items-center justify-between px-3 py-1.5 rounded cursor-pointer text-sm group",
                  activeFile === fileName
                    ? "bg-[#37373d] text-white"
                    : "text-slate-400 hover:bg-[#2a2d2e] hover:text-slate-200"
                )}
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span>{fileName}</span>
                </div>
                {fileName !== "main.py" && (
                  <Trash2
                    className="w-3 h-3 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => deleteFile(fileName, e)}
                  />
                )}
              </div>
            ))}

            {/* Input for new file */}
            {isCreating && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#37373d]">
                <FileCode className="w-4 h-4 text-slate-400" />
                <input
                  autoFocus
                  className="bg-transparent border-none outline-none text-sm text-white w-full"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onBlur={addNewFile}
                  onKeyDown={(e) => e.key === "Enter" && addNewFile()}
                  placeholder="filename.py"
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* RIGHT SIDE: MONACO EDITOR */}
      <div className="flex-1 flex flex-col">
        {/* Tab Bar */}
        <div className="flex bg-[#1e1e1e] border-b border-[#2d2d2d]">
          <div className="px-4 py-2 text-sm bg-[#1e1e1e] border-r border-[#2d2d2d] text-white flex items-center gap-2">
            <FileCode className="w-4 h-4 text-yellow-400" /> {activeFile}
          </div>
        </div>

        <Editor
          height="100%"
          defaultLanguage="python"
          path={activeFile} // This helps Monaco keep separate history/undo for each file
          theme="vs-dark"
          value={files[activeFile].content}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
