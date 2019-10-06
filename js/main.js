(function() {
 var DEBUG, before, c, clamp, collides, ctx, delta, draw, elapsed, keysDown, keysPressed, load, loading, now, ogre, setDelta, tick, update;

 c = document.getElementById('draw');

 ctx = c.getContext('2d');

 delta = 0;

 now = 0;

 before = Date.now();

 elapsed = 0;

 loading = 0;

 DEBUG = false;
 //DEBUG = true;

 c.width = 800;

 c.height = 600;

 keysDown = {};

 keysPressed = {};
 click = {};

 framesThisSecond = 0;
 fpsElapsed = 0;
 fps = 0

 score = 0;
 enemySpeed = 200;

 window.addEventListener("keydown", function(e) {
         keysDown[e.keyCode] = true;
         return keysPressed[e.keyCode] = true;
         }, false);

 window.addEventListener("keyup", function(e) {
         return delete keysDown[e.keyCode];
         }, false);

 c.addEventListener("click", function(e) {
   click = {
     'x': e.offsetX,
     'y': e.offsetY,
   }

   console.log(click);
 })

 setDelta = function() {
     now = Date.now();
     delta = (now - before) / 1000;
     return before = now;
 };

 if (!DEBUG) {
     console.log = function() {
         return null;
     };
 }

 ogre = false;

 clamp = function(v, min, max) {
     if (v < min) {
         return min;
     } else if (v > max) {
         return max;
     } else {
         return v;
     }
 };

 collides = function(a, b) {
     return a.x + a.w > b.x && a.x < b.x + b.w && a.y + a.h > b.y && a.y < b.y + b.h;
 };

 clicked = function(c, x, y, w, h) {
    return c.x >= x && c.x <= x + w && c.y >= y && c.y <= y + h;
 }

 player = {
   x: 375,
   y: 480,
   w: 50,
   h: 50,
 }

 enemies = []
 projectiles = []
 particles = []

 toSpawn = 0;
 spawnInterval = 1;

 toShoot = 0;
 shootInterval = 0.2;

 tick = function() {
     setDelta();
     elapsed += delta;
     update(delta);
     draw(delta);
     keysPressed = {};
     click = null;
     if (!ogre) {
         return window.requestAnimationFrame(tick);
     }
 };

 speed = 120;
 pps = 0;

 spawnEnemy = function() {
   return {
     x: Math.random() * 600 + 100,
     y: -10,
     w: 30,
     h: 30,
   }
 }

 explode = function(x, y) {
   for(var i = 0; i < 42; i ++) {
     particles.push({
       x: x,
       y: y,
       w: 2,
       h: 2,
       dx: (Math.random() - 0.5) * 500,
       dy: (Math.random() - 0.5) * 500,
       ttl: Math.random() + 0.5,
     })
   }
 }

 shoot = function() {
   projectiles.push({
     x: player.x + player.w / 2 - 1,
     y: player.y,
     w: 2,
     h: 20,
   })
 }

 update = function(delta) {
     framesThisSecond += 1;
     fpsElapsed += delta;
     toSpawn -= delta;
     toShoot -= delta;

     speed = 500;

     if(keysDown[68] && player.y <= (600 - player.w / 2)) {
       player.x += delta * speed;
     } else if(keysDown[65] && player.y >= player.w / 2) {
       player.x -= delta * speed;
     }

     if((keysDown[66] || keysDown[32]) && toShoot <= 0) {
       toShoot = shootInterval;
       shoot();
     }

     for(var i = projectiles.length - 1; i >= 0; i--) {
       if(projectiles[i].y <= 0) {
         projectiles.splice(i, 1);
         continue;
       }

       collision = false;

       for(var j = enemies.length - 1; j >= 0; j--) {
         if(collides(enemies[j], projectiles[i])) {
           score += 1;
           explode(enemies[j].x, enemies[j].y);
           enemies.splice(j, 1);
           projectiles.splice(i, 1);
           collision = true;
           break;
         }
       }

       if(!collision) {
         projectiles[i].y -= delta * 800;
       }
     }

     for(var i = enemies.length - 1; i >= 0; i--) {
       if(enemies[i].y > 600) {
         ogre = true
         enemies.splice(i, 1);
         continue;
       }

       if(collides(enemies[i], player)) {
         ogre = true
         explode(player.x, player.y);
         player.y = 1000
         enemies.splice(i, 1);
         continue;
       }

       enemies[i].y += delta * enemySpeed;
     }

     for(var i = particles.length - 1; i >= 0; i--) {
       if(particles[i].ttl <= 0) {
         particles.splice(i, 1);
         continue;
       }

       particles[i].x -= particles[i].dx * delta;
       particles[i].y -= particles[i].dy * delta;

       particles[i].ttl -= delta;
     }

     if(toSpawn <= 0) {
        toSpawn = spawnInterval;
        enemySpeed += 2;

        enemies.push(spawnEnemy());
     }

     if(fpsElapsed >= 1) {
        fps = framesThisSecond / fpsElapsed;
        framesThisSecond = fpsElapsed = 0;
     }
 };

 draw = function(delta) {
     ctx.fillStyle = "#000000";
     ctx.fillRect(0, 0, c.width, c.height);

     if(DEBUG) {
        ctx.fillStyle = "#888888";
        ctx.font = "20px Visitor";
        ctx.fillText(Math.round(fps), 20, 590);
     }

     ctx.fillStyle = "#eeeeee";
     ctx.textAlign = 'center';

     ctx.font = "64px Visitor";
     ctx.fillText(score, 400, 40);

     if (ogre) {
       ctx.font = "100px Visitor";
       ctx.fillText('GAME OVER', 400, 300);
     }

     enemies.forEach(function(e) {
       ctx.fillRect(e.x, e.y, e.w, e.h)
     })

     particles.forEach(function(p) {
       ctx.fillRect(p.x, p.y, p.w, p.h)
     })

     projectiles.forEach(function(p) {
       ctx.fillRect(p.x, p.y, p.w, p.h)
     })

     ctx.fillRect(player.x, player.y, player.w, player.h)

 };

 (function() {
  var targetTime, vendor, w, _i, _len, _ref;
  w = window;
  _ref = ['ms', 'moz', 'webkit', 'o'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  vendor = _ref[_i];
  if (w.requestAnimationFrame) {
  break;
  }
  w.requestAnimationFrame = w["" + vendor + "RequestAnimationFrame"];
  }
  if (!w.requestAnimationFrame) {
  targetTime = 0;
  return w.requestAnimationFrame = function(callback) {
  var currentTime;
  targetTime = Math.max(targetTime + 16, currentTime = +(new Date));
  return w.setTimeout((function() {
          return callback(+(new Date));
          }), targetTime - currentTime);
  };
  }
 })();

 load = function() {
     if(loading) {
         window.requestAnimationFrame(load);
     } else {
         window.requestAnimationFrame(tick);
     }
 };

 load();

}).call(this);
