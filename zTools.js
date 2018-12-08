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
        //Ie判断
        this.isIe = isIe;
        //数据类型检测
        this.getType = getType;
        //函数检测
        this.isFunction = isFunction;
        //深拷贝
        this.jsClone = jsClone;
        //随机字符串
        this.randomStr = randomStr;
        //跨域请求
        this.jsonp = jsonp;
        //ajax
        this.zAjax = zAjax;
    }


    /**
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
                this.set(key, '', -1000);
            },
        };
        return _cookie;
    }


    /**
     * 判断函数
    */
    function isFunction(source) {
        return '[object Function]' === Object.prototype.toString.call(source);
    };


    /**
     * 判断Ie
     */
    function isIe() {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    };


    /**
     * 检测数据类型
     * @param {*} data 
     */
    function getType(data) {
        var typeName = Object.prototype.toString.call(data),
            returnType = '';
        switch (typeName) {
            case '[object String]':
                returnType = 'String';
                break;
            case '[object Number]':
                returnType = 'Number';
                break;
            case '[object Array]':
                returnType = 'Array';
                break;
            case '[object Date]':
                returnType = 'Date';
                break;
            case '[object Function]':
                returnType = 'Function';
                break;
            case '[object Object]':
                returnType = 'Object';
                break;
            default:
                break;
        }
        return returnType;
    }



    /**
     * 深拷贝（缺陷:对function、date类型操作存在需要注意的事项）
     */
    function jsClone(source) {
        var newVal = null,
            _type = getType(source);
        switch (_type) {
            case 'Object':
                newVal = {};
                for (var key in source) {
                    var _value = source[key];
                    newVal[key] = jsClone(_value);
                }
                break;
            case 'Array':
                newVal = [];
                for (var i = 0; i < source.length; i++) {
                    var _value = source[i];
                    newVal[i] = jsClone(_value);
                }
                break;
            default:
                newVal = source;
                break;
        }
        return newVal;
    }


    /**
     * 随机n位字符串
     */
    function randomStr(prefix, num) {
        return prefix + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, num || 5);
    };


    /**
     * 在页面中注入js脚本
     */
    function createScript(url, charset) {
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        charset && script.setAttribute('charset', charset);
        script.setAttribute('src', url);
        script.async = true;
        return script;
    };


    /**
     * 跨域请求
     */
    function jsonp(url, onsuccess, onerror, charset) {
        var callbackName = randomStr('addScript');
        window[callbackName] = function () {
            if (onsuccess && isFunction(onsuccess)) {
                onsuccess(arguments[0]);
            }
        };
        var script = createScript(url + '&callback=' + callbackName, charset);
        script.onload = script.onreadystatechange = function () {
            if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                script.onload = script.onreadystatechange = null;
                // 移除该script的 DOM 对象
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
                // 删除函数或变量
                window[callbackName] = null;
            }
        };
        script.onerror = function () {
            if (onerror && isFunction(onerror)) {
                onerror();
            }
        };
        document.getElementsByTagName('head')[0].appendChild(script);
    }


    /**
     * ajax
     * todo: 文件数据，使用FormData、 扩展IE6[创建form提交] 
     */
    function zAjax(options) {
        var defautOpt = {
            url: '',
            type: 'get',
            data: {},
            headers:{},
            success: function () { },
            error: function () { },
        };
        var opt = options;
        opt.prototype = defautOpt;//继承默认配置
        if (opt.url) {
            var xhr = XMLHttpRequest
                ? new XMLHttpRequest()
                : new ActiveXObject('Microsoft.XMLHTTP');//IE6
            var data = opt.data,
                url = opt.url,
                _headers =  opt.headers,
                type = opt.type.toUpperCase(),
                dataArr = [];
            for (var k in data) {
                dataArr.push(k + '=' + JSON.stringify(data[k]));
            }
            if (type === 'GET') {
                url = url + '?' + dataArr.join('&');
                xhr.open(type, url, true);
                xhr.send();
            }
            if (type === 'POST') {
                xhr.open(type, url, true);
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                for (var headerType in _headers) {
                    xhr.setRequestHeader(headerType, _headers[headerType]);
                }
                xhr.send(dataArr.join('&'));
            }
            xhr.onload = function () {
                if (xhr.status === 200 || xhr.status === 304) {
                    var res;
                    if (opt.success && opt.success instanceof Function) {
                        res = xhr.responseText;
                        if (typeof res === 'string') {
                            res = JSON.parse(res);
                            opt.success.call(xhr, res);
                        }
                    }
                } else {
                    if (opt.error && opt.error instanceof Function) {
                        opt.error.call(xhr, res);
                    }
                }
            };
        }
    }



})(window, document);

