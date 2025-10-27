const weekdayEl = document.getElementById('weekday');
const messageEl = document.getElementById('main-message');
const subtitleEl = document.getElementById('card-subtitle');
const refreshButton = document.getElementById('refresh');
const footerYearEl = document.getElementById('footer-year');
const isStatusPage = Boolean(weekdayEl && messageEl && subtitleEl && refreshButton);

const workdayMessages = [
    'Você já fez seu commit diário?',
    'Revisou aquele pull request que tá parado?',
    'Organizou o backlog antes da daily?',
    'Criou documentação do projeto hoje?',
    'Testes automatizados em dia, ou só na promessa?',
    'Checou se a feature está ativada só para staging mesmo?',
    'Atualizou as dependências ou vai deixar para o próximo sprint?',
    'Já pediu ajuda antes de perder o dia inteiro no bug?',
    'Fez o handoff direitinho pro time de QA?',
    'Lembrou de hidratar e alongar entre commits?'
];

const weekendMessages = [
    'Quem fez fez.',
    'Tá trabalhando hoje, é porque é desorganizado.',
    'Deploy só segunda, certo?',
    'Descansa que o merge pode esperar.',
    'Se precisar trabalhar, que seja no controle da playlist.',
    'Se o bug vive só no seu sonho, deixa pra segunda.',
    'Nada de stand-up hoje, só deitado no sofá.',
    'O melhor deploy de sábado é o de pizza no delivery.',
    'Hoje o backlog chama churrasco com os amigos.',
    'Seu pull request agora é puxar o cobertor.'
];

// Mensagens contextuais suaves para complementar o humor principal.
const subtitles = {
    weekday: [
        'Hoje é dia de construir com calma e qualidade.',
        'Colabora com o time e deixa a esteira rodando.',
        'Evita débito técnico: futuro você agradece.',
        'Code review honesto salva tempo lá na frente.',
        'Breakpoints são amigos, mas use com propósito.',
        'Celebrar pequenas entregas mantém a motivação.'
    ],
    weekend: [
        'Respira fundo: backlog nenhum manda aqui.',
        'A cabeça precisa descansar para entregar melhor depois.',
        'Energia recarregada rende sprint mais leve.',
        'Silenciar as notificações também é produtividade.',
        'O modo avião do notebook chama-se desligar.',
        'Compartilhar risadas recarrega mais que café.'
    ]
};

const weekdays = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function pickRandomDifferent(items, currentValue) {
    if (items.length === 0) {
        return '';
    }

    if (items.length === 1) {
        return items[0];
    }

    let candidate = pickRandom(items);
    let attempts = 0;

    while (candidate === currentValue && attempts < 6) {
        candidate = pickRandom(items);
        attempts += 1;
    }

    if (candidate === currentValue) {
        const fallback = items.find((item) => item !== currentValue);
        return fallback ?? candidate;
    }

    return candidate;
}

function updateUI() {
    if (!isStatusPage) {
        return;
    }

    const today = new Date();
    const weekdayIndex = today.getDay();
    const isWeekend = weekdayIndex === 0 || weekdayIndex >= 5;
    const bucket = isWeekend ? weekendMessages : workdayMessages;
    const subtitleBucket = isWeekend ? subtitles.weekend : subtitles.weekday;

    weekdayEl.textContent = weekdays[weekdayIndex];
    const currentMessage = messageEl.textContent.trim();
    const currentSubtitle = subtitleEl.textContent.trim();
    messageEl.textContent = pickRandomDifferent(bucket, currentMessage);
    subtitleEl.textContent = pickRandomDifferent(subtitleBucket, currentSubtitle);
}

function triggerMessageUpdate() {
    if (!isStatusPage) {
        return;
    }

    refreshButton.disabled = true;
    updateUI();

    window.setTimeout(() => {
        refreshButton.disabled = false;
    }, 320);
}
function init() {
    if (footerYearEl) {
        footerYearEl.textContent = new Date().getFullYear();
    }
    updateUI();
}

if (isStatusPage) {
    refreshButton.addEventListener('click', triggerMessageUpdate);

    document.addEventListener('keydown', (event) => {
        if (event.code !== 'Space' && event.key !== ' ') {
            return;
        }

        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable) {
            return;
        }

        event.preventDefault();

        if (!refreshButton.disabled) {
            triggerMessageUpdate();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
