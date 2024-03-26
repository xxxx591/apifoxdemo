'use client'

import { useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

import { Provider as NiceModalProvider } from '@ebay/nice-modal-react'
import { Button, ConfigProvider, Dropdown, Flex, message, Modal, theme, Tooltip } from 'antd'
import { ChevronRightIcon, FilterIcon, PlusIcon } from 'lucide-react'

import { Setting } from '@/app/setting'
import { ApiMenu } from '@/components/ApiMenu'
import { ApiMenuContextProvider } from '@/components/ApiMenu/ApiMenuContext'
import { ApiTab } from '@/components/ApiTab'
import { FooterBar } from '@/components/FooterBar'
import { FileIcon } from '@/components/icons/FileIcon'
import { IconText } from '@/components/IconText'
import { InputSearch } from '@/components/InputSearch'
import { SideNav } from '@/components/SideNav'
import { API_MENU_CONFIG } from '@/configs/static'
import { GlobalContextProvider } from '@/contexts/global'
import { LayoutProvider, useLayoutContext } from '@/contexts/layout-settings'
import { MenuItemType } from '@/enums'
import { getCatalogType } from '@/helpers'
import { useHelpers } from '@/hooks/useHelpers'
import { useStyles } from '@/hooks/useStyle'

import { MenuTabProvider } from '../contexts/menu-tab-settings'

import { css } from '@emotion/css'

function HomeContent() {
  const { token } = theme.useToken()

  const { panelRef, isSideMenuCollapsed, setIsSideMenuCollapsed } = useLayoutContext()

  const { createTabItem } = useHelpers()

  const { styles } = useStyles(({ token }) => {
    const resizeHandleInner = css({
      backgroundColor: token.colorBorderSecondary,
    })

    return {
      resizeHandle: css({
        [`&:hover > .${resizeHandleInner}, &[data-resize-handle-state="hover"] > .${resizeHandleInner}, &[data-resize-handle-state="drag"] > .${resizeHandleInner}`]:
          {
            backgroundColor: token.colorPrimary,
          },
      }),

      resizeHandleInner,

      expandTrigger: css({
        color: token.colorPrimary,
        backgroundColor: token.colorFillAlter,
        boxShadow: `1px 0 4px rgba(16 24 40 / 0.08)`,
        '&:hover': {
          backgroundColor: token.colorFillSecondary,
        },
      }),
    }
  })

  // 点击事件处理函数示例
  const [active, setActive] = useState('api')
  const handleItemClick = (itemName: string) => {
    console.log(`切换左侧选项栏 ${itemName}`)
    setActive(itemName)
    // 在这里可以处理点击事件的逻辑
  }

  return (
    <div className="flex h-full" style={{ backgroundColor: token.colorBgContainer }}>
      {/* 左侧菜单栏 */}
      <SideNav active={active} handleItemClick={handleItemClick} />

      {active === 'api' ? (
        <div className="relative w-full overflow-hidden">
          <PanelGroup direction="horizontal">
            {/* 接口树形菜单面板 */}
            <Panel
              ref={panelRef}
              collapsible
              className="flex h-full flex-col overflow-hidden py-2"
              defaultSize={15}
              minSize={15}
              style={{ backgroundColor: token.colorFillAlter }}
              onCollapse={() => {
                setIsSideMenuCollapsed(true)
              }}
              onExpand={() => {
                setIsSideMenuCollapsed(false)
              }}
            >
              <Flex gap={token.paddingXXS} style={{ padding: token.paddingXS }}>
                <InputSearch />

                <ConfigProvider
                  theme={{
                    components: {
                      Button: {
                        paddingInline: token.paddingXS,
                        defaultBg: token.colorFillTertiary,
                        defaultBorderColor: token.colorFillTertiary,
                      },
                    },
                  }}
                >
                  <Tooltip title="显示筛选条件">
                    <Button>
                      <IconText icon={<FilterIcon size={16} />} />
                    </Button>
                  </Tooltip>

                  <Dropdown
                    menu={{
                      items: [
                        ...[
                          MenuItemType.ApiDetail,
                          MenuItemType.HttpRequest,
                          MenuItemType.Doc,
                          MenuItemType.ApiSchema,
                        ].map((t) => {
                          const { newLabel } = API_MENU_CONFIG[getCatalogType(t)]

                          return {
                            key: t,
                            label: t === MenuItemType.Doc ? '新建 Markdown' : newLabel,
                            icon: (
                              <FileIcon size={16} style={{ color: token.colorPrimary }} type={t} />
                            ),
                            onClick: () => {
                              createTabItem(t)
                            },
                          }
                        }),
                      ],
                    }}
                  >
                    <Button type="primary">
                      <IconText icon={<PlusIcon size={18} />} />
                    </Button>
                  </Dropdown>
                </ConfigProvider>
              </Flex>

              <div className="app-menu flex-1 overflow-y-auto">
                <ApiMenuContextProvider>
                  {/* 接口树形展示 */}
                  <ApiMenu />
                </ApiMenuContextProvider>
              </div>
            </Panel>

            <PanelResizeHandle className={`relative basis-[1px] ${styles.resizeHandle}`}>
              <div className={`h-full w-[1px] ${styles.resizeHandleInner}`} />
            </PanelResizeHandle>

            {/* 信息页面面板 */}
            <Panel
              className="relative flex h-full flex-1 flex-col overflow-y-auto overflow-x-hidden"
              minSize={50}
            >
              <div className="flex-1 overflow-auto">
                <ApiTab />
              </div>

              <div
                className="shrink-0 basis-9"
                style={{ borderTop: `1px solid ${token.colorBorderSecondary}` }}
              >
                <FooterBar />
              </div>
            </Panel>
          </PanelGroup>

          {isSideMenuCollapsed && (
            <div
              className={`absolute left-0 top-1/2 z-50 flex h-12 w-4 -translate-y-1/2 cursor-pointer items-center justify-center rounded-r-lg ${styles.expandTrigger}`}
              onClick={() => {
                panelRef.current?.expand()
              }}
            >
              <ChevronRightIcon size={12} strokeWidth={3} />
            </div>
          )}
        </div>
      ) : (
        <Setting />
      )}
    </div>
  )
}

export function HomePage() {
  //创建对话框全局context
  const [modal, modalContextHolder] = Modal.useModal()
  //创建提示全局context
  const [messageApi, messageContextHolder] = message.useMessage({ duration: 1 })
  //创建全局的tab激活状态
  const [active, setActive] = useState('api')

  return (
    <LayoutProvider>
      <GlobalContextProvider messageApi={messageApi} modal={modal}>
        <NiceModalProvider>
          <MenuTabProvider>
            <HomeContent />

            {modalContextHolder}
            {messageContextHolder}
          </MenuTabProvider>
        </NiceModalProvider>
      </GlobalContextProvider>
    </LayoutProvider>
  )
}
