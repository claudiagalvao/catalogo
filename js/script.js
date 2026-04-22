let produtos = [];
let acessorios = [];
let produtoAtual = null;

async function carregarDados() {
    try {
        const [resP, resA] = await Promise.all([
            fetch('data/fantasias.json').then(r => r.json()),
            fetch('data/acessorios.json').then(r => r.json())
        ]);
        produtos = resP;
        acessorios = resA;
        renderizar();
    } catch (e) {
        console.error("Erro no carregamento.", e);
    }
}

function renderizar() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const termo = document.getElementById("input-busca").value.toLowerCase();
    const tamanho = document.getElementById("filter-tamanho").value;
    const precoRange = document.getElementById("filter-preco").value;
    const vibeAtiva = document.querySelector(".vibe-btn.active")?.dataset.vibe;

    const filtrados = produtos.filter(p => {
        const matchVibe = termo.length > 0 ? true : (p.categoriaSlug === vibeAtiva);
        const matchBusca = p.nome.toLowerCase().includes(termo);
        const matchTamanho = !tamanho || p.tamanhos.includes(tamanho);
        return matchVibe && matchBusca && matchTamanho;
    });

    filtrados.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        const sizesHtml = p.tamanhos.map(s => `<span class="size-tag">${s}</span>`).join('');
        
        card.innerHTML = `
            <img src="${p.imagem}" onerror="this.src='assets/images/placeholder.jpg'">
            <div class="card-info-overlay">
                <span class="card-category">Destaque</span>
                <h3 class="card-title">${p.nome}</h3>
                <div class="card-rating">
                    <i class="fas fa-star"></i><i class="fas fa-star"></i>
                    <i class="fas fa-star"></i><i class="fas fa-star"></i>
                    <i class="far fa-star"></i><span>(24)</span>
                </div>
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
    produtoAtual = p;
    document.getElementById("modal-img").src = p.imagem;
    document.getElementById("modal-nome").innerText = p.nome;
    document.getElementById("modal-preco-atual").innerText = `R$ ${p.preco.toFixed(2)}`;
    document.getElementById("modal").classList.remove("hidden");
    // Lógica de acessórios (Upsell) aqui...
}

document.getElementById("btn-finalizar").onclick = () => {
    let msg = `Olá Crazy Fantasy! Gostaria de reservar: *${produtoAtual.nome}*`;
    window.open(`https://wa.me/5519992850208?text=${encodeURIComponent(msg)}`);
}

document.querySelector(".close").onclick = () => document.getElementById("modal").classList.add("hidden");
document.getElementById("input-busca").addEventListener("input", renderizar);
window.onload = carregarDados;
