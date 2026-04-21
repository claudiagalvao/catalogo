// ==========================
// VARIÁVEIS GLOBAIS
// ==========================
let produtos = [];

// ==========================
// CARREGAR JSON
// ==========================
fetch('data/fantasias.json')
  .then(res => res.json())
  .then(data => {
    produtos = data;
    renderProdutos();
  })
  .catch(err => console.error("Erro ao carregar JSON:", err));


// ==========================
// RENDERIZAR PRODUTOS
// ==========================
function renderProdutos() {
  const categorias = {
    bad: document.querySelector("#bad .grid"),
    fun: document.querySelector("#fun .grid"),
    pop: document.querySelector("#pop .grid"),
    luxo: document.querySelector("#luxo .grid")
  };

  // limpa antes (evita duplicar)
  Object.values(categorias).forEach(cat => cat.innerHTML = "");

  produtos.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${p.imagem}" alt="${p.nome}">
      <div class="info">
        <h3>${p.nome}</h3>
        <p>R$ ${p.preco}</p>
      </div>
    `;

    // clique abre modal
    card.addEventListener("click", () => abrirModal(p));

    categorias[p.categoria]?.appendChild(card);
  });
}


// ==========================
// MODAL
// ==========================
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const modalNome = document.getElementById("modal-nome");
const modalPreco = document.getElementById("modal-preco");
const modalTamanhos = document.getElementById("modal-tamanhos");
const modalWhatsapp = document.getElementById("modal-whatsapp");
const upsellDiv = document.getElementById("upsell");

function abrirModal(produto) {
  modal.classList.remove("hidden");

  modalImg.src = produto.imagem;
  modalNome.innerText = produto.nome;
  modalPreco.innerText = "R$ " + produto.preco;
  modalTamanhos.innerText = "Tamanhos: " + produto.tamanhos.join(", ");

  // WhatsApp
  modalWhatsapp.href = `https://wa.me/5519992850208?text=Tenho interesse na fantasia ${produto.nome}`;

  // UPSSELL
  renderUpsell(produto.acessorios);
}

// fechar modal
document.querySelector(".close").onclick = () => {
  modal.classList.add("hidden");
};

window.onclick = (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
};


// ==========================
// UPSELL
// ==========================
function renderUpsell(acessorios) {
  upsellDiv.innerHTML = "";

  if (!acessorios || acessorios.length === 0) return;

  acessorios.forEach(a => {
    const item = document.createElement("div");
    item.innerHTML = `${a.nome} + R$ ${a.preco}`;
    upsellDiv.appendChild(item);
  });
}


// ==========================
// QUIZ
// ==========================
document.getElementById("btn-quiz").addEventListener("click", () => {
  document.getElementById("quiz").scrollIntoView();
});

document.querySelectorAll(".quiz-options button").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    document.getElementById(target).scrollIntoView();
  });
});


// ==========================
// BUSCA (simples)
// ==========================
const buscaInput = document.getElementById("busca");

buscaInput.addEventListener("input", () => {
  const termo = buscaInput.value.toLowerCase();

  document.querySelectorAll(".card").forEach(card => {
    const nome = card.innerText.toLowerCase();

    card.style.display = nome.includes(termo) ? "block" : "none";
  });
});
