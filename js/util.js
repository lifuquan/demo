function $(selector){
	return document.querySelector(selector);
}

var Util = {};
Util.addEventListener = document.addEventListener?
	function(elem,type,listener,useCapture){
		elem.addEventListener(type,listener,useCapture);
	}:
	function(elem,type, listener, useCapture){
		elem.attachEvent('on'+type, listener);
	};
Util.removeEventListener = document.removeEventListener?
	function(elem, type, listener, useCapture){
		elem.removeEventListener(type, listener, useCapture);
	}:
	function(elem, type, listener, useCapture){
		elem.detachEvent('on'+type, listener);
	};

/**
 * [动画函数]
 * @param  {[DOM element]} 	ele      [DOM元素]
 * @param  {[string]} 		attr     [DOM元素的属性]
 * @param  {[number]} 		from     [不带单位的起始值]
 * @param  {[number]} 		to       [不带单位的终点值]
 * @param  {[number]} 		duration [以毫秒为单位的时间长度]
 * @return {[number]}          		 [intervalID]
 */
Util.animate = function(ele, attr, from, to, duration, callback){

	var stepCount = duration/20;	//每20毫秒实行一帧动画
	var distance = Math.abs(to-from);
	var sign = (to-from)/distance;
	var stepLength = distance/stepCount;
	/**
	 * [给ele.attr赋值]
	 * @param {[number]} val [不带单位的数值]
	 */
	var setAttr = function(val){
		if(attr==='opacity'){
			ele.style.opacity = val;
			// 兼容IE8
			ele.style.filter = 'alpha(opacity='+ 100*val +')';
		}else if(attr in ele.style){
			ele.style[attr] = val + 'px';
		}
	};
	var offset = 0;
	var step = function(){
		var tmpOffset = offset + stepLength;
		if(tmpOffset<distance){
			offset = tmpOffset;
			setAttr(from+offset*sign);
		}else{
			setAttr(to);
			clearInterval(intervalID);
			if(callback) callback();
		}
	};
	setAttr(from);
	var intervalID = setInterval(step, 20);
	return intervalID;
}

/**
 * [Ajax跨域请求GET方法的封装]
 * @param  {[String]}   url      [请求资源的url]
 * @param  {[Object]}   options  [请求的查询参数]
 * @param  {[Function]} callback [请求的回调函数，接收responseText作为参数]
 * @return {[void]}            	 []
 */
Util.get = function (url, options, callback){
	if(window.XDomainRequest){
		// 在IE8和IE9下,XMLHttpRequest不支持跨域请求。CORS是通过XDomainRequest实现的。
		var xdr = new XDomainRequest();
		xdr.onload = function(){
			callback(xdr.responseText);
		}
		xdr.open('get', url+'?'+serialize(options));
		xdr.send();
	}else{
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if(xhr.readyState==4){
				if((xhr.status>=200 && xhr.status<300) || (xhr.status==304)){
					callback(xhr.responseText);
				}else{
					alert('Request was unsuccessful: '+xhr.status);
				}
			}
		}
		xhr.open('get', url+'?'+serialize(options), true);
		xhr.send(null);
	}
	
	function serialize(data){
		if(!data) return '';
		var pairs = [];
		for(var name in data){
			if(!data.hasOwnProperty(name)) continue;
			if(typeof data[name]==='function') continue;
			var value = data[name].toString();
			name = encodeURIComponent(name);
			value = encodeURIComponent(value);
			pairs.push(name+'='+value);
		}
		return pairs.join('&');
	}
}

// 2.1	获取课程列表
// Util.get('http://study.163.com/webDev/couresByCategory.htm', {pageNo: 2, psize: 5, type: 20}, function(data){
//    console.log(data);
// });
// 2.2	右侧“最热排行”
// Util.get('http://study.163.com/webDev/hotcouresByCategory.htm', null, function(data){
//    console.log(data);
// });
// 2.3	导航关注
// Util.get('http://study.163.com/webDev/attention.htm', null, function(data){
//    console.log(data);
// });
//2.4	用户登录
// Util.get('http://study.163.com/webDev/login.htm', {userName: md5('studyOnline'), password: md5('study.163.com')}, function(data){
//    console.log(data);
// });

