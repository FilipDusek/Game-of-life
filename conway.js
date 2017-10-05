var Game = function(){
    var cells = [];
    var cellSize = 5;
    var gapSize = cellSize/20;

    var canvas = document.getElementById("game");
    var ctx = canvas.getContext("2d");

    var gameWidth, gameHeight;
    var loopAllowed = false;

    var bgColor = "#10232c";
    var deadColor = "#071013";
    var aliveColor = "#23B5D3";


    function init(){
        calcSize();
        seedGame(0.7);
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
        cells[x][y] = !cells[x][y];
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

    function redraw(){
        ctx.fillStyle = bgColor;
        ctx.fillRect(0,0,ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        for (var x = 0; x < cells.length; x++){
            for (var y = 0; y < cells[x].length; y++) {
                var cell = cells[x][y];
                if (cell === false){
                    drawCell(x, y, deadColor);
                } else if (cell === true) {
                    drawCell(x, y, aliveColor);
                } else {
                    console.error("Cell [" + x + ", " + y + "] has invalid value (" + cell + ")")
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
        redraw();
    }

    init();
    return this;
};

window.addEventListener('load', Game, true);
