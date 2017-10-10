var Game = function(canvasID){
    var cells = [];
    this.cellHistory = [];
    this.historyLength = 100;
    var cellSize = 5;
    var gapSize = cellSize/20;

    var canvas = document.getElementById(canvasID);
    var ctx = canvas.getContext("2d");

    var gameWidth, gameHeight, refresh;
    var loopAllowed = true;
    this.running = true;

    var bgColor = "#10232c";
    var deadColor = "#071013";
    var aliveColor = "#23B5D3";
    var colorCount = 4;

    this.onMouseMove = function(e) {
        var currX = e.clientX - canvas.offsetLeft;
        var currY = e.clientY - canvas.offsetTop;
        var x = Math.floor(currX / cellSize);
        var y = Math.floor(currY / cellSize);
        if (x > 0 && x < gameWidth && y > 0 && y < gameHeight){
            cells[x][y]["alive"] = !cells[x][y]["alive"];
        }
    };

    this.calcSize = function(){
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
        gameWidth = Math.floor(ctx.canvas.clientWidth / cellSize) + 1;
        gameHeight = Math.floor(ctx.canvas.clientHeight / cellSize) + 1;
    };

    this.drawCell = function(x, y, color){
        ctx.fillStyle = color;
        ctx.fillRect(x*cellSize + gapSize, y*cellSize + gapSize, cellSize - gapSize, cellSize - gapSize);
    };

    this.seedGame = function(probability){
        for (var x = 0; x < gameWidth; x++){
            cells[x] = [];
            for (var y = 0; y < gameHeight; y++) {
                var cl = "hsl(" + Math.floor(Math.random() * colorCount) * (360 / colorCount) + ", 90%, 70%)";
                var isAlive = Math.random() > probability;
                cells[x][y] = {alive: isAlive, color: isAlive ? cl : deadColor};
            }
        }
    };

    this.getNeighbors = function(x, y){
        var vectors = [[1, -1], [0, -1], [-1, -1], [1, 0], [-1, 0], [1, 1], [0, 1], [-1, 1]];
        var neighbors = [];
        for (var i = 0; i < vectors.length; i++){
            var xn = vectors[i][0] + x;
            var yn = vectors[i][1] + y;

            var xnf = xn;
            var ynf = yn;

            if (xn < 0) { xnf = xn + gameWidth; }
            if (yn < 0) { ynf = yn + gameHeight; }
            if (xn > gameWidth - 1) { xnf = xn - gameWidth; }
            if (yn > gameHeight - 1) { ynf = yn - gameHeight; }

            var isOutside = (xnf !== xn) || (ynf !== yn);

            if (isOutside){
                if (loopAllowed && cells[xnf][ynf]["alive"] === true){
                    neighbors.push(cells[xnf][ynf]);
                }
            } else if (cells[xn][yn]["alive"] === true) {
                neighbors.push(cells[xnf][ynf]);
            }

            // drawCell(x, y, "#F00");
            // if (loopAllowed){
            //     if ( cells[xnf][ynf]["alive"] === true) {
            //         drawCell(xnf, ynf, "#007300");
            //     } else {
            //         drawCell(xnf, ynf, "#0f0");
            //     }
            // } else if (!isOutside) {
            //     if ( cells[xn][yn]["alive"] === true) {
            //         drawCell(xn, yn, "#007373");
            //     } else {
            //         drawCell(xn, yn, "#0ff");
            //     }
            // }
        }
        return neighbors;
    };

    this.redraw = function(){
        ctx.fillStyle = bgColor;
        ctx.fillRect(0,0,ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        for (var x = 0; x < cells.length; x++){
            for (var y = 0; y < cells[x].length; y++) {
                var cell = cells[x][y];
                this.drawCell(x, y, cell["color"]);
            }
        }
    };

    // Taken from: https://stackoverflow.com/a/1053865/5384214
    this.getNextColor = function(colors){
        if(colors.length === 0)
            return null;
        var modeMap = {};
        var maxEl = colors[0], maxCount = 1;

        for(var i = 0; i < colors.length; i++)
        {
            var el = colors[i];
            if(modeMap[el] === null)
                modeMap[el] = 1;
            else
                modeMap[el]++;
            if(modeMap[el] > maxCount)
            {
                maxEl = el;
                maxCount = modeMap[el];
            }
        }
        return maxEl;
    };

    this.next = function(force){
        if (this.running || force){
            if (this.cellHistory.length > this.historyLength - 1) this.cellHistory.shift();
            this.cellHistory.push(cells);
            var nextCells = [];
            var born = [3];
            var survive = [3, 2];

            for (var x = 0; x < cells.length; x++){
                nextCells[x] = [];
                for (var y = 0; y < cells[x].length; y++) {
                    var neighbors = this.getNeighbors(x, y);
                    var nc = neighbors.length;
                    var isAlive = cells[x][y]["alive"];

                    var isNextAlive = (isAlive && survive.indexOf(nc) !== -1) || (!isAlive && born.indexOf(nc) !== -1);
                    var cl = isNextAlive ? this.getNextColor(neighbors.map(function(item){ return item["color"]; })) : deadColor;
                    nextCells[x][y] = {alive: isNextAlive, color: cl};
                }
            }
            cells = nextCells;
            this.redraw();
        }
    };

    this.prev = function(){
        if (this.cellHistory.length) {
            cells = this.cellHistory.pop();
            this.redraw();
        }
    };

    this.init = function(){
        this.calcSize();
        this.seedGame(0.4);
        this.redraw();
        canvas.addEventListener("mousemove", this.onMouseMove, false);
        window.addEventListener("resize", this.calcSize, true);
        refresh = setInterval(this.next, 100);
    };


    this.init();
    return this;
};

function startGame(){
    window.game = Game("game");
}

function onKeyDown(e){
    var keyCode = e.keyCode;
    if(keyCode === 32) {
        window.game.running = !window.game.running;
    }
    if(keyCode === 39) {
        window.game.next(true);
    }
    if(keyCode === 37) {
        window.game.prev();
    }
}

window.addEventListener('load', startGame, true);
document.addEventListener("keydown", onKeyDown, false);
