// eslint-disable-next-line import/no-commonjs
const path = require('path')

const alias = {
  '@/components': path.resolve(__dirname, '..', 'src/components'),
  '@/assets': path.resolve(__dirname, '..', 'src/assets'),
  '@/interfaces': path.resolve(__dirname, '..', 'src/interfaces'),
  '@/services': path.resolve(__dirname, '..', 'src/services'),
  '@/stores': path.resolve(__dirname, '..', 'src/stores'),
  '@/utils': path.resolve(__dirname, '..', 'src/utils'),
  '@/src': path.resolve(__dirname, '..', 'src')
}

// NOTE 在 sass 中通过别名（alias配置,@ 或 ~）引用需要指定路径
const sassImporter = function (url) {
  if (url[0] === '~' && url[1] !== '/') {
    return { file: path.resolve(__dirname, '..', 'node_modules', url.substr(1)) }
  }

  return { file: url }

  // const reg = /^(@\/[a-z]+)\/(.*)/
  // const res = url.match(reg)

  // return { file: reg.test(url) && alias[res[1]] ? path.join(alias[res[1]], res[2]) : url }
}

const config = {
  projectName: 'teashop-seller',
  date: '2019-3-14',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  alias,
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: {
    babel: {
      sourceMap: true,
      presets: [['env', { modules: false }]],
      plugins: ['lodash', 'transform-decorators-legacy', 'transform-class-properties', 'transform-object-rest-spread']
    },
    sass: { importer: sassImporter }
  },
  defineConstants: {},
  copy: {
    patterns: [],
    options: {}
  },
  weapp: {
    module: {
      postcss: {
        autoprefixer: {
          enable: true,
          config: { browsers: ['last 3 versions', 'Android >= 4.1', 'ios >= 8'] }
        },
        pxtransform: {
          enable: true,
          config: {}
        },
        url: {
          enable: true,
          config: { limit: 10240 } // 设定转换尺寸上限
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    esnextModules: ['taro-ui'],
    module: {
      postcss: {
        autoprefixer: {
          enable: true,
          config: { browsers: ['last 3 versions', 'Android >= 4.1', 'ios >= 8'] }
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }

  return merge({}, config, require('./prod'))
}
