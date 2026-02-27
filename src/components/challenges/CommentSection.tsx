"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import styles from './CommentSection.module.css';

interface Comment {
    _id: string;
    text: string;
    userId: {
        _id: string;
        name: string;
        avatar: string;
    };
    createdAt: string;
}

export default function CommentSection({ challengeId }: { challengeId: string }) {
    const { data: session } = useSession();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Fetch comments for this challenge
        const fetchComments = async () => {
            try {
                // In a real app, you would fetch from /api/challenges/[id]/comments
                // For now, let's mock some comments
                setTimeout(() => {
                    setComments([
                        {
                            _id: '1',
                            text: 'This challenge looks amazing! Cant wait to participate.',
                            userId: { _id: 'u1', name: 'FitnessFanatic', avatar: '' },
                            createdAt: new Date(Date.now() - 3600000).toISOString()
                        },
                        {
                            _id: '2',
                            text: 'Anyone know if we can submit multiple times?',
                            userId: { _id: 'u2', name: 'CuriousUser', avatar: '' },
                            createdAt: new Date(Date.now() - 7200000).toISOString()
                        }
                    ]);
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error("Failed to load comments", error);
                setLoading(false);
            }
        };

        if (challengeId) {
            fetchComments();
        }
    }, [challengeId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session) {
            alert('Please log in to leave a comment.');
            return;
        }

        if (!newComment.trim()) return;

        setSubmitting(true);

        try {
            // Mock API call to post comment
            setTimeout(() => {
                const newCommentObj: Comment = {
                    _id: Math.random().toString(),
                    text: newComment,
                    userId: {
                        _id: session.user?.id || 'new',
                        name: session.user?.name || 'Anonymous',
                        avatar: session.user?.avatar || ''
                    },
                    createdAt: new Date().toISOString()
                };

                setComments([newCommentObj, ...comments]);
                setNewComment('');
                setSubmitting(false);
            }, 500);

            // Real implementation would look like:
            // const res = await fetch(`/api/challenges/${challengeId}/comments`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ text: newComment })
            // });
            // const data = await res.json();
            // setComments([data.comment, ...comments]);

        } catch (error) {
            console.error('Error posting comment:', error);
            setSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.heading}>Comments ({comments.length})</h3>

            <form onSubmit={handleSubmit} className={styles.commentForm}>
                <div className={styles.inputWrapper}>
                    {session ? (
                        <div className={styles.userAvatar}>
                            <Image
                                src={session.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user?.name || 'User')}&background=random`}
                                alt={session.user?.name || 'User'}
                                fill
                                unoptimized
                            />
                        </div>
                    ) : (
                        <div className={styles.userAvatar} style={{ background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            👤
                        </div>
                    )}
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={session ? "Leave a comment..." : "Log in to join the discussion..."}
                        className={styles.textarea}
                        rows={3}
                        disabled={!session || submitting}
                    />
                </div>
                <div className={styles.formActions}>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={!session || !newComment.trim() || submitting}
                        style={{ opacity: (!session || !newComment.trim() || submitting) ? 0.5 : 1 }}
                    >
                        {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                </div>
            </form>

            <div className={styles.commentsList}>
                {loading ? (
                    <div className={styles.loadingState}>Loading comments...</div>
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment._id} className={styles.commentCard}>
                            <div className={styles.commentAvatar}>
                                <Image
                                    src={comment.userId.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userId.name)}&background=random`}
                                    alt={comment.userId.name}
                                    fill
                                    unoptimized
                                    style={{ borderRadius: '50%' }}
                                />
                            </div>
                            <div className={styles.commentContent}>
                                <div className={styles.commentHeader}>
                                    <span className={styles.userName}>{comment.userId.name}</span>
                                    <span className={styles.timestamp}>{formatDate(comment.createdAt)}</span>
                                </div>
                                <p className={styles.commentText}>{comment.text}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
