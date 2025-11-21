import { NextRequest, NextResponse } from 'next/server';
import { extractChunksFromPDF } from '@/utils/extractAndChunk';
import { embedChunks, embedQuery, searchRelevantChunks } from '@/utils/embedChunks';
import {memoryStore, getMemoryVectorStore } from '@/utils/memoryStore';
import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    // const { path } = req.body;
    const { question } = await req.json();
  const queryEmbedding = await embedQuery(question);
  const contextChunks = searchRelevantChunks(queryEmbedding, getMemoryVectorStore());

  const context = contextChunks.map(c => c.text).join('\n\n');

//   const result = await chatModel.generateContent([
//     { role: 'user', parts: `Answer this question based only on the following context:\n\n${context}\n\nQuestion: ${question}` },
//   ]);
console.log("contextChunks------",context, contextChunks,"a",  getMemoryVectorStore())

  const result = await chatModel.generateContent(`Answer this question based only on the following context:${context}Question: ${question}`);

  const text = result.response.text();

//   const completion = await openai.chat.completions.create({
//     model: 'gpt-4',
//     messages: [
//       {
//         role: 'system',
//         content: 'Answer using the provided context only.',
//       },
//       {
//         role: 'user',
//         content: `Answer based on this context:\n\n${contextChunks.map((c: any) => c.text).join('\n\n')}\n\nQuestion: ${question}`,
//       },
//     ],
//   });
//     return NextResponse.json({ answer: completion.choices[0].message.content });
    return NextResponse.json({ answer: text });
  } catch (err) {
    console.error('OpenAI Error:', err);
    return NextResponse.json({ text: 'Transcription failed.' }, { status: 500 });
  }
}