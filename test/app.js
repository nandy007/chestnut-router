const Koa = require('koa');
const http = require('http');

const app = new Koa();

const routerMiddleware = require('../index');

let util = function (folder, cb) {
    let count = 0;
    app.use(async function(ctx, next){
        const url = ctx.url;
        if(url==='/'||url==='/interface/child'||url==='/filter'){
            count++;
        }
        await next();
        if(count===3){
            setTimeout(cb, 10*1000);
        }
    });

    app.use(routerMiddleware(folder));

    http.createServer(app.callback()).listen(3002);


    console.log('请在浏览器上分别访问:');
    console.log('http://127.0.0.1:3002');
    console.log('http://127.0.0.1:3002/interface/child');
    console.log('http://127.0.0.1:3002/filter');
};

module.exports = util;