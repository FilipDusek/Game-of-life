var Game = function(){
    var cells = [];
    var cellSize = 4;
    var gapSize = cellSize/20;

    var canvas = document.getElementById("game");
    var ctx = canvas.getContext("2d");

    var gameWidth, gameHeight;
    var loopAllowed = true;

    var bgColor = "#10232c";
    var deadColor = "#071013";
    var aliveColor = "#23B5D3";
    var colorCount = 5;


    function init(){
        calcSize();
        seedGame(0.4);
        redraw();
        setInterval(next, 50);
        canvas.addEventListener("mousemove", onMouseMove, false);
        window.addEventListener('resize', calcSize, true);
    }

    function onMouseMove(e) {
        var currX = e.clientX - canvas.offsetLeft;
        var currY = e.clientY - canvas.offsetTop;
        var x = Math.floor(currX / cellSize);
        var y = Math.floor(currY / cellSize);
        if (x > 0 && x < gameWidth && y > 0 && y < gameHeight){
            cells[x][y]["alive"] = !cells[x][y]["alive"];
        }
    }

    function calcSize(){
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
        gameWidth = Math.floor(ctx.canvas.clientWidth / cellSize) + 1;
        gameHeight = Math.floor(ctx.canvas.clientHeight / cellSize) + 1;
    }

    function drawCell(x, y, color){
        ctx.fillStyle = color;
        ctx.fillRect(x*cellSize + gapSize, y*cellSize + gapSize, cellSize - gapSize, cellSize - gapSize);
    }

    function seedGame(probability){
        for (var x = 0; x < gameWidth; x++){
            cells[x] = [];
            for (var y = 0; y < gameHeight; y++) {
                console.log(colorCount);
                var cl = "hsl(" + Math.floor(Math.random() * colorCount) * (360 / colorCount) + ", 70%, 50%)";
                var isAlive = Math.random() > probability;
                cells[x][y] = {alive: isAlive, color: isAlive ? cl : deadColor};
            }
        }
    }

    function getNeighbors(x, y){
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
    }

    function redraw(){
        ctx.fillStyle = bgColor;
        ctx.fillRect(0,0,ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        for (var x = 0; x < cells.length; x++){
            for (var y = 0; y < cells[x].length; y++) {
                var cell = cells[x][y];
                drawCell(x, y, cell["color"]);
            }
        }
    }

    // Taken from: https://stackoverflow.com/a/1053865/5384214
    function getNextColor(colors){
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
    }

    function next(){
        var newCells = [];
        var born = [3];
        var survive = [3, 2];

        for (var x = 0; x < cells.length; x++){
            newCells[x] = [];
            for (var y = 0; y < cells[x].length; y++) {
                var neighbors = getNeighbors(x, y);
                var nc = neighbors.length;
                var isAlive = cells[x][y]["alive"];
                var isNextAlive = (isAlive && survive.indexOf(nc) !== -1) || (!isAlive && born.indexOf(nc) !== -1);

                var cl = isNextAlive ? getNextColor(neighbors.map(function(item){ return item["color"]; })) : deadColor;

                newCells[x][y] = {alive: isNextAlive, color: cl};
            }
        }
        cells = newCells;
        redraw();
    }

    init();
    return this;
};

window.addEventListener('load', Game, true);
