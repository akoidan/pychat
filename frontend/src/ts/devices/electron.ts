import {
  app,
  BrowserWindow,
} from "electron";
import * as constants from "@/ts/utils/consts";
import {
  ELECTRON_IGNORE_SSL,
  ELECTRON_MAIN_FILE,
  IS_DEBUG,
} from "@/ts/utils/consts";

let mainWindow: BrowserWindow | null;

if (ELECTRON_IGNORE_SSL) {
  app.commandLine.appendSwitch("ignore-certificate-errors", "true");
}

console.log(JSON.stringify(constants));

/*
 * Declare let setImmediate: () => void;
 * declare let process;
 */

async function createWindow() {
  console.log("creating new window");
  if (IS_DEBUG) {
    const {default: installExtension, VUEJS_DEVTOOLS} = await import("electron-devtools-installer");
    await installExtension(VUEJS_DEVTOOLS);
    console.log("vue-devtools installed");
  }

  const url = ELECTRON_MAIN_FILE.replace("{}", app.getAppPath());
  console.log(`loading ${url}`);

  let mainWindow: BrowserWindow | null = new BrowserWindow();

  mainWindow.loadURL(url);

  mainWindow.on("closed", () => {
    console.log("closed");
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  console.log("window closed");
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  console.log("activate");
  if (mainWindow === null) {
    createWindow();
  }
});
