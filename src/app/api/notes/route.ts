import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Simple moderation list to avoid filesystem issues with external libraries in serverless
const BLOCKLIST = ['badword', 'spam', 'abuse']; // Extend as needed

function isProfane(text: string): boolean {
    const lower = text.toLowerCase();
    return BLOCKLIST.some(word => lower.includes(word));
}

export async function GET() {
    try {
        // Ensure table exists (fail-safe for first run if setup wasn't called)
        // While creating table on every read isn't ideal, for a small event app it ensures it "just works"
        // removing the need for a separate setup step for the end user in some cases.
        // However, to be cleaner, we'll just try to select.

        // Note: If you see "relation 'notes' does not exist", you MUST visit /api/setup first.
        const { rows } = await sql`SELECT * FROM notes ORDER BY created_at DESC LIMIT 100`;
        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('Database Error in GET /api/notes:', error);

        // Check for common connection errors to give better feedback
        if (error.message?.includes('connection string format') || error.message?.includes('missing_connection_string')) {
            return NextResponse.json({
                error: 'Database Configuration Error: Invalid POSTGRES_URL in .env.local on server. Please ensure it is a valid postgresql:// URL.'
            }, { status: 500 });
        }

        // Return a more friendly error if table is missing
        if (error.message?.includes('does not exist')) {
            return NextResponse.json([], { status: 200 }); // Return empty if proper setup hasn't happened yet to avoid crash loop
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { content, color, rotation } = await request.json();

        if (!content || content.length > 280) {
            return NextResponse.json({ error: 'Invalid content length' }, { status: 400 });
        }

        if (isProfane(content)) {
            return NextResponse.json({ error: 'Please keep it clean!' }, { status: 400 });
        }

        const { rows } = await sql`
      INSERT INTO notes (content, color, rotation, reactions)
      VALUES (${content}, ${color}, ${rotation}, '{}'::jsonb)
      RETURNING *;
    `;

        return NextResponse.json(rows[0]);
    } catch (error: any) {
        console.error('Database Error in POST /api/notes:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
