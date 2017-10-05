var Game = function(){
    var canvas = document.getElementById("game");
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    var ctx = canvas.getContext("2d");

    var cells = [];
    var gapSize = 0.5;
    var cellSize = 10;
    var gameWidth = Math.floor(ctx.canvas.clientWidth / cellSize) + 1;
    var gameHeight = Math.floor(ctx.canvas.clientHeight / cellSize) + 1;
    var loopAllowed = false;

    window.addEventListener('resize', function(){
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
        gameWidth = Math.floor(ctx.canvas.clientWidth / cellSize) + 1;
        gameHeight = Math.floor(ctx.canvas.clientHeight / cellSize) + 1;
    }, true);

    function drawCell(x, y, color){
        ctx.fillStyle = color;
        ctx.fillRect(x*cellSize + gapSize, y*cellSize + gapSize, cellSize - gapSize, cellSize - gapSize);
    }

    function seedGame(probability){
        for (var x = 0; x < gameWidth; x++){
            cells[x] = [];
            for (var y = 0; y < gameHeight; y++) {
                cells[x][y] = Math.random() > probability;
            }
        }
    }

    function neighborsCount(x, y){
        var vectors = [[1, -1], [0, -1], [-1, -1], [1, 0], [-1, 0], [1, 1], [0, 1], [-1, 1]];
        var count = 0;
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

            if (loopAllowed && isOutside && cells[xnf][ynf] === true){
                count++;
            }

            if (!isOutside && cells[xn][yn] === true) {
                count++;
            }
            // drawCell(x, y, "#F00");
            // if (loopAllowed){
            //     if ( cells[xnf][ynf] === true) {
            //         drawCell(xnf, ynf, "#007300");
            //     } else {
            //         drawCell(xnf, ynf, "#0f0");
            //     }
            // } else if (!isOutside) {
            //     if ( cells[xn][yn] === true) {
            //         drawCell(xn, yn, "#007373");
            //     } else {
            //         drawCell(xn, yn, "#0ff");
            //     }
            // }

        }
        return count;
    }

    function draw(){
        ctx.fillStyle = "#4f4f4f";
        ctx.fillRect(0,0,ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        for (var x = 0; x < cells.length; x++){
            for (var y = 0; y < cells[x].length; y++) {
                if (cells[x][y] === false){
                    drawCell(x, y, "#000");
                } else if (cells[x][y] === true) {
                    drawCell(x, y, "#7e00ff");
                } else {
                    drawCell(x, y, "#fff");
                }
            }
        }
    }

    function next(){
        var newCells = [];
        for (var x = 0; x < cells.length; x++){
            newCells[x] = [];
            for (var y = 0; y < cells[x].length; y++) {
                var nc = neighborsCount(x, y);
                var isAlive = cells[x][y];
                newCells[x][y] = (isAlive && !(nc > 3 || nc < 2)) || (!isAlive && nc === 3);
            }
        }
        cells = newCells;
        draw();
    }

    seedGame(0.7);
    next();
    setInterval(next, 50);
    canvas.addEventListener("mousemove", function (e) {
        var currX = e.clientX - canvas.offsetLeft;
        var currY = e.clientY - canvas.offsetTop;
        var x = Math.floor(currX / cellSize);
        var y = Math.floor(currY / cellSize);
        cells[x][y] = !cells[x][y];
    }, false);

    return this;
};

window.addEventListener('load', Game, true);
