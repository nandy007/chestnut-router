const routerMiddleware = require('../../index');

routerMiddleware.addFilters({
    filter1: async function (ctx) {
        ctx.body = '经过了过滤器1;';
    },
    filter2: async function (ctx) {
        ctx.body += '经过了过滤器2;';
    }
});

const router = routerMiddleware.create('/', ['filter1']);

module.exports = router
    .get('filter', routerMiddleware.excuteFiters(['filter2']), async function (ctx, next) {
        ctx.body += '这是一个使用了过滤器的响应';
    });
