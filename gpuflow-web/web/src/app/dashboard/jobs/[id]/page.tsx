"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, ArrowLeft, Clock, Cpu } from "lucide-react";

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchJob = async () => {
    try {
      const res = await api.get(`/jobs/${id}`); // We need to create this endpoint endpoint in backend first!
      setJob(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
    const interval = setInterval(() => {
      if (job?.status === "running" || job?.status === "pending" || job?.status === "assigned") {
        fetchJob();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [id, job?.status]);

  if (loading) return <div className="p-8 text-white">Loading Job Data...</div>;
  if (!job) return <div className="p-8 text-white">Job not found</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Job #{job.id.slice(0, 8)}
            </h1>
            <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
              <Clock className="w-4 h-4" /> 
              Created {new Date(job.created_at).toLocaleString()}
            </div>
          </div>
          <div className="ml-auto">
            <StatusBadge status={job.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Content: LOGS */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-slate-900 border-slate-800 text-white min-h-[500px] flex flex-col">
              <CardHeader className="border-b border-slate-800 py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-green-400" /> Console Output
                </CardTitle>
                {job.status === "running" && (
                   <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"/>
                )}
              </CardHeader>
              <CardContent className="p-0 flex-1 relative group">
                {/* LOGS VIEWER */}
                <div className="absolute inset-0 overflow-auto p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-300 selection:bg-purple-500/30">
                  {job.result_url || job.error_message || (
                    <span className="text-slate-600 italic">
                      {job.status === "pending" ? "Waiting for GPU..." : "No logs available."}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Details */}
          <div className="space-y-6">
             <Card className="bg-slate-900 border-slate-800 text-white">
              <CardHeader>
                <CardTitle className="text-md">Machine Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded border border-slate-800">
                  <div className="p-2 bg-slate-800 rounded">
                    <Cpu className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    {job.machine_id ? (
                        <>
                            <div className="font-medium text-sm">Assigned Worker</div>
                            <div className="text-xs text-slate-500 font-mono">{job.machine_id.slice(0,8)}...</div>
                        </>
                    ) : (
                        <div className="text-sm text-yellow-500">Searching for worker...</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    completed: "bg-green-500/20 text-green-400 border-green-500/50",
    running: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    failed: "bg-red-500/20 text-red-400 border-red-500/50",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  };
  return (
    <Badge variant="outline" className={`${colors[status] || "bg-slate-800"} uppercase tracking-wider`}>
      {status}
    </Badge>
  );
}