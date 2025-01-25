// import OpenAI from 'openai';
// import { NextResponse } from 'next/server';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export const runtime = 'edge';

// export async function POST(req: Request) {
//   try {
//     const prompt =
//       "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

//     // Toggle between real API call and mock response
//     const useMockResponse = false;

//     if (useMockResponse) {
//       // Mocked response for testing
//       const mockedResponse = {
//         choices: [
//           {
//             text: "What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?",
//           },
//         ],
//       };

//       // Directly return mocked response
//       return NextResponse.json(mockedResponse);
//     } else {
//       // Real API call with streaming
//       const response = await openai.chat.completions.create({
//         model: 'gpt-4', // You can switch to gpt-3.5-turbo if needed
//         messages: [{ role: 'user', content: prompt }],
//         stream: true, // Enable streaming
//       });

//       // We need to convert the stream returned by OpenAI to a ReadableStream that can be passed to NextResponse.
//       const stream = new ReadableStream({
//         async start(controller) {
//           for await (const chunk of response) {
//             controller.enqueue(chunk);
//           }
//           controller.close();
//         },
//         cancel() {
//           console.log('Stream cancelled');
//         }
//       });

//       return new NextResponse(stream); // Return the ReadableStream to the response
//     }
//   } catch (error) {
//     console.error('An error occurred:', error);

//     if (error instanceof OpenAI.APIError) {
//       const { name, status, headers, message } = error;
//       return NextResponse.json({ name, status, headers, message }, { status });
//     }

//     return NextResponse.json({ message: 'Unexpected error occurred' }, { status: 500 });
//   }
// }


import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

const fallbackMessages = [
  "What's something you've always wanted to learn?",
  "If you could travel anywhere, where would you go?",
  "What's your favorite way to spend a weekend?",
  "What’s a book that really made an impact on you?",
  "If you could meet anyone from history, who would it be and why?",
  "What’s one thing you can’t live without?"
];

export async function POST() {
  const prompt =
    "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

  // Toggle between real API call and mock response
  const useMockResponse = false;

  try {
    if (useMockResponse) {
      // Mocked response for testing
      const mockedResponse = {
        choices: [
          {
            text: "What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?",
          },
        ],
      };

      return NextResponse.json(mockedResponse);
    } else {
      // Real API call with streaming
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // You can switch to gpt-3.5-turbo if needed
        messages: [{ role: 'user', content: prompt }],
        stream: true, // Enable streaming
      });

      // We need to convert the stream returned by OpenAI to a ReadableStream that can be passed to NextResponse.
      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of response) {
            controller.enqueue(chunk);
          }
          controller.close();
        },
        cancel() {
          console.log('Stream cancelled');
        }
      });

      return new NextResponse(stream); // Return the ReadableStream to the response
    }
  } catch (error) {
    console.error('AI API request failed:', error);

    // Random fallback message in case of error
    const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

    // Return fallback message as a response
    return NextResponse.json({
      choices: [
        {
          text: randomMessage,
        },
      ],
    });
  }
}