'use client';
import styles from './Wall.module.css';
import Note from '../Note/Note';
import { Note as NoteType } from '@/lib/types';

interface WallProps {
    notes: NoteType[];
    loading: boolean;
    onNoteMove?: (id: string, x: number, y: number) => void;
}

export default function Wall({ notes, loading, onNoteMove }: WallProps) {
    if (loading && notes.length === 0) {
        return (
            <div className={styles.wall}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading the wall...</p>
                </div>
            </div>
        );
    }

    if (notes.length === 0) {
        return (
            <div className={styles.wall}>
                <div className={styles.empty}>
                    <div className={styles.emptyNote}>
                        <span>📝</span>
                        <p>Be the first to leave a note!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.wall}>
            <div className={styles.canvas}>
                {notes.map((note, index) => (
                    <Note
                        key={note.id}
                        note={note}
                        index={index}
                        onMove={onNoteMove}
                    />
                ))}
            </div>
        </div>
    );
}
