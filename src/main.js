const { app, BrowserWindow, session } = require('electron')
const path = require('path')
const fs = require('fs')

const TARGET_URL = 'https://www.genspark.ai/'
const BRAND = require('./brand.js')

// 关闭 Chromium 的 DoH/AsyncDNS，强制走系统 DNS（让 VPN 的 DNS 生效）
app.commandLine.appendSwitch('disable-features', 'DnsOverHttps,AsyncDns')

function redirectLogos() {
  if (!BRAND.logoUrlPatterns?.length) return
  session.defaultSession.webRequest.onBeforeRequest((details, cb) => {
    for (const p of BRAND.logoUrlPatterns) {
      if (details.url.includes(p.match) && /\.(png|svg|jpg|webp|ico)(\?|$)/i.test(details.url)) {
        const local = 'file://' + path.join(__dirname, '..', 'assets', p.file)
        return cb({ redirectURL: local })
      }
    }
    cb({})
  })
}

function stripCSP() {
  session.defaultSession.webRequest.onHeadersReceived((details, cb) => {
    const headers = { ...details.responseHeaders }
    for (const k of Object.keys(headers)) {
      if (/content-security-policy|x-frame-options/i.test(k)) delete headers[k]
    }
    cb({ responseHeaders: headers })
  })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    title: BRAND.name,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      partition: 'persist:genspark'
    }
  })

  const logoPath = path.join(__dirname, '..', 'assets', 'logo.svg').replace(/\\/g, '/')
  const css = fs.readFileSync(path.join(__dirname, 'inject.css'), 'utf8')
    .replace(/__BRAND_NAME__/g, BRAND.name)
    .replace(/__LOGO_PATH__/g, logoPath)

  win.webContents.on('dom-ready', () => {
    win.webContents.insertCSS(css)
  })

  win.loadURL(TARGET_URL)
}

app.whenReady().then(() => {
  stripCSP()
  redirectLogos()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
