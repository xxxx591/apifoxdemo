import { Form, Input, Modal, type ModalProps, Select, type SelectProps } from 'antd'

import { SchemaType } from '@/components/JsonSchema'
import { HTTP_CODE_CONFIG } from '@/configs/static'
import { ContentType } from '@/enums'
import type { ApiDetailsResponse } from '@/types'

export const httpCodeOptions: SelectProps['options'] = Object.entries(HTTP_CODE_CONFIG).map(
  ([, { text, value, desc }]) => {
    return {
      label: value,
      value,
      text,
      desc,
    }
  }
)

export const contentTypeOptions: SelectProps['options'] = [
  { label: 'JSON', value: ContentType.JSON },
  { label: 'XML', value: ContentType.XML },
  { label: 'HTML', value: ContentType.HTML },
  { label: 'Raw', value: ContentType.Raw },
  { label: 'Binary', value: ContentType.Binary },
]

type FormData = Pick<ApiDetailsResponse, 'name' | 'code' | 'contentType' | 'jsonSchema'>

interface ModalNewResponseProps extends ModalProps {
  type?: string
  onFinish?: (data: FormData) => void
  projectInfo?: any
}

export function ModalNewSetting(props: ModalNewResponseProps) {
  console.log('props', props)
  const { onFinish, ...rest } = props

  const [form] = Form.useForm<FormData>()

  return (
    <Modal
      {...rest}
      title="添加响应"
      onOk={() => {
        form.validateFields().then((values) => {
          onFinish?.(values)
        })
      }}
    >
      <Form<FormData> form={form} initialValues={props.projectInfo} layout="vertical">
        {props.type === 'name' && (
          <Form.Item label="项目名称" name="name">
            <Input />
          </Form.Item>
        )}
        {props.type === 'id' && (
          <Form.Item label="项目ID" name="id">
            <Input />
          </Form.Item>
        )}
        {props.type === 'description' && (
          <Form.Item label="项目备注" name="description">
            <Input.TextArea />
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}
