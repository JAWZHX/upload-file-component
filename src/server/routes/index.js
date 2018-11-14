const Router = require('koa-router');
const router = new Router();
const controllers = require('../controllers');

router.post('uploadFile', '/uploadFile', controllers.uploadFile);

module.exports = router;