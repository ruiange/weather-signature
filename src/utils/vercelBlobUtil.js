import { put } from '@vercel/blob';
const vercelBlobUpload = async (buffer,originalname) => {
    const { url, downloadUrl, pathname, contentType, contentDisposition } = await put(
        originalname,
       buffer,
        {
            access: 'public', // or 'private'
            token: process.env.BLOB_READ_WRITE_TOKEN,
        }
    );
    return url;
};

export default vercelBlobUpload;
