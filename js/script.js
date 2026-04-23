// 🔥 ESTADO (MOVIDO PRO TOPO)
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
    if (!texto) return "";
    return texto.toString().toLowerCase();
}

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

function renderizar() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    grid.innerHTML = "";

    const termo = document.getElementById("input-busca")?.value.toLowerCase() || "";

    const tamanho = filtrosState.tamanho;
    const precoRange = filtrosState.preco;
    const genero = filtrosState.genero;

    const vibeAtiva = document.querySelector(".vibe-btn.active")?.dataset.vibe;

    const filtrados = produtos.filter(p => {

        const nome = normalizar(p.nome);
        const categoria = normalizar(p.categoria);
        const modelo = normalizar(p.modelo);

        const matchBusca =
            termo === "" ||
            nome.includes(termo) ||
            categoria.includes(termo) ||
            modelo.includes(termo);

        const matchVibe =
            termo ? true : (!vibeAtiva || p.categoriaSlug === vibeAtiva);

        const matchTamanho =
            !tamanho || (p.tamanhos && p.tamanhos.includes(tamanho));

        const matchGenero =
            !genero || normalizar(p.modelo) === normalizar(genero);

        let matchPreco = true;
        if (precoRange === "0-100") matchPreco = p.preco <= 100;
        else if (precoRange === "100-150") matchPreco = p.preco >= 100 && p.preco <= 150;
        else if (precoRange === "150+") matchPreco = p.preco > 150;

        return matchBusca && matchVibe && matchTamanho && matchGenero && matchPreco;
    });

    // 🔥 fallback seguro
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

// 🔥 BUSCA
document.getElementById("input-busca")?.addEventListener("input", renderizar);

// 🔥 VIBE
document.querySelectorAll(".vibe-btn, .col-item").forEach(el => {
    el.onclick = () => {
        const vibe = el.dataset.vibe;

        document.querySelectorAll(".vibe-btn").forEach(b => b.classList.remove("active"));

        const btnAlvo = document.querySelector(`.vibe-btn[data-vibe="${vibe}"]`);
        if (btnAlvo) btnAlvo.classList.add("active");

        document.getElementById("input-busca").value = "";

        renderizar();
    };
});

// 🔥 DROPDOWN
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

window.onload = carregarDados;
