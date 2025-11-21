import { NextRequest, NextResponse } from 'next/server';
import { extractChunksFromPDF } from '@/utils/extractAndChunk';
import { embedChunks } from '@/utils/embedChunks';
import {  memoryStore, setMemoryVectorStore } from '@/utils/memoryStore';

export async function POST(req: NextRequest) {
  try {
    // const { path } = req.body;
    const { path } = await req.json();
    console.log(path,req)
    const chunks = await extractChunksFromPDF(path);
    const embedded = await embedChunks(chunks);
    setMemoryVectorStore(
       embedded
   );

    memoryStore.push(...embedded);
    console.log("memory store--->", memoryStore)
    return NextResponse.json({ message: 'Document processed.' });
  } catch (err) {
    console.error('OpenAI Error:', err);
    return NextResponse.json({ text: 'Transcription failed.' }, { status: 500 });
  }
}