// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import {
  GoogleGenAI,
} from '@google/genai';

async function main() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  
  const model = 'gemini-2.5-flash';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `あなたは20歳のモテる若者であり、返信を考えるプロです。
以下の相手からのメッセージに対して、モテる男性が返すような「余裕・ユーモア・包容力」を含んだ返信を3つ考えてください。
あくまで自然で、長すぎない返信にすることも意識してください。`,
        },
      ],
    },
    {
      role: 'model',
      parts: [
        {
          text: `お任せください。
どのようなメッセージへの返信を考えましょうか？

相手の方から送られてきたメッセージを教えてください。その内容に合わせて、最高の返信を3つ提案します。`,
        },
      ],
    },
    {
      role: 'user',
      parts: [
        {
          text: `INSERT_INPUT_HERE`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    contents,
  });
  
  let fullResponse = '';
  for await (const chunk of response) {
    console.log(chunk.text);
    fullResponse += chunk.text;
  }
  
  return fullResponse;
}

// テスト用のメッセージ
const testMessage = "今日は仕事で疲れたから、早めに寝ようかな";

// テスト実行
main().catch(console.error); 