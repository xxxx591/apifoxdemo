# Apifox UI

## 介绍

这是一个模仿 Apifox 前端界面的开源项目，使用了 Next.js 和 Antd5 来构建。


路径备忘：
src/app/home-page  ---> 主页面入口
src/components/tab-content   --->   右侧主要内容，包括文档，修改文档，以及一系列，比如发起请求，请求参数之类的代码都在这里面
src/components/tab-content/api/ApiDocEditing.tsx  --->   修改文档相关内容
src/components/tab-content/api/ParamsTab.tsx   ---->  请求参数相关Tab

src/components/SideNav   ---->  最左侧工具栏
src/components/ApiMenu/ApiMenu.tsx   ----> menu菜单，包括request啥的

src/components/ApiMenu/ApiMenuTitleTop.tsx   ---->  中部工具栏（项目概况之类
src/components/tab-content/Blank.tsx      ---->  新建接口的页面

src/components/ApiMenu/DropdownActions.tsx  ----> 菜单操作下拉
src/hooks/useHelpers.ts     --->  新增菜单操作方法