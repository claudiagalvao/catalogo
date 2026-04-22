let produtos = [];
let acessorios = [];
let produtoAtual = null;

const modal = document.getElementById("modal");
const upsellDiv = document.getElementById("upsell");

// Carregar dados
async function iniciar() {
    try {
        const [resF, resA] = await Promise.all([
            fetch('data/fantasias.json').then(r => r.json()),
            fetch('data/acessorios.json').then(r => r.json())
        ]);
        produtos = resF;
        acessorios = resA;
        renderizar(produtos);
    } catch (e) { console.error("Erro ao carregar JSONs", e); }
}

function renderizar(lista) {
    document.querySelectorAll(".grid").forEach(g => g.innerHTML = "");
    lista.forEach(p => {
        const grid = document.querySelector(`#${p.categoriaSlug} .grid`);
        if (grid) {
            const card = document.createElement("div");
            card.className = "card";
            card.onclick = () => abrir(p);
            card.innerHTML = `
                <img src="${p.imagem}">
                <div class="info">
                    <h3>${p.nome}</h3>
                    <p>R$ ${p.preco.toFixed(2)}</p>
                </div>
            `;
            grid.appendChild(card);
        }
    });
}

function abrir(p) {
    produtoAtual = p;
    document.getElementById("modal-img").src = p.imagem;
    document.getElementById("modal-nome").innerText = p.nome;
    document.getElementById("modal-preco").innerText = `R$ ${p.preco.toFixed(2)}`;
    document.getElementById("modal-tamanhos").innerText = `Tamanhos: ${p.tamanhos.join(", ")}`;
    
    renderUpsell(p);
    modal.classList.remove("hidden");
}

function renderUpsell(p) {
    upsellDiv.innerHTML = "<h4>🔥 Complete o look:</h4>";
    if (!p.upsell || p.upsell.length === 0) { 
        atualizarTotal(p); 
        return; 
    }

    p.upsell.forEach(id => {
        const acc = acessorios.find(a => a.id === id);
        if (acc) {
            const item = document.createElement("div");
            item.className = "upsell-item";
            item.innerHTML = `
                <input type="checkbox" data-preco="${acc.preco}" data-id="${acc.id}">
                <img src="${acc.imagem}">
                <div style="flex:1; display:flex; justify-content:space-between; font-size:13px">
                    <span>${acc.nome}</span>
                    <strong>+ R$ ${acc.preco.toFixed(2)}</strong>
                </div>
            `;
            upsellDiv.appendChild(item);
        }
    });

    const totalDiv = document.createElement("div");
    totalDiv.id = "total-combo";
    upsellDiv.appendChild(totalDiv);

    upsellDiv.querySelectorAll("input").forEach(i => i.onchange = () => atualizarTotal(p));
    atualizarTotal(p);
}

function atualizarTotal(p) {
    const checks = upsellDiv.querySelectorAll("input:checked");
    let totalAcc = 0;
    checks.forEach(c => totalAcc += Number(c.dataset.preco));

    let desc = checks.length === 1 ? 0.05 : checks.length === 2 ? 0.08 : checks.length >= 3 ? 0.10 : 0;
    let precoDesc = p.preco * (1 - desc);
    let totalFinal = precoDesc + totalAcc;

    const div = document.getElementById("total-combo");
    if (div) {
        div.innerHTML = `
            Combo Especial: <strong>R$ ${precoDesc.toFixed(2)}</strong><br>
            Acessórios: <strong>R$ ${totalAcc.toFixed(2)}</strong><br>
            <hr style="border:0; border-top:1px solid #222; margin:5px 0">
            <strong>TOTAL FINAL: R$ ${totalFinal.toFixed(2)}</strong>
        `;
    }
}

document.getElementById("btn-upsell").onclick = () => {
    const checks = upsellDiv.querySelectorAll("input:checked");
    let msg = `*PEDIDO:* ${produtoAtual.nome}\n`;
    checks.forEach(c => {
        const a = acessorios.find(item => item.id == c.dataset.id);
        msg += `+ ${a.nome}\n`;
    });
    window.open(`https://wa.me/5519992850208?text=${encodeURIComponent(msg)}`);
};

document.querySelector(".close").onclick = () => modal.classList.add("hidden");
document.getElementById("busca").oninput = (e) => {
    const t = e.target.value.toLowerCase();
    renderizar(produtos.filter(p => p.nome.toLowerCase().includes(t)));
};

document.querySelectorAll("[data-target]").forEach(b => {
    b.onclick = () => document.getElementById(b.dataset.target).scrollIntoView({behavior: "smooth"});
});

iniciar();
