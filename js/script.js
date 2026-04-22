/* ========================================
   CRAZY FANTASY - LÓGICA DO CATÁLOGO 2026
   ======================================== */

let produtos = [];
let acessorios = [];
let produtoSelecionado = null;

// 1. CARREGAMENTO DE DADOS
async function carregarDados() {
    try {
        // Carrega os arquivos JSON da pasta data
        const [resProdutos, resAcessorios] = await Promise.all([
            fetch('data/fantasias.json').then(res => res.json()),
            fetch('data/acessorios.json').then(res => res.json())
        ]);
        
        produtos = resProdutos;
        acessorios = resAcessorios;
        
        renderizar(); // Primeira renderização da vitrine
    } catch (error) {
        console.error("Erro ao carregar os dados do catálogo:", error);
    }
}

// 2. RENDERIZAÇÃO DA VITRINE (GRID)
function renderizar() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;
    
    grid.innerHTML = ""; // Limpa a vitrine antes de renderizar

    // Captura os valores dos filtros
    const termoBusca = document.getElementById("input-busca").value.toLowerCase();
    const filtroTamanho = document.getElementById("filter-tamanho").value;
    const vibeAtiva = document.querySelector(".vibe-btn.active")?.dataset.vibe;

    // Lógica de filtragem
    const filtrados = produtos.filter(p => {
        const matchVibe = termoBusca.length > 0 ? true : (p.categoriaSlug === vibeAtiva);
        const matchBusca = p.nome.toLowerCase().includes(termoBusca);
        const matchTamanho = !filtroTamanho || p.tamanhos.includes(filtroTamanho);
        
        return matchVibe && matchBusca && matchTamanho;
    });

    // Criação dos Cards
    filtrados.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        
        // Gera o HTML dos tamanhos (bolinhas)
        const sizesHtml = p.tamanhos.map(s => `<span class="size-tag">${s}</span>`).join('');
        
        card.innerHTML = `
            <img src="${p.imagem}" onerror="this.src='assets/images/placeholder.jpg'">
            <div class="card-info-overlay">
                <span class="card-category">${p.categoriaNome || 'Destaque'}</span>
                <div class="card-rating">
                    <i class="fas fa-star"></i><i class="fas fa-star"></i>
                    <i class="fas fa-star"></i><i class="fas fa-star"></i>
                    <i class="fas fa-star"></i><span>(24)</span>
                </div>
                <h3 class="card-title">${p.nome}</h3>
                <div class="card-price">R$ ${p.preco.toFixed(2)}</div>
                <div class="card-sizes">${sizesHtml}</div>
            </div>
            <div class="card-action-icon">
                <i class="fas fa-shopping-bag"></i>
            </div>
        `;
        
        // Evento de clique para abrir o modal
        card.onclick = () => abrirModal(p);
        grid.appendChild(card);
    });
}

// 3. LÓGICA DO MODAL
function abrirModal(p) {
    produtoSelecionado = p;
    
    const modal = document.getElementById("modal");
    document.getElementById("modal-img").src = p.imagem;
    document.getElementById("modal-nome").innerText = p.nome;
    document.getElementById("modal-preco-atual").innerText = `R$ ${p.preco.toFixed(2)}`;
    
    // Limpa a lista de upsell (acessórios extras)
    const upsellList = document.getElementById("upsell-list");
    if(upsellList) upsellList.innerHTML = "";

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // Trava o scroll do fundo
}

function fecharModal() {
    const modal = document.getElementById("modal");
    modal.classList.add("hidden");
    document.body.style.overflow = "auto"; // Libera o scroll
}

// 4. WHATSAPP INTEGRATION
function finalizarReserva() {
    if (!produtoSelecionado) return;
    
    const telefone = "5519992850208";
    const mensagem = `Olá Crazy Fantasy! Vi no catálogo e gostaria de reservar:
----------------------------
✨ *${produtoSelecionado.nome}*
💰 Preço: R$ ${produtoSelecionado.preco.toFixed(2)}
----------------------------
Pode me passar as informações de disponibilidade?`;

    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

// 5. EVENTOS DE INTERAÇÃO
document.addEventListener("DOMContentLoaded", () => {
    carregarDados();

    // Eventos de Busca e Filtro
    document.getElementById("input-busca")?.addEventListener("input", renderizar);
    document.getElementById("filter-tamanho")?.addEventListener("change", renderizar);

    // Fechar modal no X
    document.querySelector(".close")?.addEventListener("click", fecharModal);

    // Fechar modal clicando fora dele
    window.addEventListener("click", (e) => {
        const modal = document.getElementById("modal");
        if (e.target === modal) fecharModal();
    });

    // Botão do WhatsApp
    document.getElementById("btn-finalizar")?.addEventListener("click", finalizarReserva);

    // Lógica dos botões de Vibe
    document.querySelectorAll(".vibe-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".vibe-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById("input-busca").value = ""; // Limpa busca ao trocar vibe
            renderizar();
        });
    });
});
