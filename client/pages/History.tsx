import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type HistoryItem = {
  id: string;
  ts: number;
  phone?: string | null;
  memoryScore: number;
  speechScore: number;
  attentionScore: number;
  label: "Low" | "Medium" | "High";
};

export default function History() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("guardian_medics_history");
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as HistoryItem[];
      setItems(data.reverse());
    } catch (e) {
      console.error(e);
    }
  }, []);

  const clear = () => {
    if (!confirm("Clear history?")) return;
    localStorage.setItem("guardian_medics_history", JSON.stringify([]));
    setItems([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 py-12">
      <div className="container">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Assessment History</h1>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost">Back</Button>
            </Link>
            <Button variant="destructive" onClick={clear}>Clear</Button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-8 rounded-xl border bg-card p-6 text-center">
            <p className="text-muted-foreground">No assessment sessions yet. Run an assessment to see results here.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {items.map((it) => (
              <div key={it.id} className="rounded-xl border bg-card p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{it.label} Risk</div>
                  <div className="text-sm text-muted-foreground">{new Date(it.ts).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Memory: {Math.round(it.memoryScore * 100)}%</div>
                  <div className="text-sm">Speech: {Math.round(it.speechScore * 100)}%</div>
                  <div className="text-sm">Attention: {Math.round(it.attentionScore * 100)}%</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
