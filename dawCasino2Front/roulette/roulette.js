document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return;

    // --- VARIABLES ---
    let currentBetAmount = 0;
    let selectedChipValue = 5;
    let selectedChipColor = '#d32f2f'; 
    let selectedBetType = null, selectedBetValue = null;
    let lastBet = null, isSpinning = false;

    // --- DOM ---
    const betAmountDisplay = document.getElementById('betAmountDisplay');
    const gameMessage = document.getElementById('gameMessage');
    const centerResult = document.getElementById('centerResult');
    const rouletteWheel = document.getElementById('rouletteWheel');
    const bettingTable = document.getElementById('bettingTable');
    
    // Configuración Ruleta
    const wheelOrder = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3];
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    const chipColors = { 1: '#0055ff', 5: '#d32f2f', 25: '#2ecc71', 100: '#222', 500: '#9b59b6' };

    init();

    function init() {
        updateDOMBalance(user.balance);
        generateBoard();
        generateWheel();
        
        // Eventos Fichas (Delegación simple si fuera necesario, aquí directo)
        document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', selectChip));
        document.querySelector('.chip-5')?.classList.add('selected'); // Default

        // Eventos Botones
        document.getElementById('btnClearBet').addEventListener('click', clearBet);
        document.getElementById('btnRepeat').addEventListener('click', repeatBet);
        document.getElementById('btnSpin').addEventListener('click', startSpin);

        // Cargar historial
        loadHistory();
    }

    async function loadHistory() {
        // Usamos la función de common.js
        const history = await api.get(`/roulette/history/${user.id}`);
        renderSharedHistory(history.slice(0, 15));
    }

    // --- LÓGICA VISUAL ---
    function generateBoard() {
        if(!bettingTable) return;
        // Solo generamos los numéricos, los estáticos ya están en el HTML para mantener orden del grid
        for(let i=1; i<=36; i++) {
            const div = document.createElement('div');
            div.textContent = i;
            div.className = `bet-cell ${redNumbers.includes(i) ? 'cell-red' : 'cell-black'}`;
            div.dataset.type = 'NUMBER';
            div.dataset.value = i;

            // Grid Layout Math
            div.style.gridColumn = Math.ceil(i / 3) + 1;
            div.style.gridRow = (i % 3 === 0) ? 1 : (i % 3 === 2 ? 2 : 3);

            div.addEventListener('click', handleBetClick);
            bettingTable.appendChild(div);
        }
        // Listeners para celdas estáticas
        document.querySelectorAll('.bet-cell:not([data-type="NUMBER"])').forEach(c => c.addEventListener('click', handleBetClick));
        document.querySelector('.zero-cell').addEventListener('click', handleBetClick); // 0 es NUMBER pero estático en HTML
    }

    function generateWheel() {
        if(!rouletteWheel) return;
        rouletteWheel.innerHTML = '';
        const step = 360 / wheelOrder.length;
        wheelOrder.forEach((num, i) => {
            const el = document.createElement('div');
            el.className = 'wheelNumber';
            if(num===0) el.classList.add('green');
            else el.classList.add(redNumbers.includes(num) ? 'red' : 'black');
            
            el.style.transform = `rotate(${i * step}deg)`;
            el.innerHTML = `<span>${num}</span>`;
            rouletteWheel.appendChild(el);
        });
    }

    // --- INTERACCIÓN ---
    function selectChip(e) {
        document.querySelectorAll('.chip').forEach(x => x.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        selectedChipValue = parseInt(e.currentTarget.dataset.value);
        selectedChipColor = chipColors[selectedChipValue];
    }

    function handleBetClick(e) {
        if(isSpinning) return;
        document.querySelectorAll('.bet-cell').forEach(c => c.classList.remove('active'));
        
        const cell = e.currentTarget;
        selectedBetType = cell.dataset.type;
        selectedBetValue = cell.dataset.value;
        currentBetAmount = selectedChipValue;

        cell.classList.add('active');
        cell.style.setProperty('--chip-color', selectedChipColor);
        updateUI();
    }

    function clearBet() {
        currentBetAmount = 0; selectedBetType = null;
        document.querySelectorAll('.bet-cell').forEach(c => c.classList.remove('active'));
        updateUI();
    }

    function repeatBet() {
        if(!lastBet || user.balance < lastBet.amount) return alert("Imposible repetir");
        
        currentBetAmount = lastBet.amount;
        selectedBetType = lastBet.type;
        selectedBetValue = lastBet.value;
        
        // Simular click visualmente
        const selector = selectedBetType === 'NUMBER' 
            ? `.bet-cell[data-value="${selectedBetValue}"][data-type="NUMBER"]`
            : `.bet-cell[data-value="${selectedBetValue}"][data-type="${selectedBetType}"]`;
            
        const cell = document.querySelector(selector);
        if(cell) {
            document.querySelectorAll('.bet-cell').forEach(c => c.classList.remove('active'));
            cell.classList.add('active');
            cell.style.setProperty('--chip-color', chipColors[100]); // Color genérico al repetir
        }
        updateUI();
    }

    function updateUI() {
        betAmountDisplay.textContent = currentBetAmount.toFixed(2) + " €";
        document.getElementById('btnSpin').disabled = currentBetAmount <= 0 || isSpinning;
        if(!isSpinning) gameMessage.textContent = currentBetAmount > 0 ? "APUESTA ACEPTADA" : "HAGA SUS APUESTAS";
    }

    // --- JUEGO ---
    async function startSpin() {
        if(user.balance < currentBetAmount) return alert("Sin saldo");
        
        isSpinning = true;
        gameMessage.textContent = "NO VA MÁS";
        updateUI(); // Deshabilita botones
        
        lastBet = { type: selectedBetType, value: selectedBetValue, amount: currentBetAmount };
        user.balance -= currentBetAmount;
        updateDOMBalance(user.balance);

        try {
            // Usamos helper de common.js
            const result = await api.post('/roulette/spin', {
                userId: user.id,
                betAmount: currentBetAmount,
                betType: selectedBetType,
                betValue: selectedBetType === 'NUMBER' ? selectedBetValue.toString() : selectedBetValue
            });

            // Animación
            const index = wheelOrder.indexOf(result.winningNumber);
            const rotation = (5 * 360) - (index * (360/37));
            rouletteWheel.style.transform = `rotate(${rotation}deg)`;

            setTimeout(() => finishGame(result), 4000);

        } catch (e) {
            console.error(e);
            user.balance += currentBetAmount; // Rollback
            isSpinning = false;
            updateUI();
        }
    }

    function finishGame(data) {
        centerResult.textContent = data.winningNumber;
        const color = data.color || (redNumbers.includes(data.winningNumber) ? 'RED' : (data.winningNumber===0?'GREEN':'BLACK'));
        centerResult.className = `centerResult res-${color.toLowerCase()}`;

        if(data.winAmount > 0) {
            gameMessage.textContent = `¡GANASTE ${data.winAmount} €!`;
            gameMessage.style.color = "var(--gold)";
        } else {
            gameMessage.textContent = "INTÉNTALO DE NUEVO";
            gameMessage.style.color = "#fff";
        }

        updateLocalUser(data.newBalance);
        updateDOMBalance(data.newBalance);
        loadHistory(); // Refresca sidebar

        isSpinning = false;
        clearBet(); // Limpia mesa
        setTimeout(() => { centerResult.textContent = "DAW"; centerResult.className = "centerResult"; }, 3000);
    }
});