var joedude878me_irl = {
	canvas: null,
	ctx: null,
	
	input: {
		init: function(){
			document.addEventListener(
				"keydown",
				function(e){
					if(e.keyCode == 37){
						joedude878me_irl.input.left = true;
					}
					if(e.keyCode == 39){
						joedude878me_irl.input.right = true;
					}
					if(e.keyCode == 38){
						joedude878me_irl.input.up = true;
					}
					if(e.keyCode == 40){
						joedude878me_irl.input.down = true;
					}
				},
				false);
			document.addEventListener(
				"keyup",
				function(e){
					if(e.keyCode == 37){
						joedude878me_irl.input.left = false;
					}
					if(e.keyCode == 39){
						joedude878me_irl.input.right = false;
					}
					if(e.keyCode == 38){
						joedude878me_irl.input.up = false;
					}
					if(e.keyCode == 40){
						joedude878me_irl.input.down = false;
					}
				},
				false);
		},
		up: false,
		left: false,
		right: false,
		down: false,
		
	},
	
	math: {
		Vec2: function(x1,y1){
			this.x = x1;
			this.y = y1;
			
			this.plus = function(v1){
				return new joedude878me_irl.math.Vec2(this.x+v1.x,this.y+v1.y);
			}
			this.minus = function(v1){
				return new joedude878me_irl.math.Vec2(this.x-v1.x,this.y-v1.y);
			}
			this.scaledBy = function(s1){
				return new joedude878me_irl.math.Vec2(s1*this.x,s1*this.y);
			}
			this.dot = function(v1){
				return v1.x*this.x+v1.y*this.y;
			}
			this.cross = function(v1){
				return this.x*v1.y-v1.x*this.y;
			}
			this.abs = function(){
				return new joedude878me_irl.math.Vec2(Math.abs(this.x),Math.abs(this.y));
			}
			this.magSquared = function(){
				return this.dot(this);
			}
			this.mag = function(){
				return Math.sqrt(this.magSquared());
			}
			this.perp1 = function(){
				return new joedude878me_irl.math.Vec2(-this.y,this.x);
			}
			this.perp2 = function(){
				return new joedude878me_irl.math.Vec2(this.y,-this.x);
			}
		},
		CollisionInfo: function(collided1,normal1,penetration1){
			this.collided = collided1;
			this.normal = normal1;
			this.penetration = penetration1;
		},
		AABB: function(pos1,dim1){
			this.pos = pos1;
			this.dim = dim1;
			
			this.collideWith = function(aabb1){
				var collided = false;
				var normal = new joedude878me_irl.math.Vec2(0,0);
				var penetration = 0.0;
				
				var hd1 = this.dim.scaledBy(0.5); //half dimensions
				var hd2 = aabb1.dim.scaledBy(0.5);
				
				var c1 = this.pos.plus(hd1); //center
				var c2 = aabb1.pos.plus(hd2);
				
				var o = hd1.plus(hd2).minus(c2.minus(c1).abs()); //overlap = half dim1 + half dim2 - (c2 - c1)

				//ox > 0 && oy > 0 => shapes are overlapping
				//min(ox,oy) => penetration distance
				
				if(o.x > 0 && o.y > 0) {
					collided = true;
					if(o.x < o.y){
						penetration = o.x;
						if(c2.x < c1.x) {
							normal.x = 1;
						} else {
							normal.x = -1;
						}
					} else {
						penetration = o.y;
						if(c2.y < c1.y) {
							normal.y = 1;
						} else {
							normal.y = -1;
						}
					}
				}
				return new joedude878me_irl.math.CollisionInfo(collided,normal,penetration);
			}
			
			this.getAABB = function() {
				return this;
			}
		}
	},
	
	Level: function() {
		this.entities = null;
		this.c_entities = null;
		this.d_entities = null;
		
		this.c_jmptbl = null;
		
		this.init = function(){
			this.entities = new Array(0);
			this.c_entities = new Array(0);
			this.d_entities = new Array(0);
			
			var aabbVaabb = function(a,b){
				var ci = a.getAABB().collide(b.getAABB());
				if(ci.collided){
					ci.penetration*=0.4;
					a.translate(ci.normal.scaledBy(ci.penetration/2.0));
					b.translate(ci.normal.scaledBy(-ci.penetration/2.0));
					a.zeroVel(ci.normal);
					b.zeroVel(ci.normal);
				}
			}
			var tilesVaabb = function(a,b){
				var tlx = Math.floor(b.getAABB().pos.x/a.tileSize);
				var tly = Math.floor(b.getAABB().pos.y/a.tileSize);
				var br = b.getAABB().pos.plus(b.getAABB().dim);
				var brx = Math.floor(br.x);
				var bry = Math.floor(br.y);
				
				var ci = new joedude878me_irl.math.CollisionInfo(false,new joedude878me_irl.math.Vec2(0,0),0);
				
				for(var x = tlx; x <= brx; x++){
					for(var y = tly; y <= bry; y++){
						if(x >= 0 && y >= 0 && x < a.tiles[0].length && y < a.tiles.length){
							if(a.tiles[y][x]){
								var tileCorner = new joedude878me_irl.math.Vec2(x*a.tileSize,y*a.tileSize);
								var aabb = new joedude878me_irl.math.AABB(tileCorner,new joedude878me_irl.math.Vec2(a.tileSize,a.tileSize));
								var temp = b.getAABB().collideWith(aabb);
								if(temp.collided && temp.penetration>ci.penetration){
									ci = temp;
								}
							}
						}
					}
				}
				
				if(ci.collided){
					ci.penetration*=0.4;
					b.translate(ci.normal.scaledBy(ci.penetration));
					b.zeroVel(ci.normal);
				}
			}
			var aabbVtiles = function(a,b){
				tilesVaabb(b,a);
			}
			
			var tilesVtiles = function(a,b){
				
			}
			
			this.c_jmptbl = [[tilesVtiles,tilesVaabb],[aabbVtiles,aabbVaabb]];
		}
		this.addEntity = function(e1){
			this.entities.push(e1);
		}
		this.addEntityC = function(e1){
			this.c_entities.push(e1);
		}
		this.addEntityCf = function(e1){
			this.entities.push(e1);
			this.c_entities.push(e1);
		}
		this.addEntityD = function(e1){
			this.d_entities.push(e1);
		}
		this.addEntityDf = function(e1){
			this.entities.push(e1);
			this.d_entities.push(e1);
		}
		this.addEntityDCf = function(e1){
			this.entities.push(e1);
			this.d_entities.push(e1);
			this.c_entities.push(e1);
		}
		this.step = function(ctx,ctxUtils){
			this.update();
			this.draw(ctx,ctxUtils);
		}
		this.update = function(){
			for(var i = 0; i < this.entities.length; i++){
				this.entities[i].update();
			}
			this.collisionDetect();
		}
		this.collisionDetect = function(){
			for(var i = 0; i < this.c_entities.length; i++){
				for(var j = 0; j < i; j++){
					this.c_jmptbl[this.c_entities[j].type][this.c_entities[i].type](this.c_entities[j],this.c_entities[i]);
				}
			}
		}
		this.draw = function(ctx,ctxUtils){
			ctx.fillStyle = "rgb(255,255,255)";
			ctx.fillRect(0,0,canvas.width,canvas.height);
			for(var i = 0; i < this.d_entities.length; i++){
				this.d_entities[i].draw(ctx,ctxUtils);
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
			this.ctx.transform(cos1,-sin1,sin1,cos1,x1,y1);
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
	
	currentLevel: null,
	
	init: function(){
		this.input.init();
		this.currentLevel = new this.Level();
		this.currentLevel.init();
		var tileData1 = {
			type: 0,
			tileSize: 64,
			tiles:
				[
				[0,0,0,0,0,1,0,0],
				[0,0,0,0,0,0,0,1],
				[0,0,1,1,0,0,0,1],
				[1,1,1,1,1,1,1,1],
				[1,1,1,1,1,1,1,1]
				],
			update: function(){
				
			},
			draw: function(ctx,ctxUtils){
				ctx.fillStyle = "rgb(0,0,0)";
				for(var i = 0; i < this.tiles.length; i++){
					for(var j = 0; j < this.tiles[0].length; j++){
						if(this.tiles[i][j]){
							ctx.fillRect(this.tileSize*j,this.tileSize*i,this.tileSize,this.tileSize);
						}
					}
				}
			}
		}
		var dat_boi = {
			type: 1,
			u: 0.0,
			onGround: false,
			vel: null,
			aabb: null,
			image: null,
			init: function(){
				this.vel = new joedude878me_irl.math.Vec2(0,0);
				this.aabb = new joedude878me_irl.math.AABB(new joedude878me_irl.math.Vec2(0,0),new joedude878me_irl.math.Vec2(48,64));
				this.image = joedude878me_irl.loader.map.get("dat_boi");
				
			},
			update: function(){
				this.vel.y+=0.3;
				this.vel.x*=0.9;
				this.u *=0.9;
				if(joedude878me_irl.input.right){
					this.vel.x+=1;
					this.u+=1
				}
				if(joedude878me_irl.input.left){
					this.vel.x-=1;
					this.u-=1;
				}
				if(this.onGround && joedude878me_irl.input.up) this.vel.y-=8;
				this.aabb.pos=this.aabb.pos.plus(this.vel);
				this.onGround = false;
			},
			draw: function(ctx,ctxUtils){
				var angle = Math.sin(this.u)/2.0;
				ctxUtils.drawImageR(this.image,this.aabb.pos.x,this.aabb.pos.y,24,64,Math.cos(-this.u/20),Math.sin(-this.u/20));
			},
			getAABB: function(){
				return this.aabb;
			},
			translate: function(v1){
				this.aabb.pos = this.aabb.pos.plus(v1);
				if(v1.y<0) this.onGround = true;
			},
			zeroVel: function(norm){
				var tan = norm.perp1();
				this.vel = tan.scaledBy(this.vel.dot(tan));
			}
		}
		dat_boi.init();
		this.currentLevel.addEntityDCf(tileData1);
		this.currentLevel.addEntityDCf(dat_boi);
		this.loop();
	},
	
	loop: function(){
		joedude878me_irl.currentLevel.step(joedude878me_irl.ctx,joedude878me_irl.ctxUtils);
		window.requestAnimationFrame(joedude878me_irl.loop);
	}
}

window.addEventListener(
	"load",
	function(e) {
		joedude878me_irl.initResources();
	},
	false
);
