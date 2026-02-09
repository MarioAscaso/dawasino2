document.addEventListener('DOMContentLoaded', () => {
    // 1. AUTH CHECK
    const user = checkAuth();
    if (!user) return;

    // --- DOM ---
    const currentBetDisplay = document.getElementById('currentBetDisplay');
    const betStack = document.getElementById('betStack');
    const dealerCardsEl = document.getElementById('dealerCards');
    const playerCardsEl = document.getElementById('playerCards');
    const dealerScoreEl = document.getElementById('dealerScore');
    const playerScoreEl = document.getElementById('playerScore');
    const gameMessage = document.getElementById('gameMessage');
    const dealerShoeEl = document.getElementById('dealerShoe');

    const btnDeal = document.getElementById('btnDeal');
    const btnHit = document.getElementById('btnHit');
    const btnStand = document.getElementById('btnStand');
    const btnRestart = document.getElementById('btnRestart');
    const btnClearBet = document.getElementById('btnClearBet');
    const btnRepeat = document.getElementById('btnRepeat');
    
    const bettingControls = document.getElementById('bettingControls');
    const actionControls = document.getElementById('actionControls');

    // --- ESTADO ---
    let currentBet = 0;
    let lastBetAmount = 0;

    // Init
    updateDOMBalance(user.balance);
    loadHistory(); // Carga inicial del historial

    // --- INTERACCIÓN ---
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const val = parseInt(chip.dataset.value);
            if (user.balance >= (currentBet + val)) {
                const computedColor = getComputedStyle(chip).backgroundColor;
                addChipToBet(val, computedColor);
            } else {
                alert("Saldo insuficiente");
            }
        });
    });

    function addChipToBet(value, color) {
        currentBet += value;
        currentBetDisplay.textContent = `APUESTA: ${currentBet} €`;
        
        const miniChip = document.createElement('div');
        miniChip.className = 'chip-mini';
        miniChip.style.backgroundColor = color;
        miniChip.textContent = value;
        betStack.appendChild(miniChip);
    }

    btnClearBet.addEventListener('click', clearTableBet);

    btnRepeat.addEventListener('click', () => {
        if (lastBetAmount === 0 || user.balance < lastBetAmount) return alert("Imposible repetir");
        
        clearTableBet();
        addChipToBet(lastBetAmount, '#ffd700'); 
    });

    function clearTableBet() {
        currentBet = 0; 
        currentBetDisplay.textContent = "APUESTA: 0 €"; 
        betStack.innerHTML = '';
    }

    // --- ACCIONES ---
    btnDeal.addEventListener('click', () => {
        if (currentBet === 0) return alert("Apuesta algo.");
        
        lastBetAmount = currentBet;
        user.balance -= currentBet;
        updateDOMBalance(user.balance);
        
        playAction('/blackjack/deal', { userId: user.id, bet: currentBet }, 'deal');
    });

    btnHit.addEventListener('click', () => playAction('/blackjack/hit', { userId: user.id }));
    btnStand.addEventListener('click', () => playAction('/blackjack/stand', { userId: user.id }, 'stand'));
    btnRestart.addEventListener('click', resetTable);

    async function playAction(endpoint, body, actionType = null) {
        try {
            const gameState = await api.post(endpoint, body);
            
            updateLocalUser(gameState.newBalance);
            updateDOMBalance(gameState.newBalance);

            if (actionType === 'deal') {
                animateDeal(gameState);
            } else if (actionType === 'stand') {
                animateDealerTurn(gameState);
            } else {
                updateTableFast(gameState);
            }

            // Si el juego ha terminado (Win/Lose/Draw), recargar historial
            if (gameState.status !== "PLAYING" && actionType !== 'stand') {
                setTimeout(loadHistory, 1500);
            }

        } catch (e) {
            console.error(e);
            if(actionType === 'deal') {
                user.balance += currentBet;
                updateDOMBalance(user.balance);
            }
        }
    }

    // --- ANIMACIONES ---
    async function animateDeal(state) {
        bettingControls.style.display = 'none';
        actionControls.style.display = 'flex';
        gameMessage.textContent = "";
        playerCardsEl.innerHTML = ''; dealerCardsEl.innerHTML = '';
        playerScoreEl.textContent = '0'; dealerScoreEl.textContent = '0';

        await dealCardTo(playerCardsEl, state.playerCards[0], 0);
        await dealCardTo(dealerCardsEl, state.dealerCards[0], 400);
        await dealCardTo(playerCardsEl, state.playerCards[1], 800);
        
        if(state.dealerCards.length > 1) {
            await dealCardTo(dealerCardsEl, state.dealerCards[1], 1200);
        }
        
        setTimeout(() => {
            playerScoreEl.textContent = state.playerScore;
            if (state.status !== "PLAYING") endGame(state.status);
        }, 1600);
    }

    async function animateDealerTurn(state) {
        actionControls.style.display = 'none';

        const hiddenCardEl = dealerCardsEl.firstElementChild;
        if (hiddenCardEl && hiddenCardEl.classList.contains('card-hidden')) {
            hiddenCardEl.style.transform = "scaleX(0)";
            await wait(200);
            
            const realCardVal = state.dealerCards[0];
            const isRed = realCardVal.includes('♥') || realCardVal.includes('♦');
            hiddenCardEl.className = `card ${isRed ? 'red' : 'black'}`;
            hiddenCardEl.textContent = realCardVal;
            hiddenCardEl.style.transform = "scaleX(1)"; 
            await wait(400);
        }

        const currentCount = dealerCardsEl.children.length;
        for (let i = currentCount; i < state.dealerCards.length; i++) {
            await dealCardTo(dealerCardsEl, state.dealerCards[i], 0);
            await wait(600);
        }

        dealerScoreEl.textContent = state.dealerScore;
        endGame(state.status);
        
        // Recargar historial al finalizar turno dealer
        setTimeout(loadHistory, 1000);
    }

    function dealCardTo(container, cardStr, delay) {
        return new Promise(resolve => {
            setTimeout(() => {
                const cardDiv = createCardElement(cardStr);
                container.appendChild(cardDiv);
                
                // Animación simple si el zapato no está visible o calculado
                if(dealerShoeEl) {
                    const shoeRect = dealerShoeEl.getBoundingClientRect();
                    requestAnimationFrame(() => {
                       const cardRect = cardDiv.getBoundingClientRect();
                       cardDiv.style.setProperty('--startX', `${shoeRect.left - cardRect.left}px`);
                       cardDiv.style.setProperty('--startY', `${shoeRect.top - cardRect.top}px`);
                    });
                }
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
            gameMessage.textContent = "¡GANASTE!"; gameMessage.style.color = "var(--success)";
        } else if (status === "DEALER_WIN") {
            gameMessage.textContent = "LA BANCA GANA"; gameMessage.style.color = "var(--danger)";
        } else {
            gameMessage.textContent = "EMPATE"; gameMessage.style.color = "var(--warning)";
        }
    }

    function resetTable() {
        btnRestart.style.display = 'none';
        bettingControls.style.display = 'flex';
        playerCardsEl.innerHTML = ''; dealerCardsEl.innerHTML = '';
        playerScoreEl.textContent = '0'; dealerScoreEl.textContent = '0';
        clearTableBet();
        gameMessage.textContent = "HAZ TU APUESTA"; gameMessage.style.color = "#fff";
    }

    // --- HISTORIAL ---
    async function loadHistory() {
        // Usa la función helper de common.js: renderSharedHistory
        // Asegúrate de que common.js está cargado antes en el HTML
        try {
            const history = await api.get(`/blackjack/history/${user.id}`);
            renderSharedHistory(history.slice(0, 15), 'miniHistoryList');
        } catch(e) { console.error("Error cargando historial", e); }
    }

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
});