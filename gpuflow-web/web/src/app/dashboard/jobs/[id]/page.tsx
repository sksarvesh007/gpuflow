"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Terminal,
  ArrowLeft,
  Clock,
  Cpu,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface Job {
  id: string;
  status: string;
  created_at: string;
  machine_id?: string;
  result_url?: string;
  error_message?: string;
}

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchJob = useCallback(async () => {
    try {
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
    const interval = setInterval(() => {
      if (
        job?.status === "running" ||
        job?.status === "pending" ||
        job?.status === "assigned"
      ) {
        fetchJob();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [id, job?.status, fetchJob]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Job Data...</p>
        </div>
      </div>
    );

  if (!job)
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-xl font-semibold mb-2">Job not found</p>
          <p className="text-slate-400">
            This job may have been deleted or doesn&apos;t exist.
          </p>
        </div>
      </div>
    );

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white p-8 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-slate-800/50 backdrop-blur-xl border border-slate-800/50 hover:border-purple-500/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Job #{job.id.slice(0, 8)}
              </span>
            </h1>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>Created {new Date(job.created_at).toLocaleString()}</span>
            </div>
          </div>
          <div>
            <StatusBadge status={job.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content: LOGS */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-slate-800/50 text-white min-h-[600px] flex flex-col backdrop-blur-xl">
              <CardHeader className="border-b border-slate-800/50 py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Terminal className="w-5 h-5 text-green-400" />
                  </div>
                  <span>Console Output</span>
                </CardTitle>
                {job.status === "running" && (
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-400 font-medium">
                      Live
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0 flex-1 relative group">
                {/* LOGS VIEWER */}
                <div className="absolute inset-0 overflow-auto p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-300 selection:bg-purple-500/30">
                  {job.result_url || job.error_message || (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        {job.status === "pending" ? (
                          <>
                            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
                            <span className="text-slate-500 italic">
                              Waiting for GPU assignment...
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-600 italic">
                            No logs available yet.
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Details */}
          <div className="space-y-6">
            {/* Machine Info Card */}
            <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-slate-800/50 text-white backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Machine Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-purple-500/20 rounded-lg">
                      <Cpu className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      {job.machine_id ? (
                        <>
                          <div className="font-semibold text-sm text-white mb-1">
                            Assigned Worker
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            {job.machine_id.slice(0, 8)}...
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                          <span className="text-sm text-yellow-400 font-medium">
                            Searching for worker...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Timeline Card */}
            <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-slate-800/50 text-white backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <StatusTimelineItem
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    label="Created"
                    time={new Date(job.created_at).toLocaleString()}
                    active
                  />
                  <StatusTimelineItem
                    icon={
                      job.status === "running" || job.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )
                    }
                    label="Assigned"
                    time={job.machine_id ? "Assigned" : "Pending"}
                    active={!!job.machine_id}
                  />
                  <StatusTimelineItem
                    icon={
                      job.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : job.status === "failed" ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )
                    }
                    label={
                      job.status === "completed"
                        ? "Completed"
                        : job.status === "failed"
                        ? "Failed"
                        : "In Progress"
                    }
                    time={job.status === "running" ? "Running..." : job.status}
                    active={
                      job.status === "running" || job.status === "completed"
                    }
                  />
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
  const statusConfig: Record<
    string,
    { bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    completed: {
      bg: "bg-green-500/20",
      text: "text-green-400",
      border: "border-green-500/50",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    running: {
      bg: "bg-blue-500/20",
      text: "text-blue-400",
      border: "border-blue-500/50",
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
    },
    failed: {
      bg: "bg-red-500/20",
      text: "text-red-400",
      border: "border-red-500/50",
      icon: <XCircle className="w-4 h-4" />,
    },
    pending: {
      bg: "bg-yellow-500/20",
      text: "text-yellow-400",
      border: "border-yellow-500/50",
      icon: <Clock className="w-4 h-4" />,
    },
  };

  const config = statusConfig[status] || {
    bg: "bg-slate-800",
    text: "text-slate-400",
    border: "border-slate-700",
    icon: null,
  };

  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} ${config.border} uppercase tracking-wider px-4 py-2 flex items-center gap-2`}
    >
      {config.icon}
      {status}
    </Badge>
  );
}

function StatusTimelineItem({
  icon,
  label,
  time,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  time: string;
  active: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`p-2 rounded-lg ${
          active
            ? "bg-purple-500/20 text-purple-400"
            : "bg-slate-800/50 text-slate-500"
        } transition-colors`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div
          className={`text-sm font-medium ${
            active ? "text-white" : "text-slate-500"
          }`}
        >
          {label}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">{time}</div>
      </div>
    </div>
  );
}
