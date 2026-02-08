document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return;

    // --- Referencias DOM (Igual que en Blackjack) ---
    const balanceEl = document.getElementById('currentBalance');
    const betAmountDisplay = document.getElementById('betAmountDisplay');
    const selectedBetInfo = document.getElementById('selectedBetInfo'); // Info textual de la apuesta
    const miniHistoryList = document.getElementById('miniHistoryList'); // Para el sidebar igual que en BJ
    
    // Elementos específicos de Ruleta
    const numbersGrid = document.getElementById('numbersGrid');
    const wheel = document.getElementById('rouletteWheel');
    const resultDisplay = document.getElementById('resultDisplay');
    
    // --- Controles de Apuesta (Igual que en Blackjack) ---
    const btnSpin = document.getElementById('btnSpin');
    const btnClearBet = document.getElementById('btnClearBet'); // Debes añadir este botón al HTML si no está
    const btnRepeat = document.getElementById('btnRepeat');     // Debes añadir este botón al HTML si no está
    const chips = document.querySelectorAll('.chip');

    // --- Estado del Juego ---
    let currentBetAmount = 0;
    let currentChipValue = 0; // Valor de ficha seleccionado
    
    // Objeto para la apuesta activa (Modelo simplificado estilo Blackjack: 1 apuesta principal)
    let activeBet = null; // { type: 'NUMBER', value: '17', element: div }
    
    let lastBetData = null; // Para botón Repetir { amount: 100, type: '...', value: '...' }
    let isSpinning = false;

    // Inicialización
    updateBalanceDisplay(user.balance);
    loadMiniHistory(user.id);
    generateGrid();     // Genera los números 1-36
    setupEventListeners();

    // ---------------------------------------------------------
    // 1. GESTIÓN DEL TABLERO Y FICHAS
    // ---------------------------------------------------------

    function generateGrid() {
        const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
        if(!numbersGrid) return;
        
        for (let i = 1; i <= 36; i++) {
            const div = document.createElement('div');
            div.textContent = i;
            div.classList.add('betSpot');
            div.classList.add(redNumbers.includes(i) ? 'red' : 'black');
            div.dataset.type = 'NUMBER';
            div.dataset.value = i;
            div.addEventListener('click', handleSpotClick);
            numbersGrid.appendChild(div);
        }
    }

    function setupEventListeners() {
        // Listeners para casillas estáticas (0, Rojo, Negro, Par, Impar)
        document.querySelectorAll('.betSpot').forEach(spot => {
            // Evitamos duplicar listeners en los generados dinámicamente
            if (!spot.parentElement.classList.contains('numbersGrid')) {
                spot.addEventListener('click', handleSpotClick);
            }
        });

        // Selección de valor de ficha (Igual que en Blackjack)
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('selected'));
                chip.classList.add('selected');
                currentChipValue = parseInt(chip.dataset.value);
            });
        });

        // Botones de Acción
        if(btnSpin) btnSpin.addEventListener('click', spinRoulette);
        if(btnClearBet) btnClearBet.addEventListener('click', clearTableBet);
        if(btnRepeat) btnRepeat.addEventListener('click', repeatLastBet);
    }

    function handleSpotClick(e) {
        if (isSpinning) return;
        
        // Si no hay ficha seleccionada, avisamos (Lógica UX)
        if (currentChipValue === 0) {
            alert("Selecciona una ficha primero.");
            return;
        }

        // Validar saldo para el incremento
        if (user.balance < (currentBetAmount + currentChipValue)) {
            alert("Saldo insuficiente");
            return;
        }

        const spot = e.currentTarget;

        // Si cambiamos de casilla, reseteamos la anterior (Restricción de 1 apuesta por jugada estilo BJ simple)
        // Si quisieras múltiples apuestas, aquí tendrías que gestionar un array.
        if (activeBet && activeBet.element !== spot) {
            clearTableBet(false); // Limpia visualmente pero no resetea controles globales aún
        }

        // Definir nueva apuesta activa
        if (!activeBet) {
            activeBet = {
                type: spot.dataset.type,
                value: spot.dataset.value,
                element: spot
            };
            spot.classList.add('active'); // Resaltar casilla
        }

        addChipToBet(currentChipValue);
        updateBetInfo(activeBet);
    }

    function addChipToBet(value) {
        currentBetAmount += value;
        if(betAmountDisplay) betAmountDisplay.textContent = currentBetAmount;
        
        // Simulación visual de pila de fichas en la casilla (opcional, por ahora solo resalte)
        // En BJ se añadía al stack central. Aquí el stack es la casilla.
    }

    function updateBetInfo(bet) {
        if(!selectedBetInfo) return;
        let text = "";
        if (bet.type === 'NUMBER') text = `NÚMERO ${bet.value}`;
        else if (bet.type === 'COLOR') text = bet.value === 'RED' ? 'ROJO' : 'NEGRO';
        else if (bet.type === 'PARITY') text = bet.value === 'EVEN' ? 'PAR' : 'IMPAR';
        
        selectedBetInfo.textContent = `Apostando a: ${text}`;
        selectedBetInfo.style.color = '#fff';
    }

    function clearTableBet(fullReset = true) {
        if (activeBet && activeBet.element) {
            activeBet.element.classList.remove('active');
        }
        currentBetAmount = 0;
        activeBet = null;
        if(betAmountDisplay) betAmountDisplay.textContent = "0";
        if(selectedBetInfo && fullReset) selectedBetInfo.textContent = "Selecciona una casilla";
    }

    function repeatLastBet() {
        if (!lastBetData) {
            alert("No hay apuesta anterior para repetir.");
            return;
        }
        if (user.balance < lastBetData.amount) {
            alert("Saldo insuficiente para repetir.");
            return;
        }

        clearTableBet();

        // Buscar el elemento DOM correspondiente a la última apuesta
        let targetSpot = null;
        if (lastBetData.type === 'NUMBER') {
            targetSpot = Array.from(document.querySelectorAll('.betSpot'))
                .find(el => el.dataset.type === 'NUMBER' && el.dataset.value == lastBetData.value);
        } else {
            targetSpot = document.querySelector(`.betSpot[data-type="${lastBetData.type}"][data-value="${lastBetData.value}"]`);
        }

        if (targetSpot) {
            activeBet = {
                type: lastBetData.type,
                value: lastBetData.value,
                element: targetSpot
            };
            targetSpot.classList.add('active');
            currentBetAmount = lastBetData.amount;
            if(betAmountDisplay) betAmountDisplay.textContent = currentBetAmount;
            updateBetInfo(activeBet);
        }
    }

    // ---------------------------------------------------------
    // 2. LÓGICA DE JUEGO (API & ANIMACIÓN)
    // ---------------------------------------------------------

    async function spinRoulette() {
        if (!activeBet || currentBetAmount === 0) {
            alert("Haz una apuesta primero.");
            return;
        }

        // Guardar para repetir
        lastBetData = {
            type: activeBet.type,
            value: activeBet.value,
            amount: currentBetAmount
        };

        // Bloquear UI
        isSpinning = true;
        if(btnSpin) btnSpin.disabled = true;
        if(resultDisplay) resultDisplay.style.opacity = 0;
        if(selectedBetInfo) selectedBetInfo.textContent = "GIRANDO...";

        // Restar saldo visualmente (Igual que BJ)
        user.balance -= currentBetAmount;
        updateBalanceDisplay(user.balance);

        try {
            const response = await fetch('http://localhost:8989/api/roulette/spin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    betType: activeBet.type,
                    betValue: activeBet.value,
                    betAmount: currentBetAmount
                })
            });

            if (!response.ok) throw new Error(await response.text());

            const result = await response.json();

            // Animación CSS
            const rotation = 1080 + Math.floor(Math.random() * 360); 
            if(wheel) wheel.style.transform = `rotate(${rotation}deg)`;

            // Esperar animación (3s)
            setTimeout(() => {
                finishGame(result);
            }, 3000);

        } catch (error) {
            console.error(error);
            alert("Error en el servidor");
            isSpinning = false;
            if(btnSpin) btnSpin.disabled = false;
            // Restaurar saldo en caso de error
            user.balance += currentBetAmount;
            updateBalanceDisplay(user.balance);
        }
    }

    function finishGame(result) {
        // Mostrar resultado
        if(resultDisplay) {
            resultDisplay.textContent = result.winningNumber;
            resultDisplay.className = 'resultDisplay'; // Reset clases
            // Asignar color para borde/texto
            const colorClass = result.color === 'RED' ? 'red' : (result.color === 'BLACK' ? 'black' : 'green');
            resultDisplay.classList.add(colorClass); 
            resultDisplay.style.opacity = 1;
        }

        // Actualizar datos usuario
        user.balance = result.newBalance;
        localStorage.setItem('user', JSON.stringify(user));
        updateBalanceDisplay(user.balance);

        // Feedback visual
        if (result.winAmount > 0) {
            if(selectedBetInfo) {
                selectedBetInfo.textContent = `¡GANASTE ${parseFloat(result.winAmount).toFixed(2)} €!`;
                selectedBetInfo.style.color = '#2ecc71';
            }
            // Efecto visual de victoria en la casilla (opcional)
        } else {
            if(selectedBetInfo) {
                selectedBetInfo.textContent = `Salió el ${result.winningNumber}. Suerte la próxima.`;
                selectedBetInfo.style.color = '#ff4d4d';
            }
        }

        // Reset estado juego
        isSpinning = false;
        if(btnSpin) btnSpin.disabled = false;
        
        // Limpiamos la mesa automáticamente tras unos segundos o dejamos que el usuario repita
        // En BJ se resetea con un botón "New Game", aquí lo dejamos listo para limpiar o repetir
        clearTableBet(false); 
        currentBetAmount = 0;
        if(betAmountDisplay) betAmountDisplay.textContent = "0";

        // Actualizar historial lateral
        setTimeout(() => loadMiniHistory(user.id), 500);
    }

    function updateBalanceDisplay(amount) {
        if(balanceEl) balanceEl.textContent = parseFloat(amount).toFixed(2);
    }

    // ---------------------------------------------------------
    // 3. HISTORIAL (Copiado de blackjack.js para consistencia)
    // ---------------------------------------------------------

    async function loadMiniHistory(userId) {
        if(!miniHistoryList) return;
        try {
            // Nota: Asegúrate de que este endpoint devuelve también las de ruleta
            // O crea uno específico en el backend para ruleta: /api/roulette/history/{id}
            const res = await fetch(`http://localhost:8989/api/roulette/history/${userId}`);
            if (res.ok) {
                const history = await res.json();
                renderMiniHistory(history.slice(0, 15));
            }
        } catch (e) {
            console.error("Error cargando historial", e);
        }
    }

    function renderMiniHistory(games) {
        miniHistoryList.innerHTML = '';
        games.forEach(game => {
            const li = document.createElement('li');
            li.className = 'history-item';
            
            // Adaptación de visualización para Ruleta
            const profit = parseFloat(game.winAmount - game.betAmount).toFixed(0);
            let resultClass = ''; 
            let resultText = ''; // Mostramos el número ganador

            if (game.winAmount > 0) { 
                resultClass = 'res-win'; 
                // En historial de ruleta, el result suele ser "WIN", pero visualmente queremos el número
                resultText = game.resultNumber !== undefined ? game.resultNumber : 'W';
            } else { 
                resultClass = 'res-lose'; 
                resultText = game.resultNumber !== undefined ? game.resultNumber : 'L';
            }

            li.classList.add(resultClass);
            li.innerHTML = `<span>${resultText}</span><span>${profit > 0 ? '+' : ''}${profit}€</span>`;
            miniHistoryList.appendChild(li);
        });
    }
});