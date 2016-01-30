//IE8,9下，兼容placeholder。在输入框上覆盖一个div用来显示提示内容。
Util.supportPlaceholder();

// 关注
// 测试账户：studyOnline	密码：study.163.com
(function(){
var follow = $('.m-follow'),
	followBtn = $('.follow'),
	followerCount = $('.followerCount'),
	followStatus = $('.follow_status'),
	mask = $('#mask'),
	loginForm = $('#loginForm'),
	close = $('#loginForm .close'),
	cookie = Util.getCookie();

if(cookie.followSuc==='false' || cookie.followSuc===undefined){
	// 如果未关注，显示关注按钮和粉丝数量。
	Util.addClass(followBtn, followerCount, 'show');
}else if(cookie.followSuc==='true'){
	// 如果已关注，显示”已关注/取消“。
	Util.addClass(followStatus, 'show');
}

Util.addEventListener(followBtn,'click', function(event){
	var cookie = Util.getCookie();
	if(cookie.loginSuc===undefined){
		Util.addClass(mask, loginForm, 'show');
	}else if(cookie.loginSuc==='true'){
		// 如果登录cookie已经设置，不弹出登录窗口，直接处理关注逻辑。
		followSuccess();
	}
}, false);

/**
 * [提交登录的用户名和密码。
 * 如果验证通过，设置cookie值'loginSuc=true',执行回调函数callback。]
 * @param  {Function} callback [回调函数]
 * @return {[type]}            [无]
 */
function loginSuccess(callback){
	var loginBtn = $('#loginForm button');
	Util.addEventListener(loginBtn, 'click', function(event){
		if(event.preventDefault){
			event.preventDefault();
		}else{
			event.returnValue = false;
		}
		
		var userName=loginForm.elements.username.value;
		var password=loginForm.elements.password.value;

		if(password && userName){
			Util.get('http://study.163.com/webDev/login.htm', {userName: md5(userName), password: md5(password)}, function(data){
				if(data=='1'){
					document.cookie = 'loginSuc=true';
					callback();
				}else if(data=='0'){
					alert('匹配用户名密码失败');
				}
			});
		}else{
			alert('请输入用户名和密码')
		}
	}, false);
}

/**
 * [登录成功后，执行的动作。]
 * @return {[type]} [无]
 */
function followSuccess(){
	// 隐藏遮罩和登录表单
	Util.removeClass(mask, loginForm, 'show');
	// 隐藏关注人数和关注按钮
	Util.removeClass(followBtn, followerCount, 'show');
	// 显示关注状态，“已关注/取消”
	Util.addClass(followStatus, 'show');
	// 调用关注api,如果返回正确结果，则设置cookie值'followSuc=true'
	Util.get('http://study.163.com/webDev/attention.htm', null, function(data){
		if(data==='1'){
			document.cookie= 'followSuc=true';
		}
	});
}

loginSuccess(followSuccess);

// 取消关注
Util.addEventListener(follow,'click', function(event){
	var target = event.target || event.srcElement;
	// 如果被点击的元素含有类名unfollow，即点击'取消'按钮
	var className = ' ' + target.className + ' ';
	if(className.indexOf(' unfollow ')!==-1){
		// 显示关注按钮和关注人数
		Util.addClass(followBtn, followerCount, 'show');
		// 隐藏关注状态，“已关注/取消"
		Util.removeClass(followStatus, 'show');
		// 清除表示登陆成功的cookie值
		document.cookie = 'loginSuc=true; Expires=' + new Date().toGMTString();
		// 清除表示关注成功的cookie值
		document.cookie = 'followSuc=true; Expires=' + new Date().toGMTString();
	}
}, false);

// 关闭登陆表单
Util.addEventListener(close, 'click', function(){
	// 隐藏登陆表单和遮罩
	Util.removeClass(mask, loginForm, 'show');
}, false);
})();

