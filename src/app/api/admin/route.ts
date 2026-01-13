import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'gdg-admin-2024';

export async function POST(request: Request) {
    try {
        const { action, password, noteId } = await request.json();

        // Verify password
        if (password !== ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        switch (action) {
            case 'delete':
                if (!noteId) {
                    return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
                }
                await sql`DELETE FROM notes WHERE id = ${noteId}`;
                return NextResponse.json({ success: true, message: 'Note deleted' });

            case 'clear-all':
                await sql`DELETE FROM notes`;
                return NextResponse.json({ success: true, message: 'All notes deleted' });

            case 'get-stats':
                const { rows: countResult } = await sql`SELECT COUNT(*) as count FROM notes`;
                return NextResponse.json({
                    success: true,
                    count: countResult[0]?.count || 0
                });

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Admin Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
