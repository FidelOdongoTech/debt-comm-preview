import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { saveTemplate, getUserTemplates, getTemplatesBySegment, deleteTemplate } from "../db";

const TemplateInputSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  customerSegment: z.enum(["long-term", "new", "chronic_defaulter"]),
  channel: z.enum(["email", "sms", "whatsapp"]),
  tone: z.string(),
  subject: z.string().optional(),
  content: z.string().min(1, "Template content is required"),
  tags: z.string().optional(),
});

export const templatesRouter = router({
  save: protectedProcedure
    .input(TemplateInputSchema)
    .mutation(async ({ ctx, input }) => {
      const template = await saveTemplate(ctx.user.id, {
        name: input.name,
        description: input.description,
        customerSegment: input.customerSegment,
        channel: input.channel,
        tone: input.tone,
        subject: input.subject,
        content: input.content,
        tags: input.tags,
        isPublic: "false",
      });
      return template;
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return await getUserTemplates(ctx.user.id);
  }),

  listBySegment: protectedProcedure
    .input(z.object({ segment: z.enum(["long-term", "new", "chronic_defaulter"]) }))
    .query(async ({ ctx, input }) => {
      return await getTemplatesBySegment(ctx.user.id, input.segment);
    }),

  delete: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const success = await deleteTemplate(input.templateId, ctx.user.id);
      return { success };
    }),
});
