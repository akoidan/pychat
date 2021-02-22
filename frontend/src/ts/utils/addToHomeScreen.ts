import loggerFactory from '@/ts/instances/loggerFactory';
import {isChrome} from '@/ts/utils/runtimeConsts';

let deferredPrompt: BeforeInstallPromptEvent;
const logger = loggerFactory.getLogger('home');
/**
 * The BeforeInstallPromptEvent is fired at the Window.onbeforeinstallprompt handler
 * before a user is prompted to "install" a web site to a home screen on mobile.
 *
 * @deprecated Only supported on Chrome and Android Webview.
 */
interface BeforeInstallPromptEvent extends Event {

  /**
   * Returns an array of DOMString items containing the platforms on which the event was dispatched.
   * This is provided for user agents that want to present a choice of versions to the user such as,
   * for example, "web" or "play" which would allow the user to chose between a web version or
   * an Android version.
   */
  readonly platforms: Array<string>;

  /**
   * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
   */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;

  /**
   * Allows a developer to show the install prompt at a time of their own choosing.
   * This method returns a Promise.
   */
  prompt(): Promise<void>;

}
let resolvePromiseInstallMethod: null| Function = null;
// @ts-ignore
window.addEventListener('beforeinstallprompt', (e: BeforeInstallPromptEvent) => {
  logger.log("Got beforeinstallprompt")();
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  if (resolvePromiseInstallMethod) {
    resolvePromiseInstallMethod();
    resolvePromiseInstallMethod = null;
  }
});

export async function canBeInstalled () {
  if (!isChrome) {
    return false;
  }
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return false;
  }
  if ('getInstalledRelatedApps' in window.navigator) {
    const relatedApps = await (navigator as any).getInstalledRelatedApps();
    return relatedApps.length === 0;
  }
  return true;
}

export async function addToHomeScreen() {

  // Show the prompt
  if (!deferredPrompt) {
    throw Error("This platform doesn't support applications");
  }
  await deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  const choiceResult = await deferredPrompt.userChoice;
  if (choiceResult.outcome === 'accepted') {
    logger.log('User accepted the A2HS prompt')();
  } else {
    logger.log('User dismissed the A2HS prompt')();
  }
}
