import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { title, category, description, imageBase64 } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are verifying if this is a legitimate civic/municipal issue that should be reported to local authorities.

Title: "${title}"
Category: "${category}"  
Description: "${description}"
Has Image: ${!!imageBase64}

A legitimate civic issue includes:
- Infrastructure problems (roads, water, electricity, sewage)
- Public safety concerns
- Municipal service issues
- Environmental problems
- Traffic/transportation issues
- Parks and recreation problems
- Any issue that local government should address

REJECT only if:
- Clearly spam, joke, or nonsensical
- Personal disputes between individuals
- Commercial complaints
- Issues outside municipal authority

For the issue described above, respond with exactly one word:
- "Yes" if this is a legitimate civic issue
- "No" if this should be rejected

Response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean up response to get just Yes/No
    text = text.replace(/[^a-zA-Z]/g, '');
    const decision = text.toLowerCase().includes('yes') ? 'Yes' : 'No';
    
    console.log('=== GEMINI VERIFICATION DEBUG ===');
    console.log('Title:', title);
    console.log('Category:', category);
    console.log('Description:', description.substring(0, 100));
    console.log('Raw Gemini Response:', response.text());
    console.log('Cleaned Response:', text);
    console.log('Final Decision:', decision);
    console.log('================================');

    return NextResponse.json({
      decision,
      category: category, // Keep original category
      reasoning: decision === 'Yes' ? 'Legitimate civic issue' : 'Not a valid civic issue'
    });

  } catch (error) {
    console.error('Verification error:', error);
    // Default to Yes on error to avoid blocking legitimate issues
    return NextResponse.json({
      decision: 'Yes',
      category: 'Road Maintenance',
      reasoning: 'Verification service unavailable, defaulting to approve'
    });
  }
}