Util.getCookie = function(){
	var cookie = {};
	var all = document.cookie;
	if(all==='') return cookie;
	var list = all.split('; ');
	for(var i=0; i<list.length; i++){
		var item = list[i];
		var p = item.indexOf('=');
		var name = item.substring(0, p);
		name = decodeURIComponent(name);
		var value = item.substring(p+1);
		value = decodeURIComponent(value);
		cookie[name] = value;
	}
	return cookie;
}

/**
     * [模板解析函数。函数的参数形式和模板标记参考了DOM编程艺术提供的demo.
     * 解析两种格式，${prop|fun}和${list tracks as track}...{/list}.
     * ${prop|fun}:
     * prop是定义在参数data中的属性，即data.prop.
     * fun是定义在配置参数config中的方法.
     * 以config.fun(data.prop)的返回值替换${prop|fun}.
     * ${list tracks as track}...{/list}:
     * tracks是定义在参数data中的属性，是一个数组，即data.tracks.
     * 在遍历数组的过程中，数组tracks的元素赋值给了变量track.
     * 在${list tracks as track}...{/list}之间的${track.prop|fun}会被解析。
     * ]
     * @param  {[String]} template [模板字符串]
     * @param  {[Object]} data     [{tracks: list}]
     * @param  {[Object]} config   [{dur2str:function(duration){...},}]
     * @return {[String]}          [解析后的HTML字符串。]
     */
    Util.getHTML = function(template, data, config){
    	/**
    	 * [把字符串转换对对应的数据，比如'prop1.prop2.prop3'会被转换成data.prop1.prop2.prop3. 如果data.prop1.prop2.prop3未定义，则返回undefined.]
    	 */
        var str2data = function(str){
            var arr = str.split('.');
            var value = data;
            for(var i=0, len=arr.length;i<len;i++){
            	// 不能写成if(value[arr[i]]，因为有可能是0)
                if(value[arr[i]]!==undefined){
                    var value = value[arr[i]];
                }else{
                    return;
                }
            }
            return value;
        };
        /**
         * [解析“${value|fun}”。以参数data中传入的值value为参数运行参数config中传入的函数fun,用函数运行结果替换掉“${value|fun}”]
         */
        function insertData(htmlStr){
            var html = htmlStr.replace(/\${([^}^|]+)(|[^}]+)?}/g, function(m0, m1, m2){
                    var value = str2data(m1);
                    if(value===undefined){
                    	// 如果${...}在data中未定义，则返回${...}。
                    	return m0;
                    }
                    if(m2 && config[m2.slice(1)]){
                    	// 如果${...|fun},并且在config中有定义fun方法。
                        value = config[m2.slice(1)](value);
                    }
                    return value
                });
            return html;
        }
        /**
         * [递归函数，每次调用只解析一个{list ... as ...}...{/list}结果。递归调用函数自身，直到解析完所有{list ... as ...}..{/list}。]
         */
        function insertLists(htmlStr){
            var tmpStart, tmpBody, tmpEnd;
            var lists, list;
            htmlStr.replace(/([\s\S]*?){list\s([\S]+)\sas\s([\S]+)}([\s\S]*?){\/list}([\s\S]*)/, function(m0, m1, m2, m3, m4, m5){
                tmpStart = m1;
                lists = m2;
                list = m3;
                tmpBody = m4;
                tmpEnd = m5;
            });
            var html = '';
            for(var i=0, len=data[lists].length;i<len;i++){
                data[list] = data[lists][i];
                html += insertData(tmpBody);
            }
            delete data[list];
            if(tmpEnd.indexOf('{/list}')!==-1){
                tmpEnd= insertLists(tmpEnd);
            } 
            html = tmpStart + html + tmpEnd;
            return html;
        }
        var html = insertData(template);
        return insertLists(html);
    }
