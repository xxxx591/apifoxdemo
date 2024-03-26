import { BASE_URL } from '@/consts/env'

// eslint-disable-next-line import/no-unresolved
import request from '../request'

// 获取所有菜单
export const getAllMenu = (params) => request.get(`/api/menu/all`, params)
export const postCreateMenu = (params) => request.post(`/api/menu/create`, params)
export const postUpdateMenu = (params) => request.post(`/api/menu/update`, params)
export const deleteMenu = (id) => request.post(`/api/menu/delete/${id}`)

//获取环境变量列表
export const getEnvList = ({ projectId }) => request.get(`/api/configEnv/list/${projectId}`)

//更新环境变量
export const updateEnv = (params) => request.post(`/api/configEnv/update`, params)
