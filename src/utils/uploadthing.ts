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

export async function deleteFilesFromUploadthing(fileIds: string[]) {
  try {
    const res = await utapi.deleteFiles(fileIds);
    if (!res.success) {
      throw new Error("Failed delete file images");
    }

    return {
      success: true,
      deletedCount: res.deletedCount,
    };
  } catch (error) {
    console.error("Delete Uploadthing error:", error);
    throw error;
  }
}

export async function deleteFileFromUploadthingByFileId(fileId: string) {
  try {
    const res = await utapi.deleteFiles(fileId);
    if (!res.success) {
      throw new Error("Failed delete file by fileId");
    }
    return {
      success: true,
      deletedFileId: fileId,
    };
  } catch (error) {
    console.error("Delete Uploadthing by FileId error:", error);
    throw error;
  }
}
