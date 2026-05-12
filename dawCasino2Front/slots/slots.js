document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return;
    let betAmount = 5; let isSpinning = false;
    
    updateDOMBalance(user.balance);
    loadHistory();

    document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', (e) => {
        if (isSpinning) return;
        document.querySelectorAll('.chip').forEach(x => x.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        betAmount = parseInt(e.currentTarget.dataset.value);
        document.getElementById('betAmountDisplay').textContent = betAmount.toFixed(2) + ' €';
    }));
    document.querySelector('.chip-5')?.classList.add('selected');

    document.getElementById('btnSpin').addEventListener('click', async () => {
        if(isSpinning) return;
        if(user.balance < betAmount) return showAlert('Saldo insuficiente', 'No tienes saldo para esta tirada.', 'warning');
        
        isSpinning = true;
        document.getElementById('gameMessage').textContent = "GIRANDO...";
        
        const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
        reels.forEach(r => { r.textContent = '🎰'; r.classList.add('spinning'); });
        
        // Restamos visualmente la apuesta de inmediato para que el usuario lo vea
        user.balance -= betAmount;
        updateDOMBalance(user.balance);

        try {
            const data = await api.post('/slots/spin', { userId: user.id, betAmount });
            
            // CORRECCIÓN DE BALANCE DURANTE EL GIRO: 
            // Mostramos el balance restado asegurándonos de que esté perfectamente sincronizado
            const exactBalanceBeforeWin = data.newBalance - data.winAmount;
            user.balance = exactBalanceBeforeWin;
            updateDOMBalance(user.balance);

            setTimeout(() => { reels[0].classList.remove('spinning'); reels[0].textContent = data.symbols[0]; }, 1000);
            setTimeout(() => { reels[1].classList.remove('spinning'); reels[1].textContent = data.symbols[1]; }, 1500);
            setTimeout(() => { 
                reels[2].classList.remove('spinning'); reels[2].textContent = data.symbols[2]; 
                
                document.getElementById('gameMessage').textContent = data.winAmount > 0 ? `¡GANASTE ${data.winAmount}€!` : "VUELVE A INTENTARLO";
                document.getElementById('gameMessage').style.color = data.winAmount > 0 ? "var(--primary)" : "#fff";
                
                // Actualización final: Se suma el premio (si lo hay) de golpe
                updateLocalUser(data.newBalance); 
                updateDOMBalance(data.newBalance); 
                loadHistory();
                isSpinning = false;
            }, 2000);
        } catch (e) {
            user.balance += betAmount; updateDOMBalance(user.balance); isSpinning = false;
        }
    });

    async function loadHistory() {
        const history = await api.get(`/slots/history/${user.id}`);
        renderSharedHistory(history.slice(0, 15));
    }
});