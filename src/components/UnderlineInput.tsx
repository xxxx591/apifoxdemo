import { ConfigProvider, Input, type InputProps, theme } from 'antd'

import { useStyles } from '@/hooks/useStyle'

import { css } from '@emotion/css'

export function UnderlineInput(props: InputProps) {
  const { token } = theme.useToken()

  const { styles } = useStyles(({ token }) => {
    return {
      nameInput: css({
        borderBottom: '1px solid transparent',
        padding: `0 ${token.paddingXXS}px`,

        '&:hover': {
          borderColor: token.colorBorder,
        },

        '&:focus': {
          borderColor: token.colorPrimary,
        },
      }),
    }
  })

  return (
    <ConfigProvider
      theme={{
        components: {
          Input: { borderRadiusLG: 0, paddingInlineLG: 0, paddingBlockLG: token.paddingXXS },
        },
      }}
    >
      <Input
        {...props}
        className={`font-medium ${styles.nameInput} ${props.className || ''}`}
        size="large"
        variant="borderless"
      />
    </ConfigProvider>
  )
}
