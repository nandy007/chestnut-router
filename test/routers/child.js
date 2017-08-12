const routerMiddleware = require('../../index');

const router = routerMiddleware.create('/interface');

const childRouter = routerMiddleware.create('/');

childRouter
    .get('child', async function(ctx, next){
        ctx.body = '使用了子路由的响应';
    });

module.exports = router.add(childRouter);
    