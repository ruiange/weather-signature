import { put } from '@vercel/blob';

export default async function vercelBlobUpload(buffer, filename) {
    const { url } = await put(filename, buffer, {
        access: 'public',
        contentType: 'image/png',
        token: process.env.BLOB_READ_WRITE_TOKEN
    });
    return url;
}
