module.exports = {
  name: 'SoloAgent',
  textReplacements: {
    'Genspark': 'SoloAgent',
    'GenSpark': 'SoloAgent',
    'genspark': 'soloagent'
  },
  // logo 文件名关键字 -> 本地替换图（main.js 转为 file:// URL）
  logoUrlPatterns: [
    { match: 'logo', file: 'logo.svg' }
  ]
}
