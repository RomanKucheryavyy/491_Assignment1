/**
 * Roman Kucheryavyy
 * Professor: Chris Marriot
 * Course: TCSS 491 (Computational Worlds)
 * Assignment: 1
 * Date: 1/31/2020
 * 
 * Assignment 1 (sprite animation), game engine, assetmanager, skeleton for the animation class was provided by Chris Marriot, 
 * the implementation of sprites an dvarious animations and other necesities like keyboard listeners were created by Roman Kucheryavyy.
 * 
 * In this implementation you will find animated snowball rolling across the map, a robot moving in all 4 directions randomly with edge
 * detection, a knight running and jumping, other fun animations like a cannon being fired.
 * 
 * @param {*} spriteSheet 
 * @param {*} startX 
 * @param {*} startY 
 * @param {*} frameWidth 
 * @param {*} frameHeight 
 * @param {*} frameDuration 
 * @param {*} frames 
 * @param {*} loop 
 * @param {*} reverse 
 */



function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } 
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    Entity.call(this, game, 0, 400);
    this.radius = 200;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.drawImage(AM.getAsset("./img/fullGrass tile.png"), 0 , 0);
    Entity.prototype.draw.call(this);
}

function Knight(game) {
    //this.soldierAnimation = new Animation(ASSET_MANAGER.getAsset("./img/rain_sprite_sheet_by_soldiern_d3hhhdy.png"), 6, 254, 70, 94, .1, 10, true, true);
    this.animation = new Animation(AM.getAsset("./img/run.png"), 0, 0, 343, 337, .04, 17, true, true);
    this.jumpAnimation = new Animation(AM.getAsset("./img/jumpAttack0001.png"), 0, 0, 407, 337, 0.1, 14, false, true);
     this.jumping = false;
     this.radius = 100;
     this.ground = 400;
    Entity.call(this, game, 0, 400);
}

Knight.prototype = new Entity();
Knight.prototype.constructor = Knight;

Knight.prototype.update = function () {
    if (this.x === 150) this.jumping = true;
    if (this.jumping) {
        if (this.jumpAnimation.isDone()) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
        }
        var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
        var totalHeight = 150;
        var height = totalHeight*(-5 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    }
    if(this.x > 800){
        this.x = 0;
    }
    this.x+= 2;
    Entity.prototype.update.call(this);
}

Knight.prototype.draw = function (ctx) {
 
    if (this.jumping) {
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34);
    }
    else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }

    Entity.prototype.draw.call(this);
}


function Enemy(game) {

    this.cannonAnimation = new Animation(AM.getAsset("./img/CannonFire_00000.png"), 0, 0, 101, 152, .05, 11, true, true);
    this.snowballAnimation = new Animation(AM.getAsset("./img/snowball_01.png"),0 , 0, 512, 386, .05, 6, true, true);

    this.moveDownRobotAnimation = new Animation(AM.getAsset("./img/robot.png"), 0, 0, 73, 60, 1, 1, true, false
    ); //quick note{:}
    this.moveUpRobotAnimation = new Animation(
        AM.getAsset("./img/robot.png"),
        73,
        0,
        73,
        60,
        1,
        1,
        true,
        false
    );
    this.moveRightRobotAnimation = new Animation(
        AM.getAsset("./img/robot.png"),
        146,
        0,
        73,
        60,
        1,
        1,
        true,
        false
    );
    this.moveLeftRobotAnimation = new Animation(
        AM.getAsset("./img/robot.png"),
        219,
        0,
        73,
        60,
        1,
        1,
        true,
        false
    );
    
    this.counter = 0;
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.lastMove = "none";
    this.hero = false;
    this.speed = 2;
    this.random = this.random = Math.floor(Math.random() * 100);
    // this.canvasWidth = game.ctx.width;
    // this.canvasHeight = game.ctx.height;
    this.x = 100;
    this.y = 100;
    this.projectileX = 1000;
    this.projectileY = 600;
    this.shooting = false;
    Entity.call(this, game, 100, 200);
}

Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function () {

    if(this.x >= 999){
        //this.lastMove = "left";
        this.random = 76;
    }
    if(this.x <= 1){
        //this.lastMove = "right";
        this.random = 26;
    }
    if(this.y <= 1){
        //this.lastMove = "down";
        this.random = 51;
    }
    if(this.y >= 799){
        //this.lastMove = "up";
        this.random = 1;
    }

    if (this.random <= 25) {
        //moving up
        this.up = true;
        this.down = false;
        this.right = false;
        this.left = false;
        
    }
    if (this.up === true) {
        this.y -= this.speed;
    }
    if (this.random <= 50 && this.random > 25) {
        //moving right

        this.up = false;
        this.down = false;
        this.right = true;
        this.left = false;
    }
    if (this.right === true) {
        this.x += this.speed;
    }
    if (this.random <= 75 && this.random > 50) {
        //moving down
        
        this.up = false;
        this.down = true;
        this.right = false;
        this.left = false;
    }
    if (this.down === true) {
        this.y += this.speed;
    }
    if (this.random <= 100 && this.random > 75) {
        //moving left
        this.up = false;
        this.down = false;
        this.right = false;
        this.left = true;
    }
    if (this.left === true) {
        
        this.x -= this.speed;
    }
    
    if(this.projectileX > 0){
        this.projectileX -= 3;
    } else {
        this.projectileX = 1000;
    }
    Entity.prototype.update.call(this);
};

Enemy.prototype.draw = function (ctx) { //CHANGE BACK TO THIS.CTX, DEFINE CTX FOR TANK GAME
    //this.moveRightAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    if (this.up) {
        this.moveUpRobotAnimation.drawFrame(
            this.game.clockTick,
            ctx,
            this.x,
            this.y
        );
        this.counter ++;
        if(this.counter === 100){
            this.up = false;
            this.counter = 0;
            this.random = Math.floor(Math.random() * 100);
        }
        
        this.lastMove = "up";
    }
    if (this.down) {
        this.moveDownRobotAnimation.drawFrame(
            this.game.clockTick,
            ctx,
            this.x,
            this.y
        );
        this.counter ++;
        if(this.counter === 100){
            this.down = false;
            this.counter = 0;
            this.random = Math.floor(Math.random() * 100)
        }
        this.lastMove = "down";
    }
    if (this.right) {
        this.moveRightRobotAnimation.drawFrame(
            this.game.clockTick,
            ctx,
            this.x,
            this.y
        );
        this.counter ++;
        if(this.counter === 100){
            this.right = false;
            this.counter = 0;
            this.random = Math.floor(Math.random() * 100)
        }
        this.lastMove = "right";
    }
    if (this.left) {
        this.moveLeftRobotAnimation.drawFrame(
            this.game.clockTick,
            ctx,
            this.x,
            this.y
        );
        this.counter ++;
        if(this.counter === 100){
            this.left = false;
            this.counter = 0;
            this.random = Math.floor(Math.random() * 100)
        }
        this.lastMove = "left";
    }
    if (!this.left && !this.right && !this.up && !this.down) {
        //if tank isnt moving then stay at most recent direction.
        if (this.lastMove === "left")
            this.moveLeftRobotAnimation.drawFrame(
                this.game.clockTick,
                ctx,
                this.x,
                this.y
            );
        if (this.lastMove === "right")
            this.moveRightRobotAnimation.drawFrame(
                this.game.clockTick,
                ctx,
                this.x,
                this.y
            );
        if (this.lastMove === "down")
            this.moveDownRobotAnimation.drawFrame(
                this.game.clockTick,
                ctx,
                this.x,
                this.y
            );
        if (this.lastMove === "up")
            this.moveUpRobotAnimation.drawFrame(
                this.game.clockTick,
                ctx,
                this.x,
                this.y
            );
        if (this.lastMove === "none")
            this.moveUpRobotAnimation.drawFrame(
                this.game.clockTick,
                ctx,
                this.x,
                this.y
            );
    }
    this.snowballAnimation.drawFrame(this.game.clockTick, ctx, this.projectileX, this.projectileY, .5);
    this.cannonAnimation.drawFrame(this.game.clockTick, ctx, 100, 200);
    Entity.prototype.draw.call(this);
};


var AM = new AssetManager();

AM.queueDownload("./img/fullGrass tile.png");
AM.queueDownload("./img/rain_sprite_sheet_by_soldiern_d3hhhdy.png");
AM.queueDownload("./img/run.png");
AM.queueDownload("./img/jumpAttack0001.png");
AM.queueDownload("./img/robot.png");
AM.queueDownload("./img/CannonFire_00000.png");
AM.queueDownload("./img/snowball_01.png");

AM.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var background = new Background(gameEngine);
    var knight = new Knight(gameEngine);
    var enemy = new Enemy(gameEngine);
    //var cannon = new Enemy(gameEngine);

    gameEngine.addEntity(background);
    gameEngine.addEntity(knight);
    gameEngine.addEntity(enemy);

    gameEngine.init(ctx);
    gameEngine.start();
    
});
