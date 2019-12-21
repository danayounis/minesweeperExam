$(document).ready(function () {


});
var rows = 10, columns = 10, mines = 10, cellsHolder, zeroSibilingsToBeOpened = {}, gameIsRunning = true, gameIsStarted = false, remainingMines = 10;
(function () {
    var $minesWrapper = $('#minesWrapper');
    var $gameWrapper = $('#gameWrapper');
    function shuffle(o) {
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }
    function initiateCells(cells_rows, cells_columns, cells_mines) {
        var cells;
        rows = cells_rows ? cells_rows : rows;
        columns = cells_columns ? cells_columns : columns;
        cells = rows * columns;
        mines = (cells_mines || cells_mines < cells) ? cells_mines : mines;
        remainingMines = mines;
        __updateRemainingMines();
        $minesWrapper.width(columns * 30);
        $minesWrapper.height(rows * 30);
        $minesWrapper.html('');
        var cellsHtml = '';
        cellsHolder = [];
        for (var i = 0; i < rows; i++) {
            cellsHolder.push([]);
            for (var j = 0; j < columns; j++) {
                cellsHtml = cellsHtml + '<div class="cell closed" id="cell_r' + i + '_c' + j + '" data-row="' + i + '" data-column="' + j + '"></div>';
                cellsHolder[i].push(0);
            }
        }
        $minesWrapper.html(cellsHtml);
        bindContextMenu();
    }
    function initiateMines() {
        var cells = rows * columns;
        var myArray = [];
        for (var i = 1; i <= cells; i++) {
            myArray.push(i - 1);
        }
        var minesArray = shuffle(myArray).splice(0, mines);
        $.each(minesArray, function (_, value) {
            cellsHolder[Math.floor(value / rows)][value % rows] = -1;
        });
    }

    function __restartGame() {
        var $restart = $('.restart');
        $restart.removeClass('lost');
        $restart.addClass('active');
        gameIsRunning = true;
        gameIsStarted = false;
        initiateGame();
    }

    function initiateRestartBinding() {
        $gameWrapper.on('click', '.restart', function () {
            __restartGame();
        });
    }

    function bindContextMenu() {
        $('.cell').on('contextmenu', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

    }

    function __updateRemainingMines() {
        $('#total-mines').text(remainingMines);
    }
    // this function is used to open clear cells
    function __openCell(curRow, curColumn) {
        var $currentDifficulty = $('.difficulty.active');
        var rows = $currentDifficulty.data('rows') - 1;
        var columns = $currentDifficulty.data('columns') - 1;
        var zeroSibilingsToBeOpened = [];
        zeroSibilingsToBeOpened.push(__getCell(curRow, curColumn));

        while (zeroSibilingsToBeOpened.length > 0) {

            var c = zeroSibilingsToBeOpened.shift();
            c.removeClass('closed');
            c.addClass('zero');
            var cellRow = c.data('row');
            var cellCol = c.data('column');
            for (var i = Math.max(cellRow - 1, 0); i <= Math.min(cellRow + 1, rows); i++) {
                for (var j = Math.max(cellCol - 1, 0); j <= Math.min(cellCol + 1, columns); j++) {
                    var $val = cellsHolder[i][j];
                    if (__getCell(i, j).hasClass('zero') || __getCell(i,j).hasClass('flagged')) { 
                        continue;
                    }
                    if ($val == 0) 
                        zeroSibilingsToBeOpened.push(__getCell(i, j));
                    else 
                        __getCell(i, j).removeClass('closed');

                }
            }
            
        }
    }
    //this function is called once the user clicks on a mine
    function __mineIsClicked(curRow, curColumn) {
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
                __getCell(i, j).removeClass('closed');
            }
        }
        $('.restart').addClass('lost');
        __getCell(curRow, curColumn).addClass('mined');
    }

    function initiateCellBindings() {
        $minesWrapper.on('click', '.cell.closed', function () {
            var $row = $(this).data('row');
            var $column = $(this).data('column');
            var $val = cellsHolder[$row][$column];
            // cleared cell
            if ($val == 0)
                __openCell($row, $column);
            // mine
            else if ($val == -1)
                __mineIsClicked($row, $column);
            else
                $(this).removeClass('closed');

        });
        $minesWrapper.on('mousedown', '.closed', function (e) {
            if (event.which == 3) {
                e.stopPropagation();
                var $cell = $(this);
                var cellRow = $(this).data('row');
                var cellColumn = $(this).data('column');
                $cell.toggleClass('flagged');
                if ($cell.hasClass('flagged')) {
                    remainingMines--;
                } else {
                    remainingMines++;
                }
                __updateRemainingMines();
            } else if (event.which == 1) {
                $('.restart').addClass('scared');
            }
        });
    }
    function setCellsValues() {
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
                if (cellsHolder[i][j] != -1) {
                    for (var k = i - 1; k <= i + 1; k++) {
                        for (var l = j - 1; l <= j + 1; l++) {
                            if (cellsHolder[k] && cellsHolder[k][l] == -1) cellsHolder[i][j]++;
                        }
                    }
                    if (cellsHolder[i][j] > 0)
                        __getCell(i, j).html('<div class="number">' + cellsHolder[i][j] + '</div>');
                } else {
                    __getCell(i, j).addClass('mine');
                }
            }
        }
    }

    function __getCell(row, column) {
        return $('#cell_r' + row + '_c' + column);
    }

    function initiateGame() {
        initiateCellsForCurrentDifficulty();
        initiateMines();
        setCellsValues();
    }

    function initiateBodyBindings() {
        $('body').on('mouseup', function (e) {
            if (event.which == 1) {
                e.stopPropagation();
                $('.restart').removeClass('scared');
            }
        });
    }
    function initiateCellsForCurrentDifficulty() {
        var $currentDifficulty = $('.difficulty.active');
        var rows = $currentDifficulty.data('rows');
        var columns = $currentDifficulty.data('columns');
        var mines = $currentDifficulty.data('mines');
        initiateCells(rows, columns, mines);

    }
    function initiateDifficultyBindings() {
        $('.difficulty').click(function () {
            var $currentDifficulty = $(this);
            if (!$currentDifficulty.hasClass('active')) {
                $('.difficulty').not($currentDifficulty).removeClass('active');
                $currentDifficulty.addClass('active');
                __restartGame();
            }
        });
    }

    initiateGame();
    initiateCellBindings();
    initiateRestartBinding();
    initiateBodyBindings();
    initiateDifficultyBindings();
}());
