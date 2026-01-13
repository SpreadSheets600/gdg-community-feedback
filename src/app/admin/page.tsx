'use client';
import { useState, useEffect } from 'react';
import styles from './admin.module.css';

interface Note {
    id: string;
    content: string;
    color: string;
    created_at: string;
}

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchNotes = async () => {
        try {
            const res = await fetch('/api/notes');
            if (res.ok) {
                const data = await res.json();
                setNotes(data);
            }
        } catch (err) {
            console.error('Failed to fetch notes', err);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotes();
        }
    }, [isAuthenticated]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get-stats', password }),
            });

            if (res.ok) {
                setIsAuthenticated(true);
                setMessage('Logged in successfully');
            } else {
                setError('Invalid password');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!confirm('Delete this note?')) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', password, noteId }),
            });

            if (res.ok) {
                setNotes(notes.filter(n => n.id !== noteId));
                setMessage('Note deleted');
            } else {
                setError('Failed to delete');
            }
        } catch (err) {
            setError('Error deleting note');
        } finally {
            setLoading(false);
        }
    };

    const handleClearAll = async () => {
        if (!confirm('⚠️ DELETE ALL NOTES? This cannot be undone!')) return;
        if (!confirm('Are you REALLY sure? Type "yes" to confirm')) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'clear-all', password }),
            });

            if (res.ok) {
                setNotes([]);
                setMessage('All notes cleared');
            } else {
                setError('Failed to clear');
            }
        } catch (err) {
            setError('Error clearing notes');
        } finally {
            setLoading(false);
        }
    };

    // Login screen
    if (!isAuthenticated) {
        return (
            <main className={styles.main}>
                <div className={styles.loginBox}>
                    <h1 className={styles.loginTitle}>🔐 Admin Access</h1>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            className={styles.input}
                            placeholder="Enter admin password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className={styles.loginBtn} disabled={loading}>
                            {loading ? 'Checking...' : 'Login'}
                        </button>
                    </form>
                    {error && <p className={styles.error}>{error}</p>}
                </div>
            </main>
        );
    }

    // Admin dashboard
    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <h1>🛠️ Admin Dashboard</h1>
                <button onClick={() => setIsAuthenticated(false)} className={styles.logoutBtn}>
                    Logout
                </button>
            </header>

            {message && <div className={styles.success}>{message}</div>}
            {error && <div className={styles.error}>{error}</div>}

            <section className={styles.actions}>
                <button onClick={fetchNotes} className={styles.actionBtn} disabled={loading}>
                    🔄 Refresh
                </button>
                <button onClick={handleClearAll} className={styles.dangerBtn} disabled={loading}>
                    🗑️ Clear All Notes
                </button>
            </section>

            <section className={styles.stats}>
                <p>Total Notes: <strong>{notes.length}</strong></p>
            </section>

            <section className={styles.noteList}>
                <h2>All Notes</h2>
                {notes.length === 0 ? (
                    <p className={styles.empty}>No notes found</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Color</th>
                                <th>Content</th>
                                <th>Created</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notes.map((note) => (
                                <tr key={note.id}>
                                    <td>
                                        <span className={`${styles.colorDot} ${styles[note.color]}`}></span>
                                    </td>
                                    <td className={styles.content}>{note.content}</td>
                                    <td className={styles.date}>
                                        {new Date(note.created_at).toLocaleString()}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDeleteNote(note.id)}
                                            className={styles.deleteBtn}
                                            disabled={loading}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </main>
    );
}
