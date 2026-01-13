export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'orange';

export interface Note {
    id: string;
    content: string;
    color: NoteColor;
    rotation: number;
    reactions: Record<string, number>;
    createdAt: number;
    x?: number;
    y?: number;
}

export type ReactionType = 'heart' | 'star' | 'like';
