import { useMemo, useState } from 'react'

import {
  Button,
  Form,
  Input,
  Layout,
  Modal,
  type ModalProps,
  Radio,
  Select,
  type SelectProps,
  Space,
  Tabs,
  Tag,
  Typography,
} from 'antd'
import { Content } from 'antd/es/layout/layout'
import Sider from 'antd/es/layout/Sider'

import { ApiParamsTab } from '@/components/ApiTab/ApiParamsTab'
import type { Tab } from '@/components/ApiTab/ApiTab.type'
import { EnvEditableTable } from '@/components/ApiTab/EnvEditableTable'
import { ParamsEditableTable } from '@/components/tab-content/api/ParamsEditableTable'
import { HTTP_CODE_CONFIG } from '@/configs/static'
import { useGlobalContext } from '@/contexts/global'
import { DataBaseType } from '@/enums'
import { getDbItem, postDbTest } from '@/services/setting'
import type { ApiDetails, ApiDetailsResponse, DatabaseInfo } from '@/types'

export const databaseTypeOptions: SelectProps['options'] = [
  { label: 'MYSQL', value: DataBaseType.MYSQL },
  { label: 'ORACLE', value: DataBaseType.ORACLE },
]

type FormData = Pick<
  ApiDetailsResponse,
  'name' | 'code' | 'contentType' | 'jsonSchema' | 'activeForm'
>

interface ApiDetailsValueType {
  name?: string
  type?: string
  example?: string
  description?: string
}

interface ModalNewResponseProps extends ModalProps {
  type?: string
  onFinish?: (data: {}) => void
  databaseInfo?: DatabaseInfo
  onChange?: (value: ModalNewResponseProps['value']) => void
  value?: any
}

export function ModalNewConfig(props: ModalNewResponseProps) {
  const { onChange } = props
  const { onFinish, databaseInfo, ...rest } = props
  const { setCurrentEnvData } = useGlobalContext()
  // tab栏参数
  const [tabValue, setTabValue] = useState({})
  const [serverValue, setServerValue] = useState({})
  const timer = null // 在函数外部声明一个计时器变量

  const EnvTable = () => {
    return (
      <div>
        <div className="my-2">
          <Typography.Text type="secondary">服务</Typography.Text>
        </div>
        <EnvEditableTable
          type="server"
          value={serverValue[activeKey]}
          onChange={(query) => {
            setServerValue({ ...serverValue, [activeKey]: query })
          }}
        />
        <div className="my-2">
          <Typography.Text type="secondary">变量</Typography.Text>
        </div>
        <EnvEditableTable
          type="env"
          value={tabValue[activeKey]}
          onChange={(query) => {
            setTabValue({ ...tabValue, [activeKey]: query })
          }}
        />
      </div>
    )
  }
  const sliceItem = (text: string) => {
    return (
      <Space>
        <Tag bordered={false} color="processing">
          {text.startsWith('新') ? '+' : text.slice(0, 1)}
        </Tag>
        <span>{text}</span>
      </Space>
    )
  }
  const tabItems = [
    { key: 'base', label: sliceItem('基础环境'), value: 'base' },
    { key: 'test', label: sliceItem('测试环境'), value: 'test' },
    { key: 'dev', label: sliceItem('开发环境'), value: 'dev' },
    { key: 'prod', label: sliceItem('生产环境'), value: 'prod' },
  ]
  const [activeKey, setActiveKey] = useState<string>('base')
  const [defaultFlag, setDefaultFlag] = useState<boolean>(true)
  const items: Tab[] = useMemo(() => {
    return tabItems.map((item) => {
      return {
        key: item.key,
        label: item.label,
        value: item.value,
        children: <EnvTable />,
      }
    })
  }, [tabItems, defaultFlag, activeKey])

  return (
    <Modal
      {...rest}
      title="环境配置"
      width={960}
      onOk={() => {
        onFinish?.(tabValue)
      }}
    >
      <Tabs
        items={items}
        style={{ height: 400 }}
        tabPosition="left"
        onChange={(value: string) => {
          // 先保存当前
          console.log('tabValue', tabValue)
        }}
      />
    </Modal>
  )
}
