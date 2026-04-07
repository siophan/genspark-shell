module.exports = {
  name: 'SoloAgent',
  textReplacements: {
    'GENSPARK': 'SOLOAGENT',
    'GenSpark': 'SoloAgent',
    'Genspark': 'SoloAgent',
    'genSpark': 'soloAgent',
    'genspark': 'soloagent'
  },
  // logo 文件名关键字 -> 本地替换图（main.js 转为 file:// URL）
  logoUrlPatterns: [
    { match: 'logo', file: 'logo.svg' }
  ]
}
