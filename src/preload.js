const BRAND = require('./brand.js')

const entries = Object.entries(BRAND.textReplacements)
const ATTRS = ['placeholder', 'alt', 'title', 'aria-label', 'value', 'content', 'data-tooltip']

function replaceStr(s) {
  if (!s) return s
  let out = s
  for (const [k, v] of entries) {
    if (out.includes(k)) out = out.split(k).join(v)
  }
  return out
}

function walk(node) {
  if (!node) return
  if (node.nodeType === Node.TEXT_NODE) {
    const v = replaceStr(node.nodeValue)
    if (v !== node.nodeValue) node.nodeValue = v
    return
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return
  const tag = node.tagName
  if (tag === 'SCRIPT' || tag === 'STYLE') return

  // 属性
  for (const a of ATTRS) {
    if (node.hasAttribute && node.hasAttribute(a)) {
      const nv = replaceStr(node.getAttribute(a))
      if (nv !== node.getAttribute(a)) node.setAttribute(a, nv)
    }
  }
  // input.value 单独处理
  if ((tag === 'INPUT' || tag === 'TEXTAREA') && node.value) {
    const nv = replaceStr(node.value)
    if (nv !== node.value) node.value = nv
  }

  // Shadow DOM
  if (node.shadowRoot) {
    node.shadowRoot.childNodes.forEach(walk)
    observe(node.shadowRoot)
  }

  node.childNodes.forEach(walk)
}

function syncTitle() {
  const t = replaceStr(document.title)
  if (t !== document.title) document.title = t
}

const observed = new WeakSet()
function observe(root) {
  if (observed.has(root)) return
  observed.add(root)
  new MutationObserver(muts => {
    for (const m of muts) {
      if (m.type === 'characterData') walk(m.target)
      else if (m.type === 'attributes') walk(m.target)
      else m.addedNodes.forEach(walk)
    }
    syncTitle()
  }).observe(root, {
    childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: ATTRS
  })
}

function run() {
  walk(document.documentElement)
  syncTitle()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { run(); observe(document.documentElement) })
} else {
  run(); observe(document.documentElement)
}

// 兜底：定时全量扫一次，捕捉异步注入和动画后才出现的文本
setInterval(run, 1500)
