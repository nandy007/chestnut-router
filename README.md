# chestnut-router Koa2快速路由

配合[chestnut-app](https://github.com/nandy007/chestnut-app)使用，也可单独在Koa2中使用

## 用法

app.js

```javascript

const Koa = require('koa');

const path = require('path');

const router = require('chestnut-router');

const app = new Koa();

// 应用的根目录
const rootPath = path.join(__dirname);

app.use(router(rootPath));

```

这时候需要在router代码中使用router.create方法来使用路由。


## 静态方法

### create 创建路由

create方法接受两个参数，第一个是父目录，第二个是过滤器数组

routers目录下的路由定义：
```javascript

// 返回的是koa-router对象，代表父目录为/interface，如果是根目录使用/或者空串
const router = require('chestnut-router').create('/interface');
// 使用过滤器写法
// const router = require('chestnut-router').create('/interface', ['session']);

module.exports = router
  .get('/login', async function(ctx){
		ctx.body = 'hi chestbut app';
	}); // 访问路径为http://ip:port/interface/login

```

### addFilters 添加过滤器

addFilters接受一个参数，为过滤规则对象，形如：{key : {handler: function(ctx){}}} 或者 {key: function(ctx){}}

当函数返回false则所有中间件全部处理结束，如果返回null则所有过滤器处理结束，返回其他值或者不返回则后续过滤器和中间件继续处理

比如：
```javascript

const router = require('chestnut-router');

router.addFilters({
	session : {
        handler : function(ctx){
            const hasData = ctx.session.hasData;
            if(!hasData) ctx.body = {
                result : 'fail',
                msg : '会话超时'
            };
            return hasData;// 没有会话时返回false，后续过滤器和中间件不处理
        }
    },
	fliter1 : function(ctx){
		console.log('进入了过滤器');
	}
	
});

```

过滤器可以在create中使用，也可以在excuteFiters中使用

使用的时候过滤器数组元素必须为过滤器的key

### excuteFiters 执行过滤器

excuteFiters接受一个参数，此次参数为过滤器数组，数组的元素必须是addFilters方法添加的规则的key或者直接是一个function(ctx){}函数，此函数规则跟addFilters中要求的函数有一致的要求


在koa中间件中使用

```javascript

const router = require('chestnut-router');

app.use(router.excuteFiters(['session', function(ctx){
	console.log('经过了临时过滤器');
}]));

```

在路由创建时使用
```javascript

const router = require('chestnut-router').create('/interface', ['session']);

```

在路由定义时使用
```javascript

// 返回的是koa-router对象，代表父目录为/interface，如果是根目录使用/
const router = require('chestnut-router').create('/interface');

module.exports = router
  .get('/login', router.excuteFiters(['session'], async function(ctx){
		ctx.body = 'hi chestbut app';
	}); // 访问路径为http://ip:port/interface/login

```


使用自定义过滤器

```javascript

const router = require('chestnut-router');

const custom = function(ctx){
	// do sth.
};

app.use(router.excuteFiters(['session', custom]));

```

### 链式路由

有的时候需要将一组url进行统一控制使用过滤器，可以使用链式路由。

即使用router的add函数来添加子路由。

add函数支持任意多个参数，每个参数必须符合下列条件之一：

1.入参router对象

2.入参字符串，其代表某个存在的本地目录路径，该路径下的所有js文件对应的模块必须是router对象并全部作为子路由添加进来。


比如：

```javascript

const routerMiddleware = require('chestnut-router');

// 创建主路由
const router = routerMiddleware.create('/interface');
// 创建子路由
const childRouter = routerMiddleware.create('/');

// 要求childRouterPath下的所有js文件作为模块引入时为router对象
const childRouterPath = path.join(__dirname, '../../childs');

// 子路由创建请求
childRouter
    .get('child', async function(ctx, next){
        ctx.body = '使用了子路由的响应';
    });

module.exports = router.add(childRouter, childRouterPath);


```

