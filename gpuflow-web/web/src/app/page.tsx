import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cpu, Zap, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white selection:bg-purple-500/30">
      
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-24 text-center">
        <div className="mb-8 p-4 rounded-full bg-slate-900 border border-slate-800 animate-pulse">
          <span className="text-purple-400 text-sm font-medium">✨ v1.0 Public Beta is Live</span>
        </div>

        <h1 className="text-7xl font-bold mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            GPUFlow
          </span>
        </h1>
        
        <p className="text-xl text-slate-400 mb-12 max-w-2xl">
          The decentralized marketplace for AI training. Rent idle GPUs for a fraction of the cloud cost, or monetize your hardware instantly.
        </p>
        
        <div className="flex gap-6">
          <Link href="/login">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6">
              Start Renting
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6">
              Become a Provider
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
          <FeatureCard 
            icon={<Cpu className="w-8 h-8 text-blue-400" />}
            title="Massive Compute"
            desc="Access H100s, A100s, and RTX 4090s on demand."
          />
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-yellow-400" />}
            title="Instant Setup"
            desc="Dockerized environments. No driver hell. Just code."
          />
          <FeatureCard 
            icon={<Shield className="w-8 h-8 text-green-400" />}
            title="Secure Sandbox"
            desc="Enterprise-grade isolation for your sensitive models."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 transition-colors">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-slate-200">{title}</h3>
      <p className="text-slate-400">{desc}</p>
    </div>
  )
}