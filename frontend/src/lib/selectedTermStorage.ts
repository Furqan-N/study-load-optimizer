const SELECTED_TERM_ID_KEY = "syllabi-selected-term-id";

export function persistSelectedTermId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) sessionStorage.setItem(SELECTED_TERM_ID_KEY, id);
  else sessionStorage.removeItem(SELECTED_TERM_ID_KEY);
}

export function readStoredSelectedTermId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SELECTED_TERM_ID_KEY);
}
