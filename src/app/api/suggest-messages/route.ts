import axios from 'axios';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // Define the prompt for generating text
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    // Make a request to DeepAI API
    const response = await axios.post(
      'https://api.deepai.org/api/text-generator',
      {
        text: prompt,
      },
      {
        headers: {
          'Api-Key': process.env.DEEPAI_API_KEY, // Make sure your API key is correct
        },
      }
    );

    // Check if the response contains the expected output
    if (response.data && response.data.output) {
      // Extract the generated text
      const generatedText = response.data.output;
      // Return the generated text as a response
      return NextResponse.json({ suggestion: generatedText });
    } else {
      // If there's no output, log and return a specific error
      console.error('No output in response:', response.data);
      return NextResponse.json({ error: 'No suggestion returned from DeepAI API' }, { status: 500 });
    }
  } catch (error) {
    // Enhanced error handling for DeepAI API request
    if (axios.isAxiosError(error)) {
      // If the error is a response error (e.g., 4xx or 5xx)
      console.error('DeepAI API responded with an error:', error.response?.data);
      const errorMessage = error.response ? error.response.data : 'Unknown error';
      return NextResponse.json({ error: `DeepAI API error: ${errorMessage}` }, { status: 500 });
    } else if ((error as any).request) {
      // If the error is related to the request (e.g., no response received)
      console.error('No response received from DeepAI API:', (error as any).request);
      return NextResponse.json({ error: 'No response from DeepAI API' }, { status: 500 });
    } else {
      // General error handling
      console.error('Error generating text:', (error as any).message);
      return NextResponse.json({ error: `Error generating text: ${(error as any).message}` }, { status: 500 });
    }
  }
}