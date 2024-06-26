const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const victoryMessageElement = document.getElementById('victoryMessage');
const hackAlert = document.getElementById('hackAlert');

context.scale(30, 30);

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const arena = createMatrix(10, 20);

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0
};

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
    updateScore();
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
        } else if (type === 'I') {
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
            ];
        } else if (type === 'S') {
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        } else if (type === 'Z') {
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
        }
    }
    
    function draw() {
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);
    
        drawMatrix(arena, { x: 0, y: 0 });
        drawMatrix(player.matrix, player.pos);
    }
    
    function drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = colors[value];
                    context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }
    
    function merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }
    
    function playerDrop() {
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            merge(arena, player);
            playerReset();
            arenaSweep();
            updateScore();
        }
        dropCounter = 0;
    }
    
    function playerMove(dir) {
        player.pos.x += dir;
        if (collide(arena, player)) {
            player.pos.x -= dir;
        }
    }
    
    function playerRotate(dir) {
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix, dir);
        while (collide(arena, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                rotate(player.matrix, -dir);
                player.pos.x = pos;
                return;
            }
        }
    }
    
    function rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y],
                    matrix[y][x],
                ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
            }
        }
    
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }
    function hideAfterDelay(elementId, delayInSeconds) {
        setTimeout(() => {
            document.getElementById(elementId).style.display = 'none';
        }, delayInSeconds * 1000);
    }
    
    
    function hideMessages() {
        victoryMessageElement.style.display = 'none';
        gameOverElement.style.display = 'none';
    }
    
    function showVictoryMessage() {
        hideMessages();
        victoryMessageElement.style.display = 'block';
        showPlayerIp();
        hideAfterDelay('playerIp', 5); // Oculta o IP após 5 segundos
    }
    
    function showGameOver() {
        hideMessages();
        gameOverElement.style.display = 'block';
        showPlayerIp();
        hideAfterDelay('playerIp', 5); // Oculta o IP após 5 segundos
    }
    
    function showPlayerIp() {
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                document.getElementById('playerIp').innerText = 'Seu IP: ' + data.ip;
            })
            .catch(() => {
                document.getElementById('playerIp').innerText = 'IP não encontrado';
            });
    }
    
    function showModal() {
        hackAlert.style.display = 'flex';
    }
    
    function closeModal() {
        hackAlert.style.display = 'none';
    }
    
    function playerReset() {
        const pieces = 'ILJOTSZ';
        player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    
        hideMessages(); // Esconde mensagens ao iniciar um novo jogo
    
        if (collide(arena, player)) {
            arena.forEach(row => row.fill(0));
            player.score = 0;
            updateScore();
            showGameOver(); // Mostra mensagem de derrota
            showModal();
        }
    }
    
    function updateScore() {
        
        scoreElement.innerText = 'Pontuação: ' + player.score;
        
    }
    document.addEventListener('keydown', event => {
        if (event.keyCode === 37) {
            playerMove(-1);
        } else if (event.keyCode === 39) {
            playerMove(1);
        } else if (event.keyCode === 40) {
            playerDrop();
        } else if (event.keyCode === 38) {
            playerRotate(-1);
        }
    });
    
    let dropCounter = 0;
    let dropInterval = 1000;
    
    let lastTime = 0;
    function update(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;
    
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
    
        if (player.score >= 100) {
            showVictoryMessage();
          
        } else {
            updateScore();
        }
    
        draw();
        requestAnimationFrame(update);
    }
    
    
    playerReset();
    updateScore();
    update();
    
    