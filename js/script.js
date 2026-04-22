let produtos = [];
let produtoSelecionado = null;

async function carregarDados() {
    try {
        const res = await fetch('data/fantasias.json');
        produtos = await res.json();
        renderizar(); 
    } catch (error) { console.error("Erro ao carregar dados:", error); }
}

function renderizar() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;
    grid.innerHTML = ""; 

    const termoBusca = document.getElementById("input-busca").value.toLowerCase();
    const filtroTamanho = document.getElementById("filter-tamanho").value;
    const vibeBtn = document.querySelector(".vibe-btn.active");
    const vibeAtiva = vibeBtn ? vibeBtn.dataset.vibe : null;

    const filtrados = produtos.filter(p => {
        const matchVibe = termoBusca.length > 0 ? true : (p.categoriaSlug === vibeAtiva);
        const matchBusca = p.nome.toLowerCase().includes(termoBusca);
        const matchTamanho = !filtroTamanho || p.tamanhos.includes(filtroTamanho);
        return matchVibe && matchBusca && matchTamanho;
    });

    filtrados.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        const sizesHtml = p.tamanhos.map(s => `<span class="size-tag">${s}</span>`).join('');
        
        card.innerHTML = `
            <img src="${p.imagem}" onerror="this.src='assets/images/placeholder.jpg'">
            <div class="card-info-overlay">
                <h3 class="card-title">${p.nome}</h3>
                <div class="card-price">R$ ${p.preco.toFixed(2)}</div>
                <div class="card-sizes">${sizesHtml}</div>
            </div>
            <div class="card-action-icon"><i class="fas fa-shopping-bag"></i></div>
        `;
        card.onclick = () => abrirModal(p);
        grid.appendChild(card);
    });
}

function abrirModal(p) {
    produtoSelecionado = p;
    document.getElementById("modal-img").src = p.imagem;
    document.getElementById("modal-nome").innerText = p.nome;
    document.getElementById("modal-preco-atual").innerText = `R$ ${p.preco.toFixed(2)}`;
    document.getElementById("modal").classList.remove("hidden");
    document.body.style.overflow = "hidden"; 
}

function fecharModal() {
    document.getElementById("modal").classList.add("hidden");
    document.body.style.overflow = "auto"; 
}

document.addEventListener("DOMContentLoaded", () => {
    carregarDados();
    document.getElementById("input-busca")?.addEventListener("input", renderizar);
    document.getElementById("filter-tamanho")?.addEventListener("change", renderizar);
    document.getElementById("btn-fechar-modal")?.addEventListener("click", fecharModal);
    
    document.getElementById("btn-finalizar")?.addEventListener("click", () => {
        const telefone = "5519992850208";
        const msg = `Olá! Quero reservar: ${produtoSelecionado.nome} (R$ ${produtoSelecionado.preco.toFixed(2)})`;
        window.open(`https://wa.me/${telefone}?text=${encodeURIComponent(msg)}`, '_blank');
    });

    document.querySelectorAll(".vibe-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".vibe-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderizar();
        });
    });
});
