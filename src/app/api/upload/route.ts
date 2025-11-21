import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import { IncomingMessage } from 'http';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    // Get the file from FormData
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());

        // Absolute path to ./uploads in your project root
    const uploadsDir = path.join(process.cwd(), 'uploads');

    // Ensure the folder exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, file.name);
    await fs.promises.writeFile(filePath, buffer);
    // console.log("filePath====", filePath)
    return NextResponse.json({ path: filePath });
  } catch (err) {
    console.error('OpenAI Error:', err);
    return NextResponse.json({ text: 'Transcription failed.' }, { status: 500 });
  }
}