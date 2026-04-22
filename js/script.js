// ==========================
// VARIÁVEIS
// ==========================
let produtos = [];
let acessorios = [];
let produtoAtual = null;

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
.then(([f, a]) => {
  produtos = f;
  acessorios = a;
  renderProdutos();
});

// ==========================
// RENDER PRODUTOS
// ==========================
function renderProdutos(lista = produtos) {

  const categorias = {
    bad: document.querySelector("#bad .grid"),
    fun: document.querySelector("#fun .grid"),
    pop: document.querySelector("#pop .grid"),
    luxo: document.querySelector("#luxo .grid")
  };

  Object.values(categorias).forEach(c => c.innerHTML = "");

  lista.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${p.imagem}">
      <div class="info">
        <h3>${p.nome}</h3>
        <p>R$ ${p.preco}</p>
      </div>
    `;

    card.onclick = () => abrirModal(p);

    if (categorias[p.categoriaSlug]) {
      categorias[p.categoriaSlug].appendChild(card);
    }
  });
}

// ==========================
// MODAL
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

// fechar modal
document.querySelector(".close").onclick = () => modal.classList.add("hidden");
window.onclick = (e) => { if (e.target === modal) modal.classList.add("hidden"); };

// ==========================
// UPSSELL
// ==========================
function renderUpsell(produto) {
  upsellDiv.innerHTML = "<h4>🔥 Complete seu look</h4>";

  if (!produto.upsell) return;

  produto.upsell.forEach(id => {
    const acc = acessorios.find(a => a.id === id);

    if (acc) {
      const item = document.createElement("div");
      item.className = "upsell-item";

      item.innerHTML = `
        <input type="checkbox" data-id="${acc.id}" data-preco="${acc.preco}">
        <img src="${acc.imagem}">
        <span>${acc.nome} + R$ ${acc.preco}</span>
      `;

      upsellDiv.appendChild(item);
    }
  });

  const total = document.createElement("div");
  total.id = "total-combo";
  upsellDiv.appendChild(total);

  atualizarTotal(produto);

  upsellDiv.querySelectorAll("input").forEach(i => {
    i.addEventListener("change", () => atualizarTotal(produto));
  });
}

// ==========================
// CÁLCULO
// ==========================
function calcularValores(produto) {

  const selecionados = upsellDiv.querySelectorAll("input:checked");

  let totalAcessorios = 0;

  selecionados.forEach(cb => {
    totalAcessorios += Number(cb.dataset.preco);
  });

  let qtd = selecionados.length;
  let desconto = 0;

  if (qtd === 1) desconto = 0.05;
  if (qtd === 2) desconto = 0.08;
  if (qtd >= 3) desconto = 0.10;

  let descontoValor = produto.preco * desconto;
  let precoComDesconto = produto.preco - descontoValor;
  let totalFinal = precoComDesconto + totalAcessorios;

  return { totalAcessorios, descontoValor, precoComDesconto, totalFinal };
}

// ==========================
// ATUALIZAR TOTAL
// ==========================
function atualizarTotal(produto) {
  const v = calcularValores(produto);

  document.getElementById("total-combo").innerHTML = `
    💰 <s>R$ ${produto.preco}</s><br>
    🎁 R$ ${v.precoComDesconto.toFixed(2)}<br>
    🧩 + R$ ${v.totalAcessorios}<br>
    💸 Economia: R$ ${v.descontoValor.toFixed(2)}<br>
    <strong>🔥 Total: R$ ${v.totalFinal.toFixed(2)}</strong>
  `;
}

// ==========================
// BOTÃO WHATSAPP
// ==========================
btnUpsell.onclick = () => {

  const v = calcularValores(produtoAtual);

  let msg = `Quero o look:\n${produtoAtual.nome}\n`;

  upsellDiv.querySelectorAll("input:checked").forEach(cb => {
    const acc = acessorios.find(a => a.id === cb.dataset.id);
    msg += `+ ${acc.nome} (R$ ${acc.preco})\n`;
  });

  msg += `\n💰 Total: R$ ${v.totalFinal.toFixed(2)}`;

  window.open(`https://wa.me/5519992850208?text=${encodeURIComponent(msg)}`);
};

// ==========================
// BUSCA
// ==========================
document.getElementById("busca").addEventListener("input", e => {
  const termo = e.target.value.toLowerCase();

  const filtrado = produtos.filter(p =>
    p.nome.toLowerCase().includes(termo)
  );

  renderProdutos(filtrado);
});

// ==========================
// QUIZ + CATEGORIAS
// ==========================
document.querySelectorAll("[data-target]").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.target;
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  });
});
