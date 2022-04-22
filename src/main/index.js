import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  globalShortcut,
} from "electron";
let tray = null;
const path = require("path");
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== "development") {
  global.__static = require("path")
    .join(__dirname, "/static")
    .replace(/\\/g, "\\\\");
}

let mainWindow;
const winURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
  });

  mainWindow.loadURL(winURL);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  if (process.platform !== "darwin") {
    // //创建系统通知区菜单
    tray = new Tray(path.join(__static, "/favicon.ico"));
    // 点击关闭时，并没有真正关闭，而是隐藏窗口
    mainWindow.on("close", (event) => {
      mainWindow.hide();
      mainWindow.setSkipTaskbar(true);
      event.preventDefault();
    });
    mainWindow.on("show", () => {
      tray.setHighlightMode("always");
    });
    mainWindow.on("hide", () => {
      tray.setHighlightMode("never");
    });
    //定制退出操作
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Quit",
        click: () => {
          mainWindow.destroy();
        },
      },
    ]);
    tray.setToolTip("Fast Formula");
    tray.setContextMenu(contextMenu);
    tray.on("click", () => {
      mainWindow.show();
      mainWindow.setSkipTaskbar(false);
    });
  }
}

app.on("ready", () => {
  createWindow();
  if (process.platform !== "darwin") {
    globalShortcut.register("ctrl+o", () => {
      mainWindow.show();
    });
  }
  if (process.platform === "darwin") {
    globalShortcut.register("CommandOrControl+o", () => {
      mainWindow.show();
    });
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
// 监听窗口的关闭隐藏到托盘
ipcMain.on("window-close", (event) => {
  mainWindow.hide();
});
