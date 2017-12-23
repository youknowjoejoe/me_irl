var joedude878me_irl = {
	canvas: null,
	ctx: null,
	
	level: {
		image1: null,
		ctx: null,
		ctxUtils: null,
		tileData: {
			type: 0,
			tileSize: 64,
			tiles: [[0,0,0,0,1],[0,0,0,0,1],[0,0,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
			update: function(){
				
			},
			draw: function(ctx){
				ctx.fillStyle = "rgb(0,0,0)";
				for(var i = 0; i < this.tiles.length; i++){
					for(var j = 0; j < this.tiles[0].length; j++){
						if(this.tiles[i][j]){
							ctx.fillRect(this.tileSize*j,this.tileSize*i,this.tileSize,this.tileSize);
						}
					}
				}
			}
		},
		
		entities: null,
		c_entities: null,
		d_entities: null,
		
		c_jmptbl: null,
		
		angle: 0.01,
		init: function(){
			this.image1 = joedude878me_irl.loader.map.get("dat_boi");
			this.ctx = joedude878me_irl.ctx;
			this.ctxUtils = joedude878me_irl.ctxUtils;
			/*this.tileData = new Array(32);
			for(var i = 0; i < 32; i++){
				this.tileData[i] = new Array(32);
				for(var j = 0; j < 32; j++){
					this.tileData[i][j] = false;
				}
			}*/
			
			this.entities = new Array(0);
			this.c_entities = new Array(0);
			this.d_entities = new Array(0);
			this.addEntityDCf(this.tileData);
			
			var tilesVaabb = function(a,b){
				return false;
			}
			var aabbVtiles = function(a,b){
				tilesVaabb(b,a);
				return false;
			}
			var aabbVaabb = function(a,b){
				return false;
			}
			this.c_jmptbl = [[null,tilesVaabb],[aabbVtiles,aabbVaabb]];
		},
		addEntity: function(e1){
			this.entities.push(e1);
		},
		addEntityC: function(e1){
			this.c_entities.push(e1);
		},
		addEntityCf: function(e1){
			this.entities.push(e1);
			this.c_entities.push(e1);
		},
		addEntityD: function(e1){
			this.d_entities.push(e1);
		},
		addEntityDf: function(e1){
			this.entities.push(e1);
			this.d_entities.push(e1);
		},
		addEntityDCf: function(e1){
			this.entities.push(e1);
			this.d_entities.push(e1);
			this.c_entities.push(e1);
		},
		step: function(){
			this.update();
			this.draw();
		},
		update: function(){
			this.collisionDetect();
			this.angle+=0.01;
		},
		collisionDetect: function(){
			for(var i = 0; i < this.c_entities.length; i++){
				for(var j = 0; j < i; j++){
					this.c_jmptbl[this.c_entities[j].type][this.c_entities[i].type](this.c_entities[j],this.c_entities[i]);
				}
			}
		},
		draw: function(){
			this.ctx.fillStyle = "rgb(255,255,255)";
			this.ctx.fillRect(0,0,canvas.width,canvas.height);
			this.ctxUtils.drawImageR(this.image1,0,0,200,200,Math.cos(this.angle),Math.sin(this.angle));
			for(var i = 0; i < this.d_entities.length; i++){
				this.d_entities[i].draw(this.ctx);
			}
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
		joedude878me_irl.level.step();
		window.requestAnimationFrame(joedude878me_irl.loop);
	}
}

window.addEventListener(
		"load",
		function(e) {
			joedude878me_irl.initResources();
		},
		false);
