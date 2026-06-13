import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const theme = {
      success: true,
      theme: {
        primaryColor: '#1f2937',
        secondaryColor: '#0f172a',
        accentColor: '#38bdf8',
        backgroundColor: '#f8fafc',
        surfaceColor: '#ffffff',
        borderColor: '#e2e8f0',
        textColor: '#111827',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '12px'
      }
    };

    return NextResponse.json(theme);
  } catch (error) {
    console.error('/api/theme error', error);
    return NextResponse.json({ success: false, error: 'Could not load theme config' }, { status: 500 });
  }
}
