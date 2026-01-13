import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { id, x, y } = await request.json();

        if (!id || x === undefined || y === undefined) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        await sql`
      UPDATE notes 
      SET x = ${x}, y = ${y}
      WHERE id = ${id};
    `;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Move Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
