// ==UserScript==
// @name         划词翻译：多词典查询
// @namespace    http://tampermonkey.net/
// @version      6.8
// @description  划词翻译调用“有道词典（有道翻译）、金山词霸、Bing 词典（必应词典）、剑桥高阶、沪江小D、谷歌翻译”
// @author       https://github.com/barrer
// @match        http://*/*
// @exclude-match *://*.cn/*
// @include      https://*/*
// @include      file:///*
// @run-at       document-start
// @connect      youdao.com
// @connect      iciba.com
// @connect      translate.google.cn
// @connect      hjenglish.com
// @connect      bing.com
// @connect      chinacloudapi.cn
// @connect      cambridge.org
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

    // Your code here...
    /**联网权限*/
    // @connect      youdao.com             有道词典
    // @connect      iciba.com              金山词霸
    // @connect      translate.google.cn    谷歌翻译
    // @connect      hjenglish.com          沪江小D
    // @connect      bing.com               必应词典
    // @connect      chinacloudapi.cn       必应词典-发音
    // @connect      cambridge.org          剑桥高阶
    // 注意：自定义变量修改后把 “@version” 版本号改为 “10000” 防止自动更新
    // >---- 可以自定义的变量 -----
    var fontSize = 14; // 字体大小[可自定义]
    var iconWidth = 300; // 整个面板宽度[可自定义]
    var iconHeight = 400; // 整个面板高度[可自定义]
    // ----- 可以自定义的变量 ----<
    /**样式*/
    var style = document.createElement('style');
    var trContentWidth = iconWidth - 16; // 整个面板宽度 - 边距间隔 = 翻译正文宽度
    var trContentHeight = iconHeight - 35; // 整个面板高度 - 边距间隔 = 翻译正文高度
    var zIndex = '2147483647'; // 渲染图层
    style.textContent = `
    /*组件样式*/
    :host{all:unset!important}
    :host{all:initial!important}
    *{word-wrap:break-word!important;word-break:break-word!important}
    a{color:#00c;text-decoration:none;cursor:pointer}
    a:hover{text-decoration:none}
    a:active{text-decoration:underline}
    img{cursor:pointer;display:inline-block;width:20px;height:20px;border:1px solid #dfe1e5;border-radius:4px;background-color:rgba(255,255,255,1);padding:2px;margin:0;margin-right:5px;box-sizing:content-box;vertical-align:middle}
    img:last-of-type{margin-right:auto}
    img:hover{border:1px solid #f90}
    img[activate]{border:1px solid #f90}
    img[activate]:hover{border:1px solid #f90}
    table{font-size:inherit;color:inherit}
    tr-icon{display:none;position:absolute;padding:0;margin:0;cursor:move;box-sizing:content-box;font-size:${fontSize}px;text-align:left;border:0;border-radius:4px;color:black;z-index:${zIndex};background:transparent}
    tr-icon[activate]{background:#fff;-webkit-box-shadow:0 3px 8px 0 rgba(0,0,0,0.2),0 0 0 0 rgba(0,0,0,0.08);box-shadow:0 3px 8px 0 rgba(0,0,0,0.2),0 0 0 0 rgba(0,0,0,0.08)}
    tr-audio{display:block;margin-bottom:5px}
    tr-audio a{margin-right:1em;font-size:80%}
    tr-audio a:last-of-type{margin-right:auto}
    tr-content{display:none;width:${trContentWidth}px;height:${trContentHeight}px;overflow-x:hidden;overflow-y:scroll;background:white;padding:2px 8px;margin-top:5px;box-sizing:content-box;font-family:"Helvetica Neue","Helvetica","Arial","sans-serif";font-size:${fontSize}px;font-weight:normal;line-height:normal;-webkit-font-smoothing:auto;font-smoothing:auto;text-rendering:auto}
    tr-engine~tr-engine{margin-top:1em}
    tr-engine .title{color:#00c;display:inline-block;font-weight:bold}
    tr-engine .title:hover{text-decoration:none}
    /*各引擎样式*/
    .google .sentences,.google .trans,.google .orig,.google .dict,.google .pos,.none{display:block}
    .google .backend,.google .entry,.google .base_form,.google .pos_enum,.google .src,.google .confidence,.google .ld_result,.google .translation_engine_debug_info,.none{display:none}
    .google .orig{color:#777}
    .google .pos{margin-top:1em}
    .google .pos:before{content:"<"}
    .google .pos:after{content:">"}
    .google .terms:before{content:"〔"}
    .google .terms:after{content:"〕"}
    .google .terms{margin-right:.2em}
    .youdao .pron{margin-right:1em}
    .youdao .phone{color:#777;margin-right:1em}
    .youdao .phone:before{content:"["}
    .youdao .phone:after{content:"]"}
    .youdao .pos:before{content:"<"}
    .youdao .pos:after{content:">"}
    .youdao .phrs{display:none}
    .youdao .trs>.tr>.exam{display:none}
    .youdao .trs>.tr>.l{display:block;margin-left:1em}
    .youdao [class="#text"]{font-style:italic}
    .youdao .return-phrase,.youdao [class="@action"],.none{display:none}
    .hjenglish dl,.hjenglish dt,.hjenglish dd,.hjenglish p,.hjenglish ul,.hjenglish li,.hjenglish h3{margin:0;padding:0;margin-block-start:0;margin-block-end:0;margin-inline-start:0;margin-inline-end:0}
    .hjenglish h3{font-size:1em;font-weight:normal}
    .hjenglish .detail-pron,.hjenglish .pronounces{color:#777}
    .hjenglish ul{margin-left:2em}
    .hjenglish .def-sentence-from,.hjenglish .def-sentence-to{display:none}
    .hjenglish .detail-groups dd h3:before{counter-increment:eq;content:counter(eq) ".";display:block;width:22px;float:left}
    .hjenglish .detail-groups dl{counter-reset:eq;margin-bottom:.5em;clear:both}
    .hjenglish ol,.hjenglish ul{list-style:none}
    .hjenglish dd{margin-left:1em}
    .hjenglish dd>p{margin-left:2.5em}
    .bing h1,.bing strong{font-size:1em;font-weight:normal;margin:0;padding:0}
    .bing .concise ul{list-style:none;margin:0;padding:0}
    .bing .hd_tf{margin-right:1em}
    .bing .concise .pos{margin-right:.2em}
    .bing .concise .web{margin-right:auto}
    .bing .concise .web:after{content:"："}
    .bing .oald{margin-top:.4em}
    .bing .hd_tf_lh div{display:inline;color:#777}
    .bing #authid td:first-child{width:22px;margin:0;padding:0}
    .bing .def_row{vertical-align:top}
    .bing .bil_dis,.bing .val_dis{padding-right:.25em}
    .bing .li_exs{display:none}
    .bing .li_id{border:0;padding:.2em}
    .bing .infor,.bing .sen_com,.bing .com_sep,.bing .bil,.bing .gra{padding-right:.25em}
    .bing .infor,.bing .label{padding-left:.25em}
    .bing .each_seg+.each_seg{margin-top:.5em}
    .bing .de_co div{display:inline}
    .bing .idm_seg,.bing .li_ids_co{margin-left:1em}
    .bing .sim{display:inline}
    .cambridge .entry~.entry{margin-top:1em}
    .cambridge p,.cambridge h2,.cambridge h3{padding:0;margin:0}
    .cambridge h2,.cambridge h3{font-size:1em;font-weight:normal}
    .cambridge .headword .hw{display:block}
    .cambridge .pron{color:#777;margin-right:1em}
    .cambridge b.def{font-weight:normal}
    .cambridge .epp-xref{border:1px solid #777;border-radius:.5em;padding:0 2px;font-size:80%}
    .cambridge .examp,.cambridge .extraexamps,.cambridge .cols,.cambridge .xref,.cambridge .fcdo,.cambridge div[fallback],.cambridge .i-volume-up,.cambridge .daccord{display:none}
    .cambridge .entry-body__el+.entry-body__el{margin-top:1em}
    .cambridge .pos-body{margin-left:1em}
    .iciba strong{font-size:1em;font-weight:normal}
    .iciba p{padding:0;margin:0}
    .iciba .icIBahyI-footer,.iciba .icIBahyI-suggest{display:none}
    .iciba .icIBahyI-prons{color:#777}
    .iciba .icIBahyI-eg{margin-right:1em}
    `;
    // iframe 工具库
    var iframe = document.createElement('iframe');
    var iframeWin = null;
    var iframeDoc = null;
    iframe.style.display = 'none';
    var icon = document.createElement('tr-icon'), //翻译图标
        content = document.createElement('tr-content'), // 内容面板
        contentList = document.createElement('div'), //翻译内容结果集（HTML内容）列表
        selected, // 当前选中文本
        engineId, // 当前翻译引擎
        engineTriggerTime, // 引擎触发时间（milliseconds）
        idsType, // 当前翻译面板内容列表数组
        pageX, // 图标显示的 X 坐标
        pageY; // 图标显示的 Y 坐标
    // 初始化内容面板
    content.appendChild(contentList);
    // 发音缓存
    var audioCache = {}; // {'mp3 download url': data}
    // 翻译引擎结果集
    var engineResult = {}; // id: DOM 
    // 唯一 ID
    var ids = {
        BD: 'bd',
        ICIBA: 'iciba',
        ICIBA_LOWER_CASE: 'icibaLowerCase',
        YOUDAO: 'youdao',
        YOUDAO_LOWER_CASE: 'youdaoLowerCase',
        BING: 'bing',
        HJENGLISH: 'hjenglish',
        GOOGLE: 'google',
        CAMBRIDGE: 'cambridge'
    };
    // 唯一 ID 扩展
    var idsExtension = {
        // ID 组
        LIST_DICT: [ids.BD, ids.ICIBA, ids.YOUDAO, ids.BING],
        LIST_DICT_LOWER_CASE: [ids.BD, ids.ICIBA, ids.ICIBA_LOWER_CASE, ids.YOUDAO, ids.YOUDAO_LOWER_CASE, ids.BING],
        LIST_GOOGLE: [ids.GOOGLE],
        // 去重比对（大小写翻译可能一样）
        lowerCaseMap: (function () {
            var obj = {};
            obj[ids.ICIBA_LOWER_CASE] = ids.ICIBA;
            obj[ids.YOUDAO_LOWER_CASE] = ids.YOUDAO;
            return obj;
        })(),
        // 标题
        names: (function () {
            var obj = {};
            obj[ids.BD] = 'B';
            obj[ids.ICIBA] = '金山词霸';
            obj[ids.ICIBA_LOWER_CASE] = '';
            obj[ids.YOUDAO] = '有道词典';
            obj[ids.YOUDAO_LOWER_CASE] = '';
            obj[ids.BING] = 'Bing 词典';
            obj[ids.HJENGLISH] = '沪江小D';
            obj[ids.GOOGLE] = '谷歌翻译';
            obj[ids.CAMBRIDGE] = '剑桥高阶';
            return obj;
        })(),
        // 跳转到网站（“%q%”占位符或者 function text -> return URL）
        links: (function () {
            var obj = {};
            obj[ids.BD] = 'https://fanyi.baidu.com/#en/zh/%q%';
            obj[ids.ICIBA] = 'https://www.iciba.com/word?w=%q%';
            obj[ids.ICIBA_LOWER_CASE] = '';
            obj[ids.YOUDAO] = 'https://dict.youdao.com/w/eng/%q%';
            obj[ids.YOUDAO_LOWER_CASE] = '';
            obj[ids.BING] = 'https://cn.bing.com/dict/search?q=%q%';
            obj[ids.HJENGLISH] = 'https://dict.hjenglish.com/w/%q%';
            obj[ids.GOOGLE] = function (text) {
                var rst = '';
                if (hasChineseByRange(text)) {
                    rst = 'https://translate.google.cn/#view=home&op=translate&sl=auto&tl=en&text=' + encodeURIComponent(text);
                } else {
                    rst = 'https://translate.google.cn/#view=home&op=translate&sl=auto&tl=zh-CN&text=' + encodeURIComponent(text);
                }
                return rst;
            };
            obj[ids.CAMBRIDGE] = 'https://dictionary.cambridge.org/search/english-chinese-simplified/direct/?q=%q%';
            return obj;
        })(),
        // 翻译引擎
        engines: (function () {
            var obj = {};
            obj[ids.BD] = function (text, time) {
                console.log(text);
                Trans = {
                    transText: text,
                    transOrigLang: "en",
                    transTargetLang: "zh",
                    transResult: {}
                };
                baiduTrans.AutoTrans(() => {
                    console.log(Trans.transResult);
                    putEngineResult(ids.BD, htmlToDom(Trans.transResult.trans[0]), time);
                    showContent();
                });
            };
            obj[ids.ICIBA] = function (text, time) {
                ajax('https://open.iciba.com/huaci_v3/dict.php?word=' + encodeURIComponent(text), function (rst) {
                    putEngineResult(ids.ICIBA, parseIciba(rst), time);
                    showContent();
                }, function (rst) {
                    putEngineResult(ids.ICIBA, htmlToDom('error: 无法连接翻译服务'), time);
                    showContent();
                });
            };
            obj[ids.ICIBA_LOWER_CASE] = function (text, time) {
                ajax('https://open.iciba.com/huaci_v3/dict.php?word=' + encodeURIComponent(text.toLowerCase()), function (rst) {
                    putEngineResult(ids.ICIBA_LOWER_CASE, parseIciba(rst), time);
                    showContent();
                }, function (rst) {
                    putEngineResult(ids.ICIBA_LOWER_CASE, htmlToDom('error: 无法连接翻译服务'), time);
                    showContent();
                });
            };
            obj[ids.YOUDAO] = function (text, time) {
                ajax('https://dict.youdao.com/jsonapi?xmlVersion=5.1&jsonversion=2&q=' + encodeURIComponent(text), function (rst) {
                    putEngineResult(ids.YOUDAO, parseYoudao(rst), time)
                    showContent();
                }, function (rst) {
                    putEngineResult(ids.YOUDAO, htmlToDom('error: 无法连接翻译服务'), time);
                    showContent();
                });
            };
            obj[ids.YOUDAO_LOWER_CASE] = function (text, time) {
                ajax('https://dict.youdao.com/jsonapi?xmlVersion=5.1&jsonversion=2&q=' + encodeURIComponent(text.toLowerCase()), function (rst) {
                    putEngineResult(ids.YOUDAO_LOWER_CASE, parseYoudao(rst), time);
                    showContent();
                }, function (rst) {
                    putEngineResult(ids.YOUDAO_LOWER_CASE, htmlToDom('error: 无法连接翻译服务'), time)
                    showContent();
                });
            };
            obj[ids.BING] = function (text, time) {
                ajax('https://cn.bing.com/dict/search?q=' + encodeURIComponent(text), function (rst) {
                    putEngineResult(ids.BING, parseBing(rst), time);
                    showContent();
                }, function (rst) {
                    putEngineResult(ids.BING, htmlToDom('error: 无法连接翻译服务'), time);
                    showContent();
                }, {
                    headers: {
                        'Cookie': 'ENSEARCH=BENVER=0;' // 中文结果
                    }
                });
            };
            obj[ids.HJENGLISH] = function (text, time) {
                ajax('https://dict.hjenglish.com/w/' + encodeURIComponent(text), function (rst) {
                    putEngineResult(ids.HJENGLISH, parseHjenglish(rst), time);
                    showContent();
                }, function (rst) {
                    putEngineResult(ids.HJENGLISH, htmlToDom('error: 无法连接翻译服务'), time);
                    showContent();
                }, {
                    headers: {
                        'Cookie': 'HJ_SID=' + uuid() + '; HJ_SSID_3=' + uuid() + '; HJ_CST=1; HJ_CSST_3=1; HJ_UID=' + uuid(),
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'
                    }
                });
            };
            obj[ids.GOOGLE] = function (text, time) {
                var url = 'https://translate.google.cn/translate_a/single?client=gtx&dt=t&dt=bd&dj=1&source=input&hl=zh-CN&sl=auto';
                url += '&tk=' + token(text);
                if (hasChineseByRange(text)) {
                    url += '&tl=en&q=' + encodeURIComponent(text);
                } else {
                    url += '&tl=zh-CN&q=' + encodeURIComponent(text);
                }
                ajax(url, function (rst) {
                    putEngineResult(ids.GOOGLE, parseGoogle(rst), time);
                    showContent();
                }, function (rst) {
                    putEngineResult(ids.GOOGLE, htmlToDom('error: 无法连接翻译服务'), time);
                    showContent();
                });
            };
            obj[ids.CAMBRIDGE] = function (text, time) {
                var url = 'https://dictionary.cambridge.org/dictionary/english-chinese-simplified/' + encodeURIComponent(text);
                ajax(url, function (rst) {
                    putEngineResult(ids.CAMBRIDGE, parseCambridge(rst), time);
                    showContent();
                }, function (rst) {
                    putEngineResult(ids.CAMBRIDGE, htmlToDom('error: 无法连接翻译服务'), time);
                    showContent();
                });
            };
            return obj;
        })()
    }
    // 绑定图标拖动事件
    var iconDrag = new Drag(icon);
    // 图标数组
    var iconArray = [{
        name: '多词典查询',
        id: 'icon-dict',
        // image: 'https://i0.hdslb.com/bfs/archive/07bcc0b8504d4a87204542af30fc792e4568471d.png',
        image: 'https://res.wx.qq.com/mpres/htmledition/images/wxopen/doc49d02c.png',
        trigger: function (text, time) {
            idsType = idsExtension.LIST_DICT;
            if (text != text.toLowerCase()) {
                idsType = idsExtension.LIST_DICT_LOWER_CASE; // 改为大小写 ID 组（大小写各请求一次）
            }
            idsType.forEach(function (id) {
                idsExtension.engines[id](text, time);
            });
            initContent(); // 初始化翻译面板
            displayContent(); // 立马显示翻译面板
        }
    }, {
        name: '谷歌翻译',
        id: 'icon-google',
        image: 'https://res.wx.qq.com/mpres/htmledition/images/wxopen/other49d02c.png',
        trigger: function (text, time) {
            idsType = idsExtension.LIST_GOOGLE;
            idsType.forEach(function (id) {
                idsExtension.engines[id](text, time);
            });
            initContent(); // 初始化翻译面板
            displayContent(); // 立马显示翻译面板
        }
    }];
    // 添加翻译引擎图标
    iconArray.forEach(function (obj) {
        var img = document.createElement('img');
        img.setAttribute('src', obj.image);
        img.setAttribute('alt', obj.name);
        img.setAttribute('title', obj.name);
        img.setAttribute('icon-id', obj.id);
        img.referrerPolicy = "no-referrer";
        img.addEventListener('click', function () {
            if (engineId == obj.id) {
                // 已经是当前翻译引擎，不做任何处理
            } else {
                icon.setAttribute('activate', 'activate'); // 标注面板展开
                engineId = obj.id; // 翻译引擎 ID
                engineTriggerTime = new Date().getTime(); // 引擎触发时间
                engineActivateShow(); // 显示翻译引擎指示器
                audioCache = {}; // 清空发音缓存
                engineResult = {}; // 清空翻译引擎结果集
                obj.trigger(selected, engineTriggerTime); // 启动翻译引擎
            }
        });
        icon.appendChild(img);
    if(obj.id == 'icon-dict'){
        window.default_img = img;
    }
    });
    // 添加内容面板（放图标后面）
    icon.appendChild(content);
    // 添加样式、翻译图标到 DOM
    var root = document.createElement('div');
    document.documentElement.appendChild(root);
    var shadow = root.attachShadow({
        mode: 'closed'
    });
    // iframe 工具库加入 Shadow
    shadow.appendChild(iframe);
    iframeWin = iframe.contentWindow;
    iframeDoc = iframe.contentDocument;
    // 外部样式表
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = createObjectURLWithTry(new Blob(['\ufeff', style.textContent], {
        type: 'text/css;charset=UTF-8'
    }));
    // 多种方式最大化兼容：Content Security Policy
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
    shadow.appendChild(style); // 内部样式表
    shadow.appendChild(link); // 外部样式表
    // 翻译图标加入 Shadow
    shadow.appendChild(icon);
    // 鼠标事件：防止选中的文本消失
    document.addEventListener('mousedown', function (e) {
        log('mousedown event:', e);
        if (e.target == icon || (e.target.parentNode && e.target.parentNode == icon)) { // 点击了翻译图标
            e.preventDefault();
        }
    });
    // 鼠标事件：防止选中的文本消失；显示、隐藏翻译图标
    document.addEventListener('mouseup', showIcon);
    // 选中变化事件
    document.addEventListener('selectionchange', showIcon);
    document.addEventListener('touchend', showIcon);
    // 内容面板滚动事件
    content.addEventListener('scroll', function (e) {
        if (content.scrollHeight - content.scrollTop === content.clientHeight) {
            log('scroll bottom', e);
            e.preventDefault();
            e.stopPropagation();
        } else if (content.scrollTop === 0) {
            log('scroll top', e);
            e.preventDefault();
            e.stopPropagation();
        }
    });
    /**日志输出*/
    function log() {
        var debug = false;
        if (!debug) {
            return;
        }
        if (arguments) {
            for (var i = 0; i < arguments.length; i++) {
                console.log(arguments[i]);
            }
        }
    }
    /**鼠标拖动*/
    function Drag(element) {
        this.dragging = false;
        this.startDragTime = 0;
        this.stopDragTime = 0;
        this.mouseDownPositionX = 0;
        this.mouseDownPositionY = 0;
        this.elementOriginalLeft = parseInt(element.style.left);
        this.elementOriginalTop = parseInt(element.style.top);
        var ref = this;
        this.startDrag = function (e) {
            e.preventDefault();
            ref.dragging = true;
            ref.startDragTime = new Date().getTime();
            ref.mouseDownPositionX = e.clientX;
            ref.mouseDownPositionY = e.clientY;
            ref.elementOriginalLeft = parseInt(element.style.left);
            ref.elementOriginalTop = parseInt(element.style.top);
            // set mousemove event
            window.addEventListener('mousemove', ref.dragElement);
            log('startDrag');
        };
        this.unsetMouseMove = function () {
            // unset mousemove event
            window.removeEventListener('mousemove', ref.dragElement);
        };
        this.stopDrag = function (e) {
            e.preventDefault();
            ref.dragging = false;
            ref.stopDragTime = new Date().getTime();
            ref.unsetMouseMove();
            log('stopDrag');
        };
        this.dragElement = function (e) {
            log('dragging');
            if (!ref.dragging) {
                return;
            }
            e.preventDefault();
            // move element
            element.style.left = ref.elementOriginalLeft + (e.clientX - ref.mouseDownPositionX) + 'px';
            element.style.top = ref.elementOriginalTop + (e.clientY - ref.mouseDownPositionY) + 'px';
            log('dragElement');
        };
        element.onmousedown = this.startDrag;
        element.onmouseup = this.stopDrag;
    }
    /**是否拖动图标*/
    function isDrag() {
        return iconDrag.elementOriginalLeft != parseInt(icon.style.left) ||
            iconDrag.elementOriginalTop != parseInt(icon.style.top);
    }
    /**强制结束拖动*/
    function forceStopDrag() {
        if (iconDrag) {
            // 强制设置鼠标拖动事件结束，防止由于网页本身的其它鼠标事件冲突而导致没有侦测到：mouseup
            iconDrag.dragging = false;
            iconDrag.unsetMouseMove();
        }
    }
    /**是否包含汉字*/
    function hasChineseByRange(str) {
        return /[\u4e00-\u9fa5]/ig.test(str);
    }
    /**uuid*/
    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    /**对象转 xml*/
    function objToXml(obj) {
        var xml = '';
        for (var prop in obj) {
            if (obj[prop] instanceof iframeWin.Function) {
                continue;
            }
            xml += obj[prop] instanceof iframeWin.Array ? '' : '<' + prop + '>';
            if (obj[prop] instanceof iframeWin.Array) {
                for (var array in obj[prop]) {
                    if (obj[prop][array] instanceof iframeWin.Function) {
                        continue;
                    }
                    xml += '<' + prop + '>';
                    xml += objToXml(new iframeWin.Object(obj[prop][array]));
                    xml += '</' + prop + '>';
                }
            } else if (obj[prop] instanceof iframeWin.Object) {
                xml += objToXml(new iframeWin.Object(obj[prop]));
            } else {
                xml += obj[prop];
            }
            xml += obj[prop] instanceof iframeWin.Array ? '' : '</' + prop + '>';
        }
        var xml = xml.replace(/<\/?[0-9]{1,}>/g, '');
        return xml
    }
    /**xml 转 html*/
    function xmlToHtml(xml, tag) {
        return xml.replace(/<([^/]+?)>/g, '<' + tag + ' class="$1">')
            .replace(/<\/(.+?)>/g, '</' + tag + '>');
    }
    // html 字符串转 DOM
    function htmlToDom(html) {
        var div = document.createElement('div');
        div.innerHTML = html;
        return div;
    }
    /**清理 html*/
    function cleanHtml(html) {
        html = html.replace(/<script[\s\S]*?<\/script>/ig, '')
            .replace(/<link[\s\S]*?>/ig, '')
            .replace(/<style[\s\S]*?<\/style>/ig, '')
            .replace(/<img[\s\S]*?>/ig, '');
        html = cleanAttr(html, 'on[a-z]*');
        return html;
    }
    /**
     * 清理指定属性（忽略大小写）
     * @param attr 支持正则表示（如“on[a-z]*”，表示清理“on”开头的属性：onclick、onmove等）
     */
    function cleanAttr(html, attr) {
        var regex = ' ' + attr + '="([^"<>]*)"';
        return html.replace(new RegExp(regex, 'ig'), '');
    }
    /**带异常处理的 createObjectURL*/
    function createObjectURLWithTry(blob) {
        try {
            return iframeWin.URL.createObjectURL(blob);
        } catch (error) {
            log(error);
        }
        return '';
    }
    /**ajax 跨域访问公共方法*/
    function ajax(url, success, error, obj) {
        if (!!!obj) {
            obj = {};
        }
        if (!!!obj.method) {
            obj.method = 'GET';
        }
        // >>>因为Tampermonkey跨域访问(a.com)时会自动携带对应域名(a.com)的对应cookie
        // 不会携带当前域名的cookie
        // 所以，GM_xmlhttpRequest【不存在】cookie跨域访问安全性问题
        // 以下设置的cookie会添加到已有cookie的后面<<<
        if (!!!obj.headers) {
            obj.headers = {
                'cookie': ''
            };
        }
        GM_xmlhttpRequest({
            method: obj.method,
            url: url,
            headers: obj.headers,
            responseType: obj.responseType,
            data: obj.data,
            onload: function (res) {
                success(res.responseText, res, obj);
            },
            onerror: function (res) {
                error(res.responseText, res, obj);
            },
            onabort: function (res) {
                error('the request was aborted', res, obj);
            },
            ontimeout: function (res) {
                error('the request failed due to a timeout', res, obj);
            },
            onreadystatechange: function () {
                log('ajax:', arguments);
            }
        });
    }
    /**放入翻译引擎结果集*/
    function putEngineResult(id, value, time) {
        if (time == engineTriggerTime) { // 是本次触发的异步ajax请求
            engineResult[id] = value;
        }
    }
    /**初始化面板*/
    function initContent() {
        contentList.innerHTML = ''; // 清空翻译内容列表
        // 发音
        var audio = document.createElement('tr-audio');
        audio.appendChild(getPlayButton({
            name: 'US',
            url: 'https://dict.youdao.com/dictvoice?audio=' + selected + '&type=2'
        }));
        audio.appendChild(getPlayButton({
            name: 'UK',
            url: 'https://dict.youdao.com/dictvoice?audio=' + selected + '&type=1'
        }));
        if (engineId != 'icon-google') { // 谷歌翻译不显示发音图标
            contentList.appendChild(audio);
        }
        // 初始化翻译引擎结构（此时内容暂未填充）
        idsType.forEach(function (id) {
            if (id in idsExtension.names) {
                var engine = document.createElement('tr-engine');
                engine.setAttribute('data-id', id);
                engine.style.display = 'none'; // 暂无内容默认隐藏
                // 标题
                if (idsExtension.names[id]) {
                    var title = document.createElement('a');
                    title.innerHTML = idsExtension.names[id];
                    title.setAttribute('class', 'title');
                    var href = 'javascript:void(0)';
                    if (idsExtension.links[id]) {
                        var link = idsExtension.links[id];
                        if (typeof link == 'string') {
                            if (link.length > 0) {
                                href = link.replace(/%q%/ig, encodeURIComponent(selected));
                            }
                        } else if (typeof link == 'function') {
                            var fnHref = link(selected);
                            if (fnHref.length > 0) {
                                href = fnHref;
                            }
                        }
                    }
                    title.setAttribute('rel', 'noreferrer noopener');
                    title.setAttribute('target', '_blank');
                    title.setAttribute('href', href);
                    title.setAttribute('title', '打开源网站');
                    engine.appendChild(title);
                }
                contentList.appendChild(engine);
            }
        });
        new Audio(`https://fanyi.baidu.com/gettts?lan=en&text=${selected}&spd=3&source=web`).play();
    }
    /**显示内容面板*/
    function displayContent() {
        var panelWidth = iconWidth + 8; // icon 展开后总宽度(8:冗余距离)
        var panelHeight = iconHeight + 8; // icon 展开后总高度(8:冗余距离)
        // 计算位置
        log('content position:',
            'window.scrollY', window.scrollY,
            'document.documentElement.scrollTop', document.documentElement.scrollTop,
            'document.body.scrollTop', document.body.scrollTop,
            'window.innerHeight', window.innerHeight,
            'document.documentElement.clientHeight', document.documentElement.clientHeight,
            'document.body.clientHeight', document.body.clientHeight,
            'icon.style.top', icon.style.top,
            'window.scrollX', window.scrollX,
            'document.documentElement.scrollLeft', document.documentElement.scrollLeft,
            'document.body.scrollLeft', document.body.scrollLeft,
            'window.innerWidth', window.innerWidth,
            'document.documentElement.clientWidth', document.documentElement.clientWidth,
            'document.body.clientWidth', document.body.clientWidth,
            'icon.style.left', icon.style.left
        );
        var scrollTop = Math.max(parseInt(document.documentElement.scrollTop), parseInt(document.body.scrollTop));
        var scrollLeft = Math.max(parseInt(document.documentElement.scrollLeft), parseInt(document.body.scrollLeft));
        var clientHeight = [parseInt(document.documentElement.clientHeight), parseInt(document.body.clientHeight)].filter(function (x) {
            return x <= parseInt(window.innerHeight);
        }).sort(function (a, b) {
            return a > b ? -1 : (a == b ? 0 : 1);
        })[0]; // 找出最大值且小于等于 window 的高度
        if (!clientHeight) { // 网页缩放导致可能数组为空（[0] 为 undefined）
            clientHeight = parseInt(window.innerHeight);
        }
        var clientWidth = [parseInt(document.documentElement.clientWidth), parseInt(document.body.clientWidth)].filter(function (x) {
            return x <= parseInt(window.innerWidth);
        }).sort(function (a, b) {
            return a > b ? -1 : (a == b ? 0 : 1);
        })[0]; // 找出最大值且小于等于 window 的宽度
        if (!clientWidth) { // 网页缩放导致可能数组为空（[0] 为 undefined）
            clientWidth = parseInt(window.innerWidth);
        }
        // 设置新的位置
        var iconNewTop = -1;
        if (parseInt(icon.style.top) < scrollTop) { // 面板在滚动条顶部可见部分之上（隐藏了部分或全部）
            log('Y adjust top');
            iconNewTop = scrollTop; // 设置为滚动条顶部可见部分位置
        } else if (parseInt(icon.style.top) + panelHeight > scrollTop + clientHeight) { // 面板在滚动条滚到最底部时之下（隐藏了部分或全部）
            log('Y adjust bottom');
            iconNewTop = parseInt(scrollTop + clientHeight - panelHeight); // 设置面板底部不超过滚动条滚到最底部时可见部分位置
            if (iconNewTop < scrollTop) { // 如果此时又出现：面板在滚动条顶部可见部分之上（隐藏了部分或全部）
                log('Y adjust bottom top');
                iconNewTop = scrollTop; // 设置为滚动条顶部可见部分位置
            }
        }
        if (iconNewTop != -1 && Math.abs(iconNewTop - parseInt(icon.style.top)) <= panelHeight) {
            log('Y set iconNewTop', iconNewTop);
            icon.style.top = iconNewTop + 'px';
        }
        var iconNewLeft = -1;
        if (parseInt(icon.style.left) < scrollLeft) {
            log('X adjust left');
            iconNewLeft = scrollLeft;
        } else if (parseInt(icon.style.left) + panelWidth > scrollLeft + clientWidth) {
            log('X adjust right');
            iconNewLeft = parseInt(scrollLeft + clientWidth - panelWidth);
            if (iconNewLeft < scrollLeft) {
                log('X adjust right left');
                iconNewLeft = scrollLeft;
            }
        }
        if (iconNewLeft != -1 && Math.abs(iconNewLeft - parseInt(icon.style.left)) <= panelWidth) {
            log('X set iconNewLeft', iconNewLeft);
            icon.style.left = iconNewLeft + 'px';
        }
        content.scrollTop = 0; // 翻译面板滚动到顶端
        content.scrollLeft = 0; // 翻译面板滚动到左端
        content.style.display = 'block';
    }
    /**内容面板填充数据*/
    function showContent() {
        // 填充已有结果集引擎内容
        idsType.forEach(function (id) {
            if (engineResult[id] && !(id in idsExtension.lowerCaseMap)) { // 跳过小写的内容填充
                var engine = contentList.querySelector('tr-engine[data-id="' + id + '"]');
                if (engine) {
                    engine.appendChild(engineResult[id]);
                    engine.removeAttribute('data-id');
                    engine.style.display = 'block';
                }
            }
        });
        // 比较大小写内容
        for (var id in idsExtension.lowerCaseMap) {
            if (engineResult[id] &&
                engineResult[idsExtension.lowerCaseMap[id]] &&
                engineResult[id].innerHTML != engineResult[idsExtension.lowerCaseMap[id]].innerHTML &&
                engineResult[id].innerHTML.toLowerCase() != engineResult[idsExtension.lowerCaseMap[id]].innerHTML.toLowerCase()) {
                var engine = contentList.querySelector('tr-engine[data-id="' + id + '"]');
                if (engine) {
                    engine.appendChild(engineResult[id]);
                    engine.removeAttribute('data-id');
                    engine.style.display = 'block';
                }
            }
        }
    }
    /**隐藏翻译引擎指示器*/
    function engineActivateHide() {
        icon.querySelectorAll('img[activate]').forEach(function (ele) {
            ele.removeAttribute('activate');
        });
    }
    /**显示翻译引擎指示器*/
    function engineActivateShow() {
        engineActivateHide();
        icon.querySelector('img[icon-id="' + engineId + '"]').setAttribute('activate', 'activate');
    }
    /**显示 icon*/
    function showIcon(e) {
        log('showIcon event:', e);
        var offsetX = 4; // 横坐标翻译图标偏移
        var offsetY = 8; // 纵坐标翻译图标偏移
        // 更新翻译图标 X、Y 坐标
        if (e.pageX && e.pageY) { // 鼠标
            log('mouse pageX/Y');
            pageX = e.pageX;
            pageY = e.pageY;
        }
        if (e.changedTouches) { // 触屏
            if (e.changedTouches.length > 0) { // 多点触控选取第 1 个
                log('touch pageX/Y');
                pageX = e.changedTouches[0].pageX;
                pageY = e.changedTouches[0].pageY;
                // 触屏修改翻译图标偏移（Android、iOS 选中后的动作菜单一般在当前文字顶部，翻译图标则放到底部）
                offsetX = -26; // 单个翻译图标块宽度
                offsetY = 16 * 3; // 一般字体高度的 3 倍，距离系统自带动作菜单、选择光标太近会导致无法点按
            }
        }
        log('selected:' + selected + ', pageX:' + pageX + ', pageY:' + pageY)
        if (e.target == icon || (e.target.parentNode && e.target.parentNode == icon)) { // 点击了翻译图标
            e.preventDefault();
            return;
        }
        selected = window.getSelection().toString().trim(); // 当前选中文本
        log('selected:' + selected + ', icon display:' + icon.style.display);
        if (selected && icon.style.display != 'block' && pageX && pageY) { // 显示翻译图标
            log('show icon');
            icon.style.top = pageY + offsetY + 'px';
            icon.style.left = pageX + offsetX + 'px';
            icon.style.display = 'block';
            // 兼容部分 Content Security Policy
            icon.style.position = 'absolute';
            icon.style.zIndex = zIndex;
        if(location.host=="mozilla.github.io" || location.host=="djvu.js.org")
            window.default_img.click();
        } else if (!selected) { // 隐藏翻译图标
            log('hide icon');
            hideIcon();
        }
    }
    /**隐藏 icon*/
    function hideIcon() {
        icon.style.display = 'none';
        icon.removeAttribute('activate'); // 标注面板关闭
        content.style.display = 'none';
        engineId = '';
        engineTriggerTime = 0;
        pageX = 0;
        pageY = 0;
        engineActivateHide();
        audioCache = {};
        engineResult = {};
        forceStopDrag();
    }
    /**发音*/
    function play(obj) {
        console.log(obj);
        let audioObj = new Audio(obj.url);
        audioObj.play();
    }
    /**得到发音按钮*/
    function getPlayButton(obj) {
        var type = document.createElement('a');
        type.innerHTML = obj.name;
        type.setAttribute('href', 'javascript:void(0)');
        type.setAttribute('class', 'audio-button');
        type.setAttribute('title', '点击发音');
        type.addEventListener('mouseup', function () {
            play(obj);
        });
        return type;
    }
    /**有道词典排版*/
    function parseYoudao(rst) {
        var html = '';
        try {
            var rstJson = iframeWin.JSON.parse(rst),
                phoneStyle = 'color:#777;';
            if (rstJson.ec) {
                var word = rstJson.ec.word[0],
                    tr = '';
                var trs = word.trs,
                    ukphone = word.ukphone,
                    usphone = word.usphone,
                    phone = word.phone,
                    returnPhrase = word['return-phrase'];
                if (returnPhrase && returnPhrase.l && returnPhrase.l.i) {
                    html += '<div>' + returnPhrase.l.i + '</div>';
                }
                html += '<div>';
                if (ukphone && ukphone.length != 0) {
                    html += '<span class="pron" style="' + phoneStyle + '">英 [' + ukphone + '] </span>';
                }
                if (usphone && usphone.length != 0) {
                    html += '<span class="pron" style="' + phoneStyle + '">美 [' + usphone + '] </span>';
                }
                html += '</div>';
                if (phone && phone.length != 0) {
                    html += '<div class="pron" style="' + phoneStyle + '">[' + phone + '] </div>';
                }
                trs.forEach(element => {
                    tr += '<div>' + element.tr[0].l.i[0] + '</div>';
                });
                html += tr;
            }
            // 网络释义
            if (rstJson.web_trans &&
                rstJson.web_trans['web-translation'] &&
                rstJson.web_trans['web-translation'].length > 0 &&
                rstJson.web_trans['web-translation'][0]['@same'] &&
                rstJson.web_trans['web-translation'][0]['@same'] == 'true' &&
                rstJson.web_trans['web-translation'][0].trans &&
                rstJson.web_trans['web-translation'][0].trans.length > 0) {
                var webTrans = '网络：';
                rstJson.web_trans['web-translation'][0].trans.forEach(function (obj, i) {
                    if (obj.value) {
                        if (obj.cls && obj.cls.cl && obj.cls.cl.length > 0) {
                            obj.cls.cl.forEach(function (cl) {
                                webTrans += '[' + cl + ']';
                            });
                        }
                        webTrans += obj.value;
                        if (rstJson.web_trans['web-translation'][0].trans.length - 1 != i) {
                            webTrans += '；';
                        }
                    }
                });
                html += '<div>' + webTrans + '</div>';
            }
            // 中英翻译
            if (rstJson.ce_new && rstJson.ce_new.word) {
                html += '<div>' +
                    '《新汉英大辞典》<br>' + xmlToHtml(objToXml(rstJson.ce_new.word), 'div') +
                    '</div>';
            }
            // 中文翻译
            if (rstJson.hh && rstJson.hh.word) {
                html += '<div>' +
                    '《现代汉语大词典》<br>' + xmlToHtml(objToXml(rstJson.hh.word), 'span') +
                    '</div>';
            }
            // 长句翻译
            if (rstJson.fanyi && rstJson.fanyi.tran) {
                html += rstJson.fanyi.tran;
            }
        } catch (error) {
            log(error);
            html += error;
        }
        var dom = document.createElement('div');
        dom.setAttribute('class', ids.YOUDAO);
        dom.innerHTML = html;
        return dom;
    }
    /**金山词霸排版*/
    function parseIciba(rst) {
        var dom = document.createElement('div');
        dom.setAttribute('class', ids.ICIBA);
        try {
            rst = rst.replace(/\n/g, ' ');
            rst = /dict.innerHTML='(.*)';    \tdict.style.display = "block";/g.exec(rst)[1];
            rst = rst
                .replace(/\\"/g, '"')
                .replace(/\\'/g, '\'') // inner-city 这个词会多一个斜杠，金山词霸的数据有些许瑕疵
                .replace(/onclick=/g, 'data-onclick=');
            rst = cleanAttr(rst, 'style');
            // 标识符处理
            var symbolRegex = /(<span class="icIBahyI-fl">.*?(?: xml:lang=).*?<\/span>)/ig;
            var symbolMatch;
            var symbolResult = [];
            while ((symbolMatch = symbolRegex.exec(rst)) != null) {
                symbolResult.push(symbolMatch[1]);
            }
            symbolResult.forEach(function (str) {
                rst = rst.replace(str,
                    str.replace(/\[英\]/g, '英')
                    .replace(/\[美\]/g, '美')
                );
            });
            rst = cleanHtml(rst)
                .replace(/(?:a>)/ig, 'span>')
                .replace(/(?:<a)/ig, '<span');
            var doc = htmlToDom(rst);
            // 发音
            doc.querySelectorAll('[title="真人发音"],[title="机器发音"]').forEach(function (ele) {
                var str = ele.getAttribute('data-onclick');
                var regex = /'(http:\/\/.*?)'/ig;
                var match = regex.exec(str);
                if (match && match.length >= 1) {
                    ele.appendChild(getPlayButton({
                        name: '♫',
                        url: match[1]
                    }));
                }
            });
            // 内容
            dom.appendChild(doc);
        } catch (error) {
            log(error);
            dom.appendChild(htmlToDom(error));
        }
        return dom;
    }
    /**沪江小D排版*/
    function parseHjenglish(rst) {
        var dom = document.createElement('div');
        dom.setAttribute('class', ids.HJENGLISH);
        try {
            var doc = htmlToDom(cleanHtml(rst));
            var label = doc.querySelector('.word-details-item-content header');
            var entry = doc.querySelector('.word-text h2');
            var collins = doc.querySelector('div[data-id="detail"] .word-details-item-content .detail-groups');
            if (entry) {
                var entryDom = document.createElement('div');
                entryDom.setAttribute('class', 'entry');
                entryDom.innerHTML = entry.innerHTML;
                dom.appendChild(entryDom);
                if (collins) {
                    if (label) {
                        var regex = /(《.*?》)/ig;
                        var match = regex.exec(label.innerHTML);
                        if (match && match[1]) {
                            dom.appendChild(htmlToDom('<div>' + match[1] + '</div>'));
                        }
                    }
                    dom.appendChild(collins);
                }
            }
        } catch (error) {
            log(error);
            dom.appendChild(htmlToDom(error));
        }
        return dom;
    }
    /**必应词典排版*/
    function parseBing(rst) {
        var html = '';
        try {
            rst = rst.replace(/onmouseover/ig, 'data-sound'); // 发音链接预处理
            rst = cleanHtml(rst)
                .replace(/(?:a>)/ig, 'span>')
                .replace(/(?:<a)/ig, '<span');
            var doc = htmlToDom(rst);
            doc.querySelectorAll('.hw_ti').forEach(function (ele) { // 牛津词头（不准）
                ele.remove();
            });
            var entry = doc.querySelector('.qdef .hd_area');
            var concise = doc.querySelector('.qdef ul');
            var tense = doc.querySelector('.qdef .hd_div1');
            var oald = doc.querySelector('#authid');
            if (entry) {
                html += '<div class="entry">' + entry.innerHTML + '</div>';
                if (concise) {
                    html += '<div class="concise">' + concise.outerHTML + '</div>';
                }
                if (tense) {
                    html += '<div class="tense">' + tense.outerHTML + '</div>';
                }
                if (oald) {
                    html += '<div class="oald">《牛津高阶英汉双解词典第八版》<br>' + oald.outerHTML + '</div>';
                }
            }
            // 计算机翻译
            var machineTrans = doc.querySelector('.smt_hw');
            if (machineTrans && machineTrans.innerHTML.indexOf('计算机翻译') != -1) {
                var parent = machineTrans.parentNode;
                var zhText = parent.querySelector('.p1-11');
                if (zhText) {
                    html += '<div class="machine-trans">' + zhText.outerHTML + '</div>';
                }
            }
        } catch (error) {
            log(error);
            html += error;
        }
        var dom = document.createElement('div');
        dom.setAttribute('class', ids.BING);
        dom.innerHTML = html;
        // 发音
        dom.querySelectorAll('[data-sound]').forEach(function (ele) {
            var str = ele.getAttribute('data-sound');
            var regex = /'(https:\/\/.*?)'/ig;
            var match = regex.exec(str);
            if (match && match.length >= 1) {
                ele.appendChild(getPlayButton({
                    name: '♫',
                    url: match[1]
                }));
            }
        });
        return dom;
    }
    /**谷歌翻译排版*/
    function parseGoogle(rst) {
        var dom = document.createElement('div');
        dom.setAttribute('class', ids.GOOGLE);
        try {
            dom.appendChild(htmlToDom(xmlToHtml(objToXml(iframeWin.JSON.parse(rst)), 'span')));
        } catch (error) {
            log(error);
            dom.appendChild(htmlToDom(error));
        }
        return dom;
    }
    /**剑桥高阶排版*/
    function parseCambridge(rst) {
        var dom = document.createElement('div');
        dom.setAttribute('class', ids.CAMBRIDGE);
        try {
            rst = cleanHtml(rst).replace(/(?:a>)/ig, 'span>')
                .replace(/(?:<a)/ig, '<span');
            var doc = htmlToDom(rst);
            // 发音
            doc.querySelectorAll('[type="audio/mpeg"]').forEach(function (ele) {
                ele.appendChild(getPlayButton({
                    name: '♫',
                    url: 'https://dictionary.cambridge.org/' + ele.getAttribute('src')
                }));
            });
            // 内容
            doc.querySelectorAll('.entry').forEach(function (ele) {
                dom.appendChild(ele);
            });
        } catch (error) {
            log(error);
            dom.appendChild(htmlToDom(error));
        }
        return dom;
    }
    /**
     * 谷歌翻译 token 计算
     * https://github.com/hujingshuang/MTrans
     * */
    function token(a) {
        var k = "";
        var b = 406644;
        var b1 = 3293161072;

        var jd = ".";
        var sb = "+-a^+6";
        var Zb = "+-3^+b+-f";

        for (var e = [], f = 0, g = 0; g < a.length; g++) {
            var m = a.charCodeAt(g);
            128 > m ? e[f++] = m : (2048 > m ? e[f++] = m >> 6 | 192 : (55296 == (m & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (m = 65536 + ((m & 1023) << 10) + (a.charCodeAt(++g) & 1023), e[f++] = m >> 18 | 240, e[f++] = m >> 12 & 63 | 128) : e[f++] = m >> 12 | 224, e[f++] = m >> 6 & 63 | 128), e[f++] = m & 63 | 128)
        }
        a = b;
        for (f = 0; f < e.length; f++) a += e[f],
            a = RL(a, sb);
        a = RL(a, Zb);
        a ^= b1 || 0;
        0 > a && (a = (a & 2147483647) + 2147483648);
        a %= 1E6;
        return a.toString() + jd + (a ^ b)
    };

    function RL(a, b) {
        var t = "a";
        var Yb = "+";
        for (var c = 0; c < b.length - 2; c += 3) {
            var d = b.charAt(c + 2),
                d = d >= t ? d.charCodeAt(0) - 87 : Number(d),
                d = b.charAt(c + 1) == Yb ? a >>> d : a << d;
            a = b.charAt(c) == Yb ? a + d & 4294967295 : a ^ d
        }
        return a
    }


///////////////////https://github.com/zyufstudio/TM/tree/master/webTranslate////////////////
function a(r) {
if (Array.isArray(r)) {
    for (var o = 0, t = Array(r.length); o < r.length; o++)
    t[o] = r[o];
    return t
}
return Array.from(r)
}

function n(r, o) {
for (var t = 0; t < o.length - 2; t += 3) {
    var a = o.charAt(t + 2);
    a = a >= "a" ? a.charCodeAt(0) - 87 : Number(a),
    a = "+" === o.charAt(t + 1) ? r >>> a : r << a,
    r = "+" === o.charAt(t) ? r + a & 4294967295 : r ^ a
}
return r
}

function e(r,gtk) {
var i = null;
var o = r.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g);
if (null === o) {
    var t = r.length;
    t > 30 && (r = "" + r.substr(0, 10) + r.substr(Math.floor(t / 2) - 5, 10) + r.substr(-10, 10))
} else {
    for (var e = r.split(/[\uD800-\uDBFF][\uDC00-\uDFFF]/), C = 0, h = e.length, f = []; h > C; C++)
    "" !== e[C] && f.push.apply(f, a(e[C].split(""))),
    C !== h - 1 && f.push(o[C]);
    var g = f.length;
    g > 30 && (r = f.slice(0, 10).join("") + f.slice(Math.floor(g / 2) - 5, Math.floor(g / 2) + 5).join("") + f.slice(-10).join(""))
}
var u = void 0
    , l = "" + String.fromCharCode(103) + String.fromCharCode(116) + String.fromCharCode(107);
u = null !== i ? i : (i = gtk || "") || "";
for (var d = u.split("."), m = Number(d[0]) || 0, s = Number(d[1]) || 0, S = [], c = 0, v = 0; v < r.length; v++) {
    var A = r.charCodeAt(v);
    128 > A ? S[c++] = A : (2048 > A ? S[c++] = A >> 6 | 192 : (55296 === (64512 & A) && v + 1 < r.length && 56320 === (64512 & r.charCodeAt(v + 1)) ? (A = 65536 + ((1023 & A) << 10) + (1023 & r.charCodeAt(++v)),
    S[c++] = A >> 18 | 240,
    S[c++] = A >> 12 & 63 | 128) : S[c++] = A >> 12 | 224,
    S[c++] = A >> 6 & 63 | 128),
    S[c++] = 63 & A | 128)
}
for (var p = m, F = "" + String.fromCharCode(43) + String.fromCharCode(45) + String.fromCharCode(97) + ("" + String.fromCharCode(94) + String.fromCharCode(43) + String.fromCharCode(54)), D = "" + String.fromCharCode(43) + String.fromCharCode(45) + String.fromCharCode(51) + ("" + String.fromCharCode(94) + String.fromCharCode(43) + String.fromCharCode(98)) + ("" + String.fromCharCode(43) + String.fromCharCode(45) + String.fromCharCode(102)), b = 0; b < S.length; b++)
    p += S[b],
    p = n(p, F);
return p = n(p, D),
p ^= s,
0 > p && (p = (2147483647 & p) + 2147483648),
p %= 1e6,
p.toString() + "." + (p ^ m)
}

/**
 * @param  {string} word
 * @param  {string} gtk
 * @return {string}
 */
var calcSign =function(word,gtk){
return e(word,gtk);
}

function GetToken(){
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://fanyi.baidu.com/",
        timeout:5000,
        onload: function (r) {
            var gtkMatch = /window\.gtk = '(.*?)'/.exec(r.responseText)
            var commonTokenMatch = /token: '(.*?)',/.exec(r.responseText)
            if (!gtkMatch) {
            console.log("获取gtk失败！！！");
            }
            if (!commonTokenMatch) {
            console.log("获取token失败！！！");
            }
            var newGtk = gtkMatch[1];
            var newCommonToken = commonTokenMatch[1];

            if (typeof newGtk !== 'undefined') {
                baiduTrans.gtk=newGtk;
            }
            if (typeof newCommonToken !== 'undefined') {
                baiduTrans.token=newCommonToken;
            }
            GM_setValue('gtk', newGtk);
            GM_setValue('token', newCommonToken);
            GM_setValue('timestamp', (new Date()).valueOf());
        },
        onerror: function (e) {
            console.error(e);
        }
    })
}

