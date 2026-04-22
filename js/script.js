let produtos = [];
let acessorios = [];
let produtoAtual = null;

async function carregarDados() {
    try {
        const resProd = await fetch('data/fantasias.json');
        const resAcc = await fetch('data/acessorios.json');
        produtos = await resProd.json();
        acessorios = await resAcc.json();
        renderizar();
    } catch (e) {
        console.error("Erro ao carregar arquivos JSON. Verifique se os nomes estão corretos na pasta /data", e);
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
        const matchVibe = p.categoriaSlug === vibeAtiva;
        const matchBusca = p.nome.toLowerCase().includes(termo);
        const matchTamanho = !tamanho || p.tamanhos.includes(tamanho);
        
        let matchPreco = true;
        if (precoRange === "0-100") matchPreco = p.preco <= 100;
        else if (precoRange === "100-150") matchPreco = p.preco > 100 && p.preco <= 150;
        else if (precoRange === "150+") matchPreco = p.preco > 150;

        return matchVibe && matchBusca && matchTamanho && matchPreco;
    });

    if (filtrados.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #555;'>Nenhuma fantasia encontrada.</p>";
    }

    filtrados.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${p.imagem}" onerror="this.src='assets/images/placeholder.jpg'">
            <div class="info">
                <h3>${p.nome}</h3>
                <p style="color:var(--magenta)">R$ ${p.preco.toFixed(2)}</p>
            </div>
        `;
        card.onclick = () => abrirModal(p);
        grid.appendChild(card);
    });
}

function abrirModal(p) {
    produtoAtual = p;
    document.getElementById("modal-img").src = p.imagem;
    document.getElementById("modal-nome").innerText = p.nome;
    
    const list = document.getElementById("upsell-list");
    list.innerHTML = "";
    
    p.upsell.forEach(idAcc => {
        const acc = acessorios.find(a => a.id === idAcc);
        if(acc) {
            const div = document.createElement("div");
            div.style.display = "flex";
            div.style.alignItems = "center";
            div.style.gap = "10px";
            div.style.marginBottom = "10px";
            div.innerHTML = `
                <input type="checkbox" class="acc-check" data-preco="${acc.preco}">
                <span style="font-size:14px">${acc.nome} (+ R$ ${acc.preco.toFixed(2)})</span>
            `;
            list.appendChild(div);
        }
    });

    const checks = list.querySelectorAll('.acc-check');
    checks.forEach(c => c.onchange = atualizarPrecosModal);
    
    atualizarPrecosModal();
    document.getElementById("modal").classList.remove("hidden");
}

function atualizarPrecosModal() {
    const checks = document.querySelectorAll(".acc-check:checked");
    const qtd = checks.length;
    let desc = 0;
    if (qtd === 1) desc = 0.05;
    else if (qtd === 2) desc = 0.08;
    else if (qtd >= 3) desc = 0.10;

    const precoFinalFantasia = produtoAtual.preco * (1 - desc);
    let totalAcc = 0;
    checks.forEach(c => totalAcc += parseFloat(c.dataset.preco));

    document.getElementById("modal-preco-atual").innerText = `R$ ${precoFinalFantasia.toFixed(2)}`;
    if (desc > 0) {
        document.getElementById("modal-preco-antigo").style.display = "inline";
        document.getElementById("modal-preco-antigo").innerText = `R$ ${produtoAtual.preco.toFixed(2)}`;
    } else {
        document.getElementById("modal-preco-antigo").style.display = "none";
    }

    document.getElementById("resumo-financeiro").innerHTML = `
        <div style="margin-top:15px; border-top:1px solid #222; padding-top:10px">
            <p>Acessórios: R$ ${totalAcc.toFixed(2)}</p>
            <p style="font-size:18px; color:var(--neon)">Total: R$ ${(precoFinalFantasia + totalAcc).toFixed(2)}</p>
        </div>
    `;
}

// EVENTOS
document.getElementById("input-busca").addEventListener("input", renderizar);
document.getElementById("filter-tamanho").addEventListener("change", renderizar);
document.getElementById("filter-preco").addEventListener("change", renderizar);

document.querySelectorAll(".vibe-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".vibe-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderizar();
    };
});

document.querySelector(".close").onclick = () => document.getElementById("modal").classList.add("hidden");

window.onload = carregarDados;
