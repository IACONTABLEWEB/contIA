import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';

const s3 = new S3Client({
  endpoint: env.s3.endpoint,
  region: env.s3.region,
  credentials: {
    accessKeyId: env.s3.accessKeyId,
    secretAccessKey: env.s3.secretAccessKey,
  },
  // Necesario para Supabase Storage y la mayoría de los proveedores S3-compatibles
  // que no son AWS (Cloudflare R2, Backblaze, etc.).
  forcePathStyle: true,
});

export async function subirArchivo(buffer, key, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.s3.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return key;
}

export async function obtenerArchivoBuffer(key) {
  const response = await s3.send(
    new GetObjectCommand({ Bucket: env.s3.bucket, Key: key })
  );
  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function urlFirmada(key, expiresInSeconds = 3600) {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: env.s3.bucket, Key: key }),
    { expiresIn: expiresInSeconds }
  );
}
