import { useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import useEvent from 'react-use-event-hook'

import { PlusOutlined, SettingOutlined, SwitcherOutlined } from '@ant-design/icons'
import {
  Button,
  Divider,
  Popconfirm,
  Space,
  Table,
  type TableProps,
  Tree,
  type TreeDataNode,
} from 'antd'

import { type DatabaseInfo, ModalNewDatabase } from '@/app/ModalNewDatabase'
import { ModalNewSetting } from '@/app/ModalNewSetting'
import { useGlobalContext } from '@/contexts/global'
import { useStyles } from '@/hooks/useStyle'
import { getDbList, postDbAdd, postDbItem } from '@/services/setting'

import { css } from '@emotion/css'

interface ProjectInfo {
  name?: string
  id?: string
  description?: string
}
export function Setting() {
  const { messageApi, globalProjectId } = useGlobalContext()

  const [modalOpen, setModalOpen] = useState(false)
  const treeData: TreeDataNode[] = [
    {
      title: '通用设置',
      key: '0-0',
      switcherIcon: <SettingOutlined />,
      children: [{ title: '基本设置', key: 'setting', isLeaf: true }],
    },
    {
      title: '项目资源',
      key: '0-1',
      switcherIcon: <SwitcherOutlined />,
      children: [{ title: '数据库连接', key: 'database', isLeaf: true }],
    },
  ]
  const { styles } = useStyles(({ token }) => {
    const resizeHandleInner = css({
      backgroundColor: token.colorBorderSecondary,
    })
    return {
      menuTree: css({
        '.ant-tree': {
          color: 'rgba(0, 0, 0, 0.88)',
        },
        '.ant-tree-treenode': {
          '::before': {
            borderRadius: token.borderRadiusSM,
          },

          '&.ant-tree-treenode-selected': {
            '::before, :hover::before': {
              backgroundColor: token.colorPrimaryBg,
            },
          },

          ':hover': {
            '.app-menu-controls': {
              display: 'inline-flex',
            },
          },
        },
      }),
      resizeHandleInner: css({
        backgroundColor: token.colorBorderSecondary,
      }),
      resizeHandle: css({
        [`&:hover > .${resizeHandleInner}, &[data-resize-handle-state="hover"] > .${resizeHandleInner}, &[data-resize-handle-state="drag"] > .${resizeHandleInner}`]:
          {
            backgroundColor: token.colorPrimary,
          },
      }),
    }
  })
  const [selectedKeys, setSelectedKeys] = useState<string>('setting')
  const handleMenuSelect = useEvent((_, { node }) => {
    console.log('选择菜单', node)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
    setSelectedKeys(node.key)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (node.key === 'database') {
      getDatabaseList()
    }
  })
  // 项目信息
  const [openType, setOpenType] = useState<'name' | 'id' | 'description' | 'database' | 'setting'>(
    'name'
  )
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({})

  // 数据库连接
  const columns: TableProps<DatabaseInfo>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      hidden: true,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '数据库类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a
            onClick={() => {
              console.log('record', record)
              setDatabaseInfo(record)
              setDatabaseType('update')
              setModalDatabaseOpen(true)
            }}
          >
            详情
          </a>
          <Popconfirm
            cancelText="取消"
            description="确定删除？"
            okText="确定"
            title=""
            onConfirm={async () => {
              await postDbItem({ id: record.id })
              await getDatabaseList()
            }}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ]
  const [databaseData, setDatabaseData] = useState<DatabaseInfo[]>([])
  const [modalDatabaseOpen, setModalDatabaseOpen] = useState(false)
  const [DatabaseType, setDatabaseType] = useState<'creat' | 'update'>('creat')
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo>({
    name: '',
    database: '',
    description: '',
    envId: 'base',
    defaultConnect: true,
  })
  const getDatabaseList = async () => {
    const res = await getDbList()
    setDatabaseData(res)
  }
  return (
    <div className="relative w-full overflow-hidden">
      <PanelGroup direction="horizontal">
        <Panel className="flex h-full flex-col overflow-hidden py-2" defaultSize={15} minSize={15}>
          <div className="app-menu flex-1 overflow-y-auto">
            <Tree
              defaultExpandAll
              defaultSelectedKeys={['setting']}
              rootClassName={styles.menuTree}
              treeData={treeData}
              onSelect={handleMenuSelect}
            />
          </div>
        </Panel>
        <PanelResizeHandle className={`relative basis-[1px] ${styles.resizeHandle}`}>
          <div className={`h-full w-[1px] ${styles.resizeHandleInner}`} />
        </PanelResizeHandle>
        <Panel
          className="relative flex h-full flex-1 flex-col overflow-y-auto overflow-x-hidden"
          minSize={50}
        >
          {selectedKeys === 'setting' && (
            <div className="mx-auto flex w-[960px] flex-col p-8">
              <p className="my-0 text-[24px]">基本设置</p>
              <Divider />
              <Space direction="vertical" size={12}>
                <div className="flex justify-between">
                  <div className="font-400 flex items-center text-[14px] text-gray-700">
                    <label className="w-[100px]">项目名称</label>
                    <p className="ml-10">{projectInfo.name}</p>
                  </div>
                  <Button
                    onClick={() => {
                      setOpenType('name')
                      setModalOpen(true)
                    }}
                  >
                    编辑
                  </Button>
                </div>
                <div className="flex justify-between">
                  <div className="font-400 flex items-center text-[14px] text-gray-700">
                    <label className="w-[100px]">项目ID</label>
                    <p
                      className="ml-10 cursor-pointer border-0 border-b border-dashed border-gray-300"
                      onClick={() => {
                        navigator.clipboard
                          .writeText(JSON.stringify(projectInfo.id, null, 2))
                          .then(() => {
                            messageApi.success('已复制')
                          })
                      }}
                    >
                      {projectInfo.id}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setOpenType('id')
                      setModalOpen(true)
                    }}
                  >
                    编辑
                  </Button>
                </div>
                <div className="flex justify-between">
                  <div className="font-400 flex items-center text-[14px] text-gray-700">
                    <label className="w-[100px]">项目备注</label>
                    <p className="ml-10">{projectInfo.description}</p>
                  </div>
                  <Button
                    onClick={() => {
                      setOpenType('description')
                      setModalOpen(true)
                    }}
                  >
                    编辑
                  </Button>
                </div>
              </Space>
            </div>
          )}
          {selectedKeys === 'database' && (
            <div className="mx-auto flex w-[960px] flex-col p-8">
              <p className="my-0 flex items-center justify-between text-[24px]">
                <span>数据库连接</span>
                <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  onClick={() => {
                    setDatabaseType('creat')
                    setModalDatabaseOpen(true)
                  }}
                >
                  新建
                </Button>
              </p>
              <Divider />
              <Space direction="vertical" size={12}>
                <Table key="key" columns={columns} dataSource={databaseData} />
              </Space>
            </div>
          )}
        </Panel>
      </PanelGroup>
      <ModalNewSetting
        open={modalOpen}
        projectInfo={projectInfo}
        type={openType}
        onCancel={() => {
          setModalOpen(false)
        }}
        onFinish={(values) => {
          setProjectInfo((prev) => ({
            ...prev,
            ...values,
          }))
          setModalOpen(false)
        }}
      />
      <ModalNewDatabase
        databaseInfo={databaseInfo}
        open={modalDatabaseOpen}
        type={DatabaseType}
        onCancel={() => {
          setModalDatabaseOpen(false)
        }}
        onFinish={async (values: DatabaseInfo) => {
          console.log('values', values)
          const params = {
            projectId: '1',
            name: values.name,
            type: values.database,
            description: values.description,
            connects: [],
          }
          Object.keys(values.activeForm).forEach((key) => {
            const obj = {
              host: values.activeForm[key].host,
              port: values.activeForm[key].port || 3306,
              username: values.activeForm[key].username,
              password: values.activeForm[key].password,
              dbName: values.activeForm[key].dbName,
              envId: values.activeForm[key].envId,
              defaultConnect: values.activeForm[key].defaultConnect,
            }
            params.connects.push(obj)
          })
          console.log('params', params)

          const res = await postDbAdd(params)
          console.log('res', res)
          if (res) {
            getDatabaseList()
            setModalDatabaseOpen(false)
          }
        }}
      />
    </div>
  )
}
