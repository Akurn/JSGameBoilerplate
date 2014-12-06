/* Akurn JS Game Boilerplate */
var debug = (location.search.indexOf('debug') > 0) ? true : false;
(function(){
    //global
    var canvas,
        context,
        timelast,
        dt;

    //settings

    //objects
    var imgFlower;
    
    window.onload = function(){ 
        //setup objects once
        canvas = document.getElementById('game');
        context = canvas.getContext('2d');
        onresize();

        /***** START NEW ROUND *****/

        /***** SETUP STAGE *****/
        imgFlower = new Sprite({
            context: context,
            image: loadImage('game/sprites/deco-flower-sprite.png'),
            fps: 12,
            width: 46,
            height: 69,
            x: 100,
            y: canvas.height - 32
        });

        /***** SETUP INTERFACE *****/
        window.onresize = onresize;

        /***** CONTROLS *****/
        document.body.addEventListener('touchmove',function(e){e.preventDefault();}); //prevent touch app from dragging game screen

        /***** START LOOP *****/
        timelast = new Date().getTime();
        (function animloop() {
            requestAnimFrame(animloop);

            var ct = new Date().getTime();
            dt = (ct - timelast);
            timelast = ct;

            draw(dt);
        })();
    }


    /* Draw Loop */
    function draw(dt) {
        if (debug) {console.log(totalAssets.loaded + '/' + totalAssets.loading);}
        if (totalAssets.loaded < totalAssets.loading) { //loading;

        } else {

            //clear frame
            context.clearRect(0, 0, canvas.width, canvas.height);

            //UPDATE
            imgFlower.y = canvas.height - 32;

            //RENDER
            context.fillStyle="#45889e";
            context.fillRect(0,0,canvas.width,canvas.height);
            context.fillStyle="#000";
            context.fillRect(canvas.width/2-100,canvas.height/2-50,200,100);

            imgFlower.render();

        }
    }
        

    /***** CLASSES *****/
    function object(op) {
        var o = op || {};
        this.ctx = o.ctx || context;
        this.x = o.x || 0;
        this.y = o.y || 0;
        this.vx = o.vx || 0;
        this.vy = o.vy || 0;
        this.width = o.width || 0;
        this.height = o.height || 0;

        //optional properties
        this.color = o.color || 'rgba(0, 0, 0, 1)';
        this.type = o.type || 0;
        this.health = o.health || 0;
    };
    object.prototype.update = function(d){
        var delta = d || dt || 1;

        this.x += this.vx;
        this.y += this.vy;
    };
    object.prototype.render = function(ctx){
        ctx = ctx || this.ctx || context || false;

        if (ctx) {
            ctx.save();
                ctx.fillStyle = this.color;
                ctx.translate(this.x, this.y);
                ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            ctx.restore();
        } else {
            console.log('No context specified in the update for:');
            console.log(this);
        }
    };


    /***** COMMMON FUNCTIONS *****/
    function startGame(){
        
    }

    function endGame() {
        
    }

    function onresize() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    // shim layer with setTimeout fallback
    // Paul Irish - http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame       ||
               window.webkitRequestAnimationFrame ||
               window.mozRequestAnimationFrame    ||
            function (callback) {
                window.setTimeout(callback, 1000 / fps);
            };
    })();

})();