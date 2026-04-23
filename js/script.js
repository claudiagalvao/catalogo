// 🔥 ESTADO (no topo - evita erro)
const filtrosState = {
    tamanho: "",
    preco: "",
    genero: ""
};

let produtos = [];
let acessorios = [];
let produtoAtual = null;
let valorFinalGlobal = 0;
let acessoriosMap = {};

// 🔥 NORMALIZAÇÃO SEGURA
function normalizar(texto) {
    return (texto || "")
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// 🔥 INIT (GARANTE DOM CARREGADO)
document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("input-busca")?.addEventListener("input", renderizar);

    document.querySelectorAll(".vibe-btn, .col-item").forEach(el => {
        el.onclick = () => {
            const vibe = el.dataset.vibe;

            document.querySelectorAll(".vibe-btn").forEach(b => b.classList.remove("active"));

            const btnAlvo = document.querySelector(`.vibe-btn[data-vibe="${vibe}"]`);
            if (btnAlvo) btnAlvo.classList.add("active");

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
            document.querySelectorAll(".custom-select").forEach(s => s.classList.remove("open"));
            select.classList.toggle("open");
        };

        options.querySelectorAll("div").forEach(option => {
            option.onclick = (e) => {
                e.stopPropagation();

                const value = option.dataset.value;
                const label = option.innerText;
                const filter = select.dataset.filter;

                selected.innerText = label;
                filtrosState[filter] = value;

                select.classList.remove("open");

                renderizar();
            };
        });
    });

    document.addEventListener("click", () => {
        document.querySelectorAll(".custom-select").forEach(s => s.classList.remove("open"));
    });

    document.querySelector(".close")?.addEventListener("click", () => {
        document.getElementById("modal")?.classList.add("hidden");
    });

    const btnFinalizar = document.getElementById("btn-finalizar");
    if (btnFinalizar) {
        btnFinalizar.onclick = () => {
            if (!produtoAtual) return;

            const checks = document.querySelectorAll(".acc-check:checked");

            let msg = `Olá Crazy Fantasy! Gostaria de reservar:\n\n🎭 *${produtoAtual.nome}*`;

            if (checks.length > 0) {
                msg += `\n✨ *Acessórios:*`;
                checks.forEach(c => msg += `\n- ${c.dataset.nome}`);
            }

            msg += `\n\n💰 *VALOR TOTAL: R$ ${valorFinalGlobal}*`;

            window.open(`https://wa.me/5519992850208?text=${encodeURIComponent(msg)}`);
        };
    }

    carregarDados();
});

// 🔥 CARREGAMENTO
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

// 🔥 RENDER
function renderizar() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    grid.innerHTML = "";

    const termo = document.getElementById("input-busca")?.value.trim() || "";
    const termoNormalizado = normalizar(termo);

    const tamanho = filtrosState.tamanho;
    const precoRange = filtrosState.preco;
    const genero = filtrosState.genero;

    const vibeAtiva = document.querySelector(".vibe-btn.active")?.dataset.vibe;

    const filtrados = produtos.filter(p => {

        const nome = normalizar(p.nome);
        const categoria = normalizar(p.categoria);
        const modelo = normalizar(p.modelo);
        const slug = normalizar(p.categoriaSlug);

        const matchBusca =
            termo === "" ||
            nome.includes(termoNormalizado) ||
            categoria.includes(termoNormalizado) ||
            modelo.includes(termoNormalizado) ||
            slug.includes(termoNormalizado) ||
            (Array.isArray(p.tags) && p.tags.some(t => normalizar(t).includes(termoNormalizado)));

        const matchVibe = termo ? true : (!vibeAtiva || p.categoriaSlug === vibeAtiva);

        const matchTamanho =
            !tamanho || (Array.isArray(p.tamanhos) && p.tamanhos.includes(tamanho));

        const matchGenero =
            !genero || normalizar(p.modelo) === normalizar(genero);

        let matchPreco = true;
        if (precoRange === "0-100") matchPreco = p.preco <= 100;
        else if (precoRange === "100-150") matchPreco = p.preco >= 100 && p.preco <= 150;
        else if (precoRange === "150+") matchPreco = p.preco > 150;

        return matchBusca && matchVibe && matchTamanho && matchGenero && matchPreco;
    });

    if (filtrados.length === 0) {
        grid.innerHTML = `<p style="color:#888; text-align:center;">Nenhuma fantasia encontrada 😢</p>`;
        return;
    }

    filtrados.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <div class="card-img-container">
                <img src="${p.imagem}" onerror="this.src='assets/images/placeholder.jpg'">
            </div>
        `;

        card.onclick = () => abrirModal(p);
        grid.appendChild(card);
    });
}

// 🔥 MODAL (ADICIONADO CORRETAMENTE)
function abrirModal(p) {
    produtoAtual = p;

    const modal = document.getElementById("modal");
    const img = document.getElementById("modal-img");
    const nome = document.getElementById("modal-nome");
    const list = document.getElementById("upsell-list");

    if (!modal || !img || !nome || !list) return;

    img.src = p.imagem;
    nome.innerText = p.nome;

    list.innerHTML = "";

    if (p.upsell && Array.isArray(p.upsell)) {
        p.upsell.forEach(idAcc => {
            const acc = acessoriosMap[idAcc];
            if (!acc) return;

            const div = document.createElement("div");
            div.style = "display:flex; gap:10px; margin-bottom:10px;";

            div.innerHTML = `
                <input type="checkbox" class="acc-check" data-preco="${acc.preco}" data-nome="${acc.nome}">
                <span>${acc.nome} (+ R$ ${acc.preco.toFixed(2)})</span>
            `;

            list.appendChild(div);
        });
    }

    document.querySelectorAll(".acc-check").forEach(c => c.onchange = atualizarPrecosModal);

    atualizarPrecosModal();

    modal.classList.remove("hidden");
}

function atualizarPrecosModal() {
    if (!produtoAtual) return;

    const checks = document.querySelectorAll(".acc-check:checked");

    let totalAcc = 0;
    checks.forEach(c => totalAcc += parseFloat(c.dataset.preco));

    const total = produtoAtual.preco + totalAcc;
    valorFinalGlobal = total.toFixed(2);

    document.getElementById("modal-preco-atual")?.innerText = `R$ ${total.toFixed(2)}`;
}
