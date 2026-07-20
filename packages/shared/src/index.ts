import { z } from "zod";

export const providerSchema = z.enum(["openrouter"]);
export type Provider = z.infer<typeof providerSchema>;

export const modelCapabilitySchema = z.enum([
  "text-input",
  "image-input",
  "file-input",
  "tool-calling",
  "json-mode",
]);
export type ModelCapability = z.infer<typeof modelCapabilitySchema>;

export const modelSchema = z.object({
  id: z.string().min(1),
  provider: providerSchema,
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  contextWindow: z.number().int().positive().nullable().optional(),
  capabilities: z.array(modelCapabilitySchema).default(["text-input"]),
  inputTokenPrice: z.string().nullable().optional(),
  outputTokenPrice: z.string().nullable().optional(),
});
export type Model = z.infer<typeof modelSchema>;

export const messageRoleSchema = z.enum(["system", "user", "assistant"]);
export type MessageRole = z.infer<typeof messageRoleSchema>;

export const messagePartSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("image"),
    attachmentId: z.uuid(),
    mimeType: z.string().min(1),
    url: z.url().optional(),
  }),
  z.object({
    type: z.literal("file"),
    attachmentId: z.uuid(),
    mimeType: z.string().min(1),
    fileName: z.string().min(1),
  }),
]);
export type MessagePart = z.infer<typeof messagePartSchema>;

export const messageSchema = z.object({
  id: z.uuid(),
  conversationId: z.uuid(),
  role: messageRoleSchema,
  parts: z.array(messagePartSchema),
  modelId: z.string().nullable().optional(),
  createdAt: z.iso.datetime(),
});
export type Message = z.infer<typeof messageSchema>;

export const conversationSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  modelId: z.string().nullable().optional(),
  pinnedAt: z.iso.datetime().nullable().optional(),
  archivedAt: z.iso.datetime().nullable().optional(),
  updatedAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
});
export type Conversation = z.infer<typeof conversationSchema>;

export const createConversationRequestSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  modelId: z.string().min(1).optional(),
  temporary: z.boolean().default(false).optional(),
});
export type CreateConversationRequest = z.infer<
  typeof createConversationRequestSchema
>;

export const updateConversationRequestSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  modelId: z.string().min(1).nullable().optional(),
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
});
export type UpdateConversationRequest = z.infer<
  typeof updateConversationRequestSchema
>;

export const streamChatRequestSchema = z.object({
  conversationId: z.uuid().optional(),
  modelId: z.string().min(1),
  parts: z.array(messagePartSchema).min(1),
  temporary: z.boolean().default(false).optional(),
});
export type StreamChatRequest = z.infer<typeof streamChatRequestSchema>;

export const saveProviderCredentialRequestSchema = z.object({
  provider: providerSchema,
  apiKey: z.string().min(8),
  label: z.string().min(1).max(80).default("OpenRouter"),
});
export type SaveProviderCredentialRequest = z.infer<
  typeof saveProviderCredentialRequestSchema
>;

export const createAttachmentUploadRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(120),
  byteSize: z.number().int().positive(),
});
export type CreateAttachmentUploadRequest = z.infer<
  typeof createAttachmentUploadRequestSchema
>;

export const createAttachmentUploadResponseSchema = z.object({
  attachmentId: z.uuid(),
  uploadUrl: z.url(),
  storageKey: z.string(),
});
export type CreateAttachmentUploadResponse = z.infer<
  typeof createAttachmentUploadResponseSchema
>;

export const shareLinkSchema = z.object({
  id: z.uuid(),
  token: z.string(),
  url: z.url(),
  createdAt: z.iso.datetime(),
});
export type ShareLink = z.infer<typeof shareLinkSchema>;

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
