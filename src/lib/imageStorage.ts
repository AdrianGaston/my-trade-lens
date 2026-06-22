// Image storage abstraction.
// Today: in-memory/base64 data URL. Tomorrow: Supabase Storage URL.
// Keep all read/write paths going through this module so the swap is local.

export interface ImageStorage {
  upload(file: File): Promise<string>; // returns a referencable URL/data-URL
  remove?(ref: string): Promise<void>;
}

export const base64ImageStorage: ImageStorage = {
  upload(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  },
};

// Default export – swap implementation later (e.g. supabaseImageStorage).
export const imageStorage: ImageStorage = base64ImageStorage;
