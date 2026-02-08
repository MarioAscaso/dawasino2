document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return;

    const balanceEl = document.getElementById('currentBalance');
    const currentBetDisplay = document.getElementById('currentBetDisplay');
    const betStack = document.getElementById('betStack');
    const dealerCardsEl = document.getElementById('dealerCards');
    const playerCardsEl = document.getElementById('playerCards');
    const dealerScoreEl = document.getElementById('dealerScore');
    const playerScoreEl = document.getElementById('playerScore');
    const gameMessage = document.getElementById('gameMessage');
    const miniHistoryList = document.getElementById('miniHistoryList');
    const dealerShoeEl = document.getElementById('dealerShoe');

    const btnDeal = document.getElementById('btnDeal');
    const btnHit = document.getElementById('btnHit');
    const btnStand = document.getElementById('btnStand');
    const btnRestart = document.getElementById('btnRestart');
    const btnClearBet = document.getElementById('btnClearBet');
    const btnRepeat = document.getElementById('btnRepeat');
    const bettingControls = document.getElementById('bettingControls');
    const actionControls = document.getElementById('actionControls');

    let currentBet = 0;
    let lastBetAmount = 0;

    updateBalanceDisplay(user.balance);
    loadMiniHistory(user.id);

    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const val = parseInt(chip.getAttribute('data-value'));
            if (user.balance >= (currentBet + val)) {
                addChipToBet(val, chip.classList[1]);
            } else {
                alert("Saldo insuficiente");
            }
        });
    });

    function addChipToBet(value, colorClass) {
        currentBet += value;
        currentBetDisplay.textContent = `APUESTA: ${currentBet} €`;
        const miniChip = document.createElement('div');
        miniChip.className = `chip-mini ${colorClass}`;
        const originalChip = document.querySelector(`.${colorClass}`);
        if(originalChip) {
            const styles = getComputedStyle(originalChip);
            miniChip.style.background = styles.background;
            miniChip.style.borderColor = styles.borderColor;
            miniChip.style.color = styles.color;
        }
        miniChip.textContent = value;
        betStack.appendChild(miniChip);
    }

    btnClearBet.addEventListener('click', clearTableBet);

    btnRepeat.addEventListener('click', () => {
        if (lastBetAmount === 0 || user.balance < lastBetAmount) {
            alert("No se puede repetir la apuesta.");
            return;
        }
        clearTableBet();
        let amount = lastBetAmount;
        const chips = [{val:100, cls:'chip-100'},{val:25, cls:'chip-25'},{val:5, cls:'chip-5'},{val:1, cls:'chip-1'}];
        chips.forEach(c => {
            while(amount >= c.val) { addChipToBet(c.val, c.cls); amount -= c.val; }
        });
    });

    function clearTableBet() {
        currentBet = 0; currentBetDisplay.textContent = "APUESTA: 0 €"; betStack.innerHTML = '';
    }

    btnDeal.addEventListener('click', () => {
        if (currentBet === 0) { alert("Apuesta algo."); return; }
        lastBetAmount = currentBet;
        user.balance -= currentBet;
        updateBalanceDisplay(user.balance);
        playAction('deal', { bet: currentBet });
    });

    btnHit.addEventListener('click', () => playAction('hit', {}));
    btnStand.addEventListener('click', () => playAction('stand', {}));
    btnRestart.addEventListener('click', resetTable);

    async function playAction(action, data) {
        data.userId = user.id;
        try {
            const res = await fetch(`http://localhost:8989/api/blackjack/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) { alert(await res.text()); return; }
            
            const gameState = await res.json();
            
            user.balance = gameState.newBalance;
            localStorage.setItem('user', JSON.stringify(user));
            updateBalanceDisplay(gameState.newBalance);

            if (action === 'deal') {
                animateDeal(gameState);
            } else if (action === 'stand') {
                animateDealerTurn(gameState);
            } else {
                updateTableFast(gameState); // Hit
            }

            if (gameState.status !== "PLAYING" && action !== 'stand') {
                setTimeout(() => loadMiniHistory(user.id), 1000);
            }

        } catch (e) { console.error(e); }
    }

    async function animateDeal(state) {
        bettingControls.style.display = 'none';
        actionControls.style.display = 'flex';
        gameMessage.textContent = "";
        playerCardsEl.innerHTML = ''; dealerCardsEl.innerHTML = '';
        playerScoreEl.textContent = '0'; dealerScoreEl.textContent = '0';

        await dealCardTo(playerCardsEl, state.playerCards[0], 0);
        
        await dealCardTo(dealerCardsEl, state.dealerCards[0], 600);
        
        await dealCardTo(playerCardsEl, state.playerCards[1], 1200);
        playerScoreEl.textContent = state.playerScore;

        if(state.dealerCards.length > 1) {
            await dealCardTo(dealerCardsEl, state.dealerCards[1], 1800);
            dealerScoreEl.textContent = state.dealerScore; 
        }

        setTimeout(() => {
            if (state.status !== "PLAYING") endGame(state.status);
        }, 2500);
    }

    async function animateDealerTurn(state) {
        actionControls.style.display = 'none';

        const hiddenCardEl = dealerCardsEl.firstElementChild;
        if (hiddenCardEl && hiddenCardEl.classList.contains('card-hidden')) {
            hiddenCardEl.style.transform = "scaleX(0)";
            await new Promise(r => setTimeout(r, 200));
            
            const realCardVal = state.dealerCards[0];
            const isRed = realCardVal.includes('♥') || realCardVal.includes('♦');
            hiddenCardEl.className = `card ${isRed ? 'red' : 'black'}`;
            hiddenCardEl.textContent = realCardVal;
            
            hiddenCardEl.style.transform = "scaleX(1)"; 
            await new Promise(r => setTimeout(r, 500)); 
        }

        const currentCardsCount = dealerCardsEl.children.length;
        const totalCards = state.dealerCards.length;

        for (let i = currentCardsCount; i < totalCards; i++) {
            await dealCardTo(dealerCardsEl, state.dealerCards[i], 0);
            await new Promise(r => setTimeout(r, 1000)); 
        }

        dealerScoreEl.textContent = state.dealerScore;
        endGame(state.status);
        loadMiniHistory(user.id);
    }

    function dealCardTo(container, cardStr, delay) {
        return new Promise(resolve => {
            setTimeout(() => {
                const cardDiv = createCardElement(cardStr);
                container.appendChild(cardDiv);
                
                const shoeRect = dealerShoeEl.getBoundingClientRect();
                requestAnimationFrame(() => {
                   const cardRect = cardDiv.getBoundingClientRect();
                   const deltaX = shoeRect.left - cardRect.left;
                   const deltaY = shoeRect.top - cardRect.top;
                   cardDiv.style.setProperty('--startX', `${deltaX}px`);
                   cardDiv.style.setProperty('--startY', `${deltaY}px`);
                });

                resolve();
            }, delay);
        });
    }

    function createCardElement(cardStr) {
        const cardDiv = document.createElement('div');
        if (!cardStr || cardStr === "HIDDEN") {
             cardDiv.className = 'card card-hidden';
        } else {
            const isRed = cardStr.includes('♥') || cardStr.includes('♦');
            cardDiv.className = `card ${isRed ? 'red' : 'black'}`;
            cardDiv.textContent = cardStr;
        }
        return cardDiv;
    }

    function updateTableFast(state) {
        playerCardsEl.innerHTML = ''; dealerCardsEl.innerHTML = ''; 
        state.playerCards.forEach(c => playerCardsEl.appendChild(createCardElement(c)));
        state.dealerCards.forEach(c => dealerCardsEl.appendChild(createCardElement(c)));
        
        playerScoreEl.textContent = state.playerScore;
        dealerScoreEl.textContent = state.dealerScore;

        if (state.status !== "PLAYING") endGame(state.status);
    }

    function endGame(status) {
        actionControls.style.display = 'none';
        btnRestart.style.display = 'block';
        gameMessage.style.opacity = 1;
        if (status === "PLAYER_WIN") {
            gameMessage.textContent = "¡GANASTE!"; gameMessage.style.color = "#2ecc71";
        } else if (status === "DEALER_WIN") {
            gameMessage.textContent = "LA BANCA GANA"; gameMessage.style.color = "#ff4d4d";
        } else {
            gameMessage.textContent = "EMPATE"; gameMessage.style.color = "#ffd700";
        }
    }

    function resetTable() {
        btnRestart.style.display = 'none';
        bettingControls.style.display = 'flex';
        playerCardsEl.innerHTML = ''; dealerCardsEl.innerHTML = '';
        playerScoreEl.textContent = '0'; dealerScoreEl.textContent = '0';
        currentBet = 0; currentBetDisplay.textContent = "APUESTA: 0 €";
        betStack.innerHTML = '';
        gameMessage.textContent = "HAZ TU APUESTA"; gameMessage.style.color = "rgba(255,255,255,0.9)";
    }

    function updateBalanceDisplay(amount) {
        balanceEl.textContent = parseFloat(amount).toFixed(2);
    }

    async function loadMiniHistory(userId) {
        try {
            const res = await fetch(`http://localhost:8989/api/blackjack/history/${userId}`);
            if (res.ok) {
                const history = await res.json();
                renderMiniHistory(history.slice(0, 15));
            }
        } catch (e) {}
    }

    function renderMiniHistory(games) {
        miniHistoryList.innerHTML = '';
        games.forEach(game => {
            const li = document.createElement('li');
            li.className = 'history-item';
            const profit = parseFloat(game.winAmount - game.betAmount).toFixed(0);
            let resultClass = ''; let resultText = '';
            if (game.result === 'WIN') { resultClass = 'res-win'; resultText = 'W'; }
            else if (game.result === 'LOSE') { resultClass = 'res-lose'; resultText = 'L'; }
            else { resultClass = 'res-draw'; resultText = 'D'; }
            li.classList.add(resultClass);
            li.innerHTML = `<span>${resultText}</span><span>${profit > 0 ? '+' : ''}${profit}€</span>`;
            miniHistoryList.appendChild(li);
        });
    }
});