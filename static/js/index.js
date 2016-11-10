var bgMusic = document.getElementById("bg-music");
var boomMusic = document.getElementById("boom-music");
var gameOverMusic = document.getElementById("over-music");
//音频缓存
boomMusic.play();
gameOverMusic.play();
setTimeout(function () {
   boomMusic.pause();
   gameOverMusic.pause();
}, 150);



var allImg = ['static/img/bg.jpg','static/img/car.png',
'static/img/f_oil.png','static/img/f_kill.png',
'static/img/f_g1.png','static/img/f_g2.png','static/img/f_g3.png','static/img/f_g4.png','static/img/f_g5.png','static/img/score.png','static/img/kill_boom.png'];

var loadOver = [];
loadOver = loadImg(allImg,function(){
	$("#loading").hide();
	homeAnimate();
})

var frameNum = 0;//帧数
//食物的数组,创建速度
var monsters = [];
var createMonsterSpeed = 25;
var monsterMoveSpeed = 4;
var removeBol = false;



function homeAnimate(){
	$(".home-wrap").show();
    bgMusic.play();
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
			this.y += 2;
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

	//食物对象--------------------------------------------
	function Monster(monster){
		this.w = monster.w;
		this.h = monster.h;
		var monsterdrawxR = randFn(0,2);
		var monsterdrawxArr = [0.218,0.46,0.695];
		this.drawX = monsterdrawxArr[monsterdrawxR]*canvas.width;
		this.drawY = -monster.h;
		this.score = monster.score;
		this.speed = monsterMoveSpeed+0.1*randFn(0,4);
		this.survival = true;
		this.img = monster.img;
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
			boom.drawX = hero.drawX+hero.w;
			boom.drawY = hero.drawY;
			boom.score = this.score;
			boom.draw();
		}
	}
	function createMonster(){
		//创建食物
		if(frameNum%createMonsterSpeed == 0){
			var monsterR = randFn(1,100);
			if (monsterR>=0&&monsterR<=70){//油滴
				var monster = {}; //存放每一个monster的信息
				monster.w = 0.07*canvas.width;
				monster.h = 0.07*canvas.height;
				monster.img = loadOver[2];
				monster.score = 1;  //打了它之后的得分
			}else{
				var monster = {};
				var giftR = randFn(0,4);
				var giftArr = [loadOver[4],loadOver[5],loadOver[6],loadOver[7],loadOver[8]];
				monster.img = giftArr[giftR];
                monster.w = monster.img.width/640*canvas.width;
				monster.h = monster.img.height/1136*canvas.height;
				monster.score = 2;
			}
			var monsterObj = new Monster(monster);
			monsters.push(monsterObj);
		}

	}
	function drawMonster(){
		//绘制食物
		for(var i=0; i<monsters.length;i++){
			monsters[i].move();
			monsters[i].draw();
			var bol = monsters[i].clear();
			if(!bol){
				var monsterBol = collide(monsters[i],hero);
				if(monsterBol){
					scoreNum += monsters[i].score;
					removeBol = true;
					monsters[i].survival = false;
					var dieBol = monsters[i].die();
					if(dieBol){
						i--;
					}
					monsters.splice(i,1);
					boomMusic.play();
				}
			}
			if(bol||removeBol){
				i--;
				removeBol = false;
			}
		}
	}


	//kill对象--------------------------------------
	var kills = [];
	var createKillSpeed = 80;
	function Kill(){
		this.w = 0.1375*canvas.width;
		this.h = 0.0633*canvas.height;
		var killdrawxR = randFn(0,2);
		var killdrawxArr = [0.218,0.46,0.695];
		this.drawX = killdrawxArr[killdrawxR]*canvas.width;
		this.drawY = -this.h;
		this.speedY = monsterMoveSpeed+0.2*randFn(0,4);
		this.img = loadOver[3];
        this.survival = true;
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
    Kill.prototype.die = function(){
		if(!this.survival){
            context.drawImage(loadOver[10],this.drawX*0.95,this.drawY*0.95,this.w*1.125,this.h*1.416);
		}
	}
	function createKill(){
		//创建kill
		if(frameNum%createKillSpeed == 0){
			var killObj = new Kill();
			kills.push(killObj);
		}
	}
	function drawKill(){
		//绘制kill
		for(var i=0; i<kills.length;i++){
			kills[i].move();
			kills[i].draw();
			var bol = kills[i].clear();
			if(!bol){
				var killBol = collide(kills[i],hero);
				if(killBol){
                    kills[i].survival = false;
                    kills[i].die();
                    setTimeout(function(){
                        gameOver();
                    },150)
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
	//爆炸对象,显示吃到的分数---------------------------------
	function Boom(){
		this.drawX = 0;
		this.drawY = 0;
	}
	Boom.prototype.draw = function(){
		context.fillStyle = "white";
		context.font = "30px Arial";
		context.fillText("+"+this.score,this.drawX,this.drawY);
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
			context.drawImage(loadOver[9],this.drawX,this.drawY,this.w,this.h);
		}
	}
	//绘制分数------------------------------------
	var scoreNum = 0;
	function drawScore(){
		context.beginPath();
		context.fillStyle = "white";
        context.font = "19px Arial";
        context.fillText(scoreNum,score.drawX+score.w*3/5,score.drawY+score.h*3/4);
	}

    //达到一定的分数改变怪物的生成速度和子弹的生成速度
	function changeSpeed(){
		if(scoreNum>=20&&scoreNum<=40){
			monsterMoveSpeed = 4;
		}else if(scoreNum>40&&scoreNum<60){
			monsterMoveSpeed = 5;
		}else if(scoreNum>=60&&scoreNum<80){
			monsterMoveSpeed = 6;
		}else if(scoreNum>=80){
			monsterMoveSpeed = 7;
		}
	}

	// 游戏结束
	var gameOverBol = true;
	function gameOver(){
		//updateNum();//更新最高分,传到后台数据库
		monsters = [];//怪物数组清空
		kills = [];//道具清空
		gameOverBol = false;
		gameOverMusic.play();
		bgMusic.pause();
		// 跳页面
		$('#layer-gameover .score').html(scoreNum);
		$('#layer-gameover').show();

	}

	//更新最高分------------------------------------
	function updateNum(){

	}
	//再玩一次---------------------------------------------------
	function again(){
		gameOverBol = true;
		frameNum = 0;//帧数重置

		createMonsterSpeed = 25;//创建怪物速度重置
		monsterMoveSpeed = 4;
		createKillSpeed = 100;//炸弹速度重置
		clearMonsterBol = false;//清屏效果重置
		scoreNum = 0;//分数重置

		countdown = 30;

		hero.drawX = canvas.width/2-heroW/2;//英雄位置重置
		hero.drawY = canvas.height-heroH-10;

		animate();
		bgMusic.play();
		timerOpen();

	}
    //动画------------------------------------------------
    function animate(){
		frameNum++;
        context.clearRect(0,0,canvas.width,canvas.height);//清屏
        bgImg.move();//背景动
        bgImg.draw();//背景绘制

		if(!gameOverBol){
			return;
		}

        //heroMoveLimit();
        hero.draw();

		createMonster();//创建食物
		drawMonster();//绘制食物

		createKill();//创建炸弹
		drawKill();//炸弹绘制

		score.draw();//分数背景绘制
		drawScore();//分数的绘制

        changeSpeed();  //达到一定分数改变速度
		if(frameNum == 1000){
			frameNum = 0;
		}

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
        heroMoveLimit();
        if (hero.drawY <= 0) {
            hero.drawY = 0;
        }else if (hero.drawY >= canvas.height-hero.h) {
            hero.drawY = canvas.height-hero.h;
        }
    	event.preventDefault();
    },false);
    canvas.addEventListener("touchend",function(){
    	moveAble = false;
    })
	// 倒计时
	var countdown = 30;
	var timer = '';
	function timerOpen(){
		$('.countdown').html(countdown);
		if (timer) {
			clearInterval(timer);
		}
		timer = setInterval(function(){
			countdown--;
			$('.countdown').html(countdown);
			if(countdown == 0) {
				clearInterval(timer);
				gameOver();
			}
		},1000)
	}

    // 游戏开始
    $('.game-btn').on('click',function(){
        $('.home-wrap').hide();
        $('#page-game').show();
        animate();
		timerOpen();
		boomMusic.play();
    })
	// 再来一次
	$('.again-btn').on('click',function(){
		$('#layer-gameover').hide();
		again();
	})
//测试
 // $('.game-btn').click();
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
            var v ='translate('+(-20*index/allImg.length)+'rem)';
            $('#loading .loadingcar').css({
                transform: v,
                webkitTransform: v
            });
            $('#loading .progress').html(Math.ceil(index/allImg.length*100)+'%');
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
