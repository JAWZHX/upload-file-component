const Koa = require('koa');
const Router = require('koa-router');
const path = require('path');

const app = new Koa();
const router = new Router();

// 搭建静态服务器
app.use(require('koa-static')(path.resolve(__dirname, '../public')));

app
  .use(router.routes())
  .use(router.allowedMethods());


app.listen(8080, '0.0.0.0', () => {
  console.log('服务器运行在http://localhost:8080');
});