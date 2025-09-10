import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function uploadFilesToUploadThing(files: Express.Multer.File[]) {
  const uploaded: { url: string; fileId: string }[] = [];

  for (const file of files) {
    // ✅ konversi Buffer → Uint8Array agar kompatibel dengan Blob
    const arrayBuffer = new Uint8Array(file.buffer);

    // bikin File web-compatible
    const webFile = new File([arrayBuffer], file.originalname, {
      type: file.mimetype,
    });

    const res = await utapi.uploadFiles(webFile);

    if (res.error) {
      throw new Error(res.error.message);
    }

    uploaded.push({ url: res.data.ufsUrl, fileId: res.data.key });
  }

  return uploaded;
}
