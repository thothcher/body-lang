import type Lenis from "lenis";

/**
 * გლობალური Lenis ინსტანსი — დიალოგებს სჭირდებათ სქროლის დროებით
 * გაჩერება, ხოლო ნავიგაციას — ინერციის შეწყვეტა.
 */
let instance: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  instance = l;
}

export function getLenis() {
  return instance;
}

/** სქროლის ჩაკეტვა/გახსნა (მოდალური ფანჯრებისთვის) */
export function lockScroll(locked: boolean) {
  if (instance) {
    if (locked) instance.stop();
    else instance.start();
  }
  document.documentElement.style.overflow = locked ? "hidden" : "";
}
