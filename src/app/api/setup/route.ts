import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        content TEXT NOT NULL,
        color VARCHAR(20) NOT NULL,
        rotation NUMERIC NOT NULL,
        reactions JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        x NUMERIC DEFAULT 0,
        y NUMERIC DEFAULT 0
      );
    `;

    // Attempt to add columns to existing table if they don't exist
    // This is a quick migration hack for this specific workflow
    try {
      await sql`ALTER TABLE notes ADD COLUMN IF NOT EXISTS x NUMERIC DEFAULT 0;`;
      await sql`ALTER TABLE notes ADD COLUMN IF NOT EXISTS y NUMERIC DEFAULT 0;`;
    } catch (e) {
      // Ignore if fails, likely already exists or permissions issue
      console.log('Migration note: columns might already exist');
    }
    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error: any) {
    console.error('Setup Error:', error);
    if (error.message?.includes('connection string format') || error.message?.includes('missing_connection_string')) {
      return NextResponse.json({
        error: 'Configuration Error: Invalid POSTGRES_URL. It should look like: postgres://user:pass@host/db'
      }, { status: 500 });
    }
    return NextResponse.json({ error: error.message || error }, { status: 500 });
  }
}
