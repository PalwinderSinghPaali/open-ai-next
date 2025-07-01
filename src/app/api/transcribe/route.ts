import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import formidable from 'formidable';
import fs from 'fs';
import { OpenAI } from 'openai';

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


export const config = {
  api: {
    bodyParser: false,
  },
};


// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const parseForm = async (req: Request) =>
  new Promise<{ filepath: string }>((resolve, reject) => {
    const form = formidable({ uploadDir: '/tmp', keepExtensions: true });
    console.log(req, form, req)

    form.parse(req as any, (err : any, fields : any, files: any) => {
      if (err) return reject(err);
      const file = files.file?.[0];
      resolve({ filepath: file.filepath });
    });
  });

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

    // Convert File to a ReadableStream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create transcription using OpenAI
    // const response = await openai.audio.transcriptions.create({
    //   file: new File([buffer], file.name, { type: file.type }),
    //   model: "whisper-1",
    // });

    //using groq ai
      const transcription = await groq.audio.transcriptions.create({
        file: new File([buffer], file.name, { type: file.type }), // Required path to audio file - replace with your audio file!
        model: "whisper-large-v3-turbo", // Required model to use for transcription
        prompt: "Specify context or spelling", // Optional
        response_format: "verbose_json", // Optional
        timestamp_granularities: ["word", "segment"], // Optional (must set response_format to "json" to use and can specify "word", "segment" (default), or both)
        // language: "en", // Optional
        temperature: 0.0, // Optional
    });


    //transalate speech to english using groq ai
    // const translation = await groq.audio.translations.create({
    //     file: new File([buffer], file.name, { type: file.type }), // Required path to audio file - replace with your audio file!
    //     model: "whisper-large-v3", // Required model to use for translation
    //     prompt: "Specify context or spelling", // Optional
    //     language: "en", // Optional ('en' only)
    //     response_format: "json", // Optional
    //     temperature: 0.0, // Optional
    // });

    console.log(JSON.stringify(transcription, null, 2));

    // await fs.promises.unlink(audioFile.filepath);

    return NextResponse.json({ text: transcription.text });
  } catch (err) {
    console.error('OpenAI Error:', err);
    return NextResponse.json({ text: 'Transcription failed.' }, { status: 500 });
  }
}
