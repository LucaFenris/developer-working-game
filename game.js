'use strict';

const gameArea = document.getElementById('game-area');
const crosshair = document.getElementById('crosshair');
const scoreEl = document.getElementById('score');
const missesEl = document.getElementById('misses');
const livesEl = document.getElementById('lives');
const startButton = document.getElementById('start-game');
const statusEl = document.getElementById('game-status');

if (gameArea && crosshair && scoreEl && missesEl && livesEl && startButton && statusEl) {
    const taskMessages = [
        'Corrigir bug no deploy de sexta',
        'Escrever testes para o módulo crítico',
        'Revisar pull request do estagiário',
        'Resolver conflito gigantesco de merge',
        'Atualizar documentação do serviço',
        'Responder ao product manager no Slack',
        'Fechar tarefas repriorizadas na sprint',
        'Subir hotfix sem quebrar staging',
        'Agendar pares para o code review',
        'Finalizar commit pendente desde cedo',
        'Criar monitoramento para endpoint novo',
        'Checar feature flag antes do deploy',
        'Eliminar console.log perdido em produção',
        'Verificar alerta vermelho no Grafana',
        'Preparar retro com aprendizados da semana'
    ];

    const hitMessages = [
        'Boa! Bug derrubado.',
        'Commit na conta, seguimos!',
        'QA agradece esse tiro certeiro.',
        'Backlog respirou fundo agora.',
        'Excelente! Sprint agradece.'
    ];

    const missMessages = [
        'Uma tarefa escapou, foco!',
        'Ops, essa pendência passou batido.',
        'Volta pro teclado, dev!',
        'Backlog ganhou reforço, cuidado.'
    ];

    const cards = [];
    let animationId = null;
    let lastTimestamp = 0;
    let spawnTimer = 0;
    let spawnDelay = 1500;
    let score = 0;
    let misses = 0;
    const maxLives = 3;
    let lives = maxLives;
    let isRunning = false;
    let speedMultiplier = 1;
    const maxSpeedMultiplier = 4;

    const crosshairState = {
        x: 0,
        y: 0,
        visible: false
    };

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function focusGameArea() {
        if (typeof gameArea.focus !== 'function') {
            return;
        }

        try {
            gameArea.focus({ preventScroll: true });
        } catch (error) {
            gameArea.focus();
        }
    }

    function updateHud() {
        scoreEl.textContent = String(score);
        missesEl.textContent = String(misses);
        livesEl.textContent = String(lives);
    }

    function setStatus(message) {
        statusEl.textContent = message;
    }

    function clearCards() {
        cards.splice(0, cards.length).forEach((card) => {
            card.el.remove();
        });
    }

    function destroyCardAt(index, { awardPoints } = { awardPoints: false }) {
        const [card] = cards.splice(index, 1);

        if (!card) {
            return;
        }

        card.el.classList.add('task-card--destroyed');
        window.setTimeout(() => {
            if (card.el.parentElement === gameArea) {
                card.el.remove();
            }
        }, 180);

        if (awardPoints) {
            score += 10;
            setStatus(pickRandom(hitMessages));
            speedMultiplier = Math.min(speedMultiplier * 1.12, maxSpeedMultiplier);
        }

        updateHud();
    }

    function handleMissAt(index) {
        destroyCardAt(index, { awardPoints: false });
        misses += 1;
        lives = Math.max(lives - 1, 0);
        updateHud();

        if (lives <= 0) {
            endGame('Backlog tomou conta! Clique em "Reiniciar rodada" para tentar de novo.');
            return;
        }

        setStatus(pickRandom(missMessages));
    }

    function spawnCard() {
        const cardEl = document.createElement('div');
        cardEl.className = 'task-card';
        cardEl.innerHTML = `<p class="task-card__text">${pickRandom(taskMessages)}</p>`;
        gameArea.appendChild(cardEl);

        const areaWidth = gameArea.clientWidth;
        const areaHeight = gameArea.clientHeight;
        const cardWidth = cardEl.offsetWidth;
        const cardHeight = cardEl.offsetHeight;
        const maxX = Math.max(areaWidth - cardWidth, 0);
        const startX = Math.random() * maxX;
        const startY = -cardHeight - Math.random() * 80;
        const speed = 0.08 + Math.random() * 0.04; // pixels per millisecond

        const card = {
            el: cardEl,
            x: startX,
            y: startY,
            width: cardWidth,
            height: cardHeight,
            speed
        };

        cardEl.style.setProperty('--x', `${card.x}px`);
        cardEl.style.setProperty('--y', `${card.y}px`);
        cards.push(card);
    }

    function pickRandom(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    function updateCards(delta) {
        const areaHeight = gameArea.clientHeight;

        for (let index = cards.length - 1; index >= 0; index -= 1) {
            const card = cards[index];
            card.y += card.speed * delta * speedMultiplier;

            if (card.y > areaHeight) {
                handleMissAt(index);
                continue;
            }

            card.el.style.setProperty('--x', `${card.x}px`);
            card.el.style.setProperty('--y', `${card.y}px`);
        }
    }

    function step(timestamp) {
        if (!isRunning) {
            return;
        }

        if (!lastTimestamp) {
            lastTimestamp = timestamp;
        }

        const delta = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        spawnTimer += delta;

        if (spawnTimer >= spawnDelay) {
            spawnCard();
            spawnTimer = 0;
            spawnDelay = Math.max(650, spawnDelay * 0.97);
        }

        updateCards(delta);
        animationId = window.requestAnimationFrame(step);
    }

    function shoot() {
        if (!isRunning) {
            return;
        }

        crosshair.classList.add('crosshair--shoot');
        window.setTimeout(() => {
            crosshair.classList.remove('crosshair--shoot');
        }, 90);

    const crosshairRect = crosshair.getBoundingClientRect();

        for (let index = cards.length - 1; index >= 0; index -= 1) {
            const card = cards[index];
            const cardRect = card.el.getBoundingClientRect();
            const intersects = !(
                crosshairRect.right < cardRect.left ||
                crosshairRect.left > cardRect.right ||
                crosshairRect.bottom < cardRect.top ||
                crosshairRect.top > cardRect.bottom
            );

            if (intersects) {
                destroyCardAt(index, { awardPoints: true });
                return;
            }
        }

        setStatus('Nenhuma tarefa atingida desta vez.');
    }

    function endGame(message) {
        isRunning = false;
        startButton.disabled = false;
        window.cancelAnimationFrame(animationId);
        setStatus(message);
    }

    function startGame() {
        window.cancelAnimationFrame(animationId);
        clearCards();
        score = 0;
        misses = 0;
        lives = maxLives;
        spawnTimer = 0;
        spawnDelay = 1500;
        lastTimestamp = 0;
        speedMultiplier = 1;
        isRunning = true;
        startButton.disabled = true;
        updateHud();
        setStatus('Sprint aberto! Derrube as tarefas que descem.');
        animationId = window.requestAnimationFrame(step);
    }

    function handlePointerMove(event) {
        const rect = gameArea.getBoundingClientRect();
        const x = clamp(event.clientX - rect.left, 0, rect.width);
        const y = clamp(event.clientY - rect.top, 0, rect.height);

        crosshairState.x = x;
        crosshairState.y = y;
        crosshairState.visible = true;

        crosshair.style.left = `${x}px`;
        crosshair.style.top = `${y}px`;
        crosshair.style.opacity = 0.9;
    }

    function handlePointerLeave() {
        crosshairState.visible = false;
        crosshair.style.opacity = 0;
    }

    function handlePointerDown(event) {
        event.preventDefault();
        handlePointerMove(event);
        shoot();
    }

    function handleKeydown(event) {
        if (event.code !== 'Space') {
            return;
        }

        const activeElement = document.activeElement;
        const activeTag = activeElement?.tagName;
        if (
            activeTag === 'INPUT' ||
            activeTag === 'TEXTAREA' ||
            activeElement?.isContentEditable ||
            (activeElement && activeElement !== document.body && activeElement !== gameArea)
        ) {
            return;
        }

        event.preventDefault();
        shoot();
    }

    startButton.addEventListener('click', () => {
        startGame();
        focusGameArea();
    });

    gameArea.addEventListener('pointermove', handlePointerMove);
    gameArea.addEventListener('pointerleave', handlePointerLeave);
    gameArea.addEventListener('pointerdown', handlePointerDown);

    document.addEventListener('keydown', handleKeydown);

    window.addEventListener('resize', () => {
        if (!gameArea.isConnected) {
            return;
        }

        const rect = gameArea.getBoundingClientRect();
        crosshairState.x = clamp(crosshairState.x, 0, rect.width);
        crosshairState.y = clamp(crosshairState.y, 0, rect.height);
        crosshair.style.left = `${crosshairState.x}px`;
        crosshair.style.top = `${crosshairState.y}px`;
    });

    // Prepara mira no centro inicialmente
    (function centerCrosshair() {
        const rect = gameArea.getBoundingClientRect();
        const x = rect.width / 2;
        const y = rect.height / 2;
        crosshairState.x = x;
        crosshairState.y = y;
        crosshair.style.left = `${x}px`;
        crosshair.style.top = `${y}px`;
        crosshair.style.opacity = 0;
    })();

    startGame();

    window.setTimeout(focusGameArea, 120);
}
