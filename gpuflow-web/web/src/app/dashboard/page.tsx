"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Server,
  Play,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Activity,
} from "lucide-react";
import Link from "next/link";

interface User {
  email: string;
  credits: number;
}

interface Machine {
  id: string;
  name: string;
  gpu_name?: string;
  vram_gb?: number;
  is_online: boolean;
}

interface Job {
  id: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // 1. Get Profile
      const userRes = await api.get("/users/me");
      setUser(userRes.data);

      // 2. Get Machines
      const machinesRes = await api.get("/machines/");
      setMachines(machinesRes.data);

      // 3. Get Jobs
      const jobsRes = await api.get("/jobs/");
      setJobs(jobsRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [fetchData, router]);

  if (loading)
    return <div className="p-8 text-white">Loading Dashboard...</div>;

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

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Dashboard
              </span>
            </h1>
            <p className="text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Welcome back,{" "}
              <span className="text-white font-medium">{user?.email}</span>
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-xl">
              <div className="text-xs text-slate-400 mb-1">
                Available Credits
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                ${user?.credits}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="border-slate-700 hover:border-purple-500/50 bg-slate-900/50 hover:bg-slate-800/50 backdrop-blur-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Active Machines"
            value={machines.length}
            icon={<Server className="text-blue-400" />}
            gradient="from-blue-500/10 to-cyan-500/10"
            iconBg="bg-blue-500/10"
          />
          <StatsCard
            title="Total Jobs"
            value={jobs.length}
            icon={<Activity className="text-green-400" />}
            gradient="from-green-500/10 to-emerald-500/10"
            iconBg="bg-green-500/10"
          />
          <StatsCard
            title="Avg. Cost / Hr"
            value="$0.45"
            icon={<TrendingUp className="text-purple-400" />}
            gradient="from-purple-500/10 to-pink-500/10"
            iconBg="bg-purple-500/10"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="machines" className="w-full">
          <TabsList className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-1">
            <TabsTrigger
              value="machines"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              My Machines
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              Job History
            </TabsTrigger>
          </TabsList>

          {/* MACHINES TAB */}
          <TabsContent value="machines" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your GPU Rigs</h2>
              <Button
                onClick={() => router.push("/dashboard/add-machine")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25"
              >
                <Plus className="w-4 h-4 mr-2" /> Register Machine
              </Button>
            </div>

            <div className="grid gap-4">
              {machines.length === 0 ? (
                <p className="text-slate-500 italic">
                  No machines registered yet.
                </p>
              ) : (
                machines.map((m) => (
                  <Card
                    key={m.id}
                    className="group bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-slate-800/50 hover:border-purple-500/30 text-white backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                  >
                    <CardContent className="p-6 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                          <Server className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-1">{m.name}</h3>
                          <p className="text-sm text-slate-400">
                            {m.gpu_name || "Waiting for connection..."}
                            {m.vram_gb && (
                              <span className="ml-2 px-2 py-0.5 rounded-md bg-slate-800/50 text-xs">
                                {m.vram_gb}GB VRAM
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge
                          status={m.is_online ? "online" : "offline"}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* JOBS TAB */}
          <TabsContent value="jobs" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Jobs</h2>
              <Button
                onClick={() => router.push("/dashboard/new-job")}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/25"
              >
                <Play className="w-4 h-4 mr-2" /> New Training Job
              </Button>
            </div>

            <div className="space-y-3">
              {jobs.length === 0 ? (
                <p className="text-slate-500 italic">No jobs run yet.</p>
              ) : (
                jobs.map((job) => (
                  <Link
                    href={`/dashboard/jobs/${job.id}`}
                    key={job.id}
                    className="block group"
                  >
                    <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-slate-800/50 group-hover:border-purple-500/30 text-white backdrop-blur-xl transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/10">
                      <CardContent className="p-5 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                            <Play className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-mono text-sm font-medium text-purple-400 group-hover:text-purple-300 transition-colors mb-1">
                              #{job.id.slice(0, 8)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(job.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={job.status} />
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Small Helper Components
function StatsCard({
  title,
  value,
  icon,
  gradient,
  iconBg,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
}) {
  return (
    <Card
      className={`group bg-gradient-to-br ${gradient} border-slate-800/50 hover:border-slate-700/50 text-white backdrop-blur-xl transition-all duration-300 hover:shadow-lg`}
    >
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-2">{title}</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 text-transparent bg-clip-text">
            {value}
          </p>
        </div>
        <div
          className={`p-4 ${iconBg} rounded-2xl group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: "bg-green-500/20 text-green-400",
    offline: "bg-red-500/20 text-red-400",
    completed: "bg-green-500/20 text-green-400",
    running: "bg-blue-500/20 text-blue-400",
    failed: "bg-red-500/20 text-red-400",
    pending: "bg-yellow-500/20 text-yellow-400",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
        colors[status] || "bg-gray-500"
      }`}
    >
      {status}
    </span>
  );
}
