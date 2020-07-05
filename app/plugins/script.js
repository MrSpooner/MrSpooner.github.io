'use strict'

let cells = [];
const playerIndex = 0;
const computerIndex = 1;
let playerMove = 1;
const playerNames = document.querySelectorAll(".field__title");

//ввод никнейма игрока
function name() {
    var doc = prompt("Enter name:", "Игрок");
    document.getElementById("name").innerHTML = doc;
}
//переход хода
function playerNext() {
    const playerMoveOld = playerMove;

    playerMove = (playerMove + 1) % 2;

    playerNames[playerMove].className = 'field__title field__title_highlight';
    playerNames[playerMoveOld].className = 'field__title';

    if (playerMove == computerIndex)
        pcMove();

}

let timerId;
//ход компьютера
function pcMove() {

    let hitDetect = true;

    timerId = setTimeout(function tick() {
        const accessibleCell = fields[playerIndex].calcAccessibleCells();
        const accessibleIndex = Math.floor(Math.random() * accessibleCell.length);
        const accessibleElem = accessibleCell[accessibleIndex];
        hitDetect = fields[playerIndex].fire(accessibleElem.x, accessibleElem.y);
        //таймер для эмуляции продумывания хода компьютером
        if (hitDetect)
            timerId = setTimeout(tick, 500);
        else
            playerNext();
    }, 500);


}
//генерация клеток поля
function generateCells() {
    let fieldCells = document.querySelectorAll('.field__cells');
    for (let j = 0; j < fieldCells.length; j++) {
        fieldCells[j].innerHTML = '';
        cells[j] = [];
        for (let x = 0; x < 10; x++) {
            cells[j][x] = [];
            for (let y = 0; y < 10; y++) {
                var cellElem = document.createElement('div');
                cellElem.className = 'field__cell';

                if (j == computerIndex)
                    cellElem.addEventListener('click', () => { clickCell(j, x, y) });

                fieldCells[j].appendChild(cellElem);
                cells[j][x][y] = cellElem;
            }
        }
    }
}
//реализация выстрела игроком при нажатии
function clickCell(fieldIndex, x, y) {
    if ((fieldIndex == computerIndex) && (playerMove == playerIndex)) {
        const fire = fields[fieldIndex].fire(x, y);
        if (!fire) {
            playerNext();
        }
    }
}

