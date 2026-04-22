let produtos = [];
let acessorios = [];
let produtoAtual = null;

// Inicialização: Busca os arquivos na pasta /data do seu GitHub
async function carregarDados() {
    try {
        const [resF, resA] = await Promise.all([
            fetch('data/fantasias.json').then(r => r.json()),
            fetch('data/acessorios.json').then(r => r.json())
        ]);
        
        produtos = resF;
        acessorios = resA;
        
        // Define a categoria inicial como 'fun' (onde está a Aeromoça)
        renderizar('fun'); 
        
    } catch (e) {
        console.error("Erro ao carregar os ficheiros JSON. Verifique os caminhos.", e);
    }
}

function renderizar(slug) {
    const grid = document.getElementById("product-grid");
    if (!grid) return;
    
    grid.innerHTML = "";
    
    // Filtra pela categoriaSlug (ex: 'fun')
    const filtrados = produtos.filter(p => p.categoriaSlug === slug);
    
    filtrados.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${p.imagem}" alt="${p.nome}">
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
    
    // Preenche dados básicos
    document.getElementById("modal-img").src = p.imagem;
    document.getElementById("modal-nome").innerText = p.nome;
    document.getElementById("modal-preco").innerText = `R$ ${p.preco.toFixed(2)}`;
    document.getElementById("modal-tamanhos").innerText = `Tamanhos: ${p.tamanhos.join(", ")}`;
    
    // Gerar a área de Upsell (Acessórios)
    const upsellDiv = document.getElementById("upsell");
    upsellDiv.innerHTML = "<h4>🔥 Complete o look:</h4>";
    
    if (p.upsell && p.upsell.length > 0) {
        p.upsell.forEach(accId => {
            const acc = acessorios.find(a => a.id === accId);
            if (acc) {
                const item = document.createElement("div");
                item.className = "upsell-item";
                item.innerHTML = `
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                        <input type="checkbox" data-preco="${acc.preco}" data-id="${acc.id}" class="acc-check">
                        <img src="${acc.imagem}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;">
                        <div style="flex:1; font-size:13px;">
                            <span>${acc.nome}</span><br>
                            <strong>+ R$ ${acc.preco.toFixed(2)}</strong>
                        </div>
                    </label>
                `;
                upsellDiv.appendChild(item);
            }
        });
        
        // Adiciona o container do total se houver acessórios
        const totalDiv = document.createElement("div");
        totalDiv.id = "total-combo";
        totalDiv.className = "total-destaque";
        upsellDiv.appendChild(totalDiv);
        
        // Escuta mudanças nos checkboxes
        upsellDiv.querySelectorAll(".acc-check").forEach(input => {
            input.onchange = () => atualizarPrecos(p);
        });
    }

    atualizarPrecos(p);
    document.getElementById("modal").classList.remove("hidden");
}

function atualizarPrecos(p) {
    const checks = document.querySelectorAll(".acc-check:checked");
    let totalAcc = 0;
    checks.forEach(c => totalAcc += Number(c.dataset.preco));

    // Lógica de Desconto Progressivo (Opcional)
    let desconto = checks.length >= 2 ? 0.05 : 0; // 5% de desc se levar 2 ou mais acessórios
    let precoBaseComDesc = p.preco * (1 - desconto);
    let totalGeral = precoBaseComDesc + totalAcc;

    const totalDiv = document.getElementById("total-combo");
    if (totalDiv) {
        totalDiv.innerHTML = `
            <div style="border-top:1px solid #222; margin-top:10px; padding-top:10px;">
                <p style="font-size:14px; color:#888;">Resumo do Look:</p>
                <div style="display:flex; justify-content:space-between; margin-top:5px;">
                    <span>Fantasia:</span> <span>R$ ${precoBaseComDesc.toFixed(2)}</span>
                </div>
                <div style="display:flex; justify-content:space-between;">
                    <span>Acessórios:</span> <span>R$ ${totalAcc.toFixed(2)}</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:10px; color:#00ffff; font-weight:bold; font-size:18px;">
                    <span>TOTAL:</span> <span>R$ ${totalGeral.toFixed(2)}</span>
                </div>
            </div>
        `;
    }
}

// Botão WhatsApp
document.getElementById("btn-upsell").onclick = () => {
    const checks = document.querySelectorAll(".acc-check:checked");
    let pedido = `*NOVO LOOK COMPLETO*\n\n✅ *Fantasia:* ${produtoAtual.nome}`;
    
    if (checks.length > 0) {
        pedido += `\n➕ *Acessórios:*`;
        checks.forEach(c => {
            const acc = acessorios.find(a => a.id === c.dataset.id);
            pedido += `\n- ${acc.nome}`;
        });
    }
    
    const url = `https://wa.me/5519992850208?text=${encodeURIComponent(pedido)}`;
    window.open(url, '_blank');
};

// Funções de Navegação e Fechamento
document.querySelector(".close").onclick = () => document.getElementById("modal").classList.add("hidden");

document.querySelectorAll(".vibe-btn, .col-img").forEach(el => {
    el.onclick = () => {
        const vibe = el.dataset.vibe;
        document.querySelectorAll(".vibe-btn").forEach(b => b.classList.remove("active"));
        const btn = document.querySelector(`.vibe-btn[data-vibe="${vibe}"]`);
        if(btn) btn.classList.add("active");
        renderizar(vibe);
    };
});

carregarDados();
