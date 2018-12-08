; (function (window, document) {
    window.zTools = new zTools();

    //构造器
    function zTools() {
        //拷贝web文章内容
        this.zCopyHtml = copyHtml;
        //路由
        this.zRouter = RouterInit;
        //Cookie
        this.Cookie = CookieTool();


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
     * 路由(默认hash模式)
     * todo: hash 和 h5 以及 js和Html关联
     */
    function RouterInit(options) {
        window.zRouter = new zRouter();
        window.zRouter.init(options);
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
    zRouter.prototype.init = function (options) {
        window.addEventListener('load', this.refresh.bind(this), false);
        window.addEventListener('hashchange', this.refresh.bind(this), false);
    }
    // 注册
    // zRouter.route('/', function () {
    //     do something...
    // });



    /**
     * Cookie
     */
    function CookieTool() {
        var _cookie = {
            set: function (key, val, time) {
                var date = +(new Date()),
                    _cookieStr = key + "=" + val,
                    expiresDays = time ? time * 60 * 60 * 24 * 1000 : 0;
                //过期时间
                if (expiresDays) {
                    _cookieStr += ";expires=" + (new Date(date + expiresDays));
                }
                document.cookie = _cookieStr + ";path=/;";
                console.log(_cookieStr + ";path=/;");
            },
            get: function (key) {
                var returnStr,
                    cookieStr = document.cookie,
                    startIndex = cookieStr.indexOf(key),
                    endIndex = cookieStr.indexOf(';', startIndex);
                if (endIndex === -1) {
                    endIndex = cookieStr.length;
                }
                returnStr = cookieStr.slice(startIndex, endIndex).split('=')[1];
                return returnStr;
            },
            delete: function (key) {
                //设置过去时间删除
                this.set(key,'' ,  -1000);
            },
        };
        return _cookie;
    }



})(window, document);

