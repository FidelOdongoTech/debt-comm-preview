import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

const CustomerProfileSchema = z.object({
  name: z.string(),
  debt_amount: z.number(),
  days_past_due: z.number(),
  customer_segment: z.enum(["long-term", "new", "chronic_defaulter"]),
  hardship_reason: z.string().optional(),
  preferred_channel: z.enum(["email", "sms", "whatsapp"]),
});

const MessageResponseSchema = z.object({
  channel: z.string(),
  tone: z.string(),
  subject: z.string().optional(),
  content: z.string(),
});

function determineTone(profile: z.infer<typeof CustomerProfileSchema>): string {
  if (profile.hardship_reason) {
    return "highly empathetic and supportive";
  }
  if (profile.customer_segment === "long-term" && profile.days_past_due < 30) {
    return "friendly reminder, appreciative of loyalty";
  }
  if (profile.days_past_due > 90 || profile.customer_segment === "chronic_defaulter") {
    return "firm, formal, and urgent";
  }
  return "professional and helpful";
}

function parseMessageResponse(rawContent: string): { subject?: string; content: string } {
  let subject: string | undefined;
  let content = rawContent;

  // Try to extract subject and content from the response
  if (rawContent.includes("Subject:") && rawContent.includes("Content:")) {
    const contentIndex = rawContent.indexOf("Content:");
    const subjectSection = rawContent.substring(0, contentIndex);
    const contentSection = rawContent.substring(contentIndex + 8);
    
    subject = subjectSection.replace(/Subject:/i, "").trim();
    content = contentSection.trim();
  } else if (rawContent.includes("Subject:")) {
    const lines = rawContent.split("\n");
    const subjectLine = lines.find(line => line.includes("Subject:"));
    if (subjectLine) {
      subject = subjectLine.replace(/Subject:/i, "").trim();
      const subjectIndex = rawContent.indexOf(subjectLine);
      content = rawContent.substring(subjectIndex + subjectLine.length).trim();
    }
  } else {
    // If no subject marker, try to use first line as subject if it's short
    const lines = rawContent.split("\n");
    if (lines.length > 0 && lines[0].length < 100 && lines[0].length > 10) {
      subject = lines[0].trim();
      content = lines.slice(1).join("\n").trim();
    } else {
      content = rawContent.trim();
    }
  }

  return {
    subject: subject && subject.length > 0 ? subject : undefined,
    content: content || rawContent,
  };
}

export const debtCommRouter = router({
  generateMessage: publicProcedure
    .input(CustomerProfileSchema)
    .output(MessageResponseSchema)
    .mutation(async ({ input: profile }) => {
      const tone = determineTone(profile);

      const prompt = `You are an AI assistant for a bank's debt management system. 
Your goal is to draft a message to a customer regarding their outstanding debt.

CUSTOMER PROFILE:
- Name: ${profile.name}
- Debt Amount: KSH ${profile.debt_amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
- Days Past Due: ${profile.days_past_due}
- Segment: ${profile.customer_segment}
- Hardship Reason: ${profile.hardship_reason || "None mentioned"}
- Preferred Channel: ${profile.preferred_channel}

TONE TO USE: ${tone}

INSTRUCTIONS:
1. Draft a message for the ${profile.preferred_channel} channel.
2. If it's an email, include a subject line as the first line.
3. Be compliant: Do not use threatening language. Focus on solutions and assistance.
4. Personalize based on the hardship reason if provided.
5. Mention the debt amount and ask them to get in touch to discuss a repayment plan.

Format the output as:
[Subject line here - only for email]

[Message body starts here]`;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a professional bank communications specialist. Always provide clear, empathetic, and compliant messaging.",
            },
            { role: "user", content: prompt },
          ],
        });

        const rawContent = response.choices[0].message.content as string;
        const { subject, content } = parseMessageResponse(rawContent);

        return {
          channel: profile.preferred_channel,
          tone,
          subject,
          content,
        };
      } catch (error) {
        console.error("Error generating message:", error);
        throw new Error("Failed to generate message");
      }
    }),
});
