export const currentEnv = 'dev'

// 登录token
export const tokenKey = 'token'

console.info(
  `\n %c ${currentEnv} %c https://emkok.com \n`,
  'color: #fff; background: red; padding:5px 0; font-size:12px;font-weight: bold;',
  'background: #03a8e8; padding:5px 0; font-size:12px;'
)

const defualtUrl = 'https://124.71.37.69:8001'
const urlEnv = {
  prod: ' https://codeapi.xixibot.com',
  dev: 'http://124.71.37.69:8001',
  test: 'https://testapi.devcto.com',
}
export const BASE_URL = 'http://124.71.37.69:8001'

export const baseUrl = urlEnv[currentEnv] || defualtUrl
