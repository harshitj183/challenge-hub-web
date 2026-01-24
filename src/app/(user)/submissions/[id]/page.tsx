"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

interface Submission {
    _id: string;
    title: string;
    description?: string;
    mediaUrl: string;
    votes: number;
    userId: { _id: string; name: string; username?: string; avatar: string };
    challengeId: { _id: string; title: string; category: string };
    createdAt: string;
}

interface Comment {
    _id: string;
    content: string;
    userId: { _id: string; name: string; username?: string; avatar: string };
    createdAt: string;
}


export default function SubmissionDetailPage() {
    const params = useParams();
    const { data: session } = useSession();
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [userVoted, setUserVoted] = useState(false);
    const [userFavorited, setUserFavorited] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchSubmission();
            fetchComments();
            if (session) {
                checkUserVote();
                checkUserFavorite();
            }
        }
    }, [params.id, session]);

    const fetchSubmission = async () => {
        try {
            const res = await fetch(`/api/submissions?id=${params.id}`);
            const data = await res.json();
            if (res.ok && data.submissions.length > 0) {
                setSubmission(data.submissions[0]);
            }
        } catch (error) {
            console.error('Error fetching submission:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments?submissionId=${params.id}`);
            const data = await res.json();
            if (res.ok) {
                setComments(data.comments);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const checkUserVote = async () => {
        try {
            const res = await fetch('/api/votes');
            const data = await res.json();
            if (res.ok) {
                const voted = data.votes.some((v: any) =>
                    (v.submissionId?._id || v.submissionId) === params.id
                );
                setUserVoted(voted);
            }
        } catch (error) {
            console.error('Error checking vote:', error);
        }
    };

    const checkUserFavorite = async () => {
        try {
            const res = await fetch('/api/favorites');
            const data = await res.json();
            if (res.ok && data.favorites) {
                const favorited = data.favorites.some((f: any) =>
                    f.submissionId && (f.submissionId._id === params.id || f.submissionId === params.id)
                );
                setUserFavorited(favorited);
            }
        } catch (error) {
            console.error('Error checking favorite:', error);
        }
    };

    const handleVote = async () => {
        if (!session) {
            alert('Please login to vote');
            return;
        }

        try {
            const res = await fetch('/api/votes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submissionId: params.id })
            });

            const data = await res.json();
            if (res.ok) {
                setUserVoted(data.action === 'added');
                setSubmission(prev => prev ? {
                    ...prev,
                    votes: prev.votes + (data.action === 'added' ? 1 : -1)
                } : null);
            }
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    const handleFavorite = async () => {
        if (!session) {
            alert('Please login to save favorites');
            return;
        }

        try {
            const res = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submissionId: params.id })
            });

            const data = await res.json();
            if (res.ok) {
                setUserFavorited(data.action === 'added');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            alert('Please login to comment');
            return;
        }

        if (!newComment.trim()) return;

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    submissionId: params.id,
                    content: newComment.trim()
                })
            });

            const data = await res.json();
            if (res.ok) {
                setComments(prev => [data.comment, ...prev]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            const res = await fetch(`/api/comments?id=${commentId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setComments(prev => prev.filter(c => c._id !== commentId));
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    if (loading) {
        return <div className="loading-screen"><div className="spinner"></div></div>;
    }

    if (!submission) {
        return <div className={styles.error}>Submission not found</div>;
    }

    return (
        <div className={styles.detailPage}>
            <div className={styles.container}>
                {/* Image Section */}
                <div className={styles.imageSection}>
                    <div className={styles.imageWrapper}>
                        <Image
                            src={submission.mediaUrl}
                            alt={submission.title}
                            fill
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                </div>

                {/* Info Section */}
                <div className={styles.infoSection}>
                    <div className={styles.header}>
                        <h1>{submission.title}</h1>
                        {submission.challengeId ? (
                            <Link href={`/challenges/${submission.challengeId._id}`}>
                                <div className={styles.challengeTag}>
                                    {submission.challengeId.title}
                                    {submission.challengeId.category && ` • ${submission.challengeId.category}`}
                                </div>
                            </Link>
                        ) : (
                            <div className={styles.challengeTag}>Challenge Deleted</div>
                        )}
                    </div>

                    {submission.description && (
                        <p className={styles.description}>{submission.description}</p>
                    )}

                    {/* User Info */}
                    {submission.userId ? (
                        <Link href={`/users/${submission.userId.username || submission.userId._id}`} className={styles.userCard}>
                            <div className={styles.avatar}>
                                <Image
                                    src={submission.userId.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(submission.userId.name)}`}
                                    alt={submission.userId.name}
                                    fill
                                    unoptimized
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                            <div>
                                <div className={styles.userName}>
                                    {submission.userId.username ? `@${submission.userId.username}` : submission.userId.name}
                                </div>
                                <div className={styles.date}>
                                    {new Date(submission.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <div className={styles.userCard}>
                            <div className={styles.userName}>Deleted User</div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className={styles.actions}>
                        <button
                            onClick={handleVote}
                            className={`${styles.actionBtn} ${userVoted ? styles.active : ''}`}
                        >
                            {userVoted ? '❤️' : '🤍'} {submission.votes}
                        </button>
                        <button
                            onClick={handleFavorite}
                            className={`${styles.actionBtn} ${userFavorited ? styles.active : ''}`}
                        >
                            {userFavorited ? '⭐' : '☆'} Save
                        </button>
                    </div>

                    {/* Comments Section */}
                    <div className={styles.commentsSection}>
                        <h2>💬 Comments ({comments.length})</h2>

                        {/* Add Comment Form */}
                        {session && (
                            <form onSubmit={handleAddComment} className={styles.commentForm}>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    maxLength={500}
                                    rows={3}
                                />
                                <button type="submit" disabled={!newComment.trim()}>
                                    Post Comment
                                </button>
                            </form>
                        )}

                        {/* Comments List */}
                        <div className={styles.commentsList}>
                            {comments.map((comment) => (
                                <div key={comment._id} className={styles.comment}>
                                    <div className={styles.commentAvatar}>
                                        <Image
                                            src={comment.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userId?.name || 'Deleted User')}&background=ccc&color=fff`}
                                            alt={comment.userId?.name || 'Deleted User'}
                                            fill
                                            unoptimized
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className={styles.commentContent}>
                                        <div className={styles.commentHeader}>
                                            {comment.userId ? (
                                                <Link href={`/users/${comment.userId.username || comment.userId._id}`} className={styles.commentUser}>
                                                    {comment.userId.username ? `@${comment.userId.username}` : comment.userId.name}
                                                </Link>
                                            ) : (
                                                <span className={styles.commentUser}>Deleted User</span>
                                            )}
                                            <span className={styles.commentDate}>
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p>{comment.content}</p>
                                        {session?.user?.id === comment.userId?._id && (
                                            <button
                                                onClick={() => handleDeleteComment(comment._id)}
                                                className={styles.deleteBtn}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {comments.length === 0 && (
                                <p className={styles.noComments}>
                                    No comments yet. Be the first to comment!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
