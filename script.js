define([
    'scripts/card',
    'scripts/user',
    'scripts/cellaction',
    'scripts/cellcard',
    'scripts/actions',
    'node_modules/lodash/lodash',
    'vendor/jquery',
    'scripts/user_table'
], function(Card, User, CellAction, CellCard, actions, _, $, UserTable){
    var field = {
        size: 4,
        el: document.querySelector('table'),
        cells: [
            new CellAction('penalty', actions.penalty),
            new CellAction('start', actions.plusBalance),
            new CellCard('shop', new Card('test', 20)),
        ],

        findCellById: function(id){
            return _.find(field.cells, ['name', id]);
        }
    };

    var list = {
        _turn: 0,

        users: [],

        current: function () {
            list._turn = list._turn % list.users.length;

            return this.users[list._turn++];
        },

        init: function(num){
            for(var i=0; i< num; i++){
                // var type = prompt('what is you player type: 1 - human, 2 - ufo, 3 - rectangle');
                //
                // type = +type % 3 + 1;

                var user = new User(i);

                this.users.push(user);

                field.el.querySelector('#start').innerHTML += user.render();
            }

            this.users.forEach(function(user){
                user.el = document.querySelector('#user_'+user.id);
            });
        }
    };

    function chooseDirection(x, y, size) {
        if (x === size && y === size) {
            return "left"
        }

        if (x === 1 && y === 1) {
            return 'right';
        }

        if (x === size && y === 1) {
            return 'down';
        }

        if (x === 1 && y === size) {
            return 'up';
        }
    }

    function selectTargetCell(direction, x, y, steps) {
        var target_cell = null;

        switch (direction) {
            case 'left':

                target_cell = field.el.rows[y - 1].cells[x - 1 - steps];

                break;
            case 'right':

                target_cell = field.el.rows[y - 1].cells[x - 1 + steps];

                break;
            case 'up':

                target_cell = field.el.rows[y - 1 - steps].cells[x - 1];

                break;
            case 'down':

                target_cell = field.el.rows[y - 1 + steps].cells[x - 1];

                break;
        }

        return target_cell;
    }

    function move(gamer, steps, cb) {
        if (steps === 0) {
            cb(gamer);

            return;
        }

        var td = gamer.el.parentNode;

        var x = td.cellIndex + 1;
        var y = td.parentNode.rowIndex + 1;

        gamer.direction = chooseDirection(x, y, field.size) || gamer.direction;

        var target_cell = selectTargetCell(gamer.direction, x, y, 1);
        target_cell.appendChild(gamer.el);

        setTimeout(function () {
            move(gamer, steps - 1, cb);
        }, 500);
    }

    function action(gamer) {
        var currentId = gamer.el.parentElement.id;

        var cell = field.findCellById(currentId);

        if (cell) {
            console.log(cell.action.name);
            cell.action(gamer);

            if(gamer.balance < 0 ){
                gameOverForUser(gamer);
            }
        }
    }

    function checkWin(){
        var isWon = list.users.length === 1;
        if(isWon){
            console.log("You had won:", list.users[0]);
        }
        return isWon;
    }

    function gameOverForUser(user){
        var index = list.users.indexOf(user);

        var gamer = list.users.splice(index, 1)[0];

        gamer.el.remove();
    }

    return {
        run(){
            list.init(2);

            $('#dice')
                .on('click', function (event) {
                    var el = event.currentTarget;

                    el.disabled = true;

                    var result =  _.random(2,5);
                    var gamer = list.current();

                    move(gamer, result, function(gamer){
                        action(gamer);
                        el.disabled = checkWin();
                    });
                });

            UserTable.render(list.users);
        }
    };
});