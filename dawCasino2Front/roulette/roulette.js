document.addEventListener('DOMContentLoaded', () => {
    // 1. AUTH
    const user = checkAuth();
    if (!user) return;

    // --- VARIABLES ---
    let currentBetAmount = 0;
    let selectedChipValue = 5;
    let selectedChipColor = '#d32f2f'; 
    let selectedBetType = null;
    let selectedBetValue = null;
    let lastBet = null;
    let isSpinning = false;

    // --- DOM ---
    const balanceDisplay = document.getElementById('currentBalance');
    const betAmountDisplay = document.getElementById('betAmountDisplay');
    const gameMessage = document.getElementById('gameMessage');
    const centerResult = document.getElementById('centerResult');
    const rouletteWheel = document.getElementById('rouletteWheel');
    const bettingTable = document.getElementById('bettingTable'); // Contenedor Grid
    const miniHistoryList = document.getElementById('miniHistoryList');

    const btnSpin = document.getElementById('btnSpin');
    const btnClear = document.getElementById('btnClearBet');
    const btnRepeat = document.getElementById('btnRepeat');

    // CONFIGURACIÓN RUEDA (Orden real europea)
    const wheelOrder = [
        0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
        5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3
    ];
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

    const chipColors = {
        1: '#0055ff', 5: '#d32f2f', 25: '#2ecc71', 100: '#222', 500: '#9b59b6'
    };

    // --- INIT ---
    function init() {
        updateBalanceDisplay(user.balance);
        generateBoard();
        generateWheel();
        
        // Chip por defecto
        document.querySelector('.chip-5')?.classList.add('selected');
        
        loadHistory(user.id);
    }

    function updateBalanceDisplay(amount) {
        if(balanceDisplay) balanceDisplay.textContent = parseFloat(amount).toFixed(2) + " €";
    }

    // --- GENERACIÓN TABLERO (Grid Logic) ---
    function generateBoard() {
        if(!bettingTable) return;
        
        // Generar 1-36 y añadirlos al Grid
        for(let i=1; i<=36; i++) {
            const div = document.createElement('div');
            div.textContent = i;
            div.className = 'bet-cell';
            div.classList.add(redNumbers.includes(i) ? 'cell-red' : 'cell-black');
            div.dataset.type = 'NUMBER';
            div.dataset.value = i;

            // Calcular posición Grid
            // Columna: (i-1)/3 + 2 (porque la 1 es el 0) -> Math.ceil(i/3) + 1
            const col = Math.ceil(i / 3) + 1;
            // Fila: 3,6,9 arriba (fila 1). 2,5,8 medio (2). 1,4,7 abajo (3).
            // Formula: Si resto es 0 -> fila 1. Si resto 2 -> fila 2. Si resto 1 -> fila 3.
            let row;
            if(i % 3 === 0) row = 1;
            else if(i % 3 === 2) row = 2;
            else row = 3;

            div.style.gridColumn = col;
            div.style.gridRow = row;

            div.addEventListener('click', handleBetClick);
            bettingTable.appendChild(div);
        }
    }

    // --- GENERACIÓN RUEDA ---
    function generateWheel() {
        if(!rouletteWheel) return;
        rouletteWheel.innerHTML = '';
        const step = 360 / wheelOrder.length;

        wheelOrder.forEach((num, i) => {
            const el = document.createElement('div');
            el.className = 'wheelNumber';
            
            // Asignar clase de color
            if(num === 0) el.classList.add('green');
            else if(redNumbers.includes(num)) el.classList.add('red');
            else el.classList.add('black');

            el.style.transform = `rotate(${i * step}deg)`;
            
            const span = document.createElement('span');
            span.textContent = num;
            el.appendChild(span);

            rouletteWheel.appendChild(el);
        });
    }

    // --- HISTORIAL (Lógica Blackjack Corregida) ---
    async function loadHistory(uid) {
        try {
            const res = await fetch(`http://localhost:8989/api/roulette/history/${uid}`);
            if(res.ok) {
                const history = await res.json();
                renderMiniHistory(history.slice(0, 15));
            }
        } catch(e){}
    }

    function renderMiniHistory(games) {
        if(!miniHistoryList) return;
        miniHistoryList.innerHTML = '';
        
        games.forEach(game => {
            // Check si viene como resultNumber (historial) o winningNumber (spin)
            const num = game.resultNumber !== undefined ? game.resultNumber : game.winningNumber;
            // Check winAmount/betAmount
            const profit = game.winAmount - game.betAmount;
            
            addHistoryItemToDOM(num, profit, false);
        });
    }

    function addHistoryItemToDOM(number, profit, prepend = false) {
        const li = document.createElement('li');
        li.className = 'history-item';
        
        let resultClass = 'res-lose';
        let resultText = 'L'; // Lose
        
        if (profit > 0) { 
            resultClass = 'res-win'; 
            resultText = 'W'; 
        } else if (profit === 0) { // Empate o recuperación
             resultClass = 'res-draw';
             resultText = 'D';
        }

        li.classList.add(resultClass);
        
        // HTML: W (17)   +20€
        li.innerHTML = `
            <span>${resultText} (${number})</span>
            <span class="history-val">${profit > 0 ? '+' : ''}${parseFloat(profit).toFixed(0)}€</span>
        `;
        
        if (prepend) miniHistoryList.prepend(li);
        else miniHistoryList.appendChild(li);

        if(prepend && miniHistoryList.children.length > 15) miniHistoryList.lastChild.remove();
    }

    // --- EVENTOS ---
    document.querySelectorAll('.chip').forEach(c => {
        c.addEventListener('click', () => {
            document.querySelectorAll('.chip').forEach(x => x.classList.remove('selected'));
            c.classList.add('selected');
            selectedChipValue = parseInt(c.dataset.value);
            selectedChipColor = chipColors[selectedChipValue];
        });
    });

    // Listeners casillas estáticas
    document.querySelectorAll('.bet-cell:not([data-value="generated"])').forEach(cell => {
        // Excluimos las que acabamos de generar si tuvieran marca, pero las generadas no están en el DOM inicial
        cell.addEventListener('click', handleBetClick);
    });

    function handleBetClick(e) {
        if(isSpinning) return;
        const cell = e.currentTarget;

        // Limpiar anterior
        document.querySelectorAll('.bet-cell').forEach(c => c.classList.remove('active'));
        
        selectedBetType = cell.dataset.type;
        selectedBetValue = cell.dataset.value;
        currentBetAmount = selectedChipValue;

        // Visual
        cell.classList.add('active');
        cell.style.setProperty('--chip-color', selectedChipColor);

        updateUI();
    }

    // Botones
    btnClear.addEventListener('click', () => {
        currentBetAmount = 0; selectedBetType = null;
        document.querySelectorAll('.bet-cell').forEach(c => c.classList.remove('active'));
        updateUI();
    });

    btnRepeat.addEventListener('click', () => {
        if(!lastBet) return;
        if(user.balance < lastBet.amount) { alert("Saldo insuficiente"); return; }

        currentBetAmount = lastBet.amount;
        selectedBetType = lastBet.type;
        selectedBetValue = lastBet.value;
        selectedChipColor = chipColors[100]; // Default color

        document.querySelectorAll('.bet-cell').forEach(c => c.classList.remove('active'));
        
        // Buscar celda
        let selector;
        if(selectedBetType === 'NUMBER') {
            const els = document.querySelectorAll(`div[data-type="NUMBER"]`);
            for(let el of els) { if(el.dataset.value == selectedBetValue) { selector = el; break; }}
        } else {
            selector = document.querySelector(`div[data-type="${selectedBetType}"][data-value="${selectedBetValue}"]`);
        }

        if(selector) {
            selector.classList.add('active');
            selector.style.setProperty('--chip-color', selectedChipColor);
        }
        updateUI();
    });

    btnSpin.addEventListener('click', async () => {
        if(currentBetAmount <= 0) return;
        if(user.balance < currentBetAmount) { alert("Sin saldo"); return; }
        startSpin();
    });

    function updateUI() {
        betAmountDisplay.textContent = currentBetAmount.toFixed(2) + " €";
        btnSpin.disabled = currentBetAmount <= 0 || isSpinning;
        btnClear.disabled = currentBetAmount <= 0 || isSpinning;
        btnRepeat.disabled = !lastBet || isSpinning;
        
        if(!isSpinning) {
            if(currentBetAmount > 0) gameMessage.textContent = "¡APUESTA ACEPTADA!";
            else gameMessage.textContent = "HAGA SUS APUESTAS";
        }
    }

    // --- GAMEPLAY ---
    async function startSpin() {
        isSpinning = true;
        gameMessage.textContent = "NO VA MÁS";
        
        lastBet = { type: selectedBetType, value: selectedBetValue, amount: currentBetAmount };
        user.balance -= currentBetAmount;
        updateBalanceDisplay(user.balance);

        try {
            const payload = {
                userId: user.id,
                betAmount: currentBetAmount,
                betType: selectedBetType,
                betValue: selectedBetType === 'NUMBER' ? selectedBetValue.toString() : selectedBetValue
            };

            const res = await fetch('http://localhost:8989/api/roulette/spin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if(!res.ok) throw new Error();
            const result = await res.json();

            // Animación
            const index = wheelOrder.indexOf(result.winningNumber);
            const step = 360 / wheelOrder.length;
            const rotation = (5 * 360) - (index * step);
            
            rouletteWheel.style.transform = `rotate(${rotation}deg)`;

            setTimeout(() => {
                finishGame(result);
            }, 4000);

        } catch (e) {
            console.error(e);
            user.balance += currentBetAmount;
            updateBalanceDisplay(user.balance);
            isSpinning = false;
            updateUI();
        }
    }

    function finishGame(data) {
        centerResult.textContent = data.winningNumber;
        const color = data.color || (redNumbers.includes(data.winningNumber) ? 'RED' : (data.winningNumber===0?'GREEN':'BLACK'));
        centerResult.className = `centerResult ${color==='RED'?'res-red':(color==='GREEN'?'res-green':'res-black')}`;

        if(data.winAmount > 0) {
            gameMessage.textContent = `¡GANASTE ${data.winAmount} €!`;
            gameMessage.style.color = "#ffd700";
        } else {
            gameMessage.textContent = "INTÉNTALO DE NUEVO";
            gameMessage.style.color = "#fff";
        }

        user.balance = data.newBalance;
        localStorage.setItem('user', JSON.stringify(user));
        updateBalanceDisplay(user.balance);

        // Añadir al historial localmente
        const profit = data.winAmount - lastBet.amount; // Profit real de esta jugada
        addHistoryItemToDOM(data.winningNumber, profit, true);

        isSpinning = false;
        currentBetAmount = 0;
        document.querySelectorAll('.bet-cell').forEach(c => c.classList.remove('active'));
        
        setTimeout(() => {
            updateUI();
            gameMessage.style.color = "#ffd700";
            centerResult.textContent = "DAW";
            centerResult.className = "centerResult";
        }, 3000);
    }

    init();
});