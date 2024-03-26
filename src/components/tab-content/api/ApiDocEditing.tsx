import { useEffect, useState } from 'react'

import Link from 'next/link'
import { PlusOutlined } from '@ant-design/icons'
import {
  Button,
  Col,
  Form,
  type FormProps,
  Input,
  Popconfirm,
  Row,
  Select,
  type SelectProps,
  Space,
  Tabs,
  theme,
  Tooltip,
} from 'antd'
import { InfoIcon, TrashIcon } from 'lucide-react'
import { nanoid } from 'nanoid'

import { PageTabStatus } from '@/components/ApiTab/ApiTab.enum'
import { GroupTitle } from '@/components/ApiTab/GroupTitle'
import { useTabContentContext } from '@/components/ApiTab/TabContentContext'
import { IconText } from '@/components/IconText'
import { InputUnderline } from '@/components/InputUnderline'
import { JsonSchemaCard } from '@/components/JsonSchemaCard'
import { JsonViewer } from '@/components/JsonViewer'
import { SelectorService } from '@/components/SelectorService'
import { ApiRemoveButton } from '@/components/tab-content/api/ApiRemoveButton'
import { API_STATUS_CONFIG, HTTP_METHOD_CONFIG } from '@/configs/static'
import { useGlobalContext } from '@/contexts/global'
import { useMenuTabHelpers } from '@/contexts/menu-tab-settings'
import { creator, initialCreateApiDetailsData } from '@/data/remote'
import { type ContentType, MenuItemType } from '@/enums'
import { getContentTypeString } from '@/helpers'
import { useStyles } from '@/hooks/useStyle'
import type { ApiDetails } from '@/types'
import { randomKey } from '@/utils'

import { InputDesc } from './InputDesc'
import { contentTypeOptions, httpCodeOptions, ModalNewResponse } from './ModalNewResponse'
import { ParamsTab } from './ParamsTab'

import { css } from '@emotion/css'

const DEFAULT_NAME = '未命名接口'

const methodOptions: SelectProps['options'] = Object.entries(HTTP_METHOD_CONFIG).map(
  ([method, { color }]) => {
    return {
      value: method,
      label: (
        <span className="font-semibold" style={{ color: `var(${color})` }}>
          {method}
        </span>
      ),
    }
  }
)

const statusOptions: SelectProps['options'] = Object.entries(API_STATUS_CONFIG).map(
  ([method, { text, color }]) => {
    return {
      value: method,
      label: (
        <span className="flex items-center">
          <span
            className="mr-2 inline-block size-[6px] rounded-full"
            style={{ backgroundColor: `var(${color})` }}
          />
          <span>{text}</span>
        </span>
      ),
    }
  }
)

