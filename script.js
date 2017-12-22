var joedude878me_irl = {
	canvas: null,
	ctx: null,
	
	loader: {
		map: new Map(),
		images: new Array(0),
		loaded: 0,
		loadImage: function(src1,name1){
			if(name!=null){
				this.map.set(name,this.images.length);
			}
			var image1 = new Image();
			image1.src = src1;
			image1.addEventListener(
					"load",
					function(e){
						joedude878me_irl.loader.imageLoaded();
					},
					false);
			this.images.push(image1);
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
		this.ctxUtils.drawImageT(this.loader.images[0],0,0);
		this.ctxUtils.drawImageR(this.loader.images[0],0,0,100,100,Math.cos(0.5),Math.sin(0.5));
		//this.ctx.drawImage(this.loader.images[this.loader.map.get("dat_boi")],0,0);
	}
}

window.addEventListener(
		"load",
		function(e) {
			joedude878me_irl.initResources();
		},
		false);