//	banner动画
(function(){
// 入场图片淡入的时间
var DURATION = 500;
// 两次图片淡入之间的等待时间
var WAITING = 4500;

var banner = $('.g-hd .m-banner');
var aLi = banner.getElementsByTagName('li');
var pointer = $('.m-banner .pointer');
var aPointer = banner.querySelectorAll('.pointer span');
// current标识当前图片，next标识下一张图片，即将要切换到的图片。
// 点击轮播图底部的指示器会更改next.
var current = 0;
var next = (current+1)%3;
// animateId是Util.animate()创建的定时器的返回值，即setInterval的返回值。
// Util.animate()是一个动画函数，此处用于改变图片的透明度。
var animateId;
// 设置另一个定时器，用于在图片切换之间等待一段时间。
// timeoutId是此定时器的返回值。
var timeoutId;
// isTimerCompleted是Util.animate()创建的timer的状态，即透明度是否正在变化。注意，要给初始值true。否则的话，如果在第一次运行step()前点击pointer会，会造成逻辑错误，使得有一小段时间内三张banner的opacity同时为0。
var isTimerCompleted = true;
// 图片透明度动画结束后，是否继续运行动画。值为true时，暂停动画。	
var doesStop = false; 

/**
 * [执行改变图片透明度动画。
 * 当doesStop==false时，动画结束后会等待一定时间，然后开始新一轮的动画。
 * 当doesStop==true时，若step()未开始执行，则直接返回。如果step()正在执行，则此轮动画结束后停止。
 * 如果带参数doesChange=true，则可以在doesStop==true的情况下，切换到选中的图片。]
 * @param  {[type]} doesChange [description]
 * @return {[type]}            [无]
 */
var step = function(doesChange){
	if(doesStop && doesChange!==true) return;
	for(var i=0; i<3; i++){
		aPointer[i].className = '';
	}
	aPointer[next].className = 'crt';
	aLi[current].style.zIndex = 0;
	aLi[next].style.zIndex = 1;
	isTimerCompleted = false;
	animateId = Util.animate(aLi[next], 'opacity', 0, 1, DURATION ,taskAfterAnimation);
}
/**
 * [一张图片透明度变化结束后进行的收尾工作。
 * 当doesStop==false, 会接着播放动画。
 * 当doesStop==true,则不会开始新一轮的动画。]
 */
function taskAfterAnimation(){
	// 把current图设为全透明，next图的zIndex设为0。指针current指向next;指针next指向next的下一幅图。设置定时器状态isTimerCompleted。
	aLi[current].style.opacity = 0;
	aLi[current].style.filter = 'alpha(opacity=0)';
	current = next;
	next = (next+1)%3;
	isTimerCompleted = true;
	if(!doesStop){
		timeoutId = setTimeout(step, WAITING);
	}
}
timeoutId = setTimeout(step, WAITING);

Util.addEventListener(banner, 'mouseenter', function(){
	doesStop = true;
	clearTimeout(timeoutId);
}, false);
Util.addEventListener(banner,'mouseleave', function(){
	// 只有当animate动画处于结束状态，才需要开启新定时器。否则的话，doesStop设为false后，动画就会自动持续下去。
	doesStop = false;
	if(isTimerCompleted){
		clearTimeout(timeoutId);
		timeoutId = setTimeout(step, WAITING);
	}
}, false);

for(var i=0, len = aLi.length; i<len; i++){
	aPointer[i].index = i;
}
Util.addEventListener(pointer,'click', function(event){
	var target = event.target || event.srcElement
	if(target.className==='crt') return;
	if(target.tagName==='SPAN'){
		// animateId对应的timer可能结束或者没有。如果未结束，而是被clarInterval中中止的话，isTimerCompleted的值为false.此时，需要做一些处理。
		clearInterval(animateId);
		doesStop = true;
		if(!isTimerCompleted){
			// 完成中途中止的动画，即直接把opacity变为1.
			aLi[next].style.opacity = 1;
			aLi[next].style.filter = 'alpha(opacity=100)';
			// 动画结束后要运行的收尾工作。
			taskAfterAnimation();
		}
		// 指针next修改为被点击的pointer对应的图片。
		next = target.index;
		step(true);
	}
}, false);
})();

