# ** 前端工程化 package.json 配置总结 **

```javascript
// package.json 这里用的 js
    {
        name: 'app', // 项目名称
        version: '0.0.1', // 项目版本号
        description: '一个示例项目', // 项目的描述
        keywords: 'next.js', // 项目关键词
        author: 'me', // 作者
        main: 'dist/index.esm.js', // 主入口文件
        type: 'module', // 指定模块系统类型
        scirpts: {
            dev: 'webpack main.js --config webpack.dev.js'
        }, // npm 脚本声明，npm钩子声明
        config: {
            baseUrl: 'www.xxx.com', // 配置项，环境变量，全局变量, 会注册为 process.env.npm_pcakage_config_baseUrl
        },
        private: 'true', // 是否私有项目, true 不会发布到 npm服务器，false可以发布
        workspaces: [
            'packages/**'
        ], // monorepo 声明工作区，工作区中声明的包将会被软连接到根目录的 node_modules中
        contributors: ['you, me, he'], // 项目贡献者
        homepage: 'www.xxxx.com', // 项目主页地址
        repository: 'github.com', // 项目的repo地址
        bugs: {
            url: 'github.con/issue', // issue地址
            email: 'xxxx@qq.com', // 邮箱
        },
        dependencies: {}, // 生产环境的依赖
        devDependencies: {}, // 开发环境的依赖
        peerDependencies: {}, // 对等依赖，但不需要安装的依赖，而由使用者提供这些依赖库，常用于库开发中声明不需要库额外去下载的依赖，库的使用者项目中会有的，比如React组件库中在这里声明React，因为使用React组件库的项目中必然有React依赖
        peerDependenciesMeta: {
            react: {
                optional: true // 可选，这样使用者项目中没有 react ，npm也不会警告
            }
        },
        bundledDependencies: {}, // 捆绑依赖
        optionalDependencies: {}, // 可选依赖
        engines: {
            node: '>=16.14.0 < 18.11.0', // 提示node版本，但并不会检测 node 版本，仅仅是提示作用
            npm: '>=6.9.0', // 提示npm版本，不会检测，仅仅提示作用
        },
        browser: 'dist/index.umd.js',
        files: [
            'dist',
            'main.js'
        ], // 指定哪些文件会被发布到npm服务器中, 也可以用 .npmignore
        os: ['linux', 'darwin', '!win32'], // 指定适用的操作系统, ! 表示禁用
        cpu: ['linux'], // 和 os 类似
        license: 'MIT', // 指定开源协议
        'lint-staged': {
            "src/**/*.{ts,tsx}": [
                "eslint src --fix --ext .ts,.tsx"
            ]
        }, // 配置 lint-staged，一般和husky等githook库一起用
        "browserslist": [
            "defaults",
            "not ie < 8",
            "last 2 versions",
            "> 1%",
            "iOS 7",
            "last 3 iOS versions"
        ], // 声明支持的浏览器及版本 autoprefixer 通过此声明添加前缀
        sideEffects: [
            'xx/xx/component.js',
            '*.css'
        ] // 声明带有副作用的包，一般用于帮助webpack，rollup 等打包工具进行 tree shaking，一般直接写 false，打包工具会自动 shaking 掉未引用的包
    }

```
