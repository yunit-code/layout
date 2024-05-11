(function(window){
    var whir = {}, lastMdule
    if(window.IDM&&window.IDM.module&&window.IDM.module.queue&&window.IDM.module.queue.moduleMain.length>0){
        lastMdule = window.IDM.module.queue.moduleMain[window.IDM.module.queue.moduleMain.length-1]
    }
    var resource={
        js:{
            vendors:'js/chunk-vendors',
            index:'js/index',
        },
        css:['css/index','css/chunk-vendors']
    }, doc = document, config = {},
    error = function(msg){
        window.console && console.error && console.error('IDM hint: ' + msg);
    },
    getPath = function(){
        var head = doc.getElementsByTagName('head')[0] || doc.head || doc.documentElement
        var js = head.getElementsByTagName('script'), jsPath = js[js.length - 1].src
        jsPath = document.currentScript.src||jsPath
        return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
    }(),
    isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]';
    config.resources = {}; //记录资源物理路径
    config.status = {}; //记录资源加载状态
    config.timeout = 10; //符合规范的资源请求最长等待秒数
    whir.res = {
        _cv : '', // 组件版本，用于更新
        _lk: 'layout',
        loadJs: function (name, url, cb) { //动态加载js文件并缓存
            if (window.localStorage) {
                var xhr, _this = this, js = localStorage.getItem(name)
                if (js == null || js.length == 0 || this._cv != localStorage.getItem(_this._lk)) {
                    if (window.ActiveXObject) {
                        xhr = new window.ActiveXObject('Microsoft.XMLHTTP')
                    } else if (window.XMLHttpRequest) {
                        xhr = new XMLHttpRequest()
                    }
                    if (xhr != null) {
                        xhr.open('GET', url)
                        xhr.send(null)
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4 && xhr.status == 200) {
                                js = xhr.responseText;
                                try {
                                    localStorage.setItem(name, js)
                                } catch (error) {
                                    console.error('存储js文件错误：%d', name)
                                    whir.res.linkJs(url)
                                }
                                localStorage.setItem(_this._lk, whir.res._cv)
                                js = js == null ? '' : js
                                whir.res.writeJs(js)
                                if (cb != null) {
                                    cb();
                                }
                            }
                        }
                    }
                } else {
                    whir.res.writeJs(js)
                    if (cb != null) cb()
                }
            } else {
                whir.res.linkJs(url)
            }
        },
        loadCss: function (name, url) {
            if (window.localStorage) {
                var xhr
                var css = localStorage.getItem(name)
                if (css == null || css.length == 0 || this._cv != localStorage.getItem('version')) {
                    if (window.ActiveXObject) {
                        xhr = new window.ActiveXObject('Microsoft.XNLHTTP')
                    } else if (window.XMLHttpRequest) {
                        xhr = new XMLHttpRequest()
                    }
                    if (xhr != null) {
                        xhr.open('GET',url)
                        xhr.send(null)
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4 && xhr.status == 200) {
                                css = xhr.responseText;
                                localStorage.setItem(name,css)
                                localStorage.setItem('version',whir.res._cv);
                                css = css == null ? '' : css
                                // css = css.replace(/images\//g,'style/images/')
                                whir.res.writeCss(css)
                            }
                        }
                    }
                } else {
                    // css = css.replace(/images\//g,'style/images/')
                    whir.res.writeCss(css)
                }
            } else {
                whir.res.linkCss(url)
            }
        },
        writeJs: function (text) {
            var head = document.getElementsByTagName('HEAD').item(0)
            var link = document.createElement('script');
            link.type = 'text/javascript';
            link.innerHTML = text;
            head.appendChild(link);
        },
        writeCss: function (text) {//往页面写入css样式
            var head = document.getElementsByTagName('HEAD').item(0)
            var link = document.createElement('style')
            link.type = 'text/css'
            link.innerHTML = text
            head.appendChild(link)
        },
        linkJs: function (apps,rcallback){
            var that = this
            if(rcallback){
                this.callback = rcallback
            }
            apps = typeof apps === 'string' ? [apps] : apps
            var dir = getPath
            var head = doc.getElementsByTagName('head')[0]
            var item = apps[0], timeout = 0
            if(apps.length === 0){
                return rcallback&&rcallback(this)
            }
            //加载模块
            var node = doc.createElement('script'), url =  dir + (resource.js[item] || item) + '.js'
            node.async = true
            node.src = url
            node.setAttribute('objectID', 'IDM-Module-'+url)
            var onScriptLoad = function(e){
              var readyRegExp = navigator.platform === 'PLaySTATION 3' ? /^complete$/ : /^(complete|loaded)$/
              if (e.type === 'load' || (readyRegExp.test((e.currentTarget || e.srcElement).readyState))) {
                config.status[item] = true
                config.resources[item] = url
                head.removeChild(node)
                (function poll() {
                  if(++timeout > config.timeout * 1000 / 4){
                    onCallback(apps)
                    return error(item +':'+url + ' is not a valid js')
                  }
                  config.status[item] ? onCallback(apps) : setTimeout(poll, 4)
                }())
              }
            }
            //首次加载
            if(!config.resources[item]){
                head.appendChild(node)
                if(node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !isOpera){
                    node.attachEvent('onreadystatechange',onScriptLoad)
                } else {
                    node.addEventListener('load',onScriptLoad, false)
                }
            } else {
                (function poll() {
                if(++timeout > config.timeout * 1000 / 4){
                    onCallback(apps) 
                    return error(item+':'+url + ' is not a valid js')
                }
                (typeof config.resources[item] === 'string' && config.status[item])
                ? onCallback(apps)
                : setTimeout(poll, 4)
                }())
            }
            var onCallback = function(apps){
                apps.length > 1 ?
                whir.res.loadjs(apps.slice(1), this.callback)
                : ( typeof this.callback === 'function' && this.callback.call(this) );
            }
            config.resources[item] = url
            return that
        },
        linkCss: function (src,reload, fun) {//往页面引入css
            var head = document.getElementsByTagName('HEAD').item(0)
            var link = document.createElement("link")
            link.type = "text/css"
            link.rel = "stylesheet"
            link.media = "screen"
            link.href = src
            head.appendChild(link)
        }
    };
    resource.css&&resource.css.forEach(function(item){
        var url = getPath + item + '.css'
        whir.res.linkCss(url,false)
    })
    whir.res._cv = '2.2.0'; //页面版本，用于检测是否需要更新缓存
    whir.res.loadJs(getPath + 'js/chunk-vendors.js', getPath + 'js/chunk-vendors.js',
        function () {
            whir.res.loadJs(getPath + 'js/index.js', getPath + 'js/index.js', function(){
                if(lastMdule&&lastMdule.callback){
                    lastMdule.callback.call(this,lastMdule)
                }
            });
        }
    );
})(window)