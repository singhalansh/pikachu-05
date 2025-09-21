// app/api/auto-categorize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { description, title, availableCategories } = await request.json();

    if (!description || !availableCategories) {
      return NextResponse.json(
        { error: 'Description and available categories are required' },
        { status: 400 }
      );
    }

    // Define the standard categories for civic issues
    const standardCategories = [
      'Electrical Services',
      'Parks & Recreation', 
      'Road Maintenance',
      'Sanitation',
      'Traffic Management',
      'Water & Sewage'
    ];

    try {
      // Use Gemini AI for intelligent categorization
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `You are an AI assistant helping categorize civic issues reported by citizens. 

Available categories:
${standardCategories.map(cat => `- ${cat}`).join('\n')}

Issue Title: "${title || 'No title'}"
Issue Description: "${description}"

Analyze this civic issue and determine the most appropriate category from the list above. Consider:
1. The main problem described
2. Which department would handle this issue
3. The type of infrastructure or service affected

Respond with ONLY a JSON object in this exact format:
{
  "suggestedCategory": "category_name",
  "confidence": 0.85,
  "reasoning": "brief explanation of why this category fits"
}

The confidence should be a number between 0.0 and 1.0 where:
- 0.9-1.0: Very confident match
- 0.7-0.89: Good match  
- 0.5-0.69: Moderate match
- 0.3-0.49: Weak match
- 0.0-0.29: Very weak/uncertain match`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response from Gemini
      let geminiResult;
      try {
        // Clean up the response text to extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          geminiResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', text);
        throw new Error('Invalid response format from AI');
      }

      // Validate that the suggested category is in our standard list
      if (!standardCategories.includes(geminiResult.suggestedCategory)) {
        // Fallback to keyword-based matching if Gemini suggests invalid category
        geminiResult.suggestedCategory = fallbackCategorize(description, title, standardCategories);
        geminiResult.confidence = 0.4;
        geminiResult.reasoning = "AI suggested invalid category, used fallback matching";
      }

      console.log('Gemini categorization result:', {
        input: `${title} - ${description}`.substring(0, 100),
        suggestedCategory: geminiResult.suggestedCategory,
        confidence: Math.round(geminiResult.confidence * 100),
        reasoning: geminiResult.reasoning
      });

      return NextResponse.json({
        suggestedCategory: geminiResult.suggestedCategory,
        confidence: geminiResult.confidence,
        reasoning: geminiResult.reasoning,
        source: 'gemini-ai'
      });

    } catch (aiError) {
      console.error('Gemini AI error:', aiError);
      
      // Fallback to keyword-based categorization
      const fallbackResult = fallbackCategorize(description, title, standardCategories);
      
      return NextResponse.json({
        suggestedCategory: fallbackResult,
        confidence: 0.6,
        reasoning: "AI service unavailable, used keyword-based matching",
        source: 'fallback'
      });
    }

  } catch (error) {
    console.error('Auto-categorize error:', error);
    return NextResponse.json(
      { error: 'Failed to categorize issue' },
      { status: 500 }
    );
  }
}

// Fallback keyword-based categorization
function fallbackCategorize(description: string, title: string, categories: string[]): string {
  const categorizeText = `${title || ''} ${description}`.toLowerCase();
  
  const categoryKeywords: Record<string, string[]> = {
    'Road Maintenance': ['road', 'pothole', 'pavement', 'street', 'asphalt', 'crack', 'intersection', 'sidewalk', 'curb', 'lane', 'highway', 'bridge', 'path', 'walkway'],
    'Water & Sewage': ['water', 'leak', 'pipe', 'drainage', 'flood', 'sewer', 'sewage', 'drain', 'burst', 'overflow', 'blockage', 'pressure', 'supply', 'plumbing', 'manhole'],
    'Electrical Services': ['electricity', 'power', 'streetlight', 'lamp', 'light', 'cable', 'wire', 'outage', 'pole', 'transformer', 'electric', 'voltage', 'bulb'],
    'Sanitation': ['garbage', 'trash', 'waste', 'bin', 'collection', 'recycling', 'disposal', 'litter', 'rubbish', 'dump', 'cleanup', 'dustbin', 'sweeping'],
    'Parks & Recreation': ['park', 'playground', 'garden', 'tree', 'bench', 'recreation', 'sport', 'grass', 'facility', 'equipment', 'green', 'plants', 'flowers'],
    'Traffic Management': ['traffic', 'signal', 'sign', 'parking', 'congestion', 'speed', 'stop', 'yield', 'crosswalk', 'zebra', 'signal', 'jam', 'vehicle']
  };

  let bestMatch = categories[0];
  let bestScore = 0;

  // Score each category based on keyword matches
  for (const category of categories) {
    const keywords = categoryKeywords[category] || [];
    let score = 0;
    
    keywords.forEach(keyword => {
      const matches = (categorizeText.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
      score += matches * 2;
      
      // Also check for partial matches
      if (categorizeText.includes(keyword)) {
        score += 1;
      }
    });

    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }

  return bestMatch;
}