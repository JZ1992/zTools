; (function (window, document) {
    window.zTools = new zTools();

    //构造器
    function zTools() {
        //拷贝web文章内容
        this.zCopyHtml = copyHtml;
        //路由
        this.zRouter = RouterInit();

    }


    /**
     * 
     * 拷贝web文章内容
     */
    function copyHtml(target) {

        var sel = window.getSelection(),
            range = document.createRange(),
            target_node = document.querySelector(target);
        sel.removeAllRanges();
        range.selectNodeContents(target_node);
        sel.addRange(range);
        document.execCommand('copy');

    }
    // zCopyHtml(htmlSelector);



    /**
     * 路由
     */
    function RouterInit(){
        window.zRouter = new zRouter();
        window.zRouter.init();
        return zRouter;
    }
    function zRouter() {
        this.routes = {};
        this.currentUrl = '';
    }
    zRouter.prototype.route = function (path, callback) {
        this.routes[path] = callback || function () { };
    };
    zRouter.prototype.refresh = function () {
        this.currentUrl = location.hash.slice(1) || '/';
        this.routes[this.currentUrl]();
    };
    zRouter.prototype.init = function () {
        window.addEventListener('load', this.refresh.bind(this), false);
        window.addEventListener('hashchange', this.refresh.bind(this), false);
    }
    // 注册
    // zRouter.route('/', function () {
    //     do something...
    // });




})(window, document);

