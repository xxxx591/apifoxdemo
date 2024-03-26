import { MinusCircleOutlined } from '@ant-design/icons'
import { Input, Select, theme } from 'antd'
import { nanoid } from 'nanoid'

import { EditableTable, type EditableTableProps } from '@/components/EditableTable'
import { PARAMS_CONFIG } from '@/configs/static'
import { ParamType } from '@/enums'
import type { Parameter } from '@/types'
import { randomKey } from '@/utils'

interface EnvServerEditableTableProps extends Pick<EditableTableProps, 'autoNewRow'> {
  value?: Parameter[]
  onChange?: (value: EnvServerEditableTableProps['value']) => void
  removable?: boolean
}

export function EnvServerEditableTable(props: EnvServerEditableTableProps) {
  const { token } = theme.useToken()

  const { value, onChange, autoNewRow = true, removable = true } = props

  const handleChange = (v: Partial<Record<keyof Parameter, any>>, idx: number) => {
    if (value) {
      const target = value.at(idx)

      if (target?.id) {
        onChange?.(
          value.map((it, i) => {
            if (i === idx) {
              return { ...it, ...v }
            }

            return it
          })
        )
      } else {
        onChange?.([
          ...value,
          {
            ...target,
            ...v,
            type: ParamType.String,
            id: randomKey(),
          },
        ])
      }
    } else {
      onChange?.([
        {
          ...v,
          type: ParamType.String,
          id: randomKey(),
        },
      ])
    }
  }

  return (
    <EditableTable<Parameter>
      autoNewRow={autoNewRow}
      columns={[
        {
          title: '参数名',
          dataIndex: 'name',
          width: '25%',
          render: (text, _, idx) => {
            return (
              <div>
                <Input
                  placeholder="添加参数"
                  value={typeof text === 'string' ? text : undefined}
                  variant="borderless"
                  onBlur={(ev) => {
                    handleChange({ name: ev.target.value }, idx)
                  }}
                />
              </div>
            )
          },
        },
        {
          title: '类型',
          dataIndex: 'type',
          width: 90,
          render: (text, record, idx) => {
            const isNewRow = !record.id

            return (
              <div className={isNewRow ? 'opacity-0 hover:opacity-100' : ''}>
                <Select
                  className="w-full [&.ant-select_.ant-select-selector]:text-inherit"
                  options={[
                    { label: 'string', value: ParamType.String },
                    { label: 'integer', value: ParamType.Integer },
                    { label: 'boolean', value: ParamType.Boolean },
                    { label: 'number', value: ParamType.Number },
                    { label: 'array', value: ParamType.Array },
                  ]}
                  popupClassName="min-w-[90px]"
                  style={{
                    color:
                      typeof text === 'string'
                        ? `var(${PARAMS_CONFIG[text as ParamType].varColor})`
                        : undefined,
                  }}
                  suffixIcon={null}
                  value={typeof text === 'string' ? text : undefined}
                  variant="borderless"
                  onChange={(val) => {
                    handleChange({ type: val }, idx)
                  }}
                />
              </div>
            )
          },
        },
        {
          title: '示例值',
          dataIndex: 'example',
          width: '25%',
          render: (text, _, idx) => {
            return (
              <Input
                value={typeof text === 'string' ? text : undefined}
                variant="borderless"
                onBlur={(ev) => {
                  handleChange({ example: ev.target.value }, idx)
                }}
              />
            )
          },
        },
        {
          title: '说明',
          dataIndex: 'description',
          width: '40%',
          render: (text, _, idx) => {
            return (
              <div className="py-0">
                <Input.TextArea
                  style={{
                    height: '32px',
                    maxHeight: '100px',
                    overflowY: 'hidden',
                    resize: 'none',
                  }}
                  value={typeof text === 'string' ? text : undefined}
                  variant="borderless"
                  onBlur={(ev) => {
                    handleChange({ description: ev.target.value }, idx)
                  }}
                />
              </div>
            )
          },
        },
        {
          width: 90,
          render: (_, record, idx) => {
            const isNewRow = !record.id

            if (!isNewRow && removable) {
              return (
                <div className="flex justify-center p-1 text-xs">
                  <span
                    className="cursor-pointer"
                    style={{ color: token.colorTextTertiary }}
                    onClick={() => {
                      onChange?.(value?.filter((_, i) => i !== idx))
                    }}
                  >
                    <MinusCircleOutlined />
                  </span>
                </div>
              )
            }
          },
        },
      ]}
      dataSource={value}
      newRowRecord={{
        type: ParamType.String,
      }}
    />
  )
}
