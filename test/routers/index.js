const routerMiddleware = require('../../index');

const router = routerMiddleware.create('/');

module.exports = router
    .get('/', async function(ctx, next){
        ctx.body = '这是一个普通路由响应';
    });
    