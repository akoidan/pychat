import {app, BrowserWindow} from 'electron';
import {IS_DEBUG, ELECTRON_MAIN_FILE, IS_PROD, ELECTRON_IGNORE_SSL} from './utils/consts';
import * as constants from './utils/consts';

let mainWindow;

if (ELECTRON_IGNORE_SSL) {
  app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
}

console.log(JSON.stringify(constants));

declare let setImmediate;
declare let process;

async function createWindow() {
  console.log('creating new window');
  if (IS_DEBUG) {
    const {default: installExtension, VUEJS_DEVTOOLS} = await import('electron-devtools-installer');
    await installExtension(VUEJS_DEVTOOLS);
    console.log('vue-devtools installed');
  }

  let url = ELECTRON_MAIN_FILE.replace('{}', app.getAppPath());
  console.log(`loading ${url}`);

  let mainWindow = new BrowserWindow();

  mainWindow.loadURL(url);
  if (!IS_PROD) {
    mainWindow.webContents.on('did-frame-finish-load', () => {
      mainWindow.webContents.once('devtools-opened', () => {
        if (mainWindow) {
          mainWindow.focus();
          setImmediate(() => {
            if (mainWindow) {
              mainWindow.focus();
            }
          });
        }
      });
      mainWindow.webContents.openDevTools();
    });
  }

  mainWindow.on('closed', () => {
    console.log('closed');
    mainWindow = null;
  });

}

app.on('ready', createWindow);


app.on('window-all-closed', () => {
  console.log('window closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('activate', () => {
  console.log('activate');
  if (mainWindow === null) {
    createWindow();
  }
});
