import { randomUUID } from "node:crypto";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type CreateAttachmentUploadRequest } from "@chinta/shared";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AttachmentsService {
  private readonly s3?: S3Client;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const accountId = config.get<string>("R2_ACCOUNT_ID");
    const accessKeyId = config.get<string>("R2_ACCESS_KEY_ID");
    const secretAccessKey = config.get<string>("R2_SECRET_ACCESS_KEY");
    const endpoint =
      config.get<string>("R2_ENDPOINT") ??
      (accountId
        ? `https://${accountId}.r2.cloudflarestorage.com`
        : undefined);

    if (endpoint && accessKeyId && secretAccessKey) {
      this.s3 = new S3Client({
        region: "auto",
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });
    }
  }

  async createUpload(userId: string, input: CreateAttachmentUploadRequest) {
    if (!this.s3) {
      throw new ServiceUnavailableException({
        code: "STORAGE_NOT_CONFIGURED",
        message: "Cloudflare R2 is not configured.",
      });
    }

    const bucket = this.config.getOrThrow<string>("R2_BUCKET");
    const attachmentId = randomUUID();
    const storageKey = `${userId}/${attachmentId}/${input.fileName}`;

    const attachment = await this.prisma.attachment.create({
      data: {
        id: attachmentId,
        userId,
        storageKey,
        fileName: input.fileName,
        mimeType: input.mimeType,
        byteSize: input.byteSize,
      },
    });

    const uploadUrl = await getSignedUrl(
      this.s3,
      new PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        ContentType: input.mimeType,
      }),
      { expiresIn: 300 },
    );

    return {
      attachmentId: attachment.id,
      storageKey,
      uploadUrl,
    };
  }
}
