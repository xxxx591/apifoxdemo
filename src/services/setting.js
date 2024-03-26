// eslint-disable-next-line import/no-unresolved
import request from '../request'

// 测试数据库连接
export const postDbTest = (params) => request.post(`/api/db/connect/test`, params)

// 新增数据库
export const postDbAdd = (params) => request.post(`/api/configDb/save`, params)

// 获取项目数据库列表
export const getDbList = (projectId) => request.get(`/api/configDb/list/${projectId}`)

// 删除数据库
export const postDbItem = ({ id }) => request.rDelete(`/api/configDb/remove/${id}`)

// 获取数据库详情
export const getDbItem = ({ id }) => request.get(`/api/configDb/getInfo/${id}`)
