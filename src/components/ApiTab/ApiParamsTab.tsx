import { useState } from 'react'

import { Tabs, theme, Typography } from 'antd'

import { ParamsEditableTable } from '@/components/tab-content/api/ParamsEditableTable'
import { ParamsEditor } from '@/components/tab-content/api/ParamsEditor'
import { SqlScriptEditor } from '@/components/tab-content/api/SqlScriptEditor'
import type { ApiDetails } from '@/types'

function BadgeLabel(props: React.PropsWithChildren<{ count?: number }>) {
  const { token } = theme.useToken()

  const { children, count } = props

  return (
    <span>
      {children}

      {typeof count === 'number' && count > 0 ? (
        <span
          className="ml-1 inline-flex size-4 items-center justify-center rounded-full text-xs"
          style={{ backgroundColor: token.colorFillContent, color: token.colorSuccessActive }}
        >
          {count}
        </span>
      ) : null}
    </span>
  )
}

interface ParamsTabProps {
  value?: ApiDetails['parameters']
  onChange?: (value: ParamsTabProps['value']) => void
}

/**
 * 请求参数页签。
 */
export function ApiParamsTab(props: ParamsTabProps) {
  const { value, onChange } = props
  const [editorValue, setEditorValue] = useState<string>('{}')

  return (
    <Tabs
      animated={false}
      items={[
        {
          key: 'params',
          label: (
            <BadgeLabel count={(value?.query?.length || 0) + (value?.path?.length || 0)}>
              Params
            </BadgeLabel>
          ),
          children: (
            <div>
              <div className="my-2">
                <Typography.Text type="secondary">Query 参数</Typography.Text>
              </div>
              <ParamsEditableTable
                value={value?.query}
                onChange={(query) => {
                  onChange?.({ ...value, query })
                }}
              />
            </div>
          ),
        },
        {
          key: 'body',
          label: 'Body',
          children: (
            <ParamsEditor
              className="h-[350px]"
              language="json"
              value={editorValue}
              onChange={(val) => {
                console.log('val', val)
                const vals = JSON.parse(typeof val === 'string' ? val : JSON.stringify(val))
                onChange?.({ ...value, body: vals })
              }}
            />
          ),
        },
        {
          key: 'cookie',
          label: 'Cookie',
          children: (
            <div className="pt-[10px]">
              <ParamsEditableTable
                value={value?.cookie}
                onChange={(cookie) => {
                  onChange?.({ ...value, cookie })
                }}
              />
            </div>
          ),
        },
        {
          key: 'headers',
          label: 'Headers',
          children: (
            <div className="pt-[10px]">
              <ParamsEditableTable
                value={value?.header}
                onChange={(header) => {
                  onChange?.({ ...value, header })
                }}
              />
            </div>
          ),
        },
        {
          key: 'sql',
          label: 'Sql',
          children: (
            <div className="pt-[10px]">
              <SqlScriptEditor
                value={value?.sql}
                onChange={(val) => {
                  onChange?.({ ...value, sql: val })
                }}
              />
            </div>
          ),
        },
      ]}
    />
  )
}
