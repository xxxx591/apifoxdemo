import React, { useCallback, useEffect, useState } from 'react'

import { javascript } from '@codemirror/lang-javascript'
import { sql } from '@codemirror/lang-sql' // 引入语言包
import CodeMirror from '@uiw/react-codemirror'

function SqlCodeMirror({ value: externalValue, onChange }) {
  const [internalValue, setInternalValue] = useState(externalValue)

  // 同步外部传入的 value 变化到内部状态
  useEffect(() => {
    setInternalValue(externalValue)
  }, [externalValue])
  const [value, setValue] = React.useState("console.log('hello world!');")
  // 内部的内容变化事件处理函数
  const handleChange = useCallback(
    (val, viewUpdate) => {
      setInternalValue(val)
      // 调用外部传入的 onChange 属性，并传递新的内容
      if (onChange) {
        onChange(val)
      }
    },
    [onChange]
  )
  return (
    <CodeMirror
      extensions={[sql({ upperCaseKeywords: true }), javascript({ jsx: true })]}
      height="200px"
      value={internalValue}
      onChange={handleChange}
    />
  )
}
export default SqlCodeMirror
