const glob = require('glob');
const fs = require('fs');
const path = require('path');
const pages = {};

function resolve(dir) {
  return path.join(__dirname, dir)
}

let entries;
try {
  // 获取相关入口
  entries = glob('src/pages/*/*/main.js', {
    sync: true
  })
} catch (err) {
  entries = [];
  throw err
}
// 格式化生成入口
let baseUrl = [];
entries.forEach((file) => {
  const fileSplit = file.split('/');
  const pageName = `${fileSplit[2]}/${fileSplit[3]}`;
  baseUrl.push(fileSplit[3]);
  let pageHtml = fileSplit.slice(0, 4).join('/') + `${fileSplit[2]}${fileSplit[3]}.html`;
  if (!fs.existsSync(pageHtml)) {
    // 入口如果不配置直接使用 _default.html
    pageHtml = fileSplit.slice(0, 3).join('/') + '/_default.html'
  }
  // let myPath = fileSplit.slice(2, 3).join('/');
  // console.log(myPath);
  pages[pageName] = {
    entry: './' + file,
    template: `public/${fileSplit[2]}.html`,
    filename: `${fileSplit[2]}${fileSplit[3]}.html`,
  }
});

module.exports = {
  pages,
  // baseUrl:'./',
  // baseUrl:'/web', // 加上的话 需要访问 localhost:8000/web/web
  // chainWebpack: config => {
  //   config
  //     .plugin('html')
  //     .tap(args => {
  //       return [/* new args to pass to html-webpack-plugin's constructor */]
  //     })
  // },
  productionSourceMap: false,
  // chainWebpack:(config)=>{
  //   config.resolve.alias.set('@',resolve('src'))
  // },
  devServer: {
    contentBase: path.join(__dirname, 'src/pages/_default.html'),
    // before: function(app) {
    //   // const base = baseUrl.replace(/\/+$/, ''); // 移除尾部斜杠
    //   app.get(`/:page/*`, function(req, res, next) {
    //     // if (baseUrl.includes(req.params.page)) {
    //       console.log(req.params.page);
    //       // 把 /<base>/<page>/* 重定向到 /<base>/<page>/
    //       req.url = `/${req.params.page}/`;
    //       next();
    //     // } else {
    //     //   next();
    //     // }
    //   });
    // },
    port: 8000,
    overlay: {
      warnings: true,
      errors: true
    },

    proxy: {
      '/mock':{
        target:'http://saastest1.ys7.com',
        changeOrigin:true,
        pathRewrite:{
          '/mock':''
        }
      }
    },
    disableHostCheck: true
  },
  css: {
    // modules:true,
    loaderOptions: {
      less: {}
    }
  },
};
