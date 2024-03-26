import { useMemo, useRef, useState } from 'react'

import { SearchOutlined, SettingOutlined } from '@ant-design/icons'
import {
  Button,
  Divider,
  Dropdown,
  Input,
  type InputRef,
  type MenuProps,
  Select,
  Space,
  Tag,
} from 'antd'
import { MoreHorizontalIcon, PlusIcon } from 'lucide-react'

import { ModalNewConfig } from '@/components/ApiTab/ModalNewConfig'
import { IconText } from '@/components/IconText'
import { useGlobalContext } from '@/contexts/global'
import { updateEnv } from '@/services/home'
import type { DatabaseInfo } from '@/types'
import { randomKey } from '@/utils'

import { useMenuTabHelpers } from '../../contexts/menu-tab-settings'

export function useApiTabActions() {
  const { removeAllTabItems, removeOtherTabItems } = useMenuTabHelpers()

  const menuItems = useMemo<MenuProps['items']>(
    () => [
      {
        key: 'closeAll',
        label: '关闭所有标签页',
        onClick: () => {
          removeAllTabItems()
        },
      },
      {
        key: 'closeOthers',
        label: '关闭其他标签页',
        onClick: () => {
          removeOtherTabItems()
        },
      },
    ],
    [removeAllTabItems, removeOtherTabItems]
  )

  return {
    menuItems,
  }
}

export function ApiTabAction() {
  const {
    globalProjectId,
    globalEnvId,
    setGlobalEnvId,
    setGlobalEnvData,
    setCurrentEnvData,
    globalEnvData,
  } = useGlobalContext()
  const { addTabItem } = useMenuTabHelpers()

  const { menuItems } = useApiTabActions()

  // 环境选择下拉选择框
  const [envItems, setEnvItems] = useState([
    { label: '开发环境', value: 'dev' },
    { label: '测试环境', value: 'test' },
    { label: '正式环境', value: 'prod' },
  ])
  const [envName, setEnvNameName] = useState('')
  const inputRef = useRef<InputRef>(null)
  const onNameChange = (value: string) => {
    console.log('e', value)
    setGlobalEnvId(value)
    setEnvNameName(value)
    setCurrentEnvData(value[globalEnvId])
  }

  // 弹窗参数相关
  const [modalConfigOpen, setModalConfigOpen] = useState(false)
  const addItem = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.preventDefault()
    setModalConfigOpen(true)
  }
  return (
    <div className="ml-2 mt-2 flex gap-x-1">
      <Button
        size="small"
        type="text"
        onClick={() => {
          addTabItem({
            key: randomKey(),
            label: '新建...',
            contentType: 'blank',
          })
        }}
      >
        <IconText icon={<PlusIcon size={16} />} />
      </Button>

      <Dropdown
        menu={{
          items: menuItems,
        }}
      >
        <Button size="small" type="text">
          <IconText icon={<MoreHorizontalIcon size={16} />} />
        </Button>
      </Dropdown>
      <Select
        dropdownRender={(menu) => (
          <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Space style={{ padding: '0 8px 4px' }}>
              <Button icon={<SettingOutlined />} type="link" onClick={addItem}>
                管理环境
              </Button>
            </Space>
          </>
        )}
        optionRender={(option) => (
          <Space>
            <Tag bordered={false} color="processing">
              {option.data.label.slice(0, 1)}
            </Tag>
            <span>{option.data.label}</span>
          </Space>
        )}
        options={envItems}
        placeholder="请选择环境"
        style={{ width: 150 }}
        suffixIcon={<SearchOutlined />}
        onChange={onNameChange}
      />
      <ModalNewConfig
        open={modalConfigOpen}
        onCancel={() => {
          setModalConfigOpen(false)
        }}
        onFinish={(values) => {
          console.log('values', values)
          setGlobalEnvData({ ...globalEnvData, ...values })
          // 调用接口更新环境变量
          setModalConfigOpen(false)
        }}
      />
    </div>
  )
}
