// Scroll lock that KEEPS the scrollbar visible (so the layout width never shifts).
// It compensates by adding padding-right equal to the scrollbar width, then
// locks scrolling. Unlock restores the original styles.

let savedOverflow = "";
let savedPaddingRight = "";

export function lockScroll() {
  savedOverflow = document.body.style.overflow;
  savedPaddingRight = document.body.style.paddingRight;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = "hidden";
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
}

export function unlockScroll() {
  document.body.style.overflow = savedOverflow;
  document.body.style.paddingRight = savedPaddingRight;
}