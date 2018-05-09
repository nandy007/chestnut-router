// 请勿修改
const path = require('path');
const glob = require('glob');
const koaRouter = require('koa-router');

/**
  * 路由处理函数
  * @param  {String}      folder         [router路由文件夹或者回调函数]
  * @param  {String}      projectPath    [应用访问路径]
  * @return {Function}  为Koa中间件函数格式
  */
 let middleware = function (folder, projectPath) {

    const rootRouter = koaRouter();

    if(typeof folder==='function'){
        const routers = folder();
        routers.forEach(function(router){
            rootRouter.use(router.rootPath, middleware.excuteFiters(router.rules), router.routes(), router.allowedMethods());
        });
    }else{
        const routerFoler = folder;
        // 遍历路由文件夹下的所有js文件
        const files = glob.sync('**/*.js', { cwd: routerFoler });
        files.forEach(function (file, i) {
            const router = require(path.join(routerFoler, file));
            // 添加所有子路由
            rootRouter.use(router.rootPath, middleware.excuteFiters(router.rules), router.routes(), router.allowedMethods());
        });
    }

    
    let preRouter, rsRouter;
    if(_rules['pre']){
        preRouter = _rules['pre'](rootRouter);
        rsRouter = preRouter;
    }else{
        rsRouter = rootRouter;
    }

    if(projectPath){
        const projectRouter = koaRouter();
        projectRouter.use(projectPath, rsRouter.routes(), rsRouter.allowedMethods());
        return projectRouter.routes();
    }

    return rsRouter.routes();
};

let _rules = {};// 缓存过滤器规则


/**
  * 添加过滤器函数
  * @param  {Object}      rules         [过滤器对象]
  */
middleware.addFilters = function (rules) {
    for (let k in rules) {
        _rules[k] = rules[k];
    }
};

/**
  * 执行过滤器函数
  * @param  {Array}      rules         [过滤器数组]
  */
middleware.excuteFiters = function (rules) {
    rules = (rules || []).slice(0);
    if(_rules['default']) rules.push(_rules['default']);
    return async function (ctx, next) {
        for (let ruleId of rules) {
            // 如果传递的数组元素是一个函数则为自定义过滤器
            const ruleHandler = typeof ruleId === 'function' ? ruleId : (function () {
                const rule = _rules[ruleId];
                if (!rule) return null;
                if (typeof rule === 'function') return rule;
                return rule.handler;
            })();
            // 当前过滤器不存在则继续下一个
            if (!ruleHandler) {
                continue;
            }
            const rs = await ruleHandler(ctx);
            // 如果过滤器返回false则return，所有中间件处理结束
            if (rs === false) {
                return;
            } else if (rs === null) {// 如果返回null则中断，不继续后面的过滤器
                break;
            }
        }
        await next();// 继续下一个中间件处理
    };
};

/**
  * 执行过滤器函数
  * @param  {String}       rootPath         [父目录路径]
  * @param  {Array}        rules            [非必须，过滤器数组]
  */
middleware.create = function (rootPath, rules) {
    let router = koaRouter();
    router.rootPath = typeof rootPath === 'string' ? rootPath : '/';
    router.rules = rules || [];
    router.add = function (...childs) {
        childs.forEach(function (child) {
            if (typeof child === 'string') {
                // 如果是字符串则认为是文件夹目录，切遍历下面的所有js文件
                const routerFoler = child;
                const files = glob.sync('**/*.js', { cwd: routerFoler });
                files.forEach(function (file, i) {
                    const childRouter = require(path.join(routerFoler, file));
                    // 添加所有子路由
                    router.use(childRouter.rootPath, middleware.excuteFiters(childRouter.rules), childRouter.routes());
                });
            } else {
                // 否则认为是子路由，直接添加
                router.use(child.rootPath, middleware.excuteFiters(child.rules), child.routes());
            }
        });

        return router;
    };
    return router;
};

module.exports = middleware;