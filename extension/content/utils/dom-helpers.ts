/**
 * Get the YouTube video player element
 */
export function getPlayer(): HTMLVideoElement | null {
  return document.querySelector('video.html5-main-video');
}

/**
 * Wait for a selector to exist in the DOM
 */
export function waitForSelectorExists(
  selector: string,
  timeout: number
): Promise<Element | null> {
  return new Promise((resolve) => {
    const check = () => document.querySelector(selector);

    // Check immediately
    const initial = check();
    if (initial) {
      resolve(initial);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = check();
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