// slider动画
(function(){
var slider = $('.g-bd_1 .m-slider');
var width = slider.clientWidth;
slider.style.width = 2*width + 'px';
slider.innerHTML += slider.innerHTML;
var to = -width;
var intervalId;
var step = function(from){
	var duration = 30000/(to-0)*(to-from)
	intervalId = Util.animate(slider, 'left', from, to, duration, function(){
		step(0);
	});
};
step(0);
var from = 0; 
Util.addEventListener(slider, 'mouseenter', function(){
	clearInterval(intervalId);
	from = parseFloat(slider.style.left);
}, false);
Util.addEventListener(slider, 'mouseleave', function(){
	step(from);
}, false);
})();

// 渲染课程列表和分页器
(function(){
var totalPage;
var crtPage = 1;
var pageSize = 20;
var type = 10;

// 根据课程列表的父容器的宽度更新pageSize. 父容器的宽度会随浏览器窗口的宽度变化而变化。
var updatePageSize = function(){
	var containerWidth = $('.g-bd_2 .left').clientWidth;
	pageSize = parseInt(containerWidth)>713? 20:15;
}
updatePageSize();
Util.addEventListener(window, 'resize', updatePageSize, false);

// 利用JSON数据渲染课程列表。课程渲染完后，再渲染分页器。renderPagination()的定义放在后面。
var renderCourseWithData = function(data){
	courses = JSON.parse(data);
	totalPage = courses.totalPage;
	var courseTemplate = $('#course_template');
	var html = Util.getHTML(courseTemplate.innerHTML, {courses: courses.list}, {formatCurrency: function(data){
		return data?'￥'+data.toFixed(2):'免费';
	}});
	var category = $('.category');
	var courses = $('#courses');
	if(!courses){
		category.insertAdjacentHTML('afterEnd', html);
	}else{
		courses.outerHTML = html;
	}
	// 渲染分页器
	renderPagination();
};
// 根据页码pageNO, 每页课程数量psize,和课程类型，获得相应的JSON数据，再使用获得的数据渲染课程列表。
var renderCourse = function(pageNo, psize, type){
	Util.get('http://study.163.com/webDev/couresByCategory.htm', {pageNo: pageNo, psize: psize, type: type}, renderCourseWithData);
};
// 渲染课程列表
renderCourse(1, pageSize, type);

// 根据当前页码crtPage, 总页数totalPage来渲染分页器。
var page = $('.m-page');
function renderPagination(){
	if(crtPage>totalPage){
		crtPage = totalPage;
	}
	var first = 1;
	if(crtPage<5){
		first = 1;
	}else if(crtPage>=5 && (crtPage<=totalPage-3)){
		first = crtPage-4;
	}else{
		first = totalPage-7;
	}

	var template = $('#page_template');
	var html = template.innerHTML.replace(/\${([^}]+)}/g, function(m0, m1){
		return first++;
	});
	page.innerHTML = html;
	var aLi = page.getElementsByTagName('li');
	for(var i=0, len=aLi.length;i<len;i++){
		if(aLi[i].innerHTML==crtPage){
			aLi[i].className += ' crt';
			break;
		}
	}
	if(crtPage==1){
		var prev = $('.m-page .prev');
		prev.className += ' disabled';
	}
	else if(crtPage==totalPage){
		var next = $('.m-page .next');
		next.className += ' disabled';
	}
}

// 点击分页器按钮时，更新课程列表和分页器。
Util.addEventListener(page, 'click', function(event){
	var target = event.target || event.srcElement;
	var className = ' ' + target.className + ' ';
	if(className.indexOf(' prev ')!==-1){
		if(crtPage>1){
			crtPage--;
		}else if(crtPage==1){
			return;
		}
	}else if(className.indexOf(' next ')!==-1){
		if(crtPage<totalPage){
			crtPage++;
		}else if(crtPage==totalPage){
			return;
		}
	}else if(target.tagName==="LI"){
		if(crtPage != parseInt(target.innerHTML)){
			crtPage = parseInt(target.innerHTML);
		}else{
			return;
		}
	}
	renderCourse(crtPage, pageSize, type);
}, false);

// 点击分类课程按钮时，也会更新课程列表和分页器。
var category = $('.category');
var product = $('.category .product');
var language = $('.category .language');
Util.addEventListener(category,'click', function(event){
	var target = event.target || event.srcElement;
	var className = ' ' + target.className + ' ';
	if(className.indexOf(' crt ')!==-1) return;
	if(target===product){
		type = 10;
		language.className = 'language';
	}else if(target===language){
		type = 20;
		product.className = 'product';
	}
	target.className += ' crt';
	crtPage = 1;
	renderCourse(crtPage, pageSize, type);
}, false);	
})();

// hover延迟效果
// CSS hover没有延迟效果，浮窗直接弹出。 这会造成干扰，使分布在中间的课程很难被选中。
// CSS hover代码仍保留在index.css的注释里。
(function(){
// 悬停时间
var HOVER_DURATION = 200;
var container = $('.g-bd_2 .left');
Util.addEventListener(container, 'mouseover', function(event){
	var target = event.target || event.srcElement;
	// 延迟200毫秒弹出浮窗
	if(target.tagName==='IMG' && target.parentNode.tagName==='LI'){
		target.doesHover = true;
		setTimeout(function(){
			if(target.doesHover){
				Util.addClass(target.parentNode.querySelector('.details'), 'hover');
			}
		}, HOVER_DURATION);
	}
}, false);
Util.addEventListener(container, 'mouseout', function(event){
	var target = event.target || event.srcElement;
	if(target.tagName==='IMG' && target.parentNode.tagName==='LI'){
		target.doesHover = false;
		Util.removeClass(target.parentNode.querySelector('.details'), 'hover');
	}
}, false);
})();

// 视频
(function(){
var mask = $('#mask'),
	videoContainer = $('#video'),
	video = $('#video video'),
	// videoPlay是视屏图片上的开始按钮
	videoPlay = $('.pause');
Util.addEventListener($('#video .close'), 'click', function(){
	// IE8不支持video标签，此处的变量video=null.
	if(video) video.pause();

	Util.removeClass(mask, 'show');
	// 在播放窗口videoContainer和播放按钮去除类名playing,用于隐藏播放窗口和现实播放图标
	Util.removeClass(videoContainer, videoPlay, 'playing');
}, false);
Util.addEventListener($('.video_poster'), 'click', function(){
	Util.addClass(mask, 'show');
	// 在播放窗口videoContainer和播放按钮添加类名playing,用于显示播放窗口和隐藏播放图标
	Util.addClass(videoContainer, videoPlay, 'playing');
}, false);
})();

// 最热排行
(function(){
var hotList = null;
// 使用JSON获得的数据渲染排行榜。
var renderHotWithData = function(data){
	var courses = JSON.parse(data);
	var courseList = $('#hot_template');
	var html = Util.getHTML(courseList.innerHTML, {courses: courses});
	var hotContainer = $('.hot .container');
	hotList = $('hot');
	if(!hotList){
		hotContainer.innerHTML = html;
	}else{
		hotList.outerHTML = html;
	}
	hotAnimation();	
};
var renderCourse = function(){
	Util.get('http://study.163.com/webDev/hotcouresByCategory.htm', null, renderHotWithData);
};
renderCourse();

var timeoutId;
// 运行一段动画后，是否停止动画。
var doesStop;
// 排行榜是否正在运动
var isChanging; 	
function helper(){
	clearTimeout(timeoutId);	
	timeoutId = setTimeout(function(){
		var from = parseFloat(hotList.style.top) || 0;
		if(from>=0){
			from = -70*20;
		}
		var to = from + 70;
		isChanging = true;
		Util.animate(hotList, 'top', from, to, 500, function(){
			isChanging = false;
			if(!doesStop){
				helper();
			}
		})
	}, 4500);
}

function hotAnimation(){
	hotList = $('#hot');
	hotList.innerHTML += hotList.innerHTML;
	helper();
}

var container = $('.hot .container');
Util.addEventListener(container, 'mouseenter', function(){
	clearTimeout(timeoutId);
	doesStop = true;
}, false);
Util.addEventListener(container, 'mouseleave', function(){
	doesStop = false;
	if(!isChanging){
		helper();
	}
}, false);
})();


