import fs from 'fs';
import pdf from 'pdf-parse';
// import pdf from 'pdf-parse/lib/pdf-parse.js';

export async function extractChunksFromPDF(filePath: string): Promise<string[]> {
    console.log("filePathfilePath", filePath)
    const dataBuffer = fs.readFileSync(filePath);
    console.log(dataBuffer, "dataBuffer")
      const { text } = await pdf(dataBuffer);
      console.log("text", text)
    // return []

  const chunks: string[] = [];
  const CHUNK_SIZE = 1000;

  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }

  return chunks;
}
