const Router = require('koa-router');
const apiController = require('../controllers/api');
const enums = require('../common/enums');
const moment = require('moment');

const apiRouter = new Router({ prefix: '/wechatapi' });


const successResponse = (data) => {
    return {
        success: true,
        data
    }
}

apiRouter
    .post('/addUserInfo', async ctx => {
        const data = await apiController.addUserInfo(ctx.request.body);
        ctx.body = data;
    })
    .post('/createRoom', async ctx => {
        const data = await apiController.createRoom(ctx.request.body);
        ctx.body = data;
    })
    .post('/findRoom', async ctx => {
        const data = await apiController.findRoom(ctx.request.body);
        ctx.body = data;
    })
   

module.exports = apiRouter;