$(function(){
	var model = {
		cats: [],
		curCat: null,
		addCat: function(name, imgUrl, clickCount){
			this.cats.push({
				name: name,
				imgUrl: imgUrl,
				clickCount: clickCount | 0,
			});
		},
		selectCat: function(cat){
			this.curCat = cat;
		},
		click: function(){
			this.curCat.clickCount++;
		},
		getAllCats: function(){
			return model.cats;
		}
	};

	var viewList = {
		init: function(){
			this.render();
		},
		render: function(){
			$('.cat_list').html('');
			var cats = octopus.getAllCats();
			cats.forEach(function(cat){
				var str = '';
				if(cat===octopus.getCurrentCat()){
					str = '<li class="selected">';
				}else{
					str = '<li>';
				}
				$(str+cat.name+'</li>').appendTo('.cat_list')
					.click((function(copyCat){
						return function(){
						octopus.selectCat(copyCat);
					}
				})(cat));
			});
		}
	};

	var viewDetail = {
		init: function(){
			this.render();
			$('.cat img').click(function(){
				octopus.click();
			});
		},
		render: function(){
			var cat = model.curCat;
			var title = '';
    		var clicks = cat.clickCount;
    		if(clicks<5){
    			title = 'Newborn';
    		}else if(clicks<10){
    			title = 'Infant';
    		}else if(clicks<15){
    			title = 'Child';
    		}else if(clicks<20){
    			title = 'Adult';
    		}else{
    			title = 'Ninja';
    		}

			$('.cat h2').text(cat.name); 
			$('.cat h3').text(title); 
			$('.cat img').attr('src', cat.imgUrl);
			$('.cat .click_count').text('Cat\'s Click:\t'+cat.clickCount);
		}
	};
	var viewAdmin = {
		init: function(){
			$('.admin').click(function(){
				viewAdmin.render();
			});
			$('.save').click(function(event){
				octopus.updateCat($('#name').val(), $('#imgUrl').val(), $('#click').val());
				viewDetail.render();
				viewList.render();
				$('form').hide();
				event.preventDefault();
			});
			$('.cancel').click(function(event){
				$('form').hide();
				event.preventDefault();
			});
		},
		render: function(){
			var cat = octopus.getCurrentCat();
			$('#name').val(cat.name);
			$('#imgUrl').val(cat.imgUrl);
			$('#click').val(cat.clickCount);
			$('form').show();
		}
	};

	var octopus = {
		init: function(){
			model.addCat('Curie', './img/cat1.jpg');
			model.addCat('Mario', './img/cat2.jpg');
			model.addCat('Peter', './img/cat3.jpg');
			model.addCat('Jim', './img/cat4.jpg');
			model.addCat('John', './img/cat2.jpg');
			model.curCat = model.cats[0];
			viewList.init();
			viewDetail.init();
			viewAdmin.init();
		},
		selectCat: function(cat){
			model.curCat = cat;
			viewDetail.render();
			viewList.render();
		},
		click: function(){
			model.click();
			viewDetail.render();
		},
		getCurrentCat: function(){
			return model.curCat;
		},
		getAllCats: function(){
			return model.getAllCats();
		},
		updateCat: function(name, imgUrl, clickCount){
			var cat = this.getCurrentCat();
			cat.name = name;
			cat.imgUrl = imgUrl;
			cat.clickCount = clickCount;
		}
	};

	octopus.init();

});