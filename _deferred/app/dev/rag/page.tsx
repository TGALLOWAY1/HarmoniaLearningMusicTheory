"use client";

import { useState } from "react";

const DEFAULT_PROMPT =
  "Give a i–VI–III–VII progression in A minor with chord tones";

type ProgressionItem = {
  degree: string;
  symbol: string;
  notes: string[];
};

type Citation = {
  id: string;
  source: string;
  title: string;
  snippet: string;
};

type Verification = {
  passed: boolean;
  checksRun: string[];
  failures: string[];
  fallbackUsed: boolean;
};

type Result = {
  answer: string;
  progression: ProgressionItem[];
  citations: Citation[];
  verification: Verification;
  parsed: {
    keyRoot: string;
    keyType: string;
    romanNumerals: string[];
  };
};

export default function DevRagPage() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/rag/progression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.details || data.error || "Request failed");
        return;
      }
      setResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-light tracking-tight mb-2">
            RAG Progression Harness
          </h1>
          <p className="text-muted-foreground text-sm">
            Test prompts and verify chord progressions with KB citations.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Prompt</label>
          <textarea
            className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Give a i–VI–III–VII progression in A minor with chord tones"
          />
          <button
            onClick={handleRun}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Running…" : "Run"}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-medium mb-2">Answer</h2>
              <pre className="p-4 rounded-md bg-muted text-sm whitespace-pre-wrap font-mono">
                {result.answer}
              </pre>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-2">Progression</h2>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Degree</th>
                    <th className="text-left py-2 font-medium">Symbol</th>
                    <th className="text-left py-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {result.progression.map((c, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2">{c.degree}</td>
                      <td className="py-2">{c.symbol}</td>
                      <td className="py-2">{c.notes.join(" ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-2">Verification</h2>
              <div className="p-4 rounded-md bg-muted text-sm space-y-2">
                <p>
                  <span className="font-medium">Passed:</span>{" "}
                  {result.verification.passed ? "Yes" : "No"}
                </p>
                {result.verification.fallbackUsed && (
                  <p className="text-amber-600">Fallback used (corrected chord tones)</p>
                )}
                {result.verification.failures.length > 0 && (
                  <div>
                    <span className="font-medium">Failures:</span>
                    <ul className="list-disc list-inside mt-1">
                      {result.verification.failures.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p>
                  <span className="font-medium">Checks run:</span>{" "}
                  {result.verification.checksRun.join(", ")}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-2">Citations</h2>
              <ul className="space-y-3">
                {result.citations.map((c) => (
                  <li
                    key={c.id}
                    className="p-3 rounded-md border border-border/50 text-sm"
                  >
                    <p className="font-medium text-muted-foreground">{c.source}</p>
                    <p className="mt-1">{c.title}</p>
                    <p className="mt-1 text-muted-foreground">{c.snippet}…</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
