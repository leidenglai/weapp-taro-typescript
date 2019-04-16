# 使用 React 和 TypeScript 写小程序

微信小程序端，使用 Taro 框架。React+TypeScript 语法，Mobx 管理数据，Taro UI 框架。

## Taro 框架

[Taro 介绍 · Taro](https://nervjs.github.io/taro/docs/README.html)

> **Taro**是一套遵循 [React](https://reactjs.org/) 语法规范的**多端开发**解决方案。现如今市面上端的形态多种多样，Web、React-Native、微信小程序等各种端大行其道，当业务要求同时在不同的端都要求有所表现的时候，针对不同的端去编写多套代码的成本显然非常高，这时候只编写一套代码就能够适配到多端的能力就显得极为需要。
> 使用**Taro**，我们可以只书写一套代码，再通过**Taro**的编译工具，将源代码分别编译出可以在不同端（微信/百度/支付宝/字节跳动小程序、H5、React-Native 等）运行的代码。

## 开发环境

nodejs

VSCode 安装 Settings Sync 插件，同步 gist：7b096d9f0a4ac0c68f727930c27fd8f4

yarn
使用终端或者 cmd 安装 yarn[安装 | Yarn 中文文档](https://yarn.bootcss.com/docs/install/#mac-stable)

进入项目根目录，执行如下命令安装依赖包：

```sh
yarn
```

## 开始开发

小程序调试模式

```sh
yarn dev:weapp
```

h5 调试模式

```sh
yarn dev:h5
```

开发时可以先在 h5 模式下完成大部分业务逻辑和 UI 调试，然后同时开启小程序和 H5 模式，对照查看效果，调试页面。

构建小程序发布文件

```sh
yarn build:weapp
```

## 概述

虽然微信小程序很强大，但是小程序对于开发者来说，确实不太友好，还好现在也有一些开源的小程序框架，此项目选用了[Aotu.io「凹凸实验室」](https://aotu.io/)出品的 Taro 框架。
框架采用**React 语法风格**，组件生命周期与 React 保持一致，最后编译成各端小程序和 H5，本项目仅兼容了微信小程序。但是可以用很小的代价将项目兼容其他端。
项目采用了 Mobx 管理数据，这是 React 流行的数据管理方案之一，_简单、可扩展的状态管理_，需要注意项目使用的是 Mobx 4 版本。
同时项目使用 TypeScript 语法，给 JavaScript 加上类型系统，提高了开发效率和代码质量。

技术栈

1.  Taro // 小程序框架，项目管理、开发、编译打包
2.  yarn // 包管理器
3.  Taro UI // UI 框架，使用了里面的组件，项目中进行了个性化定制
4.  React //语法风格
5.  TypeScript // 语言类型系统
6.  Sass // style 模块
7.  Mobx // 数据管理方案
8.  lodash // 辅助函数

## 资源

- 项目配置 解释 [package.json 文件 — JavaScript 标准参考教程（alpha）](http://javascript.ruanyifeng.com/nodejs/packagejson.html)
- Taro 中文文档：[Taro 介绍 · Taro](https://nervjs.github.io/taro/docs/README.html)
- React 中文文档：[React 中文文档 - 用于构建用户界面的 JavaScript 库](https://react.docschina.org/)
- Mobx 中文文档：[MobX 介绍 · MobX 中文文档](https://cn.mobx.js.org/)
- TypeScript 中文文档：[文档简介 · TypeScript 中文网 · TypeScript——JavaScript 的超集](https://www.tslang.cn/docs/home.html)
- Taro UI：[Taro UI | O2Team](https://taro-ui.aotu.io/#/)
- Lodash.js 中文文档： https://www.html.cn/doc/lodash/
- scss：[Sass 参考手册 | Sass 中文文档](http://sass.bootcss.com/docs/sass-reference/)

##**目录结构**

```
— config/  // 构建配置，Taro默认生成
— dist/ // 小程序构建缓存和输出目录
— node_modules/   // 所以依赖安装包文件
— src/            // 项目文件
    assets/ // 所有资源文件 如图片、字体、样式文件
    components/// 组件目录
    interface/// 公共接口
	  libs // 手动导入的库，此目录不会进行代码检查和压缩编译
    pages/ // 项目页面目录，对应微信小程序的pages
    services/// 与后端交互的接口请求文件
    stores/  // mobx数据管理
    utils/  // 一些中间件、插件方法等
    app.scss// 项目的配置
    app.tsx// 应用入口
— .babelre  // babel插件的配置文件
- .eslintignore   // eslint配置
- .eslintrc.json  // eslint配置
- .stylelintrc.json  // stylelint配置
- tsconfig.json   // ts语言的配置
— package.json  // 项目描述文件
— README.md // 项目文档
- project.config.json // 小程序配置文件
```
