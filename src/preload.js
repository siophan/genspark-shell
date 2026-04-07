const BRAND = require('./brand.js')

const entries = Object.entries(BRAND.textReplacements)

function replaceText(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    let v = node.nodeValue
    let changed = false
    for (const [k, val] of entries) {
      if (v.includes(k)) { v = v.split(k).join(val); changed = true }
    }
    if (changed) node.nodeValue = v
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return
    node.childNodes.forEach(replaceText)
  }
}

function syncTitle() {
  let t = document.title
  for (const [k, v] of entries) t = t.split(k).join(v)
  if (t !== document.title) document.title = t
}

function run() {
  replaceText(document.body)
  syncTitle()
}

document.addEventListener('DOMContentLoaded', () => {
  run()
  new MutationObserver(muts => {
    for (const m of muts) {
      m.addedNodes.forEach(replaceText)
      if (m.type === 'characterData') replaceText(m.target)
    }
    syncTitle()
  }).observe(document.documentElement, {
    childList: true, subtree: true, characterData: true
  })
})
