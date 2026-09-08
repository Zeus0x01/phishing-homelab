import { parseLabDefinition, type LabDefinition, type LabRecord } from "./schema";

const fileModules = import.meta.glob("../../../labs/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

export function loadFileLabs(): LabRecord[] {
  const out: LabRecord[] = [];
  for (const [path, raw] of Object.entries(fileModules)) {
    try {
      const definition = parseLabDefinition(raw);
      out.push({ definition, source: "file", readonly: true });
    } catch (err) {
      console.error(`[labs] invalid file ${path}:`, err);
    }
  }
  return out.sort((a, b) => a.definition.title.localeCompare(b.definition.title));
}

export function mergeLabs(fileLabs: LabRecord[], dbLabs: LabDefinition[]): LabRecord[] {
  const map = new Map<string, LabRecord>();
  for (const rec of fileLabs) map.set(rec.definition.id, rec);
  for (const definition of dbLabs) {
    const existing = map.get(definition.id);
    if (existing?.source === "file") {
      map.set(`${definition.id}-db`, {
        definition: { ...definition, id: `${definition.id}-db` },
        source: "database",
        readonly: false,
      });
    } else {
      map.set(definition.id, { definition, source: "database", readonly: false });
    }
  }
  return [...map.values()].sort((a, b) => a.definition.title.localeCompare(b.definition.title));
}

export function findLab(records: LabRecord[], id: string) {
  return records.find((r) => r.definition.id === id) ?? null;
}
