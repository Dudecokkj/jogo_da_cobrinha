const canvas = document.getElementById("tela");
const ctx = canvas.getContext("2d");
const elPontos = document.getElementById("pontos");
const elRecorde = document.getElementById("recorde");
const elMensagem = document.getElementById("mensagem");

const TAMANHO = 20; // tamanho de cada célula em pixels
const CELULAS = canvas.width / TAMANHO;
const VELOCIDADE_MS = 110;

const DIRECOES = {
  cima: { x: 0, y: -1 },
  baixo: { x: 0, y: 1 },
  esquerda: { x: -1, y: 0 },
  direita: { x: 1, y: 0 },
};

const TECLAS = {
  ArrowUp: "cima", w: "cima", W: "cima",
  ArrowDown: "baixo", s: "baixo", S: "baixo",
  ArrowLeft: "esquerda", a: "esquerda", A: "esquerda",
  ArrowRight: "direita", d: "direita", D: "direita",
};

let cobra, direcao, proximaDirecao, comida, pontos, recorde, timer, jogando;

function lerRecorde() {
  try {
    return Number(localStorage.getItem("cobrinha-recorde")) || 0;
  } catch (e) {
    return 0;
  }
}

function salvarRecorde(valor) {
  try {
    localStorage.setItem("cobrinha-recorde", String(valor));
  } catch (e) {
    /* armazenamento indisponível: ignora */
  }
}

function novaComida() {
  let posicao;
  do {
    posicao = {
      x: Math.floor(Math.random() * CELULAS),
      y: Math.floor(Math.random() * CELULAS),
    };
  } while (cobra.some((p) => p.x === posicao.x && p.y === posicao.y));
  return posicao;
}

function reiniciar() {
  clearInterval(timer);
  const meio = Math.floor(CELULAS / 2);
  cobra = [{ x: meio, y: meio }];
  direcao = DIRECOES.direita;
  proximaDirecao = direcao;
  pontos = 0;
  recorde = lerRecorde();
  comida = novaComida();
  jogando = false;
  elPontos.textContent = pontos;
  elRecorde.textContent = recorde;
  elMensagem.textContent = "Pressione uma seta (ou WASD) para começar";
  desenhar();
}

function iniciar() {
  if (jogando) return;
  jogando = true;
  elMensagem.textContent = "";
  timer = setInterval(passo, VELOCIDADE_MS);
}

function mudarDirecao(nome) {
  const nova = DIRECOES[nome];
  // não permite voltar na direção oposta
  if (nova.x === -direcao.x && nova.y === -direcao.y && cobra.length > 1) return;
  proximaDirecao = nova;
  iniciar();
}

function fimDeJogo() {
  clearInterval(timer);
  jogando = false;
  if (pontos > recorde) {
    recorde = pontos;
    salvarRecorde(recorde);
    elRecorde.textContent = recorde;
    elMensagem.textContent = `Novo recorde: ${pontos}! Clique em Reiniciar.`;
  } else {
    elMensagem.textContent = `Fim de jogo! Você fez ${pontos} pontos.`;
  }
}

function passo() {
  direcao = proximaDirecao;
  const cabeca = { x: cobra[0].x + direcao.x, y: cobra[0].y + direcao.y };

  const bateuParede = cabeca.x < 0 || cabeca.y < 0 || cabeca.x >= CELULAS || cabeca.y >= CELULAS;
  const bateuCorpo = cobra.some((p) => p.x === cabeca.x && p.y === cabeca.y);
  if (bateuParede || bateuCorpo) {
    fimDeJogo();
    return;
  }

  cobra.unshift(cabeca);
  if (cabeca.x === comida.x && cabeca.y === comida.y) {
    pontos += 1;
    elPontos.textContent = pontos;
    comida = novaComida();
  } else {
    cobra.pop();
  }
  desenhar();
}

function desenhar() {
  ctx.fillStyle = "#161d26";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f87171";
  ctx.fillRect(comida.x * TAMANHO + 2, comida.y * TAMANHO + 2, TAMANHO - 4, TAMANHO - 4);

  cobra.forEach((parte, i) => {
    ctx.fillStyle = i === 0 ? "#4ade80" : "#22c55e";
    ctx.fillRect(parte.x * TAMANHO + 1, parte.y * TAMANHO + 1, TAMANHO - 2, TAMANHO - 2);
  });
}

document.addEventListener("keydown", (e) => {
  const nome = TECLAS[e.key];
  if (!nome) return;
  e.preventDefault();
  mudarDirecao(nome);
});

document.querySelectorAll("[data-dir]").forEach((botao) => {
  botao.addEventListener("click", () => mudarDirecao(botao.dataset.dir));
});

document.getElementById("reiniciar").addEventListener("click", reiniciar);

reiniciar();
