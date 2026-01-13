import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { noteId, reaction } = await request.json();

        if (!noteId || !['heart', 'star', 'like'].includes(reaction)) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // JSONB update to increment specific key. 
        // Coalesce ensures we start at 0 if key doesn't exist.
        await sql`
      UPDATE notes 
      SET reactions = jsonb_set(
        reactions, 
        array[${reaction}], 
        (COALESCE(reactions->>${reaction}, '0')::int + 1)::text::jsonb
      )
      WHERE id = ${noteId};
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
