import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import type { message, Modal } from 'antd'
import { current, produce } from 'immer'
import { customRandom, nanoid } from 'nanoid'

import type { ApiMenuData } from '@/components/ApiMenu'
import { apiDirectoryData, creator, recycleGroupData } from '@/data/remote'
import { CatalogType } from '@/enums'
import { getCatalogType, isMenuFolder } from '@/helpers'
import { getAllMenu, getEnvList, postCreateMenu, postUpdateMenu } from '@/services/home'
import type { RecycleCatalogType, RecycleData, RecycleDataItem } from '@/types'
import { moveArrayItem, randomKey } from '@/utils'

type ModalHookApi = ReturnType<typeof Modal.useModal>[0]
type MessageApi = ReturnType<typeof message.useMessage>[0]

interface MenuHelpers {
  /** 添加一个新的菜单项到菜单列表中。 */
  addMenuItem: (menuData: ApiMenuData) => number
  /** 从菜单列表中移除一个菜单项。 */
  removeMenuItem: (menuData: Pick<ApiMenuData, 'id'>) => void
  /** 更新一个菜单项的信息。 */
  updateMenuItem: (menuData: Partial<ApiMenuData> & Pick<ApiMenuData, 'id'>) => void
  /** 从回收站中恢复菜单项。 */
  restoreMenuItem: (
    menuData: Partial<ApiMenuData> & {
      restoreId: RecycleDataItem['id']
      catalogType: RecycleCatalogType
    }
  ) => void
  /** 移动菜单项。 */
  moveMenuItem: (moveInfo: {
    dragKey: ApiMenuData['id']
    dropKey: ApiMenuData['id']
    /** the drop position relative to the drop node, inside 0, top -1, bottom 1 */
    dropPosition: 0 | -1 | 1
  }) => void
}

interface GlobalContextData extends MenuHelpers {
  menuRawList?: ApiMenuData[]
  recyleRawData?: RecycleData
  modal: ModalHookApi
  messageApi: MessageApi
  setGlobalProjectId?: React.Dispatch<React.SetStateAction<GlobalContextData['globalProjectId']>>
  globalProjectId?: string
  globalEnvId?: string
  globalEnvData?: any
  menuSearchWord?: string
  setMenuSearchWord?: React.Dispatch<React.SetStateAction<GlobalContextData['menuSearchWord']>>
  setGlobalEnvId?: React.Dispatch<React.SetStateAction<GlobalContextData['globalEnvId']>>
  setGlobalEnvData?: React.Dispatch<React.SetStateAction<GlobalContextData['globalEnvData']>>
  apiDetailDisplay?: 'name' | 'path'
  setApiDetailDisplay?: React.Dispatch<React.SetStateAction<GlobalContextData['apiDetailDisplay']>>
  currentEnvData?: any
  setCurrentEnvData?: React.Dispatch<React.SetStateAction<GlobalContextData['currentEnvData']>>
  globalEnvServerConfig?: any
  setGlobalEnvServerConfig?: React.Dispatch<
    React.SetStateAction<GlobalContextData['globalEnvServerConfig']>
  >
}
interface AllMenu {
  name: string
  parentId: number
  projectId: number
  type: string
  [property: string]: any
}

const GlobalContext = createContext({} as GlobalContextData)

