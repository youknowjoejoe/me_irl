var joedude878me_irl = {
	canvas: null,
	ctx: null,
	
	level: {
		image1: null,
		ctx: null,
		ctxUtils: null,
		angle: 0.01,
		init: function(){
			this.image1 = joedude878me_irl.loader.map.get("dat_boi");
			this.ctx = joedude878me_irl.ctx;
			this.ctxUtils = joedude878me_irl.ctxUtils;
		},
		update: function(){
			this.angle+=0.01;
			this.ctxUtils.drawImageR(this.image1,0,0,200,200,Math.cos(this.angle),Math.sin(this.angle));
		}
	},
	
	loader: {
		map: new Map(),
		images: new Array(0),
		loaded: 0,
		loadImage: function(src1,name1){
			var image1 = new Image();
			image1.src = src1;
			image1.addEventListener(
					"load",
					function(e){
						joedude878me_irl.loader.imageLoaded();
					},
					false);
			this.images.push(image1);
			if(name1 != null){
				this.map.set(name1,image1);
			}
		},
		imageLoaded: function(){
			this.loaded++;
			if(this.loaded===this.images.length) this.callback();
		},
		callback: null
	},

	ctxUtils: {
		ctx: null,
		init: function(){
			this.ctx = joedude878me_irl.ctx;
		},
		drawImageT: function(img1,x1,y1){
			this.ctx.drawImage(img1,x1,y1);
		},
		drawImageR: function(img1,x1,y1,x2,y2,cos1,sin1){
			this.ctx.save();
			this.ctx.translate(x2,y2);
			this.ctx.transform(cos1,-sin1,sin1,cos1,-x1,-y1);
			this.ctx.translate(-x2,-y2);
			this.ctx.drawImage(img1,0,0);
			this.ctx.restore();
		},
	},
	
	initResources: function(){	
		this.canvas = document.getElementById("canvas");
		this.ctx = canvas.getContext("2d");
		this.ctxUtils.init();
		this.loader.callback = function(){joedude878me_irl.init()};
		this.loader.loadImage("dat_boi.png","dat_boi");
	},
	
	init: function(){
		this.level.init();
		this.loop();
	},
	
	loop: function(){
		joedude878me_irl.level.update();
		window.requestAnimationFrame(joedude878me_irl.loop);
	}
}

window.addEventListener(
		"load",
		function(e) {
			joedude878me_irl.initResources();
		},
		false);
