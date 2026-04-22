const produtos = [
  {
    id: 1,
    nome: "Aeromoça",
    preco: 110,
    imagem: "assets/images/aeromoca.jpg",
    upsell: [1,2]
  }
];

const acessorios = [
  {
    id: 1,
    nome: "Luva Branca",
    preco: 15,
    imagem: "assets/images/luva.jpg"
  },
  {
    id: 2,
    nome: "Óculos Gatinho",
    preco: 20,
    imagem: "assets/images/oculos.jpg"
  }
];

const grid = document.getElementById("grid");
const modal = document.getElementById("modal");
const upsellDiv = document.getElementById("upsell");

function renderProdutos() {
  grid.innerHTML = "";

  produtos.forEach(produto => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${produto.imagem}">
      <div class="card-info">
        <h3>${produto.nome}</h3>
        <p>R$ ${produto.preco}</p>
      </div>
    `;

    card.addEventListener("click", () => abrirModal(produto));

    grid.appendChild(card);
  });
}

function abrirModal(produto) {
  modal.classList.remove("hidden");

  document.getElementById("modal-img").src = produto.imagem;
  document.getElementById("modal-nome").innerText = produto.nome;
  document.getElementById("modal-preco").innerText = `R$ ${produto.preco}`;

  renderUpsell(produto);
}

function fecharModal() {
  modal.classList.add("hidden");
}

function renderUpsell(produto) {
  upsellDiv.innerHTML = "<h4>🔥 Complete seu look</h4>";

  if (!produto.upsell || produto.upsell.length === 0) return;

  produto.upsell.forEach(id => {
    const acc = acessorios.find(a => a.id === id);

    if (!acc) return;

    const item = document.createElement("div");
    item.className = "upsell-item";

    item.innerHTML = `
      <img src="${acc.imagem}" alt="${acc.nome}">
      <div class="upsell-info">
        <span>${acc.nome}</span>
        <strong>+ R$ ${acc.preco}</strong>
      </div>
    `;

    upsellDiv.appendChild(item);
  });
}

/* INICIALIZAÇÃO SEGURA */
document.addEventListener("DOMContentLoaded", () => {
  renderProdutos();
});
