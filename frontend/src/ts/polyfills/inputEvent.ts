/**
 *  Hotfix for Edge 15 for reflect data
 */

if (!window.InputEvent) {
  // @ts-expect-error: next-line
  window.InputEvent = (): void => {};
}
