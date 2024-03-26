import { useMemo, useState } from 'react'

import {
  Button,
  Form,
  Input,
  Modal,
  type ModalProps,
  Radio,
  Select,
  type SelectProps,
  Tabs,
} from 'antd'

import type { Tab } from '@/components/ApiTab/ApiTab.type'
import { HTTP_CODE_CONFIG } from '@/configs/static'
import { DataBaseType } from '@/enums'
import { getDbItem, postDbTest } from '@/services/setting'
import type { ApiDetailsResponse, DatabaseInfo } from '@/types'

export const databaseTypeOptions: SelectProps['options'] = [
  { label: 'MYSQL', value: DataBaseType.MYSQL },
  { label: 'ORACLE', value: DataBaseType.ORACLE },
]

type FormData = Pick<
  ApiDetailsResponse,
  'name' | 'code' | 'contentType' | 'jsonSchema' | 'activeForm'
>

interface ModalNewResponseProps extends ModalProps {
  type?: string
  onFinish?: (data: FormData) => void
  databaseInfo?: DatabaseInfo
}

export function ModalNewDatabase(props: ModalNewResponseProps) {
  console.log('props', props)

  const { onFinish, databaseInfo, ...rest } = props

  const [form] = Form.useForm<FormData>()
  // eslint-disable-next-line @typescript-eslint/require-await
  const getDatabaseInfo = async () => {
    getDbItem({ id: databaseInfo.projectId }).then((res) => {
      console.log('res', res)
    })
  }

  // tab栏参数
  const BaseForm = () => {
    return (
      <>
        <Form.Item label="数据库地址" labelCol={{ span: 6 }} name="host" required={true}>
          <Input placeholder="IP / Host" />
        </Form.Item>
        <Form.Item label="端口" labelCol={{ span: 6 }} name="port">
          <Input placeholder="留空则使用默认端口3306" />
        </Form.Item>
        <Form.Item label="用户名" labelCol={{ span: 6 }} name="username" required={true}>
          <Input />
        </Form.Item>
        <Form.Item label="密码" labelCol={{ span: 6 }} name="password">
          <Input.Password />
        </Form.Item>
        <Form.Item label="数据库名称" labelCol={{ span: 6 }} name="dbName" required={true}>
          <Input />
        </Form.Item>
        <Button
          type="primary"
          onClick={async () => {
            const formData: DatabaseInfo = form.getFieldsValue()
            const params: any = {
              host: formData.host,
              port: formData.port,
              username: formData.username,
              password: formData.password,
              dbName: formData.dbName,
            }

            await postDbTest(params)
          }}
        >
          测试连接
        </Button>
      </>
    )
  }
  const tabItems = [
    { key: 'base', label: '默认环境', value: 'base' },
    { key: 'test', label: '测试环境', value: 'test' },
    { key: 'dev', label: '开发环境', value: 'dev' },
    { key: 'prod', label: '生产环境', value: 'prod' },
  ]
  const [activeKey, setActiveKey] = useState<string>('base')
  const [defaultFlag, setDefaultFlag] = useState<boolean>(true)
  const [activeForm, setActiveForm] = useState<any>({})
  const items: Tab[] = useMemo(() => {
    return tabItems.map((item) => {
      return {
        key: item.key,
        label: item.label,
        value: item.value,
        children: (
          <>
            {activeKey === 'base' && <BaseForm />}
            {activeKey !== 'base' && (
              <>
                <Form.Item
                  label="配置方式"
                  labelCol={{ span: 6 }}
                  name="defaultConnect"
                  required={true}
                >
                  <Radio.Group
                    onChange={(e) => {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                      setDefaultFlag(e.target.value)
                    }}
                  >
                    <Radio value={true}> 使用默认配置 </Radio>
                    <Radio value={false}> 单独配置 </Radio>
                  </Radio.Group>
                </Form.Item>
                {form.getFieldValue('defaultConnect') === false && <BaseForm />}
              </>
            )}
          </>
        ),
      }
    })
  }, [tabItems, form, defaultFlag, activeKey])

  if (props.type === 'update') {
    getDatabaseInfo()
  }
  return (
    <Modal
      {...rest}
      title={props.type === 'creat' ? '新增数据库连接' : '修改数据库连接'}
      width={960}
      onOk={() => {
        console.log('form', form.getFieldsValue())
        form.validateFields().then((values) => {
          console.log('activeForm', activeForm)
          values.activeForm = activeForm
          onFinish?.(values)
        })
      }}
    >
      <Form
        form={form}
        initialValues={databaseInfo}
        labelCol={{ span: 4 }}
        layout="horizontal"
        wrapperCol={{ span: 14 }}
      >
        <Form.Item label="名称" name="name">
          <Input />
        </Form.Item>
        <Form.Item label="说明" name="description">
          <Input.TextArea />
        </Form.Item>
        <Form.Item label="数据库类型" name="type">
          <Select options={databaseTypeOptions} />
        </Form.Item>
        <Form.Item label="配置" name="envId">
          {/*<SchemaType />*/}
          <Input style={{ visibility: 'hidden' }} />

          <Tabs
            items={items}
            tabPosition="left"
            onChange={(value: string) => {
              // 每次切换的时候都会把当前的form值保存 以activeKey为key 保存，切换回来的时候再赋值给form
              // 先保存当前
              const oldFormData: DatabaseInfo = form.getFieldsValue()
              if (activeForm[value] === undefined) {
                const formData: DatabaseInfo = form.getFieldsValue()
                if (value !== 'base' && formData.defaultConnect === undefined) {
                  formData.defaultConnect = true
                }
                setActiveForm({ ...activeForm, [value]: formData, [activeKey]: oldFormData })
                form.resetFields(['host', 'port', 'username', 'password', 'dbName'])
              } else {
                // 获取当前
                const newFormData: DatabaseInfo = activeForm[value]
                form.setFieldsValue(newFormData)
              }
              setActiveKey(value)
              form.setFieldValue('envId', value)
            }}
          />
          {/*<BaseForm />*/}
        </Form.Item>
      </Form>
    </Modal>
  )
}
