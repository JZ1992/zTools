(function(window, document) {
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
    //rem布局解决方案
    this.remLayoutWeb = remLayoutWeb;
    this.remLayoutHybrid = remLayoutHybrid;

    //节点遍历
    this.GoThroughDom = GoThroughDom;

    //文本标注
    this.TextLabeling = TextLabeling;
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
    document.execCommand("copy");
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
    this.currentUrl = "";
  }
  zRouter.prototype.route = function(path, callback) {
    this.routes[path] = callback || function() {};
  };
  zRouter.prototype.refresh = function() {
    this.currentUrl = location.hash.slice(1) || "/";
    this.routes[this.currentUrl]();
  };
  zRouter.prototype.init = function(options) {
    window.addEventListener("load", this.refresh.bind(this), false);
    window.addEventListener("hashchange", this.refresh.bind(this), false);
  };
  // 注册
  // zRouter.route('/', function () {
  //     do something...
  // });

  /**
   * Cookie
   */
  function CookieTool() {
    var _cookie = {
      set: function(key, val, time) {
        var date = +new Date(),
          _cookieStr = key + "=" + val,
          expiresDays = time ? time * 60 * 60 * 24 * 1000 : 0;
        //过期时间
        if (expiresDays) {
          _cookieStr += ";expires=" + new Date(date + expiresDays);
        }
        document.cookie = _cookieStr + ";path=/;";
        console.log(_cookieStr + ";path=/;");
      },
      get: function(key) {
        var returnStr,
          cookieStr = document.cookie,
          startIndex = cookieStr.indexOf(key),
          endIndex = cookieStr.indexOf(";", startIndex);
        if (endIndex === -1) {
          endIndex = cookieStr.length;
        }
        returnStr = cookieStr.slice(startIndex, endIndex).split("=")[1];
        return returnStr;
      },
      delete: function(key) {
        //设置过去时间删除
        this.set(key, "", -1000);
      }
    };
    return _cookie;
  }

  /**
   * 判断函数
   */
  function isFunction(source) {
    return "[object Function]" === Object.prototype.toString.call(source);
  }

  /**
   * 判断Ie
   */
  function isIe() {
    var myNav = navigator.userAgent.toLowerCase();
    return myNav.indexOf("msie") != -1
      ? parseInt(myNav.split("msie")[1])
      : false;
  }

  /**
   * 检测数据类型
   * @param {*} data
   */
  function getType(data) {
    var typeName = Object.prototype.toString.call(data),
      returnType = "";
    switch (typeName) {
      case "[object String]":
        returnType = "String";
        break;
      case "[object Number]":
        returnType = "Number";
        break;
      case "[object Array]":
        returnType = "Array";
        break;
      case "[object Date]":
        returnType = "Date";
        break;
      case "[object Function]":
        returnType = "Function";
        break;
      case "[object Object]":
        returnType = "Object";
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
      case "Object":
        newVal = {};
        for (var key in source) {
          var _value = source[key];
          newVal[key] = jsClone(_value);
        }
        break;
      case "Array":
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
    return (
      prefix +
      Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, "")
        .substr(0, num || 5)
    );
  }

  /**
   * 在页面中注入js脚本
   */
  function createScript(url, charset) {
    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    charset && script.setAttribute("charset", charset);
    script.setAttribute("src", url);
    script.async = true;
    return script;
  }

  /**
   * 跨域请求
   */
  function jsonp(url, onsuccess, onerror, charset) {
    var callbackName = randomStr("addScript");
    window[callbackName] = function() {
      if (onsuccess && isFunction(onsuccess)) {
        onsuccess(arguments[0]);
      }
    };
    var script = createScript(url + "&callback=" + callbackName, charset);
    script.onload = script.onreadystatechange = function() {
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
    script.onerror = function() {
      if (onerror && isFunction(onerror)) {
        onerror();
      }
    };
    document.getElementsByTagName("head")[0].appendChild(script);
  }

  /**
   * ajax
   * todo: 文件数据，使用FormData、 扩展IE6[创建form提交]
   */
  function zAjax(options) {
    var defautOpt = {
      url: "",
      type: "get",
      data: {},
      headers: {},
      success: function() {},
      error: function() {}
    };
    var opt = options;
    opt.prototype = defautOpt; //继承默认配置
    if (opt.url) {
      var xhr = XMLHttpRequest
        ? new XMLHttpRequest()
        : new ActiveXObject("Microsoft.XMLHTTP"); //IE6
      var data = opt.data,
        url = opt.url,
        _headers = opt.headers,
        type = opt.type.toUpperCase(),
        dataArr = [];
      for (var k in data) {
        dataArr.push(k + "=" + JSON.stringify(data[k]));
      }
      if (type === "GET") {
        url = url + "?" + dataArr.join("&");
        xhr.open(type, url, true);
        xhr.send();
      }
      if (type === "POST") {
        xhr.open(type, url, true);
        xhr.setRequestHeader(
          "Content-type",
          "application/x-www-form-urlencoded"
        );
        for (var headerType in _headers) {
          xhr.setRequestHeader(headerType, _headers[headerType]);
        }
        xhr.send(dataArr.join("&"));
      }
      xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 304) {
          var res;
          if (opt.success && opt.success instanceof Function) {
            res = xhr.responseText;
            if (typeof res === "string") {
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

  /**
   * rem布局
   * demo基础：750 * 1340 页面
   * 从网易与淘宝的font-size思考前端设计稿与工作流: http://www.cnblogs.com/lyzg/p/4877277.html
   */
  function remLayoutWeb() {
    /**
     *一、页面开头处引入下面这段代码，用于动态计算font-size[网易做法]
     */
    (function(doc, win) {
      var docEl = doc.documentElement,
        isIOS = navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
        dpr = isIOS ? Math.min(win.devicePixelRatio, 3) : 1,
        dpr = window.top === window.self ? dpr : 1, //被iframe引用时，禁止缩放
        scale = 1 / dpr,
        resizeEvt =
          "orientationchange" in window ? "orientationchange" : "resize";
      docEl.dataset.dpr = dpr;
      var metaEl = doc.createElement("meta");
      metaEl.name = "viewport";
      metaEl.content =
        "initial-scale=" +
        scale +
        ",maximum-scale=" +
        scale +
        ", minimum-scale=" +
        scale;
      docEl.firstElementChild.appendChild(metaEl);
      var recalc = function() {
        var width = docEl.clientWidth;
        if (width / dpr > 750) {
          width = 750 * dpr;
        }
        // 乘以100，px : rem = 100 : 1
        docEl.style.fontSize = 100 * (width / 750) + "px";
        console.log(width, docEl.style.fontSize);
      };
      recalc();
      if (!doc.addEventListener) return;
      win.addEventListener(resizeEvt, recalc, false);
    })(document, window);
  }

  function remLayoutHybrid() {
    /**
     *二、淘宝做法（推荐做法，尤其是app内嵌页面）：
     */
    (function(win, lib) {
      var doc = win.document;
      var docEl = doc.documentElement;
      var metaEl = doc.querySelector('meta[name="viewport"]');
      var flexibleEl = doc.querySelector('meta[name="flexible"]');
      var dpr = 0;
      var scale = 0;
      var tid;
      var flexible = lib.flexible || (lib.flexible = {});

      if (metaEl) {
        var match = metaEl
          .getAttribute("content")
          .match(/initial\-scale=([\d\.]+)/);
        if (match) {
          scale = parseFloat(match[1]);
          dpr = parseInt(1 / scale);
        }
      } else if (flexibleEl) {
        var content = flexibleEl.getAttribute("content");
        if (content) {
          var initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
          var maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/);
          if (initialDpr) {
            dpr = parseFloat(initialDpr[1]);
            scale = parseFloat((1 / dpr).toFixed(2));
          }
          if (maximumDpr) {
            dpr = parseFloat(maximumDpr[1]);
            scale = parseFloat((1 / dpr).toFixed(2));
          }
        }
      }

      if (!dpr && !scale) {
        var isAndroid = win.navigator.appVersion.match(/android/gi);
        var isIPhone = win.navigator.appVersion.match(/iphone/gi);
        var devicePixelRatio = win.devicePixelRatio;
        if (isIPhone) {
          // iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
          if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {
            dpr = 3;
          } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)) {
            dpr = 2;
          } else {
            dpr = 1;
          }
        } else {
          // 其他设备下，仍旧使用1倍的方案
          dpr = 1;
        }
        scale = 1 / dpr;
      }

      docEl.setAttribute("data-dpr", dpr);
      if (!metaEl) {
        metaEl = doc.createElement("meta");
        metaEl.setAttribute("name", "viewport");
        metaEl.setAttribute(
          "content",
          "initial-scale=" +
            scale +
            ", maximum-scale=" +
            scale +
            ", minimum-scale=" +
            scale +
            ", user-scalable=no"
        );
        if (docEl.firstElementChild) {
          docEl.firstElementChild.appendChild(metaEl);
        } else {
          var wrap = doc.createElement("div");
          wrap.appendChild(metaEl);
          doc.write(wrap.innerHTML);
        }
      }

      function refreshRem() {
        var width = docEl.getBoundingClientRect().width;
        // 适配平板
        if (width / dpr > 540) {
          width = 540 * dpr;
        }
        var rem = width / 10;
        docEl.style.fontSize = rem + "px";
        flexible.rem = win.rem = rem;
      }

      win.addEventListener(
        "resize",
        function() {
          clearTimeout(tid);
          tid = setTimeout(refreshRem, 300);
        },
        false
      );
      win.addEventListener(
        "pageshow",
        function(e) {
          if (e.persisted) {
            clearTimeout(tid);
            tid = setTimeout(refreshRem, 300);
          }
        },
        false
      );

      if (doc.readyState === "complete") {
        doc.body.style.fontSize = 12 * dpr + "px";
      } else {
        doc.addEventListener(
          "DOMContentLoaded",
          function(e) {
            doc.body.style.fontSize = 12 * dpr + "px";
          },
          false
        );
      }

      refreshRem();

      flexible.dpr = win.dpr = dpr;
      flexible.refreshRem = refreshRem;
      flexible.rem2px = function(d) {
        var val = parseFloat(d) * this.rem;
        if (typeof d === "string" && d.match(/rem$/)) {
          val += "px";
        }
        return val;
      };
      flexible.px2rem = function(d) {
        var val = parseFloat(d) / this.rem;
        if (typeof d === "string" && d.match(/px$/)) {
          val += "rem";
        }
        return val;
      };
    })(window, window["lib"] || (window["lib"] = {}));
  }

  //NodeList对象常用方法扩展
  function NodeListFnExtend() {}

  /**
   * dom节点遍历
   * @param {*} rootNode
   * @param {*} fn
   */
  function GoThroughDom(rootNode, fn) {
    var nodeChildren = rootNode.children;
    if (nodeChildren.length) {
      nodeChildren = filterNode(nodeChildren);
      if (!nodeChildren.length) {
        return;
      }
      nodeChildren.forEach(function(itemNode) {
        var childrenLenth = itemNode.children ? itemNode.children.length : 0;
        fn(itemNode);
        if (childrenLenth) {
          GoThroughDom(itemNode, fn);
        }
      });
    } else {
      fn(rootNode);
    }
  }

  //过滤script和css
  function filterNode(nodeList) {
    var nodeArray = [];
    for (var i = 0; i < nodeList.length; i++) {
      var node = nodeList[i];
      if (/script|style/.test(node.localName.toLowerCase())) {
        break;
      }
      nodeArray.push(node);
    }
    return nodeArray;
  }
  //zTools.GoThroughDom(document.body, function(node){console.log(node.localName);})

  /**
   * 文本标注
   */
  function TextLabeling(config) {
    //缓存配置项
    this.config = config;
    //使用标引的容器
    this.container = document.querySelector(config.container);
    //选区包含的dom，取消此次标引的操作
    this.exclude = config.exclude;
    //当前选区是否容器内
    this.currentSelectionIsIn = false;
    //鼠标右键功能区
    this.menuBox = null;
  }
  //获取当前选区所在的dom
  TextLabeling.prototype.getCurrentSelectionContainer = function() {
    var sel = window.getSelection(),
      currentNode;
    if (sel.type === "None") {
      currentNode = null;
    } else {
      currentNode = sel.getRangeAt(0).commonAncestorContainer.parentElement;
    }
    return currentNode;
  };
  //获取选区包含的dom
  TextLabeling.prototype.getRangeContainDom = function() {
    debugger;
    var sel = window.getSelection(),
      currentNode;
    if (sel.type === "None") {
      currentNode = null;
    } else {
      currentNode = sel.getRangeAt(0).commonAncestorContainer.parentElement;
    }
  };
  //排除style和script标签
  TextLabeling.prototype.filterNode = function(nodeList) {
    var nodeArray = [];
    for (var i = 0; i < nodeList.length; i++) {
      var node = nodeList[i];
      if (/script|style/.test(node.localName.toLowerCase())) {
        break;
      }
      nodeArray.push(node);
    }
    return nodeArray;
  };
  //节点的包含的关系[包含本身]
  TextLabeling.prototype.isChildOf = function(targetNode, fatherNode) {
    if (targetNode === fatherNode) {
      this.currentSelectionIsIn = true;
    } else {
      var nodeChildren = fatherNode.children,
        that = this;
      nodeChildren = that.filterNode(nodeChildren);
      if (!nodeChildren.length) {
        return;
      }
      nodeChildren.forEach(function(itemNode) {
        var childrenLenth = itemNode.children ? itemNode.children.length : 0;
        that.isChildOf(targetNode, itemNode);
      });
    }
  };
  //关闭选区
  TextLabeling.prototype.closeSelection = function() {
    var sel = window.getSelection(),
      range = sel.getRangeAt(0);
    range.collapse();
    sel.removeAllRanges();
  };
  //检查选区是否在注册的容器内
  TextLabeling.prototype.isInContainer = function() {
    //检索前重置
    this.currentSelectionIsIn = false;
    this.isChildOf(this.getCurrentSelectionContainer(), this.container);
    return this.currentSelectionIsIn;
  };
  //绑定事件
  TextLabeling.prototype.bindEvent = function() {
    //selectionchange 只能挂载在 document上
    var that = this;

    // document.addEventListener("selectionchange", function(e) {
    //   if (that.isInContainer()) {
    //     console.log("in");
    //   } else {
    //     console.log("out");
    //   }
    // });

    document.addEventListener("contextmenu", function(e) {
      if (that.isInContainer()) {
        console.log("in");
        e.preventDefault();
        that.setMenu();
        that.displayMenu(e);
      } else {
        console.log("out");
      }
    });

    document.addEventListener("click", function(e) {
      if (e.target.className.indexOf("tlm-btn") !== -1) {
        that.addLabeling();
      }
    });
  };
  //添加标引
  TextLabeling.prototype.addLabeling = function() {
    var origin_text = window.getSelection().toString(),
      wrap_span = document.createElement("span"),
      wrap_range = window.getSelection().getRangeAt(0);
    wrap_span.classList.add("tips-area");
    wrap_span.innerHTML = `<span class="ta-text">${origin_text}</span><span class="ta-del-button  dds">x</span>`;
    wrap_range.deleteContents();
    wrap_range.insertNode(wrap_span);
    wrap_range.collapse();
    window.getSelection().removeAllRanges(); //保证range唯一，用于检测选区包含的dom
  };
  //删除标引
  TextLabeling.prototype.removeLabeling = function() {
    var origin_text = currentNode.previousElementSibling.innerText,
      sel = window.getSelection(),
      new_span = document.createTextNode(origin_text),
      delete_area = currentNode.parentNode,
      wrap_range = document.createRange();
    sel.removeAllRanges();
    wrap_range.selectNode(delete_area);
    sel.addRange(wrap_range);
    wrap_range.deleteContents();
    wrap_range.insertNode(new_span);
    wrap_range.collapse();
  };
  //右键功能
  TextLabeling.prototype.setMenu = function() {
    var tpl = "";
    tpl += '<div class="text-labeling-menu">';
    tpl += '     <div class="tlm-btn">添加标注</div>';
    tpl += "</div>";
    var menuBox = document.querySelector(".text-labeling-box");
    if (menuBox) {
      menuBox.innerHTML = tpl;
    } else {
      var menu_node = document.createElement("div");
      menu_node.className = "text-labeling-box";
      menu_node.innerHTML = tpl;
      document.body.appendChild(menu_node);
      this.menuBox = menu_node;
    }
  };
  TextLabeling.prototype.displayMenu = function(e) {
    var styleList = this.menuBox.style;
    styleList.display = "block";
    styleList.left = e.clientX + 20 +"px";
    styleList.top = e.clientY - 10 +"px";
  };
  //初始化
  TextLabeling.prototype.init = function() {
    this.bindEvent();
  };
})(window, document);
