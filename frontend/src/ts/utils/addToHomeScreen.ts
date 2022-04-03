import loggerFactory from "@/ts/instances/loggerFactory";
import {isChrome} from "@/ts/utils/runtimeConsts";

const logger = loggerFactory.getLogger("home");

export async function canBeInstalled() {
  if (!isChrome) {
    return false;
  }
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return false;
  }
  if ("getInstalledRelatedApps" in window.navigator) {
    const relatedApps = await (navigator as any).getInstalledRelatedApps();
    return relatedApps.length === 0;
  }
  return true;
}

export async function addToHomeScreen() {
  // Show the prompt
  if (!window.deferredPrompt) {
    throw Error("This platform doesn't support Home applications");
  }
  await window.deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  const choiceResult = await window.deferredPrompt.userChoice;
  if (choiceResult.outcome === "accepted") {
    logger.log("User accepted the A2HS prompt")();
  } else {
    logger.log("User dismissed the A2HS prompt")();
  }
}
