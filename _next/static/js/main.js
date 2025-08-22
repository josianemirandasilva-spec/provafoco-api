const form = document.querySelector("form");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", function(event) {
  event.preventDefault();
  const nota = parseFloat(document.getElementById("nota").value);

  if (nota >= 700) {
    mensagem.textContent = "🎉 Alta chance de aprovação!";
    mensagem.style.color = "green";
  } else if (nota >= 600) {
    mensagem.textContent = "⚠️ Chance mediana, continue estudando!";
    mensagem.style.color = "orange";
  } else {
    mensagem.textContent = "❌ Baixa chance. Não desanime!";
    mensagem.style.color = "red";
  }
});
