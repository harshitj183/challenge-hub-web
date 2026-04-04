"use client";
import { useState, useEffect, use } from 'react';
import styles from './page.module.css';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Player {
    _id: string;
    name: string;
    avatar: string;
}

interface Match {
    _id: string;
    challengeId: string;
    round: number;
    division: string;
    participants: Player[];
    scores: number[];
    winner: Player | null;
    status: 'pending' | 'active' | 'completed';
}

interface Challenge {
    _id: string;
    title: string;
    challengeType: string;
    tournamentDetails?: {
        divisions: number;
    };
    createdBy: string;
}

export default function ChallengeBracketPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const [matches, setMatches] = useState<Match[]>([]);
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeDivision, setActiveDivision] = useState<string>('A');
    const [generating, setGenerating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);
    const [winnerId, setWinnerId] = useState<string>('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [challengeRes, bracketRes] = await Promise.all([
                fetch(`/api/challenges/${id}`),
                fetch(`/api/challenges/${id}/bracket`)
            ]);

            const challengeData = await challengeRes.json();
            const bracketData = await bracketRes.json();

            if (challengeData.challenge) {
                setChallenge(challengeData.challenge);
            }
            if (bracketData.matches) {
                setMatches(bracketData.matches);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load bracket data');
        } finally {
            setLoading(false);
        }
    };

    const generateBracket = async () => {
        try {
            setGenerating(true);
            const res = await fetch(`/api/challenges/${id}/bracket`, {
                method: 'POST',
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Bracket generated successfully!');
                fetchData();
            } else {
                toast.error(data.error || 'Failed to generate bracket');
            }
        } catch (error) {
            toast.error('An error occurred while generating the bracket');
        } finally {
            setGenerating(false);
        }
    };

    const handleUpdateScore = async () => {
        if (!selectedMatch || !winnerId) {
            toast.error('Please select a winner');
            return;
        }

        try {
            setUpdating(true);
            const res = await fetch(`/api/challenges/${id}/bracket`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matchId: selectedMatch._id,
                    scores: [score1, score2],
                    winnerId
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Match updated successfully!');
                setSelectedMatch(null);
                fetchData();
            } else {
                toast.error(data.error || 'Failed to update match');
            }
        } catch (error) {
            toast.error('An error occurred while updating the match');
        } finally {
            setUpdating(false);
        }
    };

    const openUpdateModal = (match: Match) => {
        setSelectedMatch(match);
        setScore1(match.scores[0] || 0);
        setScore2(match.scores[1] || 0);
        setWinnerId(match.winner?._id || '');
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading tournament brackets...</p>
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className={styles.empty}>
                <h2>Challenge not found</h2>
                <Link href="/challenges" className={styles.generateBtn}>Back to Challenges</Link>
            </div>
        );
    }

    const isTournament = challenge.challengeType === 'tournament';
    if (!isTournament) {
        return (
            <div className={styles.empty}>
                <h2>This is not a tournament challenge</h2>
                <Link href={`/challenges/${id}`} className={styles.generateBtn}>View Details</Link>
            </div>
        );
    }

    const divisionsCount = challenge.tournamentDetails?.divisions || 2;
    const divisionNames = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, divisionsCount);
    const isAdminOrCreator = session?.user?.role === 'admin' || session?.user?.id === challenge.createdBy;

    const filteredMatches = matches.filter(m => m.division === activeDivision);
    const rounds = Array.from(new Set(filteredMatches.map(m => m.round))).sort((a, b) => a - b);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href={`/challenges/${id}`} className="text-secondary text-sm mb-4 inline-block hover:underline">
                    ← Back to Challenge Details
                </Link>
                <h1 className="text-gradient">{challenge.title}</h1>
                <p>Official Tournament Brackets & Match Scheduling</p>

                <div className={styles.controls}>
                    {divisionNames.map(div => (
                        <button
                            key={div}
                            onClick={() => setActiveDivision(div)}
                            className={activeDivision === div ? styles.activeTab : styles.tab}
                        >
                            Division {div}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.divisionContainer}>
                <h2 className={styles.divisionTitle}>Division {activeDivision} Brackets</h2>

                {matches.length === 0 ? (
                    <div className={styles.empty}>
                        <p className="mb-6">Bracket has not been generated yet.</p>
                        {isAdminOrCreator && (
                            <button 
                                onClick={generateBracket} 
                                disabled={generating}
                                className={styles.generateBtn}
                            >
                                {generating ? 'Generating...' : '🛠️ Generate Initial Bracket'}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={styles.bracketWrapper}>
                        {rounds.map(roundNum => (
                            <div key={roundNum} className={styles.round}>
                                <h3 className={styles.roundTitle}>Round {roundNum}</h3>
                                <div className={styles.matchesColumn}>
                                    {filteredMatches
                                        .filter(m => m.round === roundNum)
                                        .map((match) => (
                                            <div key={match._id} className={styles.matchCard}>
                                                <div className={`${styles.player} ${match.winner?._id === match.participants[0]?._id ? styles.winner : ''}`}>
                                                    <div className={styles.playerInfo}>
                                                        <img src={match.participants[0]?.avatar || '/placeholder-avatar.png'} className={styles.avatar} alt="" />
                                                        <span>{match.participants[0]?.name || 'TBD'}</span>
                                                    </div>
                                                    <span className={styles.score}>{match.scores[0] || 0}</span>
                                                    {match.winner?._id === match.participants[0]?._id && <div className={styles.winnerIcon}></div>}
                                                </div>
                                                <div className={styles.divider}></div>
                                                <div className={`${styles.player} ${match.winner?._id === match.participants[1]?._id ? styles.winner : ''}`}>
                                                    <div className={styles.playerInfo}>
                                                        <img src={match.participants[1]?.avatar || '/placeholder-avatar.png'} className={styles.avatar} alt="" />
                                                        <span>{match.participants[1]?.name || 'TBD'}</span>
                                                    </div>
                                                    <span className={styles.score}>{match.scores[1] || 0}</span>
                                                    {match.winner?._id === match.participants[1]?._id && <div className={styles.winnerIcon}></div>}
                                                </div>
                                                {isAdminOrCreator && match.status !== 'completed' && match.participants.length === 2 && (
                                                    <button 
                                                        className={styles.editBtn}
                                                        onClick={() => openUpdateModal(match)}
                                                    >
                                                        Edit Result
                                                    </button>
                                                )}
                                                {match.status === 'completed' && (
                                                    <div className={styles.completedBadge}>Final</div>
                                                )}
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem', color: '#666', fontSize: '0.9rem' }}>
                <p>Tournament matches follow the official platform rules.</p>
                <p>Results are validated by submission voting and verified by staff.</p>
            </div>

            {selectedMatch && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2 className="mb-4">Update Match Result</h2>
                        <p className="text-secondary mb-6">Round {selectedMatch.round} - Division {selectedMatch.division}</p>
                        
                        <div className={styles.modalContent}>
                            <div className={styles.modalPlayerRow}>
                                <div className={styles.modalPlayerInfo}>
                                    <img src={selectedMatch.participants[0]?.avatar || '/placeholder-avatar.png'} className={styles.avatar} alt="" />
                                    <span>{selectedMatch.participants[0]?.name}</span>
                                </div>
                                <input 
                                    type="number" 
                                    value={score1} 
                                    onChange={(e) => setScore1(Number(e.target.value))}
                                    className={styles.scoreInput}
                                    placeholder="Score"
                                />
                            </div>

                            <div className={styles.vs}>VS</div>

                            <div className={styles.modalPlayerRow}>
                                <div className={styles.modalPlayerInfo}>
                                    <img src={selectedMatch.participants[1]?.avatar || '/placeholder-avatar.png'} className={styles.avatar} alt="" />
                                    <span>{selectedMatch.participants[1]?.name}</span>
                                </div>
                                <input 
                                    type="number" 
                                    value={score2} 
                                    onChange={(e) => setScore2(Number(e.target.value))}
                                    className={styles.scoreInput}
                                    placeholder="Score"
                                />
                            </div>

                            <div className={styles.winnerSelect}>
                                <p className="mb-3">Select Winner:</p>
                                <div className={styles.winnerOptions}>
                                    <button 
                                        className={winnerId === selectedMatch.participants[0]?._id ? styles.winnerBtnActive : styles.winnerBtn}
                                        onClick={() => setWinnerId(selectedMatch.participants[0]?._id)}
                                    >
                                        {selectedMatch.participants[0]?.name}
                                    </button>
                                    <button 
                                        className={winnerId === selectedMatch.participants[1]?._id ? styles.winnerBtnActive : styles.winnerBtn}
                                        onClick={() => setWinnerId(selectedMatch.participants[1]?._id)}
                                    >
                                        {selectedMatch.participants[1]?.name}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button onClick={() => setSelectedMatch(null)} className={styles.cancelBtn}>Cancel</button>
                            <button 
                                onClick={handleUpdateScore} 
                                className={styles.updateBtn}
                                disabled={updating}
                            >
                                {updating ? 'Updating...' : 'Confirm Result'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
