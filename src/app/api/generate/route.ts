import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  try {
    // const completion = await openai.chat.completions.create({
    //   model: 'gpt-4o',
    //   messages: [{ role: 'user', content: prompt }],
    // });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

  console.log("Result response --->", completion)

    return NextResponse.json({ response: completion.choices[0].message.content });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to get response from OpenAI' }, { status: 500 });
  }
}
