import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const supabase = await createClient();
    const storagePath = decodeURIComponent(params.path.join('/'));

    // Get signed URL for the file
    const { data, error } = await supabase.storage
      .from('audio-files')
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Error creating signed URL:', error);
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      );
    }

    // Redirect to the signed URL
    return NextResponse.redirect(data.signedUrl);

  } catch (error) {
    console.error('Stream API error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}