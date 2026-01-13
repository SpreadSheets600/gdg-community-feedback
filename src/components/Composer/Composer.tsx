'use client';
import { useState } from 'react';
import styles from './Composer.module.css';
import { NoteColor, Note } from '@/lib/types';

interface ComposerProps {
    onNoteAdded?: (note: Note) => void;
    getPosition?: () => { x: number; y: number };
}

export default function Composer({ onNoteAdded, getPosition }: ComposerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState('');
    const [color, setColor] = useState<NoteColor>('yellow');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const colors: NoteColor[] = ['yellow', 'pink', 'blue', 'green', 'orange'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        setError('');

        const rotation = Math.floor(Math.random() * 10) - 5;
        const pos = getPosition ? getPosition() : { x: 100 + Math.random() * 200, y: 100 + Math.random() * 150 };
        const { x, y } = pos;

        try {
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: content.trim(), color, rotation, x, y }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to post');
            }

            // Pass the new note back to parent for instant display
            if (onNoteAdded) {
                onNoteAdded(data);
            }

            setContent('');
            setIsOpen(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                className={styles.fab}
                onClick={() => setIsOpen(true)}
            >
                <span className={styles.fabPlus}>+</span>
                <span className={styles.fabText}>Add Note</span>
            </button>
        );
    }

    return (
        <>
            <div className={styles.overlay} onClick={() => setIsOpen(false)} />
            <div className={`${styles.modal} ${styles[color]}`}>
                <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>×</button>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <textarea
                        className={styles.textarea}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write something amazing... ✨"
                        maxLength={200}
                        autoFocus
                    />

                    <div className={styles.bottom}>
                        <div className={styles.colorPicker}>
                            {colors.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`${styles.colorBtn} ${styles[`pick${c}`]} ${color === c ? styles.active : ''}`}
                                    onClick={() => setColor(c)}
                                />
                            ))}
                        </div>

                        <span className={styles.charCount}>{content.length}/200</span>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSubmitting || !content.trim()}
                    >
                        {isSubmitting ? 'Posting...' : 'Stick it! 📌'}
                    </button>
                </form>
            </div>
        </>
    );
}
