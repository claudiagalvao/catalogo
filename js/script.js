// ==========================
// VARIÁVEIS GLOBAIS
// ==========================
let produtos = [];
let acessorios = [];
let produtoAtual = null;

// ==========================
// ELEMENTOS DO MODAL
// ==========================
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const modalNome = document.getElementById("modal-nome");
const modalPreco = document.getElementById("modal-preco");
const modalTamanhos = document.getElementById("modal-tamanhos");
const modalWhatsapp = document.getElementById("modal-whatsapp");
const upsellDiv = document.getElementById("upsell");
const btnUpsell = document.getElementById("btn-upsell");

// ==========================
// CARREGAR JSON
// ==========================
Promise.all([
  fetch('data/fantasias.json').then(res => res.json()),
  fetch('data/acessorios.json').then(res => res.json())
])
.then(([fantasiasData, acessoriosData]) => {
  produtos = fantasiasData;
  acessorios = acessoriosData;
  renderProdutos();
})
.catch(err => console.error("Erro ao carregar dados:", err));


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

  Object.values(categorias).forEach(cat => {
    if (cat) cat.innerHTML = "";
  });

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

    card.addEventListener("click", () => abrirModal(p));

    if (categorias[p.categoriaSlug]) {
      categorias[p.categoriaSlug].appendChild(card);
    }
  });
}


// ==========================
// ABRIR MODAL
// ==========================
function abrirModal(produto) {
  produtoAtual = produto;

  modal.classList.remove("hidden");

  modalImg.src = produto.imagem;
  modalNome.innerText = produto.nome;
  modalPreco.innerText = "R$ " + produto.preco;
  modalTamanhos.innerText = "Tamanhos: " + produto.tamanhos.join(", ");

  modalWhatsapp.href = `https://wa.me/5519992850208?text=Tenho interesse na fantasia ${produto.nome}`;

  renderUpsell(produto);
}


// ==========================
// FECHAR MODAL
// ==========================
document.querySelector(".close").onclick = () => {
  modal.classList.add("hidden");
};

window.onclick = (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
};


// ==========================
// UPSELL COM IMAGEM + CSS
// ==========================
function renderUpsell(produto) {
  upsellDiv.innerHTML = "<h4>🔥 Complete seu look</h4>";

  if (!produto.upsell || produto.upsell.length === 0) return;

  let total = produto.preco;

  produto.upsell.forEach(id => {
    const acc = acessorios.find(a => a.id === id);

    if (acc) {
      total += acc.preco;

      const item = document.createElement("div");
      item.className = "upsell-item";

      item.innerHTML = `
        <img src="${acc.imagem}" alt="${acc.nome}">
        <span>${acc.nome} + R$ ${acc.preco}</span>
      `;

      upsellDiv.appendChild(item);
    }
  });

  const totalDiv = document.createElement("div");
  totalDiv.style.marginTop = "10px";
  totalDiv.innerHTML = `<strong>💰 Look completo: R$ ${total}</strong>`;
  upsellDiv.appendChild(totalDiv);
}


// ==========================
// BOTÃO COMPLETAR LOOK
// ==========================
btnUpsell.addEventListener("click", () => {
  if (!produtoAtual) return;

  let mensagem = `Quero o look completo:\n${produtoAtual.nome}\n`;
  let total = produtoAtual.preco;

  produtoAtual.upsell.forEach(id => {
    const acc = acessorios.find(a => a.id === id);

    if (acc) {
      mensagem += `+ ${acc.nome} (R$ ${acc.preco})\n`;
      total += acc.preco;
    }
  });

  mensagem += `Total: R$ ${total}`;

  const url = `https://wa.me/5519992850208?text=${encodeURIComponent(mensagem)}`;

  window.open(url, "_blank");
});


// ==========================
// QUIZ
// ==========================
const btnQuiz = document.getElementById("btn-quiz");

if (btnQuiz) {
  btnQuiz.addEventListener("click", () => {
    document.getElementById("quiz").scrollIntoView();
  });
}

document.querySelectorAll(".quiz-options button").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    const section = document.getElementById(target);

    if (section) section.scrollIntoView();
  });
});


// ==========================
// BUSCA
// ==========================
const buscaInput = document.getElementById("busca");

if (buscaInput) {
  buscaInput.addEventListener("input", () => {
    const termo = buscaInput.value.toLowerCase();

    document.querySelectorAll(".card").forEach(card => {
      const nome = card.innerText.toLowerCase();
      card.style.display = nome.includes(termo) ? "block" : "none";
    });
  });
}
