import useEvent from 'react-use-event-hook'

import { ConfigProvider, Tree, type TreeProps } from 'antd'

import { API_MENU_CONFIG } from '@/configs/static'
import { useGlobalContext } from '@/contexts/global'
import { CatalogType, MenuItemType } from '@/enums'
import { isMenuSameGroup } from '@/helpers'
import { useStyles } from '@/hooks/useStyle'

import { useMenuTabContext, useMenuTabHelpers } from '../../contexts/menu-tab-settings'
import { PageTabStatus } from '../ApiTab/ApiTab.enum'

import type { CatalogDataNode } from './ApiMenu.type'
import { useApiMenuContext } from './ApiMenuContext'
import { SwitcherIcon } from './SwitcherIcon'

import { css } from '@emotion/css'

type TreeOnSelect = NonNullable<TreeProps['onSelect']>

/**
 * 侧边的菜单目录，以文件树的形式展示。
 *
 * 相关概念：
 * - 名词解释：菜单/目录（Menu），文件夹（Folder），文件（File），Folder 和 File 统称为 Menu。
 * - 文件夹可以包含文件和另一个文件夹，包含的关系以层级递进的形式展示。
 */
export function ApiMenu() {
  const { moveMenuItem } = useGlobalContext()
  const { expandedMenuKeys, addExpandedMenuKeys, removeExpandedMenuKeys, menuTree } =
    useApiMenuContext()
  // console.log('中间部分', menuTree)

  const { tabItems, activeTabKey } = useMenuTabContext()
  const { activeTabItem, addTabItem } = useMenuTabHelpers()

  const selectedKeys = activeTabKey ? [activeTabKey] : undefined

  const switchExpandedKeys = useEvent((menuId: string) => {
    if (expandedMenuKeys.includes(menuId)) {
      removeExpandedMenuKeys([menuId])
    } else {
      addExpandedMenuKeys([menuId])
    }
  })

  /**
   * 选择菜单
   */
  const handleMenuSelect = useEvent<TreeOnSelect>((_, { node }) => {
    const menuId = node.key
    if (typeof menuId === 'string') {
      if (!node.isLeaf) {
        switchExpandedKeys(menuId)
      }

      const isTabPresent = tabItems.some(({ key }) => key === menuId)

      if (isTabPresent) {
        activeTabItem({ key: menuId })
      } else {
        //项目概况或回收站
        if (menuId === CatalogType.Overview || menuId === CatalogType.Recycle) {
          const { title } = API_MENU_CONFIG[menuId]

          addTabItem({
            key: menuId,
            label: title,
            contentType: menuId,
          })
        } else {
          //目录
          if ('customData' in node) {
            const dataNode = node as CatalogDataNode
            const catalog = dataNode.customData.catalog

            if (
              catalog.type !== MenuItemType.ApiSchemaFolder &&
              catalog.type !== MenuItemType.RequestFolder
            ) {
              addTabItem({
                key: menuId,
                label: catalog.name,
                contentType: catalog.type,
                data: {
                  tabStatus: PageTabStatus.Update,
                },
              })
            }
          }
        }
      }
    }
  })

  const { styles } = useStyles(({ token }) => ({
    menuTree: css({
      '.ant-tree-treenode': {
        '::before': {
          borderRadius: token.borderRadiusSM,
        },

        '&.ant-tree-treenode-selected': {
          '::before, :hover::before': {
            backgroundColor: token.colorPrimaryBg,
          },
        },

        ':hover': {
          '.app-menu-controls': {
            display: 'inline-flex',
          },
        },
      },
    }),
  }))

  const handleDrop: TreeProps['onDrop'] = (info) => {
    const dropKey = info.node.key
    const dragKey = info.dragNode.key
    const dropPos = info.node.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

    if (
      typeof dragKey === 'string' &&
      typeof dropKey === 'string' &&
      (dropPosition === 0 || dropPosition === 1 || dropPosition === -1)
    ) {
      moveMenuItem({ dragKey, dropKey, dropPosition })
    }
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Tree: {
            motionDurationMid: '0',
            motionDurationSlow: '0',
            colorBgTextHover: 'transparent',
            colorBgContainer: 'transparent',
            colorTextLightSolid: 'currentColor',
          },
        },
      }}
    >
      {!!menuTree && (
        <Tree.DirectoryTree
          blockNode
          showIcon
          allowDrop={({ dragNode, dropNode }) => {
            if (dropNode.className?.includes('top-folder')) {
              return false
            }

            return isMenuSameGroup(
              (dragNode as CatalogDataNode).customData.catalog,
              (dropNode as CatalogDataNode).customData.catalog
            )
          }}
          draggable={{
            icon: false,
            nodeDraggable: (node) => {
              return !node.className?.includes('top-folder')
            },
          }}
          expandedKeys={expandedMenuKeys}
          rootClassName={styles.menuTree}
          selectedKeys={selectedKeys}
          switcherIcon={
            ((node) => {
              const hasChildren = node.data?.children?.length

              return hasChildren ? (
                <SwitcherIcon
                  onClick={() => {
                    const menuId = node.data?.key

                    if (typeof menuId === 'string') {
                      switchExpandedKeys(menuId)
                    }
                  }}
                />
              ) : null
            }) as CatalogDataNode['switcherIcon']
          }
          treeData={menuTree}
          onDrop={handleDrop}
          onSelect={handleMenuSelect}
        />
      )}
    </ConfigProvider>
  )
}
