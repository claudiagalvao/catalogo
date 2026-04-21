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
// UPSELL COM SELEÇÃO
// ==========================
function renderUpsell(produto) {
  upsellDiv.innerHTML = "<h4>🔥 Complete seu look</h4>";

  if (!produto.upsell || produto.upsell.length === 0) return;

  produto.upsell.forEach(id => {
    const acc = acessorios.find(a => a.id === id);

    if (acc) {
      const item = document.createElement("div");
      item.className = "upsell-item";

      item.innerHTML = `
        <input type="checkbox" data-id="${acc.id}" data-preco="${acc.preco}">
        <img src="${acc.imagem}" alt="${acc.nome}">
        <span>${acc.nome} + R$ ${acc.preco}</span>
      `;

      upsellDiv.appendChild(item);
    }
  });

  // TOTAL
  const totalDiv = document.createElement("div");
  totalDiv.id = "total-combo";
  totalDiv.style.marginTop = "10px";
  upsellDiv.appendChild(totalDiv);

  atualizarTotal(produto);

  upsellDiv.querySelectorAll("input").forEach(input => {
    input.addEventListener("change", () => atualizarTotal(produto));
  });
}


// ==========================
// CÁLCULO COM DESCONTO
// ==========================
function atualizarTotal(produto) {
  const checkboxes = upsellDiv.querySelectorAll("input:checked");

  let totalAcessorios = 0;

  checkboxes.forEach(cb => {
    totalAcessorios += parseFloat(cb.dataset.preco);
  });

  let quantidade = checkboxes.length;
  let desconto = 0;

  if (quantidade === 1) desconto = 0.05;
  if (quantidade === 2) desconto = 0.08;
  if (quantidade >= 3) desconto = 0.10;

  let descontoValor = produto.preco * desconto;
  let totalFinal = produto.preco - descontoValor + totalAcessorios;

  document.getElementById("total-combo").innerHTML = `
    💰 Fantasia: R$ ${produto.preco}<br>
    🧩 Acessórios: R$ ${totalAcessorios}<br>
    🎁 Desconto: -R$ ${descontoValor.toFixed(2)}<br>
    <strong>🔥 Total: R$ ${totalFinal.toFixed(2)}</strong>
  `;
}


// ==========================
// BOTÃO COMPLETAR LOOK
// ==========================
btnUpsell.addEventListener("click", () => {
  if (!produtoAtual) return;

  const checkboxes = upsellDiv.querySelectorAll("input:checked");

  let mensagem = `Quero o look:\n${produtoAtual.nome}\n`;
  let total = produtoAtual.preco;

  checkboxes.forEach(cb => {
    const acc = acessorios.find(a => a.id === cb.dataset.id);

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
