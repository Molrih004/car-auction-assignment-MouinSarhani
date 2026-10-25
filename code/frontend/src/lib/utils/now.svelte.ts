/**
 * A reactive clock. `now.value` is $state that changes every second, so everything that is
 * $derived from it (time left, "Open" or "Closed") updates by itself without reloading the page.
 * Call it while a component is being created; the $effect stops the timer when the component is removed.
 */
export function createNow(intervalMs = 1000) {
  let now = $state(Date.now());
  $effect(() => {
    const timer = setInterval(() => { now = Date.now(); }, intervalMs);
    return () => clearInterval(timer);
  });
  return {
    get value() {
      return now;
    },
  };
}

/**
 * Calls `load` again every few seconds while the page is open, so the current bid and the
 * number of bids stay up to date when other buyers bid. Pauses while the browser tab is hidden.
 */
export function poll(load: () => Promise<unknown>, intervalMs = 5000) {
  $effect(() => {
    const timer = setInterval(() => { if (!document.hidden) load().catch(() => {}); }, intervalMs);
    return () => clearInterval(timer);
  });
}
