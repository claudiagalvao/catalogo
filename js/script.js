let produtos = [];
let acessorios = [];
let produtoAtual = null;

async function iniciar() {
    try {
        const [f, a] = await Promise.all([
            fetch('data/fantasias.json').then(r => r.json()),
            fetch('data/acessorios.json').then(r => r.json())
        ]);
        produtos = f;
        acessorios = a;
        renderizar(); // Inicia com a primeira categoria ou todas
    } catch (e) { console.error("Erro JSON", e); }
}

// BUSCA E FILTROS EM TEMPO REAL
function filtrarProdutos() {
    const termo = document.getElementById("input-busca").value.toLowerCase();
    const tamanho = document.getElementById("filter-tamanho").value;
    const precoRange = document.getElementById("filter-preco").value;
    const vibeAtiva = document.querySelector(".vibe-btn.active").dataset.vibe;

    return produtos.filter(p => {
        const matchVibe = p.categoriaSlug === vibeAtiva;
        const matchBusca = p.nome.toLowerCase().includes(termo) || p.tags.some(t => t.includes(termo));
        const matchTamanho = tamanho === "" || p.tamanhos.includes(tamanho);
        
        let matchPreco = true;
        if (precoRange === "0-100") matchPreco = p.preco <= 100;
        else if (precoRange === "100-150") matchPreco = p.preco > 100 && p.preco <= 150;
        else if (precoRange === "150+") matchPreco = p.preco > 150;

        return matchVibe && matchBusca && matchTamanho && matchPreco;
    });
}

function renderizar() {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";
    
    const filtrados = filtrarProdutos();
    
    filtrados.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${p.imagem}">
            <div class="info">
                <h3>${p.nome}</h3>
                <p>R$ ${p.preco.toFixed(2)}</p>
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
    document.getElementById("modal-tamanhos").innerText = `Disponível: ${p.tamanhos.join(", ")}`;
    
    const list = document.getElementById("upsell-list");
    list.innerHTML = "";
    
    p.upsell.forEach(idAcc => {
        const acc = acessorios.find(a => a.id === idAcc);
        if(acc) {
            const div = document.createElement("div");
            div.className = "acc-item";
            div.innerHTML = `
                <input type="checkbox" class="acc-check" data-id="${acc.id}" data-preco="${acc.preco}">
                <img src="${acc.imagem}">
                <div style="flex:1">
                    <div style="font-size:14px">${acc.nome}</div>
                    <div style="font-size:12px; color:var(--neon)">+ R$ ${acc.preco.toFixed(2)}</div>
                </div>
            `;
            list.appendChild(div);
        }
    });

    list.querySelectorAll('.acc-check').forEach(c => c.onchange = calcularRegraNegocio);
    calcularRegraNegocio();
    document.getElementById("modal").classList.remove("hidden");
}

function calcularRegraNegocio() {
    const checks = document.querySelectorAll(".acc-check:checked");
    const qtd = checks.length;
    let descontoPercentual = 0;

    // REGRA DE NEGÓCIO
    if (qtd === 1) descontoPercentual = 0.05;
    else if (qtd === 2) descontoPercentual = 0.08;
    else if (qtd >= 3) descontoPercentual = 0.10;

    const precoOriginal = produtoAtual.preco;
    const precoComDesconto = precoOriginal * (1 - descontoPercentual);
    
    let totalAcessorios = 0;
    checks.forEach(c => totalAcessorios += parseFloat(c.dataset.preco));

    const totalGeral = precoComDesconto + totalAcessorios;

    // Atualização Visual no Modal
    const precoAntigoSpan = document.getElementById("modal-preco-antigo");
    const precoAtualSpan = document.getElementById("modal-preco-atual");

    if (descontoPercentual > 0) {
        precoAntigoSpan.style.display = "inline";
        precoAntigoSpan.innerText = `R$ ${precoOriginal.toFixed(2)}`;
        precoAtualSpan.innerText = `R$ ${precoComDesconto.toFixed(2)}`;
        precoAtualSpan.style.color = "var(--neon)";
    } else {
        precoAntigoSpan.style.display = "none";
        precoAtualSpan.innerText = `R$ ${precoOriginal.toFixed(2)}`;
        precoAtualSpan.style.color = "#fff";
    }

    const resumo = document.getElementById("resumo-financeiro");
    resumo.innerHTML = `
        <div style="margin-top:20px; border-top:1px solid #222; padding-top:15px; font-size:14px">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px">
                <span>Total Acessórios:</span> <span>R$ ${totalAcessorios.toFixed(2)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:20px; font-weight:bold; color:var(--neon); margin-top:10px">
                <span>TOTAL COMBO:</span> <span>R$ ${totalGeral.toFixed(2)}</span>
            </div>
            ${descontoPercentual > 0 ? `<p style="color:var(--gold); font-size:11px; margin-top:5px">✨ Economia de ${(descontoPercentual*100).toFixed(0)}% aplicada na fantasia!</p>` : ''}
        </div>
    `;
}

// EVENTOS DE BUSCA E FILTROS
document.getElementById("input-busca").oninput = renderizar;
document.getElementById("filter-tamanho").onchange = renderizar;
document.getElementById("filter-preco").onchange = renderizar;

document.querySelectorAll(".vibe-btn, .col-item").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".vibe-btn").forEach(b => b.classList.remove("active"));
        const vibe = btn.dataset.vibe;
        document.querySelector(`.vibe-btn[data-vibe="${vibe}"]`).classList.add("active");
        renderizar();
    }
});

document.querySelector(".close").onclick = () => document.getElementById("modal").classList.add("hidden");

// WHATSAPP
document.getElementById("btn-finalizar").onclick = () => {
    const checks = document.querySelectorAll(".acc-check:checked");
    let msg = `Olá! Gostaria de reservar:\n\n🎭 *Fantasia:* ${produtoAtual.nome}`;
    if(checks.length > 0) {
        msg += `\n✨ *Acessórios:*`;
        checks.forEach(c => {
            const acc = acessorios.find(a => a.id === c.dataset.id);
            msg += `\n- ${acc.nome}`;
        });
    }
    const final = document.querySelector("#resumo-financeiro b span")?.innerText || "";
    window.open(`https://wa.me/5519992850208?text=${encodeURIComponent(msg)}`);
}

iniciar();
