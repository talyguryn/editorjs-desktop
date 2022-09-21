/**
 * Require tools
 */
const { app, BrowserWindow } = require('electron');

const Logger = require('./utils/logger');
const log = Logger.getLogger();

const Remote = require('@electron/remote/main');
Remote.initialize();

let fileToOpen = null;
let win;

function createWindow() {
  const isDev = false //|| true;

  win = new BrowserWindow({
    width: isDev ? 1200 : 700,
    height: 800,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    }
  })

  win.loadFile('index.html')

  if (isDev) win.webContents.openDevTools();

  Remote.enable(win.webContents)
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})



app.on('open-file', (event, path) => {
  log.info(`path: ${path}`);

  fileToOpen = path;
});

/**
 * On ready initial function
 */
app.on('ready',  async () => {
  try {
    log.info('App is ready');

    createWindow()


    win.webContents.send('open-file', fileToOpen);

    /**
     * Do not try to check for updates in dev mode
     */
    if (!require('electron-is-dev')) {
      require('./utils/autoupdater');
    }
  } catch (error) {
    log.error(error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
});

/**
 * Catch runtime exceptions and rethrow them to "app's onready catch"
 */
process.on('uncaughtException', (err) => {
  // log.error('uncaughtException');
  log.error(err.toString());
});

process.on('unhandledRejection', (err) => {
  // log.error('unhandledRejection');
  log.error(err.toString());
});
