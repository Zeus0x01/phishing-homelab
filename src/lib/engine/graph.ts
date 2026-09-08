import type { ExtractedSample } from "@/lib/labs/artifacts";

export type GraphNode = {
  id: string;
  kind: "sample" | "domain" | "ip" | "url" | "attachment";
  label: string;
};

export type GraphEdge = { from: string; to: string };

export function buildAttackGraph(samples: ExtractedSample[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  const add = (n: GraphNode) => {
    if (!nodes.has(n.id)) nodes.set(n.id, n);
  };

  for (const s of samples) {
    const sampleId = `sample:${s.labId}:${s.sampleId}`;
    add({ id: sampleId, kind: "sample", label: s.subject.slice(0, 42) });
    const fromDom = s.artifacts.find((a) => a.kind === "domain");
    if (fromDom) {
      const id = `domain:${fromDom.value}`;
      add({ id, kind: "domain", label: fromDom.value });
      edges.push({ from: id, to: sampleId });
    }
    for (const ip of s.artifacts.filter((a) => a.kind === "ip")) {
      const id = `ip:${ip.value}`;
      add({ id, kind: "ip", label: ip.value });
      if (fromDom) edges.push({ from: `domain:${fromDom.value}`, to: id });
      edges.push({ from: id, to: sampleId });
    }
    for (const u of s.artifacts.filter((a) => a.kind === "url")) {
      const host = String(u.meta.hostname);
      const id = `url:${host}`;
      add({ id, kind: "url", label: host });
      edges.push({ from: sampleId, to: id });
      if (fromDom) edges.push({ from: `domain:${fromDom.value}`, to: id });
    }
    for (const a of s.artifacts.filter((a) => a.kind === "attachment")) {
      const id = `att:${a.value}`;
      add({ id, kind: "attachment", label: a.label });
      edges.push({ from: sampleId, to: id });
    }
  }

  return { nodes: [...nodes.values()], edges };
}
