var allImg = ['static/img/bg.jpg','static/img/car.png',
'static/img/f_oil.png','static/img/f_kill.png',
'static/img/f_g1.png','static/img/f_g2.png','static/img/f_g3.png','static/img/score.png'];

var loadOver = [];
loadOver = loadImg(allImg,function(){
	$("#loading").hide();
	homeAnimate();
})

var frameNum = 0;//帧数
//怪兽的数组,创建速度
var monsters = [];
var createMonsterSpeed = 20;
var monsterMoveSpeed = 4;
var removeBol = false;



function homeAnimate(){
	$(".home-wrap").show();

	main();
}
function main(){
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var body = document.getElementsByTagName("body")[0];

    canvas.width = body.offsetWidth;
    canvas.height = body.offsetHeight;


    //对象的定义-----------------------------------------------------------------

    //背景图定义
    var bgH = canvas.height/canvas.width*640;
	var bgImg = {
        w: canvas.width,
        h: canvas.height,
        x: 0,
        y: 0,
		draw:function (){
			context.drawImage(loadOver[0],this.x,this.y,this.w,this.h);
			context.drawImage(loadOver[0],this.x,this.y-this.h,this.w,this.h);
		},
		move:function (){
			this.y++;
			if (this.y>=this.h){
				this.y = 0;
			}
		}
	}
    //英雄对象------------------------------------
	var heroW = 0.246*canvas.width;
	var heroH = 0.148*canvas.height;

	var hero = {
		w:heroW,
		h:heroH,
		drawX:canvas.width/2-heroW/2,
		drawY:canvas.height-heroH-10,
		ps: 2,
		draw:function(){
			context.drawImage(loadOver[1],this.drawX,this.drawY,this.w,this.h);
		}
	}
    //英雄移动限制---------------------------------
	var limitX = 0.148*canvas.width;
	function heroMoveLimit(){
		if(hero.drawX<=limitX){
			hero.drawX = limitX;
		}else if(hero.drawX>=canvas.width-hero.w-limitX){
			hero.drawX = canvas.width-hero.w-limitX;
		}else if(hero.drawY>=canvas.height-hero.h){
			hero.drawY = canvas.height-hero.h;
		}else if(hero.drawY<=0){
			hero.drawY = 0;
		}
	}

	//怪兽对象--------------------------------------------
	function Monster(monster){
		this.w = monster.w;
		this.h = monster.h;
		var monsterdrawxR = randFn(0,2);
		var monsterdrawxArr = [0.218,0.46,0.695];
		this.drawX = monsterdrawxArr[monsterdrawxR]*canvas.width;
		this.drawY = -monster.h;
		this.hit = 0;
		this.hp = monster.hp;
		this.score = monster.score;
		this.speed = monsterMoveSpeed+0.1*randFn(0,4);
		this.holdspeed = this.speed;
		this.survival = true;
		this.img = monster.img;
		this.length = 0;
	}
	Monster.prototype.draw = function(){
		context.drawImage(this.img,this.drawX,this.drawY,this.w,this.h);
	}
	Monster.prototype.move = function(){
		this.drawY+=this.speed;
	}
	Monster.prototype.clear = function(){
		if (this.drawY>=canvas.height){
			for (var i=0; i<monsters.length; i++){
				if (this == monsters[i]){
					monsters.splice(i,1);
					return true;
				}
			}
		}
	}
	Monster.prototype.die = function(){
		if(!this.survival){
			var boom = new Boom();
			boom.drawX = this.drawX+this.w/2-boom.w/2;
			boom.drawY = this.drawY+this.h/2-boom.h/2;
			boom.score = this.score;
			boom.draw();
			this.length++;
			if(this.length>=30){
				delete boom;
				for (var i=0; i<monsters.length; i++){
					if (this == monsters[i]){
						monsters.splice(i,1);
						return true;
					}
				}
			}
		}
	}
	function createMonster(){
		//创建怪兽
		if(frameNum%createMonsterSpeed == 0){
			var monsterR = randFn(1,100);
			if (monsterR>=0&&monsterR<=70){//油滴
				var monster = {}; //存放没一个monster的信息
				monster.w = 0.07*canvas.width;
				monster.h = 0.07*canvas.height;
				monster.img = loadOver[2];
				monster.score = 10;  //打了它之后的得分
				monster.hp = 1;
			}else{
				var monster = {};
				monster.w = 0.106*canvas.width;
				monster.h = 0.090*canvas.height;
				var giftR = randFn(0,2);
				var giftArr = [loadOver[4],loadOver[5],loadOver[6]];
				monster.img = giftArr[giftR];
				monster.score = 20;
				monster.hp = 3;
			}
			var monsterObj = new Monster(monster);
			monsters.push(monsterObj);
		}

	}
	function drawMonster(){
		//绘制怪兽
		for(var i=0; i<monsters.length;i++){
			monsters[i].move();
			monsters[i].draw();
			var bol = monsters[i].clear();
			if(!bol){
				// var killBol = collide(kills[i],hero);
				// if(killBol){
				// 	console.log('game over');
				// 	kills.splice(i,1);
				// 	i--;
				// }
			}
			if(bol||removeBol){
				i--;
				removeBol = false;
			}
		}
	}


	//kill对象--------------------------------------
	var kills = [];
	var createKillSpeed = 100;
	function Kill(){
		this.w = 0.1375*canvas.width;
		this.h = 0.0633*canvas.height;
		var killdrawxR = randFn(0,2);
		var killdrawxArr = [0.218,0.46,0.695];
		this.drawX = killdrawxArr[killdrawxR]*canvas.width;
		this.drawY = -this.h;
		this.speedY = monsterMoveSpeed+0.1*randFn(0,4);
		this.img = loadOver[3];
	}
	Kill.prototype.move = function(){
		this.drawY += this.speedY;
	}
	Kill.prototype.draw = function(){
		context.drawImage(this.img,this.drawX,this.drawY,this.w,this.h);
	}
	Kill.prototype.clear = function(){
		if(this.drawY>=canvas.height){
			for (var i=0; i<kills.length; i++){
				if (this == kills[i]){
					kills.splice(i,1);
					return true;
					break;
				}
			}
		}
	}
	function createKill(){
		//创建道具
		if(frameNum%createKillSpeed == 0){
			var killObj = new Kill();
			kills.push(killObj);
		}
	}
	function drawKill(){
		//绘制道具
		for(var i=0; i<kills.length;i++){
			kills[i].move();
			kills[i].draw();
			var bol = kills[i].clear();
			if(!bol){
				var killBol = collide(kills[i],hero);
				if(killBol){
					console.log('game over');
					kills.splice(i,1);
					i--;
				}
			}else{
				i--;
			}
		}
	}


	//碰撞检测---------------------------------------
	function collide(obj1,obj2){
		var l1 = obj1.drawX;
		var r1 = l1+obj1.w;
		var t1 = obj1.drawY;
		var b1 = t1+obj1.h;

		var l2 = obj2.drawX;
		var r2 = l2+obj2.w;
		var t2 = obj2.drawY;
		var b2 = t2+obj2.h;

		if (r1>l2&&l1<r2&&b1>t2&&t1<b2){
			return true;
		}else{
			return false;
		}
	}
	//eat检测
	function heroEat(){
		for(var i=0; i<monsters.length; i++){
            if(monsters[i].survival){
            	var heroBol = collide(monsters[i],hero);
                if(heroBol){  //撞到，清除，死亡
					scoreNum += monsters[i].score;
					console.log(scoreNum);
					removeBol = true;
					monsters[i].survival = false;
					var dieBol = monsters[i].die();
					if(dieBol){
						i--;
					}
					monsters.splice(i,1);
                }
            }

		}
	}
	//爆炸对象,显示吃到的分数---------------------------------
	var boomW = 0.043*canvas.width;
	var boomH = 0.029*canvas.height;
	function Boom(){
		this.w = boomW;
		this.h = boomH;
		this.drawX = 0;
		this.drawY = 0;
	}
	Boom.prototype.draw = function(){
		context.beginPath();
		context.fillStyle = "white";
		context.font = "22px";
		var shift = 10;
		context.fillText("+"+this.score,this.drawX+this.w/2-shift,this.drawY+this.h/2+4);
	}

	//绘制分数背景------------------------------------------
	var scoreW = 0.209*canvas.width;
	var scoreH = 0.048*canvas.height;
	var score = {
		w:scoreW,
		h:scoreH,
		drawX:canvas.width-scoreW,
		drawY:40,
		draw:function(){
			context.drawImage(loadOver[7],this.drawX,this.drawY,this.w,this.h);
		}
	}
	//绘制分数------------------------------------
	var scoreNum = 0;
	function drawScore(){
		context.beginPath();
		context.fillStyle = "white";
		context.font = "12px";
		context.fillText(scoreNum,score.drawX+score.w*3/5,score.drawY+score.h*2/3);
	}


    //动画------------------------------------------------
    function animate(){
		frameNum++;
        context.clearRect(0,0,canvas.width,canvas.height);//清屏
        bgImg.move();//背景动
        bgImg.draw();//背景绘制

        heroMoveLimit();
        hero.draw();
		heroEat();

		createMonster();//创建怪兽
		drawMonster();//绘制怪兽

		createKill();//创建道具
		drawKill();//道具绘制

		score.draw();//分数背景绘制
		drawScore();//分数的绘制

        window.requestAnimationFrame(animate);

    }
    var moveAble = false;
    var limitX = 0.148*canvas.width;
    canvas.addEventListener("touchstart",function (){
    	var first = event.touches[0];
    	 if(first.clientX>=hero.drawX&&first.clientX<=hero.drawX+hero.w&&first.clientY>=hero.drawY&&first.clientY<=hero.drawY+hero.h){
    		moveAble = true;
    	}
    	rangeX = first.clientX - hero.drawX;
    	rangeY = first.clientY - hero.drawY;
    	event.preventDefault();
    },false);
    canvas.addEventListener("touchmove",function (){
    	var first = event.touches[0];
    	if (moveAble) {
            hero.drawX = first.clientX - rangeX;
            hero.drawY = first.clientY - rangeY;
    	}
    	event.preventDefault();
    },false);
    canvas.addEventListener("touchend",function(){
    	moveAble = false;
    })
    // 游戏开始
    $('.game-btn').on('click',function(){
        $('.home-wrap').hide();
        $('#page-game').show();
        animate();
    })
//测试
$('.game-btn').click();
}















function randFn(min,max){
	//随机数
	return parseInt(Math.random()*(max-min+1)+min);
}
//加载图片
function loadImg(arr,fn){
	var arr1 = [];
   	var index = 0;
   	var arr2 = [];
   	for(var i=0; i<arr.length; i++){
   		var imgObj = new Image();
   		imgObj.src = arr[i];
   		imgObj.index = i;
   		imgObj.onload = function(){
   			index++;
   // 			$("#loading .text p").eq(1).html(Math.ceil(index/allImg.length*100)+'%');
			// $("#loading .load_wrap .loadPer").width(Math.ceil(index/allImg.length*100)+'%');
            $('#loading').html(index);
   			arr1.push(this);
   			if(index>arr.length-1){
   				for(var i=0; i<arr1.length;i++){
   					for(var j=0; j<arr1.length; j++){
   						if(arr1[j].index == i){
   							arr2.push(arr1[j]);
   						}
   					}
   				}
   				if(fn){
   					fn();
   				}
   			}
   		}
   	}
   	return arr2;
}
