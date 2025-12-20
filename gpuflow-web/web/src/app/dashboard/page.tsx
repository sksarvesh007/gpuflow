"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Server, Play, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [machines, setMachines] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            Dashboard
          </h1>
          <p className="text-slate-400">Welcome back, {user?.email}</p>
        </div>
        <div className="flex gap-4 items-center bg-slate-900 p-2 rounded-lg border border-slate-800">
          <span className="px-3 text-sm text-slate-300">Credits: ${user?.credits}</span>
          <Button variant="outline" size="sm" onClick={fetchData}>
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
        />
        <StatsCard 
          title="Total Jobs" 
          value={jobs.length} 
          icon={<Play className="text-green-400" />} 
        />
        <StatsCard 
          title="Avg. Cost / Hr" 
          value="$0.45" 
          icon={<div className="text-yellow-400 font-bold">$</div>} 
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="machines" className="w-full">
        <TabsList className="bg-slate-900 border-slate-800">
          <TabsTrigger value="machines">My Machines</TabsTrigger>
          <TabsTrigger value="jobs">Job History</TabsTrigger>
        </TabsList>

        {/* MACHINES TAB */}
        <TabsContent value="machines" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your GPU Rigs</h2>
            <Button onClick={() => router.push("/dashboard/add-machine")} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" /> Register Machine
            </Button>
          </div>

          <div className="grid gap-4">
            {machines.length === 0 ? (
              <p className="text-slate-500 italic">No machines registered yet.</p>
            ) : (
              machines.map((m) => (
                <Card key={m.id} className="bg-slate-900 border-slate-800 text-white">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">{m.name}</h3>
                      <p className="text-sm text-slate-400">
                        {m.gpu_name || "Waiting for connection..."} • {m.vram_gb ? `${m.vram_gb}GB VRAM` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={m.is_online ? "online" : "offline"} />
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
            <Button onClick={() => router.push("/dashboard/new-job")} className="bg-blue-600 hover:bg-blue-700">
              <Play className="w-4 h-4 mr-2" /> New Training Job
            </Button>
          </div>

          <div className="space-y-3">
             {jobs.length === 0 ? (
              <p className="text-slate-500 italic">No jobs run yet.</p>
            ) : (
              jobs.map((job) => (
                <Card key={job.id} className="bg-slate-900 border-slate-800 text-white">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-mono text-sm text-purple-400">ID: {job.id.slice(0, 8)}...</p>
                      <p className="text-xs text-slate-500">Created: {new Date(job.created_at).toLocaleString()}</p>
                    </div>
                    <StatusBadge status={job.status} />
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Small Helper Components
function StatsCard({ title, value, icon }: any) {
  return (
    <Card className="bg-slate-900 border-slate-800 text-white">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-3 bg-slate-800 rounded-full">{icon}</div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    online: "bg-green-500/20 text-green-400",
    offline: "bg-red-500/20 text-red-400",
    completed: "bg-green-500/20 text-green-400",
    running: "bg-blue-500/20 text-blue-400",
    failed: "bg-red-500/20 text-red-400",
    pending: "bg-yellow-500/20 text-yellow-400",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${colors[status] || "bg-gray-500"}`}>
      {status}
    </span>
  );
}