# 墨语智能写作前端

基于 Vue 3 + Vite + TypeScript + Ant Design Vue 的智能写作平台前端。项目提供文章创作流程、历史文章、会员购买、个人资料编辑、后台用户管理与数据统计等页面。

## 技术栈

- Vue 3、Vue Router、Pinia
- TypeScript、Vite
- Ant Design Vue
- Axios
- ECharts
- Marked

## 功能概览

- 用户注册、登录、退出登录。
- 个人资料编辑：昵称、头像上传、个人简介。
- AI 文章创作：选题、标题选择、大纲编辑、正文生成、配图。
- 历史文章列表与文章详情。
- VIP 购买与支付记录。
- 管理后台：用户查询、用户编辑、用户删除、统计分析。

## 环境要求

- Node.js `^20.19.0 || >=22.12.0`
- npm
- 后端服务默认运行在 `http://localhost:8181/api`

## 快速开始

```bash
npm install
npm run dev
```

开发服务默认由 Vite 启动，访问终端输出的本地地址即可。当前项目的请求实例默认使用：

```ts
baseURL: 'http://localhost:8181/api'
```

同时 `vite.config.ts` 配置了 `/api` 到 `http://localhost:8181` 的代理，后续如改为相对路径请求可直接复用该代理。

## 常用脚本

```bash
# 启动开发环境
npm run dev

# 类型检查
npm run type-check

# 生产构建
npm run build

# 仅执行 Vite 构建
npm run build-only

# 预览生产构建
npm run preview

# 根据后端 OpenAPI 生成接口类型
npm run openapi2ts
```

## 接口类型生成

接口封装和类型位于 `src/api`，配置文件为 `openapi2ts.config.ts`：

```ts
schemaPath: 'http://localhost:8181/api/v3/api-docs'
```

生成前请先启动后端服务，然后运行：

```bash
npm run openapi2ts
```

如果后端接口发生变更，建议同步更新 `src/api/userController.ts`、`src/api/articleController.ts` 等接口封装与 `src/api/typings.d.ts` 类型定义。

## 头像上传

个人资料页和后台用户编辑弹窗复用 `src/components/UserAvatarUpload.vue`。

上传流程：

1. 前端选择图片文件。
2. 组件调用 `POST /user/upload/avatar`，字段名为 `file`。
3. 后端上传文件到对象存储并返回图片 URL。
4. 前端将 URL 写入 `userAvatar`。
5. 用户保存资料或管理员保存用户后，后续登录态和页面展示都会使用该头像 URL。

上传限制：

- 支持 `JPG`、`PNG`、`GIF`、`WebP`
- 文件大小不超过 `2MB`

## 目录结构

```text
src/
  api/            后端接口封装与 TypeScript 类型
  assets/         静态资源
  components/     全局组件
  constant/       常量
  layouts/        页面布局
  pages/          业务页面
  router/         路由配置
  stores/         Pinia 状态管理
  styles/         全局样式
  request.ts      Axios 实例与响应拦截
```

## 权限说明

- 未登录用户可访问首页、登录页、注册页。
- `/user/profile` 需要登录。
- `/admin/**` 需要管理员角色。
- 登录态由后端 Session 维护，前端 Axios 开启了 `withCredentials`。

## 注意事项

- 本项目依赖后端 Session Cookie，前后端本地联调时需确保后端允许携带凭证。
- 若执行 `npm run type-check` 失败，请先确认是否为当前分支已有的类型错误，再定位本次改动。
- 不要在前端代码中写入密钥，第三方服务密钥统一由后端配置。
