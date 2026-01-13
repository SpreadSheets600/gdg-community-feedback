'use client';
import { useState, useEffect, useCallback } from 'react';
import Wall from '@/components/Wall/Wall';
import Composer from '@/components/Composer/Composer';
import styles from './page.module.css';
import { Note } from '@/lib/types';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [hasPosted, setHasPosted] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Find a non-overlapping position for new notes
  const findFreePosition = useCallback(() => {
    const noteWidth = 220;
    const noteHeight = 200;
    const padding = 20;
    const maxAttempts = 50;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Calculate grid position based on current note count
      const cols = Math.floor(window.innerWidth / (noteWidth + padding));
      const row = Math.floor((notes.length + attempt) / Math.max(cols, 3));
      const col = (notes.length + attempt) % Math.max(cols, 3);

      const x = 40 + col * (noteWidth + padding) + (Math.random() * 30 - 15);
      const y = 30 + row * (noteHeight + padding) + (Math.random() * 20 - 10);

      // Check if this position overlaps with existing notes
      const overlaps = notes.some(note => {
        const nx = Number(note.x) || 0;
        const ny = Number(note.y) || 0;
        return Math.abs(nx - x) < noteWidth && Math.abs(ny - y) < noteHeight;
      });

      if (!overlaps) {
        return { x, y };
      }
    }

    // Fallback: place at end of grid
    const cols = Math.floor(window.innerWidth / (noteWidth + padding)) || 3;
    const row = Math.floor(notes.length / cols);
    const col = notes.length % cols;
    return {
      x: 40 + col * (noteWidth + padding),
      y: 30 + row * (noteHeight + padding)
    };
  }, [notes]);

  useEffect(() => {
    const posted = localStorage.getItem('gdg-wall-posted');
    if (posted) setHasPosted(true);

    fetchNotes();
    const interval = setInterval(fetchNotes, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchNotes]);

  const handleNoteAdded = (newNote: Note) => {
    // Instantly add the new note to the wall
    setNotes(prev => [newNote, ...prev]);
    localStorage.setItem('gdg-wall-posted', 'true');
    setHasPosted(true);
  };

  const handleNoteMove = async (id: string, x: number, y: number) => {
    // Optimistic update
    setNotes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));

    try {
      await fetch('/api/notes/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, x, y }),
      });
    } catch (err) {
      console.error('Failed to save position', err);
    }
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerNote}>
          <div className={styles.brand}>
            <div className={styles.gdgLogo}>
              <span className={styles.gdgBlue}>G</span>
              <span className={styles.gdgRed}>D</span>
              <span className={styles.gdgYellow}>G</span>
            </div>
            <h1 className={styles.title}>Community Wall</h1>
            <p className={styles.subtitle}>Leave your mark ✨</p>
          </div>
        </div>
        <div className={styles.stats}>
          <span className={styles.noteCount}>{notes.length} notes 📌</span>
        </div>
      </header>

      <Wall
        notes={notes}
        loading={loading}
        onNoteMove={handleNoteMove}
      />

      {!hasPosted && <Composer onNoteAdded={handleNoteAdded} getPosition={findFreePosition} />}
    </main>
  );
}
