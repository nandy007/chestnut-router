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

// 返回的是koa-router对象，代表父目录为/interface，如果是根目录使用/
const router = require('chestnut-router').create('/interface');

module.exports = router
  .get('/login', async function(ctx){
		ctx.body = 'hi chestbut app';
	}); // 访问路径为http://ip:port/interface/login

```

### addFilters 添加过滤器

addFilters接受一个参数，为过滤规则对象，形如：{key : {handler: function(ctx){}}}

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
            return hasData;
        }
    }
});

```

过滤器可以在create中使用，也可以在excuteFiters中使用

使用的时候过滤器数组元素必须为过滤器的key

### excuteFiters 执行过滤器

excuteFiters接受一个参数，此次参数为过滤器数组


在koa中间件中使用

```javascript

const router = require('chestnut-router');

app.use(router.excuteFiters(['session']));

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