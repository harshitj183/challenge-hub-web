"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './StoryFeed.module.css';

interface Story {
    _id: string;
    title: string;
    mediaUrl: string;
    userId: {
        name: string;
        avatar: string;
    };
    challengeId: {
        title: string;
    };
    votes: number;
    isTrending?: boolean;
}

export default function StoryFeed() {
    const [stories, setStories] = useState<Story[]>([]);
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            // Fetch trending and new submissions
            const res = await fetch('/api/submissions?limit=20&sort=-votes');
            const data = await res.json();
            if (res.ok) {
                setStories(data.submissions);
            }
        } catch (error) {
            console.error('Error fetching stories:', error);
        }
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    return (
        <>
            <div className={styles.storyFeedContainer}>
                <div className={styles.header}>
                    <h3>🔥 Trending Stories</h3>
                    <p>Latest submissions from the community</p>
                </div>

                <div className={styles.scrollWrapper}>
                    <button
                        className={`${styles.scrollBtn} ${styles.scrollBtnLeft}`}
                        onClick={scrollLeft}
                        aria-label="Scroll left"
                    >
                        ‹
                    </button>

                    <div className={styles.storiesContainer} ref={scrollContainerRef}>
                        {stories.map((story) => (
                            <div
                                key={story._id}
                                className={styles.storyItem}
                                onClick={() => setSelectedStory(story)}
                            >
                                <div className={styles.storyRing}>
                                    <div className={styles.storyImageWrapper}>
                                        <Image
                                            src={story.mediaUrl}
                                            alt={story.title}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                </div>
                                <div className={styles.storyInfo}>
                                    <span className={styles.storyUsername}>
                                        {story.userId?.name || 'Anonymous'}
                                    </span>
                                    <span className={styles.storyVotes}>
                                        ❤️ {story.votes}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        className={`${styles.scrollBtn} ${styles.scrollBtnRight}`}
                        onClick={scrollRight}
                        aria-label="Scroll right"
                    >
                        ›
                    </button>
                </div>
            </div>

            {/* Story Modal */}
            {selectedStory && (
                <div className={styles.storyModal} onClick={() => setSelectedStory(null)}>
                    <div className={styles.storyModalContent} onClick={(e) => e.stopPropagation()}>
                        <button
                            className={styles.closeBtn}
                            onClick={() => setSelectedStory(null)}
                        >
                            ✕
                        </button>

                        <div className={styles.storyHeader}>
                            <div className={styles.storyUserInfo}>
                                <Image
                                    src={selectedStory.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStory.userId?.name || 'User')}&background=6366f1&color=fff`}
                                    alt={selectedStory.userId?.name}
                                    width={40}
                                    height={40}
                                    style={{ borderRadius: '50%' }}
                                    unoptimized
                                />
                                <div>
                                    <h4>{selectedStory.userId?.name || 'Anonymous'}</h4>
                                    <p>{selectedStory.challengeId?.title || 'Challenge'}</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.storyMediaContainer}>
                            <Image
                                src={selectedStory.mediaUrl}
                                alt={selectedStory.title}
                                fill
                                style={{ objectFit: 'contain' }}
                            />
                        </div>

                        <div className={styles.storyFooter}>
                            <h3>{selectedStory.title}</h3>
                            <div className={styles.storyStats}>
                                <span>❤️ {selectedStory.votes} votes</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
