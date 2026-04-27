import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const coreDir = resolve(repoRoot, "packages", "core");
const registerPath = resolve(coreDir, "src", "register.ts");
const customElementsManifestPath = resolve(coreDir, "custom-elements.json");
const componentDocsPath = resolve(coreDir, "component-docs.json");
const cemCommand = process.platform === "win32"
  ? resolve(repoRoot, "node_modules", ".bin", "cem.cmd")
  : resolve(repoRoot, "node_modules", ".bin", "cem");

execSync(`"${cemCommand}" analyze --litelement --globs "packages/core/src/components/**/emb-*.ts" --outdir "packages/core"`, {
  cwd: repoRoot,
  shell: process.platform === "win32",
  stdio: "inherit"
});

const manifest = JSON.parse(readFileSync(customElementsManifestPath, "utf8"));
const tagByClassName = parseRegisterDefinitions(readFileSync(registerPath, "utf8"));
const typeAliasesByModule = collectTypeAliases(manifest.modules ?? []);

const components = [];

for (const moduleDoc of manifest.modules ?? []) {
  const declarations = Array.isArray(moduleDoc.declarations) ? moduleDoc.declarations : [];

  for (const declaration of declarations) {
    if (declaration.kind !== "class") {
      continue;
    }

    const tagName = declaration.tagName ?? tagByClassName.get(declaration.name);
    if (!tagName) {
      continue;
    }

    const aliases = typeAliasesByModule.get(moduleDoc.path) ?? new Map();
    const moduleSource = readFileSync(resolve(repoRoot, moduleDoc.path), "utf8");
    const members = Array.isArray(declaration.members) ? declaration.members : [];
    const attributes = Array.isArray(declaration.attributes) ? declaration.attributes : [];
    const events = Array.isArray(declaration.events) ? declaration.events : [];
    const slots = mergeSlots(Array.isArray(declaration.slots) ? declaration.slots : [], parseSlotsFromSource(moduleSource));

    const publicFields = members.filter((member) => member.kind === "field" && member.privacy !== "private" && member.privacy !== "protected");
    const propertyDocs = publicFields.map((member) => {
      const attribute = attributes.find((entry) => entry.fieldName === member.name || entry.name === member.attribute);
      const resolvedType = resolveType(member.type?.text, aliases);

      return {
        attributeName: attribute?.name ?? member.attribute ?? null,
        defaultValue: member.default ?? attribute?.default ?? null,
        description: member.description || attribute?.description || "",
        name: member.name,
        reflects: Boolean(member.reflects),
        type: resolvedType.text,
        values: resolvedType.values
      };
    });

    const methodDocs = members
      .filter((member) => member.kind === "method" && member.privacy !== "private" && member.privacy !== "protected" && !isLifecycleMethod(member.name))
      .map((member) => ({
        description: member.description || "",
        name: member.name,
        parameters: (member.parameters ?? []).map((parameter) => ({
          name: parameter.name,
          optional: Boolean(parameter.optional),
          type: parameter.type?.text ?? null
        })),
        returnType: member.return?.type?.text ?? null
      }));

    const eventDocs = events.map((eventDoc) => {
      const resolvedType = resolveType(eventDoc.type?.text, aliases);

      return {
        description: eventDoc.description || "",
        name: eventDoc.name,
        type: resolvedType.text,
        values: resolvedType.values
      };
    });

    const slotDocs = slots.map((slotDoc) => ({
      description: slotDoc.description || "",
      name: slotDoc.name || "default"
    }));

    components.push({
      className: declaration.name,
      description: declaration.description || "",
      modulePath: moduleDoc.path,
      properties: propertyDocs,
      methods: methodDocs,
      events: eventDocs,
      slots: slotDocs,
      summary: declaration.summary || "",
      tagName
    });
  }
}

components.sort((left, right) => left.tagName.localeCompare(right.tagName));

writeFileSync(
  componentDocsPath,
  `${JSON.stringify(
    {
      components
    },
    null,
    2
  )}\n`,
  "utf8"
);

function collectTypeAliases(modules) {
  const aliasesByModule = new Map();

  for (const moduleDoc of modules) {
    const modulePath = resolve(repoRoot, moduleDoc.path);
    const source = readFileSync(modulePath, "utf8");
    const aliases = new Map();

    for (const match of source.matchAll(/export\s+type\s+([A-Za-z0-9_]+)\s*=\s*([^;]+);/gs)) {
      const name = match[1];
      const text = normalizeWhitespace(match[2]);
      const values = parseStringUnionValues(text);

      aliases.set(name, {
        text,
        values
      });
    }

    aliasesByModule.set(moduleDoc.path, aliases);
  }

  return aliasesByModule;
}

function isLifecycleMethod(name) {
  return new Set(["connectedCallback", "disconnectedCallback", "firstUpdated", "render", "updated", "willUpdate"]).has(name);
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function parseRegisterDefinitions(source) {
  const tagMap = new Map();

  for (const match of source.matchAll(/\[\s*"([^"]+)"\s*,\s*([A-Za-z0-9_]+)\s*\]/g)) {
    tagMap.set(match[2], match[1]);
  }

  return tagMap;
}

function parseStringUnionValues(typeText) {
  if (!typeText.includes("|")) {
    return null;
  }

  const parts = typeText.split("|").map((part) => part.trim());
  const values = [];

  for (const part of parts) {
    const quote = part.startsWith('"') && part.endsWith('"') ? '"' : part.startsWith("'") && part.endsWith("'") ? "'" : null;

    if (!quote) {
      return null;
    }

    values.push(part.slice(1, -1));
  }

  return values;
}

function resolveType(typeText, aliases) {
  if (!typeText) {
    return {
      text: null,
      values: null
    };
  }

  const inlineValues = parseStringUnionValues(typeText);
  if (inlineValues) {
    return {
      text: typeText,
      values: inlineValues
    };
  }

  const alias = aliases.get(typeText);
  if (alias) {
    return {
      text: alias.text,
      values: alias.values
    };
  }

  return {
    text: typeText,
    values: null
  };
}

function mergeSlots(documentedSlots, parsedSlots) {
  const slotsByName = new Map();

  for (const slot of documentedSlots) {
    slotsByName.set(slot.name || "default", slot);
  }

  for (const slot of parsedSlots) {
    if (!slotsByName.has(slot.name)) {
      slotsByName.set(slot.name, slot);
    }
  }

  return Array.from(slotsByName.values());
}

function parseSlotsFromSource(source) {
  const slots = [];

  for (const match of source.matchAll(/<slot(?:\s+[^>]*name=["']([^"']+)["'])?[^>]*>/g)) {
    slots.push({
      description: "",
      name: match[1] || "default"
    });
  }

  return slots;
}
