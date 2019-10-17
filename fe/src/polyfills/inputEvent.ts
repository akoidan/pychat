/**
 *  Hotfix for Edge 15 for reflect data
 */

/* tslint:disable */
if (!window.InputEvent) {
  // @ts-ignore: next-line
  window.InputEvent = (): void => {};
}
