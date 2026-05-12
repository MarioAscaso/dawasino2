document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return;

    let placedBetsMap = {}; 
    let lastPlacedBets = []; 
    let selectedChipValue = 5;
    let selectedChipColor = '#d32f2f'; 
    let isSpinning = false;
    let currentRotation = 0; 

    const betAmountDisplay = document.getElementById('betAmountDisplay');
    const gameMessage = document.getElementById('gameMessage');
    const centerResult = document.getElementById('centerResult');
    const rouletteWheel = document.getElementById('rouletteWheel');
    const bettingTable = document.getElementById('bettingTable');
    const horizontalHistory = document.getElementById('horizontalHistory');
    
    const wheelOrder = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3];
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    const chipColors = { 1: '#0055ff', 5: '#d32f2f', 25: '#2ecc71', 100: '#222', 500: '#9b59b6' };

    init();

    function init() {
        updateDOMBalance(user.balance);
        generateBoard();
        generateWheel();
        
        document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', selectChip));
        document.querySelector('.chip-5')?.classList.add('selected'); 

        document.getElementById('btnClearBet').addEventListener('click', clearBet);
        document.getElementById('btnRepeat').addEventListener('click', repeatBet);
        document.getElementById('btnSpin').addEventListener('click', startSpin);

        loadHistory();
    }

    async function loadHistory() {
        const history = await api.get(`/roulette/history/${user.id}`);
        const uniqueHistory = []; let lastTime = 0;
        history.forEach(game => {
            const gameTime = new Date(game.playedAt).getTime();
            if (Math.abs(gameTime - lastTime) > 2000) { uniqueHistory.push(game); lastTime = gameTime; }
        });
        renderSharedHistory(uniqueHistory.slice(0, 15));
        renderHorizontalHistory(uniqueHistory.slice(0, 10)); 
    }

    function renderHorizontalHistory(recentGames) {
        horizontalHistory.innerHTML = '';
        recentGames.forEach(game => {
            if(game.resultNumber !== undefined && game.resultNumber !== null) {
                let colorClass = 'ball-green';
                if(game.resultNumber !== 0) colorClass = redNumbers.includes(game.resultNumber) ? 'ball-red' : 'ball-black';
                const ball = document.createElement('div'); ball.className = `history-ball ${colorClass}`; ball.textContent = game.resultNumber;
                horizontalHistory.appendChild(ball);
            }
        });
    }

    function generateBoard() {
        if(!bettingTable) return;
        for(let i=1; i<=36; i++) {
            const div = document.createElement('div'); div.textContent = i; div.className = `bet-cell ${redNumbers.includes(i) ? 'cell-red' : 'cell-black'}`;
            div.dataset.type = 'NUMBER'; div.dataset.value = i;
            div.style.gridColumn = Math.ceil(i / 3) + 1; div.style.gridRow = (i % 3 === 0) ? 1 : (i % 3 === 2 ? 2 : 3);
            div.addEventListener('click', handleBetClick); bettingTable.appendChild(div);
        }
        document.querySelectorAll('.bet-cell:not([data-type="NUMBER"])').forEach(c => c.addEventListener('click', handleBetClick));
        document.querySelector('.zero-cell').addEventListener('click', handleBetClick); 
    }

    function generateWheel() {
        if(!rouletteWheel) return;
        rouletteWheel.innerHTML = '';
        const step = 360 / wheelOrder.length;
        wheelOrder.forEach((num, i) => {
            const el = document.createElement('div'); el.className = 'wheelNumber';
            if(num===0) el.classList.add('green'); else el.classList.add(redNumbers.includes(num) ? 'red' : 'black');
            el.style.transform = `rotate(${i * step}deg)`; el.innerHTML = `<span>${num}</span>`;
            rouletteWheel.appendChild(el);
        });
    }

    function selectChip(e) {
        document.querySelectorAll('.chip').forEach(x => x.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        selectedChipValue = parseInt(e.currentTarget.dataset.value);
        selectedChipColor = chipColors[selectedChipValue];
    }

    function handleBetClick(e) {
        if(isSpinning) return;
        document.querySelectorAll('.winning-highlight').forEach(el => el.classList.remove('winning-highlight'));
        const cell = e.currentTarget; const type = cell.dataset.type; const value = cell.dataset.value; const key = `${type}-${value}`;

        if (placedBetsMap[key]) {
            placedBetsMap[key].amount += selectedChipValue;
            updateCellVisuals(cell, placedBetsMap[key].amount, selectedChipColor);
        } else {
            placedBetsMap[key] = { type, value, amount: selectedChipValue, cell };
            updateCellVisuals(cell, selectedChipValue, selectedChipColor);
        }
        updateUI();
    }

    function updateCellVisuals(cell, totalAmount, color) {
        let chipMarker = cell.querySelector('.chip-marker');
        if (!chipMarker) { chipMarker = document.createElement('div'); chipMarker.className = 'chip-marker'; cell.appendChild(chipMarker); }
        chipMarker.textContent = totalAmount >= 1000 ? (totalAmount/1000).toFixed(1)+'k' : totalAmount;
        chipMarker.style.backgroundColor = color;
    }

    function clearBet() {
        Object.values(placedBetsMap).forEach(bet => { const marker = bet.cell.querySelector('.chip-marker'); if(marker) marker.remove(); });
        placedBetsMap = {}; updateUI();
    }

    function repeatBet() {
        if(isSpinning) return;
        if(lastPlacedBets.length === 0) return showAlert('Aviso', 'No hay apuesta anterior para repetir.', 'info');
        const totalLastBet = lastPlacedBets.reduce((acc, b) => acc + b.amount, 0);
        if(user.balance < totalLastBet) return showAlert('Aviso', 'Saldo insuficiente para repetir la apuesta.', 'warning');

        clearBet(); 
        lastPlacedBets.forEach(bet => {
            let selector = bet.type === 'NUMBER' ? `.bet-cell[data-value="${bet.value}"][data-type="NUMBER"]` : `.bet-cell[data-value="${bet.value}"][data-type="${bet.type}"]`;
            const cell = document.querySelector(selector);
            if(cell) {
                const key = `${bet.type}-${bet.value}`; placedBetsMap[key] = { type: bet.type, value: bet.value, amount: bet.amount, cell: cell };
                let color = chipColors[100]; Object.keys(chipColors).forEach(k => { if(parseInt(k) <= bet.amount) color = chipColors[k]; });
                updateCellVisuals(cell, bet.amount, color);
            }
        });
        updateUI();
    }

    function updateUI() {
        const totalBet = Object.values(placedBetsMap).reduce((acc, bet) => acc + bet.amount, 0);
        betAmountDisplay.textContent = totalBet.toFixed(2) + " €";
        document.getElementById('btnSpin').disabled = totalBet <= 0 || isSpinning;
        if(!isSpinning) gameMessage.textContent = totalBet > 0 ? "APUESTA ACEPTADA" : "HAGA SUS APUESTAS";
    }

    async function startSpin() {
        const betsArray = Object.values(placedBetsMap);
        const totalBet = betsArray.reduce((acc, bet) => acc + bet.amount, 0);
        
        if(user.balance < totalBet) return showAlert('Saldo insuficiente', 'No tienes saldo suficiente para esta apuesta.', 'error');
        
        lastPlacedBets = betsArray.map(b => ({ type: b.type, value: b.value, amount: b.amount }));
        document.querySelectorAll('.winning-highlight').forEach(el => el.classList.remove('winning-highlight'));

        isSpinning = true; gameMessage.textContent = "NO VA MÁS"; updateUI(); 
        user.balance -= totalBet; updateDOMBalance(user.balance);

        try {
            const payload = { userId: user.id, bets: betsArray.map(b => ({ betType: b.type, betValue: b.type === 'NUMBER' ? b.value.toString() : b.value, betAmount: b.amount })) };
            const result = await api.post('/roulette/spin', payload);

            // CORRECCIÓN MATEMÁTICA PARA LA FLECHA (Eliminada la suma fantasma)
            const index = wheelOrder.indexOf(result.winningNumber);
            const segment = 360 / 37;
            const targetAngle = 360 - (index * segment); 
            
            currentRotation += (5 * 360) + targetAngle - (currentRotation % 360);
            rouletteWheel.style.transform = `rotate(${currentRotation}deg)`;

            setTimeout(() => finishGame(result), 4000);
        } catch (e) {
            user.balance += totalBet; isSpinning = false; updateUI(); updateDOMBalance(user.balance);
        }
    }

    function finishGame(data) {
        centerResult.textContent = data.winningNumber;
        const color = data.color || (redNumbers.includes(data.winningNumber) ? 'RED' : (data.winningNumber===0?'GREEN':'BLACK'));
        centerResult.className = `centerResult res-${color.toLowerCase()}`;

        const winningCell = document.querySelector(`.bet-cell[data-value="${data.winningNumber}"][data-type="NUMBER"]`);
        if(winningCell) { winningCell.classList.add('winning-highlight'); setTimeout(() => winningCell.classList.remove('winning-highlight'), 3500); }

        if(data.winAmount > 0) { gameMessage.textContent = `¡GANASTE ${data.winAmount} €!`; gameMessage.style.color = "var(--primary)"; } 
        else { gameMessage.textContent = "INTÉNTALO DE NUEVO"; gameMessage.style.color = "#fff"; }

        updateLocalUser(data.newBalance); updateDOMBalance(data.newBalance); loadHistory(); 
        isSpinning = false; clearBet(); 
    }
});