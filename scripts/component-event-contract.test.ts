import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import ts from "typescript";

import componentDocs from "../packages/core/component-docs.json";

type ComponentBindings = {
  tagName: string;
  nativeEvents: string[];
  passthroughEvents: string[];
  reactEvents?: string[];
  vueHandlers: { domEvent: string }[];
};

const require = createRequire(import.meta.url);
const { componentDefinitions }: { componentDefinitions: ComponentBindings[] } = require("./wrapper-manifest.mjs");

it("keeps every wrapped component's documented public events aligned with both frameworks", () => {
  const docsByTag = new Map(componentDocs.components.map((entry) => [entry.tagName, entry]));
  const differences: string[] = [];

  for (const component of componentDefinitions) {
    const docs = docsByTag.get(component.tagName);
    if (!docs) {
      differences.push(`${component.tagName} is missing component docs`);
      continue;
    }

    const documented = new Set(docs.events.map(({ name }) => name));
    const vue = component.vueHandlers.map(({ domEvent }) => domEvent);
    const react = component.reactEvents ? [...component.reactEvents, ...component.nativeEvents] : vue;
    const passthrough = component.passthroughEvents;

    for (const [framework, events] of [["React", react], ["Vue", vue]] as const) {
      const exposed = new Set([...events, ...passthrough]);
      for (const event of documented) {
        if (!exposed.has(event)) differences.push(`${component.tagName} ${event} has no ${framework} declaration`);
      }
      for (const event of exposed) {
        if (!documented.has(event)) differences.push(`${component.tagName} ${event} is undocumented in ${framework}`);
      }
      for (const event of passthrough) {
        if (events.includes(event)) differences.push(`${component.tagName} ${event} overrides ${framework} native propagation`);
      }
    }
  }

  expect(differences).toEqual([]);
});

it("documents the events components explicitly dispatch from their hosts", () => {
  const undocumented: string[] = [];

  for (const component of componentDocs.components) {
    const file = resolve(import.meta.dirname, "..", component.modulePath);
    const source = ts.createSourceFile(component.modulePath, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
    const declaration = source.statements.find((statement) => ts.isClassDeclaration(statement) && statement.name?.text === component.className);
    const documented = new Set(component.events.map(({ name }) => name));

    function checkDispatch(argument: ts.Expression): void {
      if (ts.isConditionalExpression(argument)) {
        checkDispatch(argument.whenTrue);
        checkDispatch(argument.whenFalse);
      }
      if (!ts.isNewExpression(argument)) return;
      const name = argument.arguments?.[0];
      if (name && ts.isStringLiteral(name) && !documented.has(name.text)) {
        undocumented.push(`${component.tagName} ${name.text}`);
      }
    }

    function visit(node: ts.Node): void {
      if (ts.isCallExpression(node) && node.expression.getText(source) === "this.dispatchEvent" && node.arguments[0]) {
        checkDispatch(node.arguments[0]);
      }
      ts.forEachChild(node, visit);
    }

    if (declaration) visit(declaration);
  }

  expect(undocumented).toEqual([]);
});
