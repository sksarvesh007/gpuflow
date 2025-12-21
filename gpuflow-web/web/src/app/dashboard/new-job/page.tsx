"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Code2 } from "lucide-react";
import { IDE, FileMap } from "@/components/ide"; // Import the new component

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Initialize with a default main.py
  const [files, setFiles] = useState<FileMap>({
    "main.py": {
      language: "python",
      content: `import sys\nfrom utils import hello\n\nprint("--- Starting Job ---")\nhello()\nprint(f"Python: {sys.version}")`
    },
    "utils.py": {
      language: "python",
      content: `def hello():\n    print("Hello from utils.py!")`
    }
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Pack all files into a JSON string to send to backend
      const payload = JSON.stringify(files);
      
      await api.post("/jobs/", {
        code_string: payload, // We send the whole project as JSON
        requirements: {}
      });
      router.push("/dashboard?job_started=true");
    } catch (err) {
      alert("Failed to submit job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Code2 className="text-blue-400"/> New Training Job
          </h1>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 px-8"
          >
            {loading ? "Scheduling..." : <><Play className="w-4 h-4 mr-2"/> Run Project</>}
          </Button>
        </div>

        {/* IDE Area */}
        <IDE files={files} setFiles={setFiles} />

        {/* Info Card */}
        <Card className="bg-slate-900 border-slate-800 text-white mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Job Configuration</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-400">
             <p>All files will be uploaded to the GPU. Ensure your entry point is named <b>main.py</b>.</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}