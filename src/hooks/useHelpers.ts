import { customAlphabet, nanoid } from 'nanoid'

import { PageTabStatus } from '@/components/ApiTab/ApiTab.enum'
import type { ApiTabItem } from '@/components/ApiTab/ApiTab.type'
import { API_MENU_CONFIG } from '@/configs/static'
import { useMenuTabHelpers } from '@/contexts/menu-tab-settings'
import { CatalogType, MenuItemType } from '@/enums'
import { randomKey } from '@/utils'

export function useHelpers() {
  const { addTabItem } = useMenuTabHelpers()

  const createApiDetails = (
    parentId?: string,
    payload?: Partial<ApiTabItem>,
    config?: { autoActive?: boolean; replaceTab?: ApiTabItem['key'] }
  ) => {
    const { newLabel } = API_MENU_CONFIG[CatalogType.Http]

    if (parentId && parentId !== '') {
      payload = { ...payload, menuId: parentId }
    }

    addTabItem(
      {
        ...payload,
        key: randomKey(),
        label: newLabel,
        contentType: MenuItemType.ApiDetail,
        data: { tabStatus: PageTabStatus.Create },
      },
      config
    )
  }

  const createApiRequest = (
    payload?: Partial<ApiTabItem>,
    config?: { autoActive?: boolean; replaceTab?: ApiTabItem['key'] }
  ) => {
    const { newLabel } = API_MENU_CONFIG[CatalogType.Request]

    addTabItem(
      {
        ...payload,
        key: randomKey(),
        label: newLabel,
        contentType: MenuItemType.HttpRequest,
        data: { tabStatus: PageTabStatus.Create },
      },
      config
    )
  }

  const createDoc = (
    payload?: Partial<ApiTabItem>,
    config?: { autoActive?: boolean; replaceTab?: ApiTabItem['key'] }
  ) => {
    addTabItem(
      {
        ...payload,
        key: randomKey(),
        label: '新建 Markdown',
        contentType: MenuItemType.Doc,
        data: { tabStatus: PageTabStatus.Create },
      },
      config
    )
  }

  const createApiSchema = (
    payload?: Partial<ApiTabItem>,
    config?: { autoActive?: boolean; replaceTab?: ApiTabItem['key'] }
  ) => {
    const { newLabel } = API_MENU_CONFIG[CatalogType.Schema]

    addTabItem(
      {
        ...payload,
        key: randomKey(),
        label: newLabel,
        contentType: MenuItemType.ApiSchema,
        data: { tabStatus: PageTabStatus.Create },
      },
      config
    )
  }

  return {
    createApiDetails,
    createApiRequest,
    createDoc,
    createApiSchema,

    createTabItem: (parentId: string, type: MenuItemType) => {
      switch (type) {
        case MenuItemType.ApiDetail:
          createApiDetails(parentId)
          break

        case MenuItemType.HttpRequest:
          createApiRequest()
          break

        case MenuItemType.Doc:
          createDoc()
          break

        case MenuItemType.ApiSchema:
          createApiSchema()
          break
      }
    },
  }
}
