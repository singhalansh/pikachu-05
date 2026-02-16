import { getAllCategories } from "@/lib/departments";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { title, category, description, imageBase64 } = await req.json();

        if (!process.env.OPENAI_API_KEY) {
            console.error("OPENAI_API_KEY not configured");
            // Fallback: treat as not verified to avoid accepting spam
            return NextResponse.json({ decision: "No" });
        }

        // Prompt for verifying issue legitimacy
        const verifyPrompt = `
You are verifying a civic issue report. Analyze if this is a legitimate civic issue that requires municipal attention.

Issue Title: "${title}"
Description: "${description}"

Check if:
1. The issue is a genuine civic problem (potholes, streetlights, garbage, water leakage, traffic signals, road damage, etc.)
2. The description matches the selected category
3. The description is reasonable and not spam/fake
4. If an image is provided, it should match the description

Only respond with exactly "Yes" or "No".
- "Yes" if it's a legitimate civic issue
- "No" if it's spam, fake, irrelevant, or doesn't match the category
`;

        // Prompt for validating / correcting the category
        const categoryPrompt = `
You are a helpful assistant analyzing the category of a civic issue report.
You will be given the title, category, and description of an issue.
Your job is to analyze them and determine the most appropriate category.

Issue Title: "${title}"
Category: "${category}"
Description: "${description}"

The available categories are: ${(await getAllCategories()).join(", ")}

Return only the category that best matches the issue. match the result word to word with the available categories.
`;

        // === Build request bodies ===
        const verifyContentParts: any[] = [{ type: "text", text: verifyPrompt }];
        const categoryContentParts: any[] = [
            { type: "text", text: categoryPrompt },
        ];

        let imagePart: any = null;

        // === Handle image if provided ===
        if (imageBase64) {
            // Extract mime type & raw base64
            const matches = imageBase64.match(
                /^data:(image\/\w+);base64,(.+)$/
            );
            let mimeType = "image/jpeg";
            let base64Data = imageBase64;

            if (matches) {
                mimeType = matches[1];
                base64Data = matches[2];
            } else if (imageBase64.includes(",")) {
                base64Data = imageBase64.split(",")[1];
            }

            imagePart = {
                type: "image_url",
                image_url: {
                    url: `data:${mimeType};base64,${base64Data}`,
                },
            };

            // Add image to both requests
            verifyContentParts.push(imagePart);
            categoryContentParts.push(imagePart);
        }

        const verifyRequestBody: any = {
            model: process.env.OPENAI_MODEL || "gpt-4.1",
            messages: [
                {
                    role: "user",
                    content: verifyContentParts,
                },
            ],
            temperature: 0.1,
            max_tokens: 10,
        };

        const categoryRequestBody: any = {
            model: process.env.OPENAI_MODEL || "gpt-4.1",
            messages: [
                {
                    role: "user",
                    content: categoryContentParts,
                },
            ],
            temperature: 0.1,
        };

        // === Call OpenAI APIs ===
        const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

        const [categoryResponse, verifyResponse] = await Promise.all([
            fetch(OPENAI_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify(categoryRequestBody),
            }),
            fetch(OPENAI_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify(verifyRequestBody),
            }),
        ]);

        if (!verifyResponse.ok) {
            console.error(
                "OpenAI API verification error:",
                verifyResponse.status,
                await verifyResponse.text()
            );
            return NextResponse.json({ decision: "No" });
        }

        if (!categoryResponse.ok) {
            console.error(
                "OpenAI API category error:",
                categoryResponse.status,
                await categoryResponse.text()
            );
        }

        // === Parse responses ===
        const verifyData: any = await verifyResponse.json();
        const categoryData: any = await categoryResponse.json();

        const getTextFromChoice = (data: any, fallback: string) => {
            const choice = data?.choices?.[0];
            const message = choice?.message;

            if (!message) return fallback;

            if (typeof message.content === "string") {
                return message.content;
            }

            if (Array.isArray(message.content)) {
                return message.content
                    .filter((part: any) => part.type === "text" && part.text)
                    .map((part: any) => part.text)
                    .join("\n");
            }

            return fallback;
        };

        const verifyText = getTextFromChoice(verifyData, "No");
        const categoryText = getTextFromChoice(categoryData, category);

        const decision = verifyText.trim().toLowerCase().includes("yes")
            ? "Yes"
            : "No";

        console.log("=== OPENAI VERIFICATION RESULT ===");
        console.log("Title:", title);
        console.log("Category (user):", category);
        console.log("Category (AI):", categoryText.trim());
        console.log("Description:", description);
        console.log("Has Image:", !!imageBase64);
        console.log("OpenAI Verify Response:", verifyText.trim());
        console.log("Final Decision:", decision);
        console.log(
            "Available Categories:",
            (await getAllCategories()).join(", ")
        );
        console.log("=====================================");
        return NextResponse.json({ decision, category: categoryText.trim() });
    } catch (error) {
        console.error("Gemini verification error:", error);
        return NextResponse.json({ decision: "No" });
    }
}
