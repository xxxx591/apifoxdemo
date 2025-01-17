import { useMemo, useState } from 'react'

import { create, useModal } from '@ebay/nice-modal-react'
import { ConfigProvider, Menu, type MenuProps, Modal, type ModalProps, theme } from 'antd'
import { InfoIcon, ShirtIcon } from 'lucide-react'

import { ThemeEditor, useThemeContext } from '@/components/ThemeEditor'

const enum SettingsMenuKey {
  Appearance = '0',
  About = '1',
}

const settingMenuItems = [
  {
    key: SettingsMenuKey.Appearance,
    icon: <ShirtIcon size={16} />,
    label: '外观',
  },
  {
    key: SettingsMenuKey.About,
    icon: <InfoIcon size={16} />,
    label: '关于此项目',
  },
] satisfies MenuProps['items']

function ThemeEditorWrapper() {
  const { themeSetting, setThemeSetting, autoSaveId } = useThemeContext()

  return (
    <ThemeEditor
      autoSaveId={autoSaveId}
      value={themeSetting}
      onChange={(value) => {
        if (value) {
          setThemeSetting(value)
        }
      }}
    />
  )
}

const renderMenuContent = (props: { menuKey: SettingsMenuKey }) => {
  switch (props.menuKey) {
    case SettingsMenuKey.Appearance:
      return <ThemeEditorWrapper />

    case SettingsMenuKey.About:
      return <>关于此项目</>
  }
}

type SettingsModalProps = Omit<ModalProps, 'open' | 'footer'>

export const SettingsModal = create((props: SettingsModalProps) => {
  const { token } = theme.useToken()

  const modal = useModal()

  const [selectedKeys, setSelectedKeys] = useState<[SettingsMenuKey]>([SettingsMenuKey.Appearance])

  const selectedMenuItem = useMemo(() => {
    return settingMenuItems.find((item) => item.key === selectedKeys[0])
  }, [selectedKeys])

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            paddingMD: 0,
            paddingContentHorizontalLG: 0,
          },
        },
      }}
    >
      <Modal
        width={950}
        {...props}
        footer={false}
        open={modal.visible}
        onCancel={(...parmas) => {
          props.onCancel?.(...parmas)
          void modal.hide()
        }}
      >
        <div className="flex">
          <div
            className="w-64"
            style={{
              padding: `${token.paddingMD}px 0`,
              backgroundColor: token.colorFillQuaternary,
            }}
          >
            <div
              className="text-lg"
              style={{
                padding: `0 ${token.paddingMD}px ${token.paddingMD}px ${token.paddingMD}px`,
              }}
            >
              设置
            </div>

            <div style={{ padding: `0 ${token.paddingMD}px` }}>
              <ConfigProvider
                theme={{
                  components: {
                    Menu: {
                      colorBgContainer: 'transparent',
                      itemHoverBg: 'transparent',
                      itemHoverColor: token.colorPrimary,
                      itemBorderRadius: token.borderRadiusSM,
                    },
                  },
                }}
              >
                <Menu
                  className="!border-none"
                  items={settingMenuItems}
                  selectedKeys={selectedKeys}
                  onClick={({ key }) => {
                    setSelectedKeys([key as SettingsMenuKey])
                  }}
                />
              </ConfigProvider>
            </div>
          </div>

          <div className="flex-1" style={{ padding: `${token.paddingMD}px` }}>
            <div className="text-lg" style={{ padding: `0 0 ${token.paddingMD}px 0` }}>
              {selectedMenuItem?.label}
            </div>

            {renderMenuContent({ menuKey: selectedKeys[0] })}
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  )
})
