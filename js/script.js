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
        console.error("Erro no JSON. Verifique a pasta /data", e);
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
        // Se houver texto na busca, ignora o filtro de Vibe para mostrar o resultado
        const matchVibe = termo.length > 0 ? true : (p.categoriaSlug === vibeAtiva);
        const matchBusca = p.nome.toLowerCase().includes(termo) || (p.tags && p.tags.some(t => t.toLowerCase().includes(termo)));
        const matchTamanho = !tamanho || p.tamanhos.includes(tamanho);
        
        let matchPreco = true;
        if (precoRange === "0-100") matchPreco = p.preco <= 100;
        else if (precoRange === "100-150") matchPreco = p.preco > 100 && p.preco <= 150;
        else if (precoRange === "150+") matchPreco = p.preco > 150;

        return matchVibe && matchBusca && matchTamanho && matchPreco;
    });

    if (filtrados.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #555; padding: 40px;">Nenhuma fantasia encontrada para "${termo}".</p>`;
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
    
    if(p.upsell) {
        p.upsell.forEach(idAcc => {
            const acc = acessorios.find(a => a.id === idAcc);
            if(acc) {
                const div = document.createElement("div");
                div.style.display = "flex";
                div.style.alignItems = "center";
                div.style.gap = "10px";
                div.style.marginBottom = "12px";
                div.innerHTML = `
                    <input type="checkbox" class="acc-check" data-id="${acc.id}" data-preco="${acc.preco}">
                    <img src="${acc.imagem}" style="width:40px; height:40px; border-radius:5px; object-fit:cover;">
                    <span style="font-size:14px">${acc.nome} (+ R$ ${acc.preco.toFixed(2)})</span>
                `;
                list.appendChild(div);
            }
        });
    }

    const checks = list.querySelectorAll('.acc-check');
    checks.forEach(c => c.onchange = atualizarPrecosModal);
    
    atualizarPrecosModal();
    document.getElementById("modal").classList.remove("hidden");
}

function atualizarPrecosModal() {
    const checks = document.querySelectorAll(".acc-check:checked");
    const qtd = checks.length;
    let desc = 0;
    
    // REGRA DE NEGÓCIO 5%, 8%, 10%
    if (qtd === 1) desc = 0.05;
    else if (qtd === 2) desc = 0.08;
    else if (qtd >= 3) desc = 0.10;

    const precoFinalFantasia = produtoAtual.preco * (1 - desc);
    let totalAcc = 0;
    checks.forEach(c => totalAcc += parseFloat(c.dataset.preco));

    document.getElementById("modal-preco-atual").innerText = `R$ ${precoFinalFantasia.toFixed(2)}`;
    
    const precoAntigo = document.getElementById("modal-preco-antigo");
    if (desc > 0) {
        precoAntigo.style.display = "inline";
        precoAntigo.innerText = `R$ ${produtoAtual.preco.toFixed(2)}`;
    } else {
        precoAntigo.style.display = "none";
    }

    document.getElementById("resumo-financeiro").innerHTML = `
        <div style="margin-top:15px; border-top:1px solid #222; padding-top:10px; font-size:14px">
            <p>Acessórios: R$ ${totalAcc.toFixed(2)}</p>
            <p style="font-size:20px; color:var(--neon); font-weight:bold; margin-top:5px">Total Combo: R$ ${(precoFinalFantasia + totalAcc).toFixed(2)}</p>
            ${desc > 0 ? `<p style="color:#ffcc00; font-size:12px">✨ Desconto de ${(desc*100)}% aplicado!</p>` : ''}
        </div>
    `;
}

// EVENTOS DE BUSCA E FILTROS
document.getElementById("input-busca").addEventListener("input", renderizar);
document.getElementById("filter-tamanho").addEventListener("change", renderizar);
document.getElementById("filter-preco").addEventListener("change", renderizar);

// EVENTO DE CLIQUE NAS VIBES E NAS IMAGENS DAS CATEGORIAS
document.querySelectorAll(".vibe-btn, .col-item").forEach(el => {
    el.onclick = () => {
        const vibe = el.dataset.vibe;
        document.querySelectorAll(".vibe-btn").forEach(b => b.classList.remove("active"));
        document.querySelector(`.vibe-btn[data-vibe="${vibe}"]`).classList.add("active");
        document.getElementById("input-busca").value = ""; // Limpa busca ao mudar vibe
        renderizar();
    };
});

document.querySelector(".close").onclick = () => document.getElementById("modal").classList.add("hidden");

// WHATSAPP
document.getElementById("btn-finalizar").onclick = () => {
    const checks = document.querySelectorAll(".acc-check:checked");
    let msg = `Olá Crazy Fantasy! Gostaria de reservar:\n\n🎭 *${produtoAtual.nome}*`;
    if(checks.length > 0) {
        msg += `\n✨ *Acessórios:*`;
        checks.forEach(c => {
            const acc = acessorios.find(a => a.id === c.dataset.id);
            msg += `\n- ${acc.nome}`;
        });
    }
    window.open(`https://wa.me/5519992850208?text=${encodeURIComponent(msg)}`);
}

window.onload = carregarDados;
