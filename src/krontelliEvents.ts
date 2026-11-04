/**
 * Dependency-free hand-off between analytics.ts and the Krontelli SDK.
 *
 * analytics.ts imports only this file. push.ts plugs the SDK in once it has
 * started (setKrontelliSink), which happens only in release builds with a
 * public key. Until then, in debug builds and under Jest, every call is a
 * silent no-op, so Krontelli gets events exactly where Firebase does.
 */
export interface KrontelliSink {
  track(name: string, props?: Record<string, unknown>): void;
}

let sink: KrontelliSink | null = null;

export function setKrontelliSink(next: KrontelliSink | null): void {
  sink = next;
}

/** Mirror of a Firebase Analytics event. Synchronous and never throws. */
export function trackKrontelli(
  name: string,
  props?: Record<string, unknown>,
): void {
  try {
    sink?.track(name, props);
  } catch {
    // Reporting is best-effort.
  }
}
