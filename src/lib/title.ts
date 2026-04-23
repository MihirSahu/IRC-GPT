export function deriveChatTitle(input: string) {
  const normalized = input.replace(/\s+/g, " ").trim();
  if (!normalized) return "Untitled conversation";
  const clipped = normalized.slice(0, 52).trim();
  return clipped.length === normalized.length ? clipped : `${clipped}…`;
}
