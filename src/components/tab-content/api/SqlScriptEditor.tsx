import { useEffect, useState } from 'react'

import { Col, Form, Row, Select } from 'antd'

import SqlCodeMirror from '@/components/tab-content/api/SqlCodeMirror'
import { getDbList } from '@/services/setting'
import type { DatabaseInfo, SqlScript } from '@/types'

interface PSqlScriptProps {
  value?: SqlScript
  onChange?: (value: PSqlScriptProps['value']) => void
}

export function SqlScriptEditor(props: PSqlScriptProps) {
  const { value, onChange } = props

  const [readOnly, setReadOnly] = useState(false)
  const [connectId, setConnectId] = useState<string>()
  const [content, setContent] = useState<string>('select * from table_1')
  const [connectList, setConnectList] = useState<DatabaseInfo[]>([])

  const setDbConnectList = async () => {
    const data = await getDbList(1)
    // console.log('res', res.data)
    setConnectList(data)
  }

  useEffect(() => {
    //加载数据库连接列表
    setDbConnectList()
    if (value?.sqlScript) {
      setContent(value.sqlScript)
    }
    if (value?.connectId) {
      setConnectId(value.connectId)
    }
  }, [])

  /**
   * 选择数据库后触发
   * @param value 数据库连接ID
   */
  const selectOnChange = (val: string) => {
    const sqlScript: SqlScript = value ? value : {}
    sqlScript.connectId = val

    onChange(sqlScript)
  }

  /**
   * 脚本修改时触发
   * @param val 脚本
   */
  const scriptOnChange = (val: string) => {
    const sqlScript: SqlScript = value ? value : {}
    sqlScript.sqlScript = val
    onChange(sqlScript)
  }

  const options: CodeMirror.EditorConfiguration = {
    lineWrapping: true, //自动换行，取消横向滚动条
    lineNumbers: true, //显示行号
    mode: { name: 'text/x-mysql' },
    extraKeys: { Ctrl: 'autocomplete' },
    theme: 'ambiance',
    readOnly,
  }
  const [editorContent, setEditorContent] = useState("console.log('hello world!');")
  const handleCodeMirrorChange = (val) => {
    // console.log('val', val)
    const data: SqlScript = value ? value : {}
    data.sqlScript = val
    onChange(data)
  }

  return (
    <>
      <Row>
        <Col span={24}>
          <Form.Item
            label="数据库连接"
            labelCol={{ span: 24 }}
            name="status"
            rules={[{ required: true }]}
          >
            <Select value={connectId} onChange={selectOnChange}>
              {connectList.map((connect) => {
                return (
                  <Select.Option key={connect.id} value={connect.id}>
                    {connect.name}
                  </Select.Option>
                )
              })}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          {/*<CodeMirror options={options} value={content} onChange={scriptOnChange} />*/}
          <SqlCodeMirror value={editorContent} onChange={handleCodeMirrorChange} />
        </Col>
      </Row>
    </>
  )
}
