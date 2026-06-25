// Supabase Storage-backed image uploader.
// Files go to the public "images" bucket under {folder}/{uuid}-{name}.
import { supabase } from "@/lib/supabase";

const BUCKET = "images";

export interface ImageStorage {
  upload(file: File, folder?: string): Promise<string>;
  remove?(ref: string): Promise<void>;
}

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export const imageStorage: ImageStorage = {
  async upload(file: File, folder = "misc") {
    const path = `${folder}/${crypto.randomUUID()}-${sanitize(file.name)}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },
  async remove(ref: string) {
    const marker = `/object/public/${BUCKET}/`;
    const idx = ref.indexOf(marker);
    if (idx === -1) return;
    const path = ref.slice(idx + marker.length);
    await supabase.storage.from(BUCKET).remove([path]);
  },
};
