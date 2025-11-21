import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function embedWithGoogle(text: string) {
  const model = genAI.getGenerativeModel({ model: 'embedding-001' });
  const result = await model.embedContent({
    content: { parts: [{ text }], role: 'user' }
  });

  return result.embedding.values;
}

export async function embedChunks(chunks: string[]) {
  const embeddings = await Promise.all(
    chunks.map(async (chunk) => {
        //with open ai
    //   const res = await openai.embeddings.create({
    //     model: 'text-embedding-3-small',
    //     input: chunk,
    //   });
    //   return {
    //     embedding: res.data[0].embedding,
    //     text: chunk,
    //   };

// with gemini
      return {
        embedding: await embedWithGoogle(chunk),
        text: chunk,
      };
    })
  );
  return embeddings;
}

export async function embedQuery(text: string) {
    // with gemini
    return await embedWithGoogle(text);
    // with open ai
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return res.data[0].embedding;
}

export function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (magA * magB);
}

export function searchRelevantChunks(queryEmbedding: any, documents: any, topK = 3) {
  const scored = documents.map((doc: any) => ({
    ...doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
  }));
  return scored.sort((a: any, b: any) => b.score - a.score).slice(0, topK);
}

