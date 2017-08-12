const app = require("./app");

const path = require('path');


// 测试一般router
describe('server', function () {
    this.timeout(10*60*1000);
    it('server by session should success', function (done) {
        app(path.join(__dirname, './routers'), function(){
            done();
        });
    });
});