
export function estimateCutoffAndRank(scores: number[], totalInscritos: number, vagas: number) {
  // scores: acertos dos participantes do ranking (amostra)
  // Modelo super simplificado: estimar taxa média de acerto (p) e dispersão beta.
  const n = scores.length;
  if (n === 0) {
    return { corte: 0, p25: 0, p50: 0, p75: 0, rank: null };
  }
  const max = Math.max(...scores);
  const mean = scores.reduce((a,b)=>a+b,0)/n;
  const varSample = scores.map(s=> (s-mean)**2).reduce((a,b)=>a+b,0)/Math.max(1,(n-1));
  const pHat = mean / max;
  // pseudo-parâmetros alfa/beta com heurística (não rigoroso, mas funcional)
  const k = 20; // força do prior
  const alpha = Math.max(1, pHat * k);
  const beta = Math.max(1, (1 - pHat) * k);
  // Quantil de acertos para vagas/total
  const quantil = vagas/Math.max(1,totalInscritos);
  // Função inversa aproximada de quantil beta-binomial é complicada. Usar percentis empíricos + uplift.
  const sorted = [...scores].sort((a,b)=>a-b);
  const q = (p)=> sorted[Math.min(sorted.length-1, Math.max(0, Math.floor(p*(sorted.length-1))))];
  const p25 = q(0.25);
  const p50 = q(0.5);
  const p75 = q(0.75);
  // Corte aproximado: p75 com ajuste de adesão (assume adesão 20%)
  const adesao = Math.min(0.9, Math.max(0.05, n/Math.max(1,totalInscritos)));
  const ajuste = 1 + (0.2 - adesao) * 0.4; // se baixa adesão, aumenta corte um pouco
  const corte = Math.round(p75 * ajuste);
  return { corte, p25, p50, p75, rank: null };
}
