// 🔥 ESTADO
const filtrosState = { tamanho: "", preco: "", genero: "" };
let produtos = [], acessorios = [], produtoAtual = null, valorFinalGlobal = 0, acessoriosMap = {};

function normalizar(t) {
    return (t || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

document.addEventListener("DOMContentLoaded", () => {

    // BUSCA
    document.getElementById("input-busca")?.addEventListener("input", renderizar);

    // VIBES
    document.querySelectorAll(".vibe-btn, .col-item").forEach(el => {
        el.onclick = () => {
            const vibe = el.dataset.vibe;
            document.querySelectorAll(".vibe-btn").forEach(b => b.classList.remove("active"));
            document.querySelector(`.vibe-btn[data-vibe="${vibe}"]`)?.classList.add("active");

            const input = document.getElementById("input-busca");
            if (input) input.value = "";

            renderizar();
        };
    });

    // DROPDOWN (CORRIGIDO)
    document.querySelectorAll(".custom-select").forEach(select => {
        const selected = select.querySelector(".selected");
        const options = select.querySelector(".options");

        selected.onclick = (e) => {
            e.stopPropagation();
            const isOpen = select.classList.contains("open");
            document.querySelectorAll(".custom-select").forEach(s => s.classList.remove("open"));
            if (!isOpen) select.classList.add("open");
        };

        options.querySelectorAll("div").forEach(opt => {
            opt.onclick = (e) => {
                e.stopPropagation();

                const value = opt.dataset.value || "";
                filtrosState[select.dataset.filter] = value;

                selected.innerText = opt.innerText;
                select.classList.remove("open");

                renderizar();
            };
        });
    });

    // FECHAR MODAL + DROPDOWN
    const fecharModal = () => document.getElementById("modal").classList.add("hidden");

    document.querySelector(".close")?.addEventListener("click", fecharModal);

    window.addEventListener("click", (e) => {
        if (e.target.id === "modal") fecharModal();
        document.querySelectorAll(".custom-select").forEach(s => s.classList.remove("open"));
    });

    // WHATSAPP
    document.getElementById("btn-finalizar").onclick = () => {
        if (!produtoAtual) return;

        const checks = document.querySelectorAll(".acc-check:checked");

        let msg = `Olá Crazy Fantasy! Gostaria de reservar:\n\n🎭 *${produtoAtual.nome}*`;

        if (checks.length > 0) {
            msg += `\n✨ *Acessórios:*`;
            checks.forEach(c => msg += `\n- ${c.dataset.nome}`);
        }

        msg += `\n\n💰 *TOTAL: R$ ${valorFinalGlobal}*`;

        window.open(`https://wa.me/5519992850208?text=${encodeURIComponent(msg)}`);
    };

    carregarDados();
});

// DATA
async function carregarDados() {
    try {
        const [resP, resA] = await Promise.all([
            fetch('data/fantasias.json').then(r => r.json()),
            fetch('data/acessorios.json').then(r => r.json())
        ]);

        produtos = resP;
        acessorios = resA;

        acessoriosMap = Object.fromEntries(acessorios.map(a => [a.id, a]));

        renderizar();
    } catch (e) {
        console.error("Erro no JSON:", e);
    }
}

// RENDER
function renderizar() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    grid.innerHTML = "";

    const termo = normalizar(document.getElementById("input-busca")?.value);
    const vibeAtiva = document.querySelector(".vibe-btn.active")?.dataset.vibe;

    const filtrados = produtos.filter(p => {

        const matchBusca =
            !termo ||
            normalizar(p.nome).includes(termo) ||
            normalizar(p.categoria).includes(termo);

        const matchVibe = termo ? true : (!vibeAtiva || p.categoriaSlug === vibeAtiva);

        const matchTamanho =
            !filtrosState.tamanho || p.tamanhos?.includes(filtrosState.tamanho);

        const matchGenero =
            !filtrosState.genero ||
            normalizar(p.modelo) === normalizar(filtrosState.genero) ||
            normalizar(p.modelo) === "unissex";

        let matchPreco = true;
        if (filtrosState.preco === "0-100") matchPreco = p.preco <= 100;
        else if (filtrosState.preco === "100-150") matchPreco = p.preco > 100 && p.preco <= 150;
        else if (filtrosState.preco === "150+") matchPreco = p.preco > 150;

        return matchBusca && matchVibe && matchTamanho && matchGenero && matchPreco;
    });

    if (!filtrados.length) {
        grid.innerHTML = `<p style="text-align:center;color:#888">Nenhuma fantasia encontrada</p>`;
        return;
    }

    filtrados.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <div class="card-img-container">
                <img src="${p.imagem}" loading="lazy">
            </div>
            <div style="padding:12px">
                <h3>${p.nome}</h3>
                <p style="color:var(--magenta);font-weight:bold">R$ ${p.preco}</p>
            </div>
        `;

        card.onclick = () => abrirModal(p);
        grid.appendChild(card);
    });
}

// 🔥 MODAL MELHORADO
function abrirModal(p) {
    produtoAtual = p;

    document.getElementById("modal-img").src = p.imagem;
    document.getElementById("modal-nome").innerText = p.nome;
    document.getElementById("modal-desc").innerText = p.descricao || "";

    const accContainer = document.getElementById("acessorios-container");
    accContainer.innerHTML = "";

    const lista = p.upsell || [];

    lista.forEach(id => {
        const acc = acessoriosMap[id];
        if (!acc) return;

        const div = document.createElement("div");

        div.innerHTML = `
            <label style="display:flex; align-items:center; gap:10px;">
                <input type="checkbox" class="acc-check" data-preco="${acc.preco}" data-nome="${acc.nome}">
                <img src="${acc.imagem}" style="width:40px; height:40px; object-fit:cover; border-radius:6px;">
                <span>${acc.nome} (+ R$ ${acc.preco})</span>
            </label>
        `;

        accContainer.appendChild(div);
    });

    document.querySelectorAll(".acc-check").forEach(c => {
        c.addEventListener("change", atualizarPrecoTotal);
    });

    atualizarPrecoTotal();

    document.getElementById("modal").classList.remove("hidden");
}

// 🔥 REGRA DE NEGÓCIO (AGORA SIM)
function atualizarPrecoTotal() {
    let precoBase = parseFloat(produtoAtual.preco);
    let totalAcc = 0;

    const checks = document.querySelectorAll(".acc-check:checked");
    const qtd = checks.length;

    checks.forEach(c => totalAcc += parseFloat(c.dataset.preco));

    let desconto = 0;
    if (qtd === 1) desconto = 0.05;
    else if (qtd === 2) desconto = 0.08;
    else if (qtd >= 3) desconto = 0.10;

    const precoComDesconto = precoBase * (1 - desconto);
    const total = precoComDesconto + totalAcc;

    valorFinalGlobal = total.toFixed(2);

    document.getElementById("total-modal").innerHTML = `
        ${desconto > 0 ? `<span style="text-decoration:line-through;color:#888">R$ ${precoBase.toFixed(2)}</span>` : ""}
        <div style="color:var(--neon); font-size:26px;">R$ ${total.toFixed(2)}</div>
        ${desconto > 0 ? `<div style="color:#00ff88;font-size:12px;">🔥 Você economiza ${(precoBase - precoComDesconto).toFixed(2)}</div>` : ""}
    `;
}
