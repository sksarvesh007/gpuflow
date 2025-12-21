"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Terminal, CheckCircle2 } from "lucide-react";

export default function AddMachinePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/machines/", { name });
      setToken(res.data.auth_token); // Save token to show user
    } catch (_err) {
      alert("Failed to create machine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 flex items-center justify-center">
      <Card className="w-full max-w-lg bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle>Connect New Hardware</CardTitle>
        </CardHeader>
        <CardContent>
          {!token ? (
            /* FORM STATE */
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">
                  Machine Name
                </label>
                <Input
                  placeholder="e.g. Home Gaming Rig"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? "Generating Keys..." : "Register & Get Token"}
              </Button>
            </form>
          ) : (
            /* SUCCESS STATE */
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col items-center text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <h3 className="text-xl font-bold">Machine Created!</h3>
                <p className="text-slate-400 text-sm">
                  Copy this token immediately. It will not be shown again.
                </p>
              </div>

              <Alert className="bg-slate-950 border-purple-500/50">
                <Terminal className="h-4 w-4 text-purple-400" />
                <AlertTitle className="text-purple-400">Auth Token</AlertTitle>
                <AlertDescription className="mt-2 flex items-center justify-between gap-2 bg-slate-900 p-2 rounded border border-slate-800 font-mono text-xs break-all">
                  {token}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => navigator.clipboard.writeText(token)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