function ObjectToQueryString(object){
    var querystring=Object.keys(object).map(function(key) { 
        return encodeURIComponent(key) + '=' + encodeURIComponent(object[key]) 
    }).join('&');
    return querystring;
}

var baiduTrans = {
    code:"bd",
    codeText:"百度",
    gtk:"",
    token:"",
    defaultOrigLang:"auto",         //默认源语言
    defaultTargetLang:"zh",         //默认目标语言
    langList: {"auto": "自动检测","zh": "中文","cht": "繁体中文","en": "英语","jp": "日语","kor": "韩语","fra": "法语","spa": "西班牙语","pt": "葡萄牙语","it": "意大利语","ru": "俄语","vie": "越南语","de": "德语","ara": "阿拉伯语"},
    Execute: function (h_onloadfn) {
        if(Trans.transOrigLang=="auto")
            this.AutoTrans(h_onloadfn);
        else
            this.ExecTrans(h_onloadfn);
        
    },
    AutoTrans:function(h_onloadfn){
        var self=this;
        var datas={
            query:Trans.transText
        }
        GM_xmlhttpRequest({
            method: "POST",
            headers:{
                "referer": 'https://fanyi.baidu.com',
                "Content-Type": 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            url: "https://fanyi.baidu.com/langdetect",
            data: ObjectToQueryString(datas),
            onload: function (r) {
                var data = JSON.parse(r.responseText);
                if(data.error===0){
                    Trans.transOrigLang=data.lan;
                    self.ExecTrans(h_onloadfn);
                }
            },
            onerror: function (e) {
                console.error(e);
            }
        });
    },
    ExecTrans:function(h_onloadfn){
        var tempSign=calcSign(Trans.transText,this.gtk);
        var datas={
            from:Trans.transOrigLang,
            to:Trans.transTargetLang,
            query:Trans.transText,
            transtype:"translang",
            simple_means_flag:3,
            sign:tempSign,
            token:this.token
        }
        GM_xmlhttpRequest({
            method: "POST",
            headers:{
                "referer": 'https://fanyi.baidu.com',
                "Content-Type": 'application/x-www-form-urlencoded; charset=UTF-8',
                //"User-Agent": window.navigator.userAgent,
            },
            url: "https://fanyi.baidu.com/v2transapi",
            data: ObjectToQueryString(datas),
            onload: function (r) {
                setTimeout(function () {
                    var result= JSON.parse(r.responseText);
                    var trans_result=result.trans_result;
                    var transDatas = trans_result.data;
                    
                    var trans = [],origs = [],src = "";
                    for (var i = 0; i < transDatas.length; i++) {
                        var getransCont = transDatas[i];
                        trans.push(getransCont.dst);
                        origs.push(getransCont.src);
                    }
                    src = trans_result.from;
                    Trans.transResult.trans = trans;
                    Trans.transResult.orig = origs;
                    Trans.transResult.origLang = src;
                    h_onloadfn();
                }, 100);
            },
            onerror: function (e) {
                console.error(e);
            }
        });
    },
    init:function(){
    this.gtk = GM_getValue('gtk', '');
    this.token = GM_getValue('token', '');
    let timestamp = GM_getValue('timestamp', 0);
    if (this.gtk=='' || this.token=='' || (new Date()).valueOf()-timestamp>600000){
        GetToken();
    }
    }
}
baiduTrans.init();
console.log(baiduTrans);

