// ========================================
// CRAZY FANTASY - SCRIPT FINAL 2026
// ========================================

// 🔥 ESTADO
const filtrosState = { tamanho: "", preco: "", genero: "" };

let produtos = [];
let acessorios = [];
let produtoAtual = null;
let valorFinalGlobal = 0;
let acessoriosMap = {};

// 🔧 NORMALIZAÇÃO
function normalizar(t) {
    return (t || "")
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// 🚀 INIT
document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("input-busca")?.addEventListener("input", renderizar);

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

    document.querySelectorAll(".custom-select").forEach(select => {
        const selected = select.querySelector(".selected");
        const options = select.querySelector(".options");

        selected.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll(".custom-select").forEach(s => {
                if (s !== select) s.classList.remove("open");
            });
            select.classList.toggle("open");
        };

        options.querySelectorAll("div").forEach(opt => {
            opt.onclick = (e) => {
                e.stopPropagation();

                const filterType = select.getAttribute("data-filter");
                const value = opt.dataset.value ? opt.dataset.value.toString().trim() : "";

                if (filterType) filtrosState[filterType] = value;

                selected.innerText = opt.innerText;
                select.classList.remove("open");

                renderizar();
            };
        });
    });

    const fecharModal = () => document.getElementById("modal").classList.add("hidden");

    document.querySelector(".close")?.addEventListener("click", fecharModal);

    window.addEventListener("click", (e) => {
        if (e.target.id === "modal") fecharModal();
        document.querySelectorAll(".custom-select").forEach(s => s.classList.remove("open"));
    });

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

// 📦 CARREGAR DADOS
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
        console.error("Erro ao carregar JSON:", e);
    }
}

// 🎯 RENDER
function renderizar() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    grid.innerHTML = "";

    const termo = normalizar(document.getElementById("input-busca")?.value);
    const vibeAtiva = document.querySelector(".vibe-btn.active")?.dataset.vibe;

    const temFiltroAtivo =
        filtrosState.tamanho ||
        filtrosState.genero ||
        filtrosState.preco ||
        termo;

    const filtrados = produtos.filter(p => {

        const nome = normalizar(p.nome);
        const categoria = normalizar(p.categoria);
        const modelo = normalizar(p.modelo);
        const slug = normalizar(p.categoriaSlug);

        const matchBusca =
            !termo ||
            nome.includes(termo) ||
            categoria.includes(termo) ||
            modelo.includes(termo) ||
            slug.includes(termo);

        const matchVibe =
            temFiltroAtivo ? true : (!vibeAtiva || p.categoriaSlug === vibeAtiva);

        const matchTamanho =
            !filtrosState.tamanho ||
            (Array.isArray(p.tamanhos) && p.tamanhos.includes(filtrosState.tamanho));

        const generoFiltro = normalizar(filtrosState.genero);

        const matchGenero =
            !generoFiltro ||
            normalizar(p.modelo) === generoFiltro ||
            normalizar(p.modelo) === "unissex";

        let matchPreco = true;

        if (filtrosState.preco === "0-100") {
            matchPreco = Number(p.preco) <= 100;
        } else if (filtrosState.preco === "100-150") {
            matchPreco = Number(p.preco) > 100 && Number(p.preco) <= 150;
        } else if (filtrosState.preco === "150+") {
            matchPreco = Number(p.preco) > 150;
        }

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
                <img src="${p.imagem}" loading="lazy" alt="${p.nome}">
            </div>

            <div class="card-content">
                <h3>${p.nome}</h3>
                <div class="card-price">R$ ${p.preco}</div>
            </div>
        `;

        card.onclick = () => abrirModal(p);
        grid.appendChild(card);
    });
}

// 🪟 MODAL
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
            <label class="acc-item">
                <input type="checkbox" class="acc-check" data-preco="${acc.preco}" data-nome="${acc.nome}">
                
                <img src="${acc.imagem}" 
                     onerror="this.src='assets/images/placeholder.jpg'">

                <div class="acc-info">
                    <span>${acc.nome}</span>
                    <span class="acc-preco">+ R$ ${acc.preco}</span>
                </div>
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

// 💰 REGRA DE NEGÓCIO
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
        ${desconto > 0 ? `<div style="text-decoration:line-through;color:#666">R$ ${precoBase.toFixed(2)}</div>` : ""}
        <div style="color:var(--neon); font-size:28px;">R$ ${total.toFixed(2)}</div>
        ${desconto > 0 ? `<div style="color:#00ff88;font-size:13px;">🔥 Você economiza R$ ${(precoBase - precoComDesconto).toFixed(2)}</div>` : ""}
    `;
}
