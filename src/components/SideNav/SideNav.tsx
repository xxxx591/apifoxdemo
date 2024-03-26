import { SettingFilled } from '@ant-design/icons'
import { show } from '@ebay/nice-modal-react'
import { Button, theme } from 'antd'

import { Logo } from '@/components/icons/Logo'
import { ModalSettings } from '@/components/modals/ModalSettings'

import { NavMenu } from './NavMenu'

export function SideNav(props: any) {
  const { token } = theme.useToken()

  return (
    <div
      className="flex h-full shrink-0 basis-[80px] flex-col items-center overflow-y-auto overflow-x-hidden px-1"
      style={{
        backgroundColor: token.colorFillQuaternary,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div
        className="mb-5 mt-4 size-10 rounded-xl p-[6px]"
        style={{ color: token.colorText, border: `1px solid ${token.colorBorder}` }}
      >
        <Logo />
      </div>

      <NavMenu {...props} />

      <div className="mt-auto w-8 pb-4">
        <Button
          icon={<SettingFilled />}
          style={{ color: token.colorTextTertiary }}
          type="text"
          onClick={() => {
            void show(ModalSettings)
          }}
        />
      </div>
    </div>
  )
}
