import type { ComponentType } from "react";
import type { LabDefinition } from "@/lib/labs/schema";

export type LabRendererProps = {
  lab: LabDefinition;
  onCheck: (stepId: string, value: string) => void;
  answers: Record<string, string>;
};

export type LabRendererModule = {
  id: string;
  label: string;
  Component: ComponentType<LabRendererProps>;
};

const registry = new Map<string, LabRendererModule>();

export function registerLabRenderer(mod: LabRendererModule) {
  registry.set(mod.id, mod);
}

export function getLabRenderer(id: string) {
  return registry.get(id) ?? registry.get("generic") ?? null;
}

export function listLabRenderers() {
  return [...registry.values()];
}
