"use strict";
var points;
var ball;
var lines;
var play;
var mouse = {
    x: undefined,
    y: undefined
};
var size = 30;
var ctxFg, ctxBg;
var width, height;
var ballTopPosition = 50;
var space = 50;
var toNew = 1;
var gameOver = false;
var requestID;
var relativeWidth = 0.3;
var lineHeight = 50;
var played = false;

window.requestAF = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame;

function Ball(nX, nY) {
    return {
        x: undefined,
        y: undefined,
        init: function () {
            this.x = nX;
            this.y = nY;
        },
        getX: function () {
            return this.x;
        },
        getY: function () {
            return this.y;
        },
        draw: function () {
            ctxFg.beginPath();
            ctxFg.arc(this.getX(), this.getY(), size, 0, 2 * Math.PI, false);
            ctxFg.fillStyle = 'green';
            ctxFg.fill();
        },
        setX: function (x) {
            this.x = x;
        }
    };
}

function Line() {
    return {
        y: undefined,
        x: undefined,
        x1: undefined,
        end: false,
        color: undefined,
        init: function () {
            var left = 0;
            var right = width - (relativeWidth * 2) * width - 4 * size;
            this.x = this._randomPosition(left, right);
            left = this.getX() + relativeWidth * width + 4 * size;
            right = width - relativeWidth * width;
            this.x1 = this._randomPosition(left, right);
            this.y = height;
            this.color = this._randomColor();
        },
        collision: function (x, y) {
            return (((this.getX() <= x) && (x <= (this.getX() + relativeWidth * width))) || ((this.getX1() <= x) && (x <= (this.getX1() + relativeWidth * width)))) &&
                    ((this.getY() <= y) && (y <= (this.getY() + lineHeight)));
        },
        _randomPosition: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        },
        _randomColor: function () {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        },
        getX: function () {
            return this.x;
        },
        getY: function () {
            return this.y;
        },
        getX1: function () {
            return this.x1;
        },
        draw: function () {
            ctxFg.fillStyle = this.color;
            ctxFg.fillRect(this.getX(), this.getY(), relativeWidth * width, lineHeight);
            ctxFg.fillRect(this.getX1(), this.getY(), relativeWidth * width, lineHeight);
        },
        move: function () {
            this.y -= 10;
            if (this.getY() < 0) {
                this.end = true;
            }
        },
        needDestroy: function () {
            return this.end;
        }
    }
}

function generate() {
    var line = new Line();
    line.init();
    lines.push(line);
}

function updateGame() {
    for (var i = 0; i < lines.length; i++) {
        if (play) {
            lines[i].move();
        }
        if (lines[i].needDestroy()) {
            points++;
            if (points % 3 === 0) {
                if (space > 10) {
                    space -= 3;
                }
            }
            lines.splice(i, 1);
            document.getElementById('audiotag2').play();
            i--;
        } else {
            if (lines[i].collision(ball.getX() - size, ball.getY() + size) ||
                    lines[i].collision(ball.getX() + size, ball.getY() + size)) {
                play = false;
                gameOver = true;
                if (!played) {
                    document.getElementById('audiotag1').play();
                }
                played = true;
            }
        }
    }
    if (play) {
        toNew -= 1;
    }
    if (toNew === 0) {
        generate();
        toNew = space;
    }
}

function frame() {
    updateGame();
    ctxFg.clearRect(0, 0, width, height);
    for (var i = 0; i < lines.length; i++) {
        lines[i].draw();
    }
    ball.draw();
    ctxFg.fillStyle = 'red';
    ctxFg.font = "30px Georgia";
    ctxFg.fillText(points, width - 60, 50);
    if (gameOver) {
        ctxFg.font = "100px Georgia";
        ctxFg.fillText("Game over. Points: " + points, width / 2 - ctxFg.measureText("Game over. Points: " + points).width / 2, height / 2);
    }
    requestID = window.requestAF(frame);
}

function mouseMove(e) {
    if (play) {
        var rect = fg.getBoundingClientRect();
        if (e.offsetX) {
            ball.setX(e.offsetX - rect.left);
        }
        else if (e.layerX) {
            ball.setX(e.layerX - rect.left);
        }
    }
}

function setSize() {
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight;
    width = window.innerWidth;
    height = window.innerHeight;
    fg.width = newWidth;
    fg.height = newHeight;
    bg.width = newWidth;
    bg.height = newHeight;
    var img = document.getElementById("sky");
    ctxBg.drawImage(img, 0, 0, newWidth, newHeight);
}


function start() {
    ctxFg = fg.getContext("2d");
    ctxBg = bg.getContext("2d");
    setSize();
    points = 0;
    lines = [];
    play = false;
    toNew = 1;
    gameOver = false;
    space = 50;
    ball = new Ball(window.innerWidth / 2, ballTopPosition);
    played = false;
    ball.init();
    window.addEventListener("resize", setSize, false);
    fg.addEventListener('mousemove', function (evt) {
        mouseMove(evt);
    }, false);
    fg.addEventListener('click', function () {
        if (!gameOver) {
            play = true;
        } else {
            start();
        }
    }, false);
    if (requestID) {
        window.cancelAnimationFrame(requestID);
        requestID = undefined;
    }
    requestID = window.requestAF(frame);
}

window.onload = start;