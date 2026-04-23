let produtos = [];
let acessoriosMap = {};
let produtoAtual = null;

// CARREGAR DADOS
async function carregarDados() {
    try {
        const [resF, resA] = await Promise.all([
            fetch('data/fantasias.json').then(r => r.json()),
            fetch('data/acessorios.json').then(r => r.json())
        ]);
        produtos = resF;
        resA.forEach(a => acessoriosMap[a.id] = a);
        renderizar();
    } catch (e) {
        console.error("Erro ao carregar dados:", e);
    }
}

// RENDERIZAR COM BUSCA E FILTROS
function renderizar() {
    const grid = document.getElementById("product-grid");
    const busca = document.getElementById("input-busca")?.value.toLowerCase() || "";
    const filtroTamanho = document.getElementById("filtro-tamanho")?.value || "";

    if (!grid) return;
    grid.innerHTML = "";

    const filtrados = produtos.filter(p => {
        const matchBusca = p.nome.toLowerCase().includes(busca) || p.categoria.toLowerCase().includes(busca);
        const matchTamanho = !filtroTamanho || p.tamanhos.includes(filtroTamanho);
        return matchBusca && matchTamanho;
    });

    filtrados.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="card-vibe-stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
            <div class="card-img-container"><img src="${p.imagem}" alt="${p.nome}"></div>
            <div class="card-info">
                <h3>${p.nome}</h3>
                <p class="price">R$ ${p.preco}</p>
            </div>
            <div class="btn-detalhes"><i class="fas fa-eye"></i> Detalhes</div>
        `;
        card.onclick = () => abrirModal(p);
        grid.appendChild(card);
    });
}

// MODAL E CÁLCULO
function abrirModal(p) {
    produtoAtual = p;
    document.getElementById("modal-img").src = p.imagem;
    document.getElementById("modal-nome").innerText = p.nome;
    
    const container = document.getElementById("acessorios-container");
    container.innerHTML = "";

    if (p.acessoriosIds) {
        p.acessoriosIds.forEach(id => {
            const acc = acessoriosMap[id];
            if (acc) {
                const div = document.createElement("div");
                div.innerHTML = `<label><input type="checkbox" class="acc-check" data-preco="${acc.preco}" onchange="atualizarTotal()"> ${acc.nome} (+R$${acc.preco})</label>`;
                container.appendChild(div);
            }
        });
    }
    document.getElementById("modal").style.display = "flex";
    atualizarTotal();
}

function atualizarTotal() {
    const checks = document.querySelectorAll(".acc-check:checked");
    let total = parseFloat(produtoAtual.preco);
    checks.forEach(c => total += parseFloat(c.dataset.preco));
    
    let qtd = 1 + checks.length;
    let desc = qtd >= 3 ? 0.10 : (qtd === 2 ? 0.08 : 0.05);
    let valorFinal = total * (1 - desc);
    
    document.getElementById("total-modal").innerText = `R$ ${valorFinal.toFixed(2)}`;
}

function fecharModal() { document.getElementById("modal").style.display = "none"; }

// LISTENERS DE BUSCA
document.getElementById("input-busca")?.addEventListener("input", renderizar);
document.getElementById("filtro-tamanho")?.addEventListener("change", renderizar);

carregarDados();
