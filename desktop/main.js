const { app, BrowserWindow, Tray, Menu, nativeImage, shell, Notification } = require("electron");
const path = require("path");

const APP_URL = "https://chat.airecho.net";
const APP_NAME = "Connect Chuba";

let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 940,
    minHeight: 560,
    title: APP_NAME,
    icon: path.join(__dirname, "icons", "icon.png"),
    backgroundColor: "#1a1a2e",
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Allow notifications, media (mic/camera/screen share)
      webSecurity: true,
    },
  });

  // Remove default menu bar
  mainWindow.setMenuBarVisibility(false);

  // Load the web app
  mainWindow.loadURL(APP_URL);

  // Show when ready (no white flash)
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(APP_URL)) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  // Minimize to tray instead of closing
  mainWindow.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Grant permission for media devices (mic, camera, screen share)
  mainWindow.webContents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      const allowedPermissions = [
        "media",
        "mediaKeySystem",
        "notifications",
        "fullscreen",
        "display-capture",
      ];
      callback(allowedPermissions.includes(permission));
    }
  );

  // Grant display media (screen sharing) access
  mainWindow.webContents.session.setDisplayMediaRequestHandler(
    (request, callback) => {
      // Show system picker for screen/window selection
      callback({ video: request.videoRequested });
    },
    { useSystemPicker: true }
  );
}

function createTray() {
  const iconPath = path.join(__dirname, "icons", "icon.png");
  let trayIcon;

  try {
    trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  } catch {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Открыть Connect Chuba",
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      },
    },
    { type: "separator" },
    {
      label: "Выход",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip(APP_NAME);
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    if (mainWindow.isVisible()) {
      mainWindow.focus();
    } else {
      mainWindow.show();
    }
  });
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    createTray();
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  } else {
    mainWindow.show();
  }
});
