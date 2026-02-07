import { Children, cloneElement, isValidElement, type ReactNode } from "react";

const NBSP = "\u00A0";
const JOIN_WORDS = [
  "и",
  "а",
  "но",
  "да",
  "или",
  "либо",
  "что",
  "как",
  "если",
  "когда",
  "чтобы",
  "в",
  "во",
  "на",
  "к",
  "ко",
  "с",
  "со",
  "о",
  "об",
  "обо",
  "у",
  "от",
  "по",
  "до",
  "из",
  "за",
  "под",
  "над",
  "при",
  "про",
  "без",
  "для",
  "через",
  "перед",
  "между"
];

const JOIN_WORDS_PATTERN = new RegExp(
  `(^|[\\s\\u00A0([{"«„“”'’])(${JOIN_WORDS.join("|")})(\\s+)`,
  "giu"
);

export function applyRussianNbsp(text: string): string {
  if (!text) {
    return text;
  }

  return text.replace(JOIN_WORDS_PATTERN, (_match, prefix: string, word: string) => {
    return `${prefix}${word}${NBSP}`;
  });
}

export function applyRussianNbspToNode(node: ReactNode): ReactNode {
  if (typeof node === "string") {
    return applyRussianNbsp(node);
  }

  if (node === null || node === undefined || typeof node === "boolean" || typeof node === "number") {
    return node;
  }

  if (Array.isArray(node)) {
    return Children.map(node, (child) => applyRussianNbspToNode(child));
  }

  if (!isValidElement<{ children?: ReactNode }>(node)) {
    return node;
  }

  if (typeof node.type === "string" && ["code", "pre", "script", "style", "textarea"].includes(node.type)) {
    return node;
  }

  const originalChildren = node.props.children;
  if (originalChildren === undefined) {
    return node;
  }

  if (typeof originalChildren === "string") {
    return cloneElement(node, undefined, applyRussianNbsp(originalChildren));
  }

  if (typeof originalChildren === "number") {
    return cloneElement(node, undefined, originalChildren);
  }

  if (Array.isArray(originalChildren)) {
    return cloneElement(node, undefined, Children.map(originalChildren, (child) => applyRussianNbspToNode(child)));
  }

  return cloneElement(node, undefined, applyRussianNbspToNode(originalChildren));
}
