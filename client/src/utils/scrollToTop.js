/**
 * Reliable utility to scroll to top across modern browsers and mobile viewports.
 * Handles window, documentElement, body, and accounts for React Suspense / lazy chunk painting.
 */
export function scrollToTop(options = { behavior: "instant" }) {
  if (typeof window === "undefined") return;

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const perform = () => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: options?.behavior || "instant",
      });
    } catch {
      window.scrollTo(0, 0);
    }

    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  };

  // Immediate execution
  perform();

  // Execution on subsequent animation frames to catch late React Suspense / DOM paints
  if (typeof requestAnimationFrame !== "undefined") {
    requestAnimationFrame(perform);
  }
  setTimeout(perform, 30);
  setTimeout(perform, 100);
}
