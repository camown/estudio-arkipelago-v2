import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface UploadSketchMarkupParams {
  dataUrl: string;
  fileName: string;
  folder?: string;
}

export interface SaveSketchSessionParams {
  id?: string;
  title: string;
  sheetNo: string;
  projectName: string;
  scaleLabel: string;
  createdBy: string;
  sourceFileUrl?: string;
  sourceThreadId?: string;
  sourceMessageId?: string;
  vectorData: any[];
  layers: any[];
  previewUrl: string;
}

/**
 * Converts a base64 DataURL (image/png) into a Blob/Uint8Array for Supabase storage upload.
 */
export function dataUrlToBlob(dataUrl: string): { blob: Blob; mimeType: string } {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
  const byteString = atob(parts[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  return {
    blob: new Blob([uint8Array], { type: mimeType }),
    mimeType,
  };
}

/**
 * Uploads a rendered sketch markup or base drawing directly to Supabase Storage bucket 'sketch-exports'
 * Falls back to returning the base64 dataUrl if Supabase Storage is not configured or offline.
 */
export async function uploadSketchMarkupToStorage({
  dataUrl,
  fileName,
  folder = 'markups',
}: UploadSketchMarkupParams): Promise<{ publicUrl: string; path: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { publicUrl: dataUrl, path: 'local-storage' };
  }

  try {
    const { blob, mimeType } = dataUrlToBlob(dataUrl);
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${folder}/${Date.now()}_${sanitizedName}.png`;

    const { error: uploadError } = await supabase.storage
      .from('sketch-exports')
      .upload(filePath, blob, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      // If bucket does not exist or upload policy fails, try chat-attachments bucket as fallback
      const { error: fallbackError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, blob, {
          contentType: mimeType,
          upsert: true,
        });

      if (fallbackError) {
        console.warn('Storage upload fallback failed, using dataUrl payload:', fallbackError.message);
        return { publicUrl: dataUrl, path: 'local-fallback' };
      }

      const { data: publicData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      return { publicUrl: publicData.publicUrl, path: filePath };
    }

    const { data: publicData } = supabase.storage
      .from('sketch-exports')
      .getPublicUrl(filePath);

    return { publicUrl: publicData.publicUrl, path: filePath };
  } catch (err) {
    console.error('Exception during sketch storage upload:', err);
    return { publicUrl: dataUrl, path: 'local-fallback' };
  }
}

/**
 * Saves a non-destructive vector sketch session in Supabase Postgres.
 */
export async function saveSketchSessionToDatabase(
  params: SaveSketchSessionParams
): Promise<string> {
  const sessionId = params.id || `sketch-${Date.now()}`;

  if (!isSupabaseConfigured || !supabase) {
    return sessionId;
  }

  try {
    await supabase.from('sketch_sessions').upsert({
      id: sessionId,
      title: params.title,
      sheet_no: params.sheetNo,
      project_name: params.projectName,
      scale_label: params.scaleLabel,
      created_by: params.createdBy,
      source_file_url: params.sourceFileUrl || null,
      source_thread_id: params.sourceThreadId || null,
      source_message_id: params.sourceMessageId || null,
      vector_data: params.vectorData,
      layers: params.layers,
      preview_url: params.previewUrl,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error recording sketch session in Supabase:', err);
  }

  return sessionId;
}