class FieldShips {
    constructor(fieldIndex, fieldVisible) {
        this.arrayField = [];
        this.ships = [];
        this.accessibleField = [];
        this.fieldIndex = fieldIndex;
        this.fieldVisible = fieldVisible;
        this.accessibleFieldChange();
    }
    //вычисление доступных для выстрела клеток
    calcAccessibleCells() {
        let accessibleCell = [];
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                if (this.shootAccess(x, y)) {
                    accessibleCell.push({ x, y });
                }
            }
        }
        return accessibleCell;
    }
    //вычисление доступной для выстрела клетки
    shootAccess(x, y) {
        if (this.arrayField[x][y] >= 0) {
            return true;
        }
        return false;
    }
    //вывод попаданий на экран 
    generateLabel(x, y) {
        if (this.arrayField[x][y] == -1) {
            const XElem = document.createElement('div');
            XElem.className = 'field__X';
            XElem.innerHTML = 'X';
            cells[this.fieldIndex][x][y].appendChild(XElem);
        }

        if (this.arrayField[x][y] == -2) {
            const OElem = document.createElement('div');
            OElem.className = 'field__O';
            OElem.innerHTML = 'O';
            cells[this.fieldIndex][x][y].appendChild(OElem);
        }
    }
    //реализация стрельбы
    fire(x, y) {
        // индекс больше нуля присвоен кораблям
        // индекс -1 у клеток, в которых было попадание по кораблю
        // индекс -2 у клеток, в которых был промах
        if (this.shootAccess(x, y)) {
            if (this.arrayField[x][y] > 0) {
                this.arrayField[x][y] = -1;

                this.generateLabel(x, y);
            } else if (this.arrayField[x][y] == 0) {
                this.arrayField[x][y] = -2;
                this.generateLabel(x, y);
                return false;
            }

            for (let k = 0; k < this.ships.length; k++) {
                let shipPartCount = 0;
                for (let i = 0; i < 10; i++) {
                    for (let j = 0; j < 10; j++) {
                        if (this.arrayField[i][j] > 0 && this.arrayField[i][j] == k + 1) {
                            shipPartCount++;
                        }
                    }
                }

                if (shipPartCount == 0 && !this.ships[k].isDead) {
                    const range = this.spaceRequired(this.ships[k]);
                    for (let rangeX = range.startX; rangeX < range.endX; rangeX++) {
                        for (let rangeY = range.startY; rangeY < range.endY; rangeY++) {
                            if (this.arrayField[rangeY][rangeX] >= 0) {
                                this.arrayField[rangeY][rangeX] = -2;
                                this.generateLabel(rangeY, rangeX);
                            }
                        }
                    }
                    this.ships[k].isDead = true;
                    this.ships[k].isVisible = true;
                    this.generateShip(this.ships[k]);
                    break;
                }

            }

            let won = true;

            for (let i = 0; i < this.ships.length; i++) {
                if (!this.ships[i].isDead) {
                    won = false;
                    break;
                }
            }

            if (won) {
                if (this.fieldIndex == playerIndex) {
                    document.querySelector('.text_vs').innerHTML = 'Победа компьютера';
                }
                else {
                    document.querySelector('.text_vs').innerHTML = 'Вы победили!';
                }
            }
            return true;
        }
        return true;
    }
    //генерация кораблей
    generateShips() {
        for (let i = 0; i < this.ships.length; i++) {
            const ship = this.ships[i];
            this.generateShip(ship);
        }
    }
    //генерация корабля
    generateShip(ship) {
        let sizeX, sizeY;
        if (ship.dir == 0)
            sizeX = ship.size;
        else
            sizeX = 1;

        if (ship.dir == 1)
            sizeY = ship.size;
        else
            sizeY = 1;

        for (let k = ship.x; k < ship.x + sizeX; k++) {
            for (let l = ship.y; l < ship.y + sizeY; l++) {
                cells[this.fieldIndex][l][k].classList.add('field__ship');
            }
        }
    }
    //создание массива с данными о клетках
    createFieldArray() {
        for (let i = 0; i < 10; i++) {
            this.arrayField[i] = [];
            for (let j = 0; j < 10; j++) {
                this.arrayField[i][j] = 0;
            }
        }

        for (let i = 0; i < this.ships.length; i++) {
            const ship = this.ships[i];
            let sizeX, sizeY;

            if (ship.dir == 0)
                sizeX = ship.size;
            else
                sizeX = 1;

            if (ship.dir == 1)
                sizeY = ship.size;
            else
                sizeY = 1;

            for (let k = ship.x; k < ship.x + sizeX; k++) {
                for (let l = ship.y; l < ship.y + sizeY; l++) {
                    this.arrayField[l][k] = i + 1;
                }
            }
        }
    }
    //вычисление занимаемого кораблем области
    spaceRequired(ship) {
        let sizeX, sizeY, startX, startY, endX, endY;
        if (ship.dir == 0)
            sizeX = ship.size;
        else
            sizeX = 1;

        if (ship.dir == 1)
            sizeY = ship.size;
        else
            sizeY = 1;

        if (ship.x - 1 >= 0)
            startX = ship.x - 1;
        else
            startX = 0;

        if (ship.y - 1 >= 0)
            startY = ship.y - 1;
        else
            startY = 0;

        if (ship.x + sizeX + 1 < 10)
            endX = ship.x + sizeX + 1;
        else
            endX = 10;

        if (ship.y + sizeY + 1 < 10)
            endY = ship.y + sizeY + 1;
        else
            endY = 10;

        return { startX, startY, endX, endY };
    }
    //расстановка кораблей
    shipsPositioning() {
        this.ships = [];
        for (let size = 4; size >= 1; size--) {
            for (let count = 0; count < 5 - size; count++) {
                let arrange = false;

                while (!arrange) {
                    const ship = ({
                        x: Math.floor(Math.random() * 10),
                        y: Math.floor(Math.random() * 10),
                        dir: Math.round(Math.random()),
                        size,
                        isVisible: this.fieldVisible,
                        isDead: false
                    });

                    if (this.accessCheck(ship)) {
                        this.pushShips(ship);
                        arrange = true;
                    }

                }
            }
        }
        this.createFieldArray();
    }
    //
    pushShips(...ships) {
        for (let i in ships) {
            if (!this.ships.includes(ships[i])) this.ships.push(ships[i]);
        }
        this.accessibleFieldChange();
    }
    //проверка возможности расположения корабля
    accessCheck(ship) {
        if (
            (ship.dir == 0 && ship.x + ship.size > 10) ||
            (ship.dir == 1 && ship.y + ship.size > 10)
        )
            return false;
        let arrayField = this.accessibleField;
        if (arrayField == null) {
            arrayField = this.accessibleFieldChange();
        }
        if (ship.dir == 0)
            for (let i = 0; i < ship.size; i++) {
                if (!arrayField[ship.x + i][ship.y]) return false;
            }
        else
            for (let i = 0; i < ship.size; i++) {
                if (!arrayField[ship.x][ship.y + i]) return false;
            }
        return true;
    }
    //обновлние массива доступных клеток 
    accessibleFieldChange() {
        let arrayField = [];
        for (let i = 0; i < 11; i++) {
            arrayField[i] = [];
            for (let j = 0; j < 11; j++) {
                arrayField[i][j] = true;
            }
        }
        for (let i = 0; i < this.ships.length; i++) {
            const ship = this.ships[i];
            const range = this.spaceRequired(ship);
            for (let k = range.startX; k < range.endX; k++) {
                for (let l = range.startY; l < range.endY; l++) {
                    arrayField[k][l] = false;
                }
            }
        }
        this.accessibleField = arrayField;
        return arrayField;
    }
}

generateCells();

let fields = [];
for (let i = 0; i < 2; i++) {
    const field = new FieldShips(i, i == playerIndex);

    field.shipsPositioning();

    if (i == playerIndex)
        field.generateShips();
    fields.push(field);
}
playerNext();
name()
//реализация рестарта игры
const navbarButtonPlay = document.querySelector(".navbar__button_play")
navbarButtonPlay.addEventListener("click", function () {
    generateCells();
    document.querySelector('.text_vs').innerHTML = 'VS';
    for (let i = 0; i < fields.length; i++) {

        const field = new FieldShips(i, i == playerIndex);

        field.shipsPositioning();

        if (i == playerIndex)
            field.generateShips();

        fields[i] = field;

        clearTimeout(timerId);
    }

    playerMove = 1;
    playerNext();
});