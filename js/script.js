let produtos = [];
let acessorios = [];
let produtoAtual = null;

// Lógica de Vibe Ativa
const vibeButtons = document.querySelectorAll('.vibe-btn');
vibeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.vibe-btn.active').classList.remove('active');
        btn.classList.add('active');
        renderizarGridPorVibe(btn.dataset.vibe);
    });
});

// Lógica de Clique em Coleção Visual
const collectionCards = document.querySelectorAll('.collection-card');
collectionCards.forEach(card => {
    card.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.vibe-btn.active').classList.remove('active');
        document.querySelector(`[data-vibe="${card.dataset.collection}"]`).classList.add('active');
        renderizarGridPorVibe(card.dataset.collection);
    });
});

async function iniciar() {
    try {
        const [resF, resA] = await Promise.all([
            fetch('data/fantasias.json').then(r => r.json()),
            fetch('data/acessorios.json').then(r => r.json())
        ]);
        produtos = resF;
        acessorios = resA;
        renderizarGridPorVibe('impactar'); // Carrega 'Impactar' por padrão
    } catch (e) { console.error("Erro ao carregar dados", e); }
}

function renderizarGridPorVibe(vibeSlug) {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = ""; // Limpa o grid

    const produtosFiltrados = produtos.filter(p => p.categoriaSlug === vibeSlug);

    produtosFiltrados.forEach(p => {
        const card = document.createElement("div");
        card.className = "card-produto grunge-border"; // Usando a borda grunge do layout
        card.onclick = () => abrirModal(p);
        card.innerHTML = `
            <img src="${p.imagem}">
            <div class="info">
                <h3>${p.nome}</h3>
                <p>R$ ${p.preco.toFixed(2)}</p>
                <button class="ver-colecao">VER DETALHES</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

/* LÓGICA DO MODAL (Mantida, mas conectada ao novo renderizarGridPorVibe) */
// ... (copie aqui a lógica de abrirModal, renderUpsell, atualizarTotal do arquivo JS anterior) ...

document.getElementById("busca_fantasia").oninput = (e) => {
    const t = e.target.value.toLowerCase();
    const v = document.querySelector('.vibe-btn.active').dataset.vibe;
    const filtrados = produtos.filter(p => p.categoriaSlug === v && p.nome.toLowerCase().includes(t));
    renderizarGridPorVibeComLista(v, filtrados);
};

// ... (resto da lógica de busca e quiz) ...
iniciar();
