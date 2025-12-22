"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export default function Home() {
  const chartData = useMemo(
    () =>
      Array.from({ length: 50 }).map(() => ({
        height: Math.random() * 100,
        color: ["bg-red-500", "bg-orange-500", "bg-yellow-500"][
          Math.floor(Math.random() * 3)
        ],
      })),
    []
  );

  return (
    <div className="relative min-h-screen bg-black text-white font-mono overflow-hidden">
      <DottedGlowBackground
        className="fixed inset-0 z-0 pointer-events-none mask-radial-to-90% mask-radial-at-center"
        opacity={0.5}
        gap={8}
        radius={1.2}
        colorLightVar="--color-neutral-300"
        glowColorLightVar="--color-orange-200"
        colorDarkVar="--color-neutral-500"
        glowColorDarkVar="--color-orange-900"
        backgroundOpacity={0.6}
        speedMin={0.1}
        speedMax={0.5}
        speedScale={0.8}
      />
      {/* Corner decorations */}
      <div className="fixed top-4 left-4 flex gap-2 z-50">
        <div className="w-3 h-3 border border-white"></div>
        <div className="w-3 h-3 border border-white"></div>
        <div className="w-3 h-3 border border-white"></div>
      </div>
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <div className="w-3 h-3 bg-white"></div>
        <div className="w-3 h-3 border border-red-500"></div>
      </div>
      <div className="fixed bottom-4 left-4 flex gap-2 z-50">
        <div className="w-3 h-3 border border-white"></div>
        <div className="w-3 h-3 bg-red-500"></div>
      </div>
      <div className="fixed bottom-4 right-4 flex gap-2 z-50">
        <div className="w-3 h-3 border border-white"></div>
      </div>

      {/* Main container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen relative z-10">
        {/* Left side - Content */}
        <div className="flex flex-col justify-between p-5 lg:p-16 relative z-10">
          {/* Header */}
          <div className="relative z-10">
            <div className="text-3xl font-bold mb-12 tracking-wider flex items-baseline">
              <span className="text-4xl lg:text-5xl">GPU</span>
              <span
                style={{ fontFamily: '"Edu NSW ACT Cursive", cursive' }}
                className="text-2xl lg:text-4xl -ml-[-0.2rem]"
              >
                flow
              </span>
            </div>

            {/* Main heading */}
            <div className="mb-5">
              <h1 className="text-4xl lg:text-6xl font-bold mb-4 tracking-tighter [word-spacing:-0.2em]">
                RENT GPUs<span className="text-red-500">.</span>
                <br />
                RUN TRAINING JOBS<span className="text-red-500">.</span>
                <br />
                EARN & SCALE AUTOMATICALLY
                <span className="text-red-500">.</span>
              </h1>
              <p className="text-slate-400 text-sm lg:text-base mb-2">
                Rent out idle GPUs to earn, or submit training jobs via our
                Python SDK or dashboard. GPUFlow handles orchestration,
                monitoring, observability, and billing end-to-end.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 mb-16">
              <Link href="/register">
                <Button className="bg-white text-black hover:bg-slate-200 px-6 py-3 font-mono text-sm font-semibold">
                  Get started
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-2 border-white text-black hover:bg-white hover:text-black px-6 py-3 font-mono text-sm font-semibold"
                >
                  Book a demo
                </Button>
              </Link>
            </div>

            {/* Resource Overview */}
            <div className="border border-slate-800 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold tracking-tight">
                  RESOURCE
                  <br />
                  OVERVIEW
                </h2>
                <div className="flex gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">[ </span>
                    <span className="text-white">
                      GPUs: <span className="font-bold">24</span>
                    </span>
                    <span className="text-slate-500"> ]</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500">[ </span>
                  <span className="text-white">
                    Units: <span className="font-bold">130</span>
                  </span>
                  <span className="text-slate-500"> ]</span>
                </div>
                <div>
                  <span className="text-slate-500">[ </span>
                  <span className="text-white">
                    A100s: <span className="font-bold">15</span>
                  </span>
                  <span className="text-slate-500"> ]</span>
                </div>
                <div>
                  <span className="text-slate-500">[ </span>
                  <span className="text-white">
                    H100s: <span className="font-bold">7</span>
                  </span>
                  <span className="text-slate-500"> ]</span>
                </div>
              </div>
            </div>

            {/* Breakdown section */}
            <div className="border border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold">BREAKDOWN</div>
                <div className="flex gap-4 text-xs">
                  <select className="bg-black border border-slate-700 px-2 py-1 text-white">
                    <option>1 day</option>
                  </select>
                  <select className="bg-black border border-slate-700 px-2 py-1 text-white">
                    <option>Type: A100 GPUs</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500"></div>
                  <span className="text-slate-400">text-gen-pro</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500"></div>
                  <span className="text-slate-400">speech-caption</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500"></div>
                  <span className="text-slate-400">image-fusion</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500"></div>
                  <span className="text-slate-400">gui-sentinel</span>
                </div>
              </div>
              {/* Usage chart */}
              <div className="h-32 flex items-end gap-[2px]">
                {chartData.map((bar, i) => (
                  <div
                    key={i}
                    className={`flex-1 ${bar.color} transition-all duration-300`}
                    style={{ height: `${bar.height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer indicators */}
          <div className="flex justify-between items-center text-xs text-slate-600 mt-8">
            <div className="flex gap-2">
              <div className="w-2 h-2 border border-slate-700"></div>
              <div className="w-2 h-2 border border-slate-700"></div>
              <div className="w-2 h-2 border border-slate-700"></div>
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-red-500"></div>
              <div className="w-2 h-2 border border-slate-700"></div>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block p-8 overflow-hidden">
          <div className="absolute top-[100px] right-10 left-10 h-[500px]">
            {/* Orange Glow Effect - Around Border */}
            <div className="absolute -inset-1 bg-orange-500/30 blur-xl opacity-60 pointer-events-none" />
            <div className="absolute -inset-0 shadow-[0_0_50px_rgba(250,115,22,0.0)] border border-white/10 pointer-events-none rounded-lg" />

            <div className="color-border orange-glow-glow absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white z-20 pointer-events-none"></div>
            <div className="color-border orange-glow-glow absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-white z-20 pointer-events-none"></div>
            <div className="color-border orange-glow-glow absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-white z-20 pointer-events-none"></div>
            <div className="color-border orange-glow-glow absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white z-20 pointer-events-none"></div>

            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain object-left-top opacity-80 mix-blend-screen"
            >
              <source src="/wave.webm" type="video/webm" />
            </video>
            {/* Overlay gradient to blend edges */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
