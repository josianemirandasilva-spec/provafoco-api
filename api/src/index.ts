
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { estimateCutoffAndRank } from './estimator';

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req,res)=> res.json({ok:true}));

// Create Exam
app.post('/exams', async (req,res)=>{
  const schema = z.object({
    banca: z.string(), orgao: z.string(), cargo: z.string(),
    dtProva: z.string(), nQuestoes: z.number().int().min(1),
    pesosJson: z.any().optional()
  });
  const data = schema.parse(req.body);
  const exam = await prisma.exam.create({
    data: { ...data, dtProva: new Date(data.dtProva) }
  });
  res.json(exam);
});

// Create Ranking
app.post('/rankings', async (req,res)=>{
  const schema = z.object({ examId: z.string(), adesao: z.number().min(0).max(1).optional() });
  const { examId, adesao } = schema.parse(req.body);
  const ranking = await prisma.ranking.create({ data: { examId, adesao } });
  res.json(ranking);
});

// Get Ranking with stats
app.get('/rankings/:id', async (req,res)=>{
  const id = req.params.id;
  const ranking = await prisma.ranking.findUnique({ where: { id }, include: { submissions: true, cutoffEstimates: true, exam: true } });
  if (!ranking) return res.status(404).json({error: 'not found'});
  // compute quick estimate
  const scores = ranking.submissions.map(s=> s.acertos);
  const vagas = 50; // placeholder
  const totalInscritos = 5000; // placeholder
  const est = estimateCutoffAndRank(scores, totalInscritos, vagas);
  res.json({ ranking, estimate: est });
});

// Submit gabarito
app.post('/submissions', async (req,res)=>{
  const schema = z.object({
    rankingId: z.string(),
    gabarito: z.array(z.string()),
    gabaritoOficial: z.array(z.string()).optional()
  });
  const { rankingId, gabarito, gabaritoOficial } = schema.parse(req.body);
  const ranking = await prisma.ranking.findUnique({ where: { id: rankingId }, include: { exam: true } });
  if (!ranking) return res.status(404).json({error:'ranking not found'});
  const official = (gabaritoOficial && gabaritoOficial.length === gabarito.length) ? gabaritoOficial : gabarito; // MVP: auto-correção
  const acertos = gabarito.reduce((acc, alt, i)=> acc + (official[i]===alt ? 1 : 0), 0);
  const notaBruta = acertos; // MVP: sem pesos
  const sub = await prisma.submission.create({ data: { rankingId, gabarito, acertos, notaBruta } as any });
  res.json(sub);
});

// Migration helper
async function migrate() {
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
}

const port = process.env.PORT || 3001;
app.listen(port, ()=> console.log(`API on :${port}`));

export {};