export function ApiDocEditing() {
  const { token } = theme.useToken()

  const { styles } = useStyles(({ token }) => {
    return {
      tabWithBorder: css({
        '.ant-tabs-content-holder': {
          border: `1px solid ${token.colorBorderSecondary}`,
          borderTop: 'none',
          borderBottomLeftRadius: token.borderRadius,
          borderBottomRightRadius: token.borderRadius,
        },
      }),
    }
  })

  const [form] = Form.useForm<ApiDetails>()

  const { messageApi, menuRawList, addMenuItem, updateMenuItem } = useGlobalContext()
  const { addTabItem } = useMenuTabHelpers()
  const { tabData } = useTabContentContext()

  const isCreating = tabData.data?.tabStatus === PageTabStatus.Create

  useEffect(() => {
    if (isCreating) {
      form.setFieldsValue(initialCreateApiDetailsData)
    } else {
      if (menuRawList) {
        const menuData = menuRawList.find(({ id }) => id === tabData.key)

        if (
          menuData &&
          (menuData.type === MenuItemType.ApiDetail || menuData.type === MenuItemType.HttpRequest)
        ) {
          const apiDetails = menuData.data

          if (apiDetails) {
            form.setFieldsValue(apiDetails)
          }
        }
      }
    }
  }, [form, menuRawList, isCreating, tabData.key])

  const handleFinish: FormProps<ApiDetails>['onFinish'] = (values) => {
    const menuName = values.name || DEFAULT_NAME
    if (isCreating) {
      const menuItemId = randomKey()
      addMenuItem({
        id: menuItemId,
        name: menuName,
        parentId: tabData.menuId,
        type: MenuItemType.ApiDetail,
        data: { ...values, name: menuName },
      })
      addTabItem(
        {
          key: menuItemId,
          label: menuName,
          contentType: MenuItemType.ApiDetail,
        },
        { replaceTab: tabData.key }
      )
    } else {
      updateMenuItem({
        id: tabData.key,
        name: menuName,
        type: MenuItemType.ApiDetail,
        data: { ...values, name: menuName },
      })

      messageApi.success('保存成功')
    }
  }

  const [modalOpen, setModalOpen] = useState(false)
  const [activeResTabKey, setActiveResTabKey] = useState<string>()

  // 运行按钮
  const handleRequestRun = () => {
    if (isCreating) {
      form.setFieldsValue(initialCreateApiDetailsData)
    } else {
      if (menuRawList) {
        const menuData = menuRawList.find(({ id }) => id === tabData.key)
        console.log('运行时所有数据', menuData)
      }
    }
  }
  return (
    <>
      <Form<ApiDetails>
        className="flex h-full flex-col"
        form={form}
        onFinish={(values) => {
          handleFinish(values)
        }}
      >
        <div className="flex items-center px-tabContent py-3">
          <Space.Compact className="flex-1">
            <Form.Item name="id" style={{ display: 'none' }}>
              <Input />
            </Form.Item>
            <Form.Item noStyle name="method">
              <Select
                showSearch
                className="min-w-[110px]"
                options={methodOptions}
                popupClassName="!min-w-[120px]"
              />
            </Form.Item>
            <Form.Item noStyle name="path">
              <Input placeholder="接口路径，“/”起始" />
            </Form.Item>
          </Space.Compact>

          <Space className="ml-auto pl-2">
            <Button htmlType="submit" type="primary">
              保存
            </Button>

            {!isCreating && (
              <>
                <Button onClick={handleRequestRun}>运行</Button>
                <ApiRemoveButton tabKey={tabData.key} />
              </>
            )}
          </Space>
        </div>

        <div className="flex-1 overflow-y-auto p-tabContent pt-0">
          <Form.Item noStyle name="name">
            <InputUnderline placeholder={DEFAULT_NAME} />
          </Form.Item>

          <div className="pt-2">
            <Row gutter={16}>
              <Col lg={12} xl={6}>
                <Form.Item
                  label="状态"
                  labelCol={{ span: 24 }}
                  name="status"
                  rules={[{ required: true }]}
                >
                  <Select options={statusOptions} />
                </Form.Item>
              </Col>

              <Col lg={12} xl={6}>
                <Form.Item label="责任人" labelCol={{ span: 24 }} name="responsibleId">
                  <Select
                    options={[
                      { label: `${creator.name}（@${creator.username}）`, value: creator.id },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col lg={12} xl={6}>
                <Form.Item label="标签" labelCol={{ span: 24 }} name="tags">
                  <Select mode="tags" placeholder="查找或回车创建标签" />
                </Form.Item>
              </Col>

              <Col lg={12} xl={6}>
                <Form.Item
                  label="服务（前置 URL）"
                  labelCol={{ span: 24 }}
                  name="serverId"
                  tooltip={
                    <span>
                      指定服务后，该接口运行时会使用该服务对应的<b>前置 URL</b>（在
                      <Link href="/">环境</Link>里设置）。
                    </span>
                  }
                >
                  <SelectorService />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item label="说明" labelCol={{ span: 24 }} name="description">
                  <InputDesc />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <GroupTitle className="mt-2">请求参数</GroupTitle>
          <Form.Item noStyle name="parameters">
            <ParamsTab />
          </Form.Item>

          <GroupTitle className="mt-8">返回响应</GroupTitle>
          <Form.Item
            shouldUpdate={(prev: ApiDetails, curr: ApiDetails) => prev.responses !== curr.responses}
          >
            {({ getFieldValue }) => {
              const responses: ApiDetails['responses'] = getFieldValue('responses')

              return (
                <Tabs
                  activeKey={activeResTabKey}
                  animated={false}
                  className={styles.tabWithBorder}
                  items={responses?.map((resp, idx) => {
                    return {
                      key: resp.id,
                      label: `${resp.name}(${resp.code})`,
                      children: (
                        <div className="p-tabContent">
                          <div className="mb-tabContent flex gap-6">
                            <div className="flex flex-wrap items-center gap-6">
                              <Form.Item
                                label="HTTP 状态码"
                                name={['responses', idx, 'code']}
                                style={{ marginBottom: 0 }}
                              >
                                <Select
                                  optionRender={({ label, data }) => (
                                    <span className="group flex items-center">
                                      {label}
                                      <span className="ml-3 font-normal opacity-65">
                                        {data.text as string}
                                      </span>
                                      <Tooltip title={`${data.desc as string}。`}>
                                        <InfoIcon
                                          className="ml-auto mr-1 opacity-0 transition-opacity group-hover:opacity-100"
                                          size={14}
                                        />
                                      </Tooltip>
                                    </span>
                                  )}
                                  options={httpCodeOptions}
                                  popupClassName="min-w-[350px]"
                                />
                              </Form.Item>
                              <Form.Item
                                label="名称"
                                name={['responses', idx, 'name']}
                                style={{ marginBottom: 0 }}
                              >
                                <Input style={{ width: '88px' }} />
                              </Form.Item>
                              <Form.Item
                                label="内容格式"
                                name={['responses', idx, 'contentType']}
                                style={{ marginBottom: 0 }}
                              >
                                <Select options={contentTypeOptions} style={{ width: '130px' }} />
                              </Form.Item>
                              <Form.Item
                                dependencies={['responses', idx, 'contentType']}
                                label="Content-Type"
                                style={{ marginBottom: 0 }}
                              >
                                {({ getFieldValue: getFieldValue1 }) => {
                                  const contentType: ContentType = getFieldValue1([
                                    'responses',
                                    idx,
                                    'contentType',
                                  ])

                                  return <span>{getContentTypeString(contentType)}</span>
                                }}
                              </Form.Item>
                            </div>

                            <div className="ml-auto pt-1">
                              <Popconfirm
                                title="确定删除吗？"
                                onConfirm={() => {
                                  const newResponses = responses.filter((_, i) => i !== idx)

                                  form.setFieldValue('responses', newResponses)

                                  setActiveResTabKey(newResponses.at(0)?.id)
                                }}
                              >
                                <Button
                                  size="small"
                                  style={{
                                    color: token.colorTextSecondary,
                                  }}
                                  type="text"
                                >
                                  <IconText icon={<TrashIcon size={14} />} />
                                </Button>
                              </Popconfirm>
                            </div>
                          </div>

                          <Form.Item noStyle name={['responses', idx, 'jsonSchema']}>
                            <JsonSchemaCard />
                          </Form.Item>

                          <Form.Item noStyle dependencies={['responseExamples']}>
                            {({ getFieldValue: getFieldValue2 }) => {
                              const examples: ApiDetails['responseExamples'] = getFieldValue2([
                                'responseExamples',
                              ])
                              const targetExamples = examples?.filter(
                                ({ responseId }) => responseId === resp.id
                              )

                              if (Array.isArray(targetExamples) && targetExamples.length > 0) {
                                return (
                                  <Tabs
                                    className={styles.tabWithBorder}
                                    items={targetExamples.map((it) => {
                                      const targetIdx = examples?.findIndex(
                                        (itt) => itt.id === it.id
                                      )

                                      return {
                                        key: it.id,
                                        label: it.name,
                                        children:
                                          typeof targetIdx === 'number' && targetIdx !== -1 ? (
                                            <div className="p-tabContent">
                                              <Form.Item
                                                noStyle
                                                name={['responseExamples', targetIdx, 'data']}
                                              >
                                                <JsonViewer />
                                              </Form.Item>
                                            </div>
                                          ) : null,
                                      }
                                    })}
                                    type="card"
                                  />
                                )
                              }

                              return null
                            }}
                          </Form.Item>
                        </div>
                      ),
                    }
                  })}
                  tabBarExtraContent={
                    <>
                      <Button
                        icon={<PlusOutlined style={{ fontSize: '12px' }} />}
                        type="text"
                        onClick={() => {
                          setModalOpen(true)
                        }}
                      >
                        添加
                      </Button>
                    </>
                  }
                  type="card"
                  onTabClick={(tabKey) => {
                    setActiveResTabKey(tabKey)
                  }}
                />
              )
            }}
          </Form.Item>
        </div>
      </Form>

      <ModalNewResponse
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
        }}
        onFinish={(values) => {
          setModalOpen(false)

          const newResId = randomKey()

          form.setFieldsValue({
            responses: [
              ...((form.getFieldValue('responses') as ApiDetails['responses']) || []),
              { ...values, id: newResId },
            ],
          })

          setActiveResTabKey(newResId)
        }}
      />
    </>
  )
}
