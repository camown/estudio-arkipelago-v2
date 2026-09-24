import { supabase, isSupabaseConfigured } from './client';

export type StorageBucket = 'blueprints' | 'chat-attachments' | 'avatars';

export interface UploadResult {
  url: string;
  isRemote: boolean;
  path?: string;
  error?: string;
}

/**
 * Upload a File or Blob to Supabase Storage with local fallback
 */
export async function uploadStudioAsset(
  bucket: StorageBucket,
  file: File | Blob,
  customPath?: string
): Promise<UploadResult> {
  // If Supabase is not configured, generate a local Data URL
  if (!isSupabaseConfigured || !supabase) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          url: e.target?.result as string,
          isRemote: false,
        });
      };
      reader.onerror = () => {
        resolve({
          url: '',
          isRemote: false,
          error: 'Failed to read file locally',
        });
      };
      reader.readAsDataURL(file);
    });
  }

  try {
    const ext = file instanceof File ? file.name.split('.').pop() || 'png' : 'png';
    const filePath = customPath || `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error || !data) {
      console.warn(`Supabase Storage upload to bucket "${bucket}" failed, falling back to local encoding:`, error?.message);
      // Graceful fallback to data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            url: e.target?.result as string,
            isRemote: false,
          });
        };
        reader.readAsDataURL(file);
      });
    }

    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: publicData.publicUrl,
      isRemote: true,
      path: data.path,
    };
  } catch (err) {
    console.error('Storage upload exception:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          url: e.target?.result as string,
          isRemote: false,
        });
      };
      reader.readAsDataURL(file);
    });
  }
}