export function GlobalContextProvider(
  props: React.PropsWithChildren<{ modal: ModalHookApi; messageApi: MessageApi }>
) {
  const { children, modal, messageApi } = props

  /**
   * 设置全局的环境变量存储
   * globalEnvServerConfig: 全局环境变量服务数据
   * globalEnvData: 全局环境变量数据
   * currentEnvData: 当前环境变量数据
   * globalProjectId: 全局项目ID
   * globalEnvId: 全局环境ID
   * */
  const [globalEnvServerConfig, setGlobalEnvServerConfig] = useState<any>({})
  const [globalEnvData, setGlobalEnvData] = useState<any>({})
  const [currentEnvData, setCurrentEnvData] = useState<any>({})
  // 设置全局的项目ID
  const [globalProjectId, setGlobalProjectId] = useState<string>('1')
  // 从url中获取项目ID
  useEffect(() => {
    const projectId = new URLSearchParams(window.location.search).get('id')
    if (projectId) {
      setGlobalProjectId(projectId)
    }
  }, [])
  // 设置全局的环境ID
  const [globalEnvId, setGlobalEnvId] = useState<string>('')
  const [menuRawList, setMenuRawList] = useState<ApiMenuData[]>()
  const [recyleRawData, setRecyleRawData] = useState<RecycleData>()

  const [menuSearchWord, setMenuSearchWord] = useState<string>()
  const [apiDetailDisplay, setApiDetailDisplay] =
    useState<GlobalContextData['apiDetailDisplay']>('name')

  const menuHelpers = useMemo<MenuHelpers>(() => {
    return {
      addMenuItem: async (menuData) => {
        setMenuRawList((list = []) => [...list, menuData])
        // 创建菜单或者文件夹
        const params = {
          name: menuData.name,
          parentId: menuData.parentId || '1',
          projectId: '0',
          type: menuData.type,
          data: menuData.data,
          id: menuData.id,
        }
        await postCreateMenu(params)
      },

      removeMenuItem: ({ id }) => {
        setMenuRawList((rawList) =>
          rawList?.filter((item) => {
            const shouldRemove = item.id === id || item.parentId === id

            if (shouldRemove) {
              setRecyleRawData((d) =>
                d
                  ? produce(d, (draft) => {
                      let catalogType = getCatalogType(item.type)

                      if (catalogType === CatalogType.Markdown) {
                        catalogType = CatalogType.Http
                      }

                      if (
                        catalogType === CatalogType.Http ||
                        catalogType === CatalogType.Schema ||
                        catalogType === CatalogType.Request
                      ) {
                        const list = draft[catalogType].list

                        const exists = list?.findIndex((it) => it.deletedItem.id === id) !== -1

                        if (!exists) {
                          draft[catalogType].list = [
                            { id: randomKey(), expiredAt: '30天', creator, deletedItem: item },
                            ...list,
                          ]
                        }
                      }
                    })
                  : d
              )
            }

            return !shouldRemove
          })
        )
      },

      updateMenuItem: async ({ id, ...rest }) => {
        setMenuRawList((list) =>
          list?.map((item) => {
            if (item.id === id) {
              const updatedItem = {
                ...item,
                ...rest,
                data: { ...item.data, ...rest.data, name: rest.name || item.name },
              }
              return updatedItem as ApiMenuData
            }

            return item
          })
        )

        await postUpdateMenu({ id, ...rest })
      },

      restoreMenuItem: ({ restoreId, catalogType }) => {
        setRecyleRawData((d) =>
          produce(d, (draft) => {
            if (draft) {
              const list = draft[catalogType].list

              draft[catalogType].list = list?.filter((li) => {
                const shouldRestore = li.id === restoreId

                if (shouldRestore) {
                  const apiMenuDataItem = current(li).deletedItem

                  setMenuRawList((rawList) => {
                    const exists = rawList?.findIndex((it) => it.id === apiMenuDataItem.id) !== -1

                    if (exists) {
                      return rawList
                    }

                    return [...rawList, apiMenuDataItem]
                  })
                }

                return !shouldRestore
              })
            }
          })
        )
      },

      moveMenuItem: ({ dragKey, dropKey, dropPosition }) => {
        setMenuRawList((list = []) => {
          const { dragMenu, dropMenu, dragMenuIdx, dropMenuIdx } = list.reduce<{
            dragMenu: ApiMenuData | null
            dropMenu: ApiMenuData | null
            dragMenuIdx: number | null
            dropMenuIdx: number | null
          }>(
            (acc, item, idx) => {
              if (item.id === dragKey) {
                acc.dragMenu = item
                acc.dragMenuIdx = idx
              } else if (item.id === dropKey) {
                acc.dropMenu = item
                acc.dropMenuIdx = idx
              }

              return acc
            },
            { dragMenu: null, dropMenu: null, dragMenuIdx: null, dropMenuIdx: null }
          )

          if (
            dragMenu &&
            dropMenu &&
            typeof dragMenuIdx === 'number' &&
            typeof dropMenuIdx === 'number'
          ) {
            return produce(list, (draft) => {
              if (isMenuFolder(dropMenu.type) && dropPosition === 0) {
                draft[dragMenuIdx].parentId = dropMenu.id
                moveArrayItem(draft, dragMenuIdx, dropMenuIdx + 1)
              } else if (dropPosition === 1) {
                if (dragMenu.parentId !== dropMenu.parentId) {
                  draft[dragMenuIdx].parentId = dropMenu.parentId
                  moveArrayItem(draft, dragMenuIdx, dropMenuIdx + 1)
                } else {
                  moveArrayItem(draft, dragMenuIdx, dropMenuIdx + 1)
                }
              }
            })
          }

          return list
        })
      },
    }
  }, [])

  const [apiDirectoryRequestData, setApiDirectoryRequestData] = useState([])
  const allMenu = async () => {
    const data = await getAllMenu()
    // console.log('res', res.data)
    setApiDirectoryRequestData(data)
  }
  // 获取环境变量列表
  const getEnvConfigList = async (id: string) => {
    const res = await getEnvList({ projectId: id })
  }

  useEffect(() => {
    setMenuRawList(apiDirectoryRequestData)
    setRecyleRawData(recycleGroupData)
  }, [apiDirectoryRequestData])

  useEffect(() => {
    allMenu()
  }, [])
  useEffect(() => {
    console.log('globalEnvId', globalEnvId)
  }, [globalEnvId])
  useEffect(() => {
    console.log('globalProjectId', globalProjectId)
    getEnvConfigList(globalProjectId)
  }, [globalProjectId])

  return (
    <GlobalContext.Provider
      value={{
        menuRawList,
        recyleRawData,
        menuSearchWord,
        setMenuSearchWord,
        apiDetailDisplay,
        setApiDetailDisplay,
        setGlobalProjectId,
        globalProjectId,
        setGlobalEnvId,
        currentEnvData,
        setCurrentEnvData,
        setGlobalEnvData,
        globalEnvServerConfig,
        setGlobalEnvServerConfig,
        globalEnvId,
        globalEnvData,
        modal,
        messageApi,
        ...menuHelpers,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = () => useContext(GlobalContext)
