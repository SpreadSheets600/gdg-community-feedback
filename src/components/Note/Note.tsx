'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './Note.module.css';
import { Note as NoteType, ReactionType } from '@/lib/types';

interface NoteProps {
    note: NoteType;
    index: number;
    onMove?: (id: string, x: number, y: number) => void;
}

export default function Note({ note, index, onMove }: NoteProps) {
    const [reactions, setReactions] = useState(note.reactions || {});
    const [hasReacted, setHasReacted] = useState<Record<string, boolean>>({});
    const [position, setPosition] = useState({
        x: Number(note.x) || (100 + (index % 5) * 240 + Math.random() * 40),
        y: Number(note.y) || (80 + Math.floor(index / 5) * 220 + Math.random() * 30)
    });
    const [isDragging, setIsDragging] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const offsetRef = useRef({ x: 0, y: 0 });
    const noteRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const reacted = localStorage.getItem(`gdg-reacted-${note.id}`);
        if (reacted) setHasReacted(JSON.parse(reacted));
    }, [note.id]);

    // Sync position from server (if another user moved it)
    useEffect(() => {
        if (!isDragging && note.x !== undefined && note.y !== undefined) {
            const serverX = Number(note.x);
            const serverY = Number(note.y);
            if (serverX > 0 || serverY > 0) {
                setPosition({ x: serverX, y: serverY });
            }
        }
    }, [note.x, note.y, isDragging]);

    const handlePointerDown = (e: React.PointerEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;

        setIsDragging(true);
        const rect = noteRef.current!.getBoundingClientRect();
        offsetRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        noteRef.current?.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;

        const parent = noteRef.current?.parentElement;
        if (!parent) return;

        const parentRect = parent.getBoundingClientRect();
        const newX = e.clientX - parentRect.left - offsetRef.current.x;
        const newY = e.clientY - parentRect.top - offsetRef.current.y;

        setPosition({ x: Math.max(0, newX), y: Math.max(0, newY) });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDragging) return;
        setIsDragging(false);
        noteRef.current?.releasePointerCapture(e.pointerId);

        if (onMove) {
            onMove(note.id, position.x, position.y);
        }
    };

    const handleReaction = async (type: ReactionType) => {
        if (hasReacted[type]) return;

        // Show emoji animation
        setShowEmoji(true);
        setTimeout(() => setShowEmoji(false), 600);

        setReactions((prev) => ({
            ...prev,
            [type]: (prev[type] || 0) + 1,
        }));

        const newHasReacted = { ...hasReacted, [type]: true };
        setHasReacted(newHasReacted);
        localStorage.setItem(`gdg-reacted-${note.id}`, JSON.stringify(newHasReacted));

        try {
            await fetch('/api/reactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noteId: note.id, reaction: type }),
            });
        } catch (e) {
            console.error('Failed to add reaction', e);
        }
    };

    const colorClass = styles[note.color] || styles.yellow;
    const rotation = note.rotation || 0;

    return (
        <article
            ref={noteRef}
            className={`${styles.note} ${colorClass} ${isDragging ? styles.dragging : ''}`}
            style={{
                left: position.x,
                top: position.y,
                transform: `rotate(${rotation}deg)`,
                zIndex: isDragging ? 1000 : 1,
                animationDelay: `${index * 60}ms`
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            {showEmoji && <span className={styles.emojiPop}>❤️</span>}
            <div className={styles.content}>{note.content}</div>
            <footer className={styles.footer}>
                <button
                    className={`${styles.reactionBtn} ${hasReacted.heart ? styles.reacted : ''}`}
                    onClick={() => handleReaction('heart')}
                    disabled={hasReacted.heart}
                >
                    ❤️ <span>{reactions.heart || 0}</span>
                </button>
                <button
                    className={`${styles.reactionBtn} ${hasReacted.like ? styles.reacted : ''}`}
                    onClick={() => handleReaction('like')}
                    disabled={hasReacted.like}
                >
                    👍 <span>{reactions.like || 0}</span>
                </button>
            </footer>
            <div className={styles.dragHint}>drag me!</div>
        </article>
    );
}
