"use client";
import { useState, useEffect } from 'react';
import styles from './page.module.css';

interface Match {
    id: string;
    player1: string;
    player2: string;
    winner: string | null;
    score1: number;
    score2: number;
}

interface Round {
    roundName: string;
    matches: Match[];
}

export default function BracketPage() {
    // Divisions state format
    const [divisions, setDivisions] = useState<number>(2);
    // Mock data for brackets based on 8 players leading to a final
    const [bracketData, setBracketData] = useState<Round[]>([
        {
            roundName: 'Quarterfinals',
            matches: [
                { id: '1', player1: 'User A', player2: 'User B', winner: 'User A', score1: 3, score2: 1 },
                { id: '2', player1: 'User C', player2: 'User D', winner: 'User D', score1: 0, score2: 2 },
                { id: '3', player1: 'User E', player2: 'User F', winner: null, score1: 0, score2: 0 },
                { id: '4', player1: 'User G', player2: 'User H', winner: null, score1: 0, score2: 0 },
            ]
        },
        {
            roundName: 'Semifinals',
            matches: [
                { id: '5', player1: 'User A', player2: 'User D', winner: null, score1: 0, score2: 0 },
                { id: '6', player1: 'TBD', player2: 'TBD', winner: null, score1: 0, score2: 0 },
            ]
        },
        {
            roundName: 'Final',
            matches: [
                { id: '7', player1: 'TBD', player2: 'TBD', winner: null, score1: 0, score2: 0 },
            ]
        }
    ]);

    const getDivisionText = (divs: number) => {
        if (divs === 2) return "2 Divisions (East/West)";
        if (divs === 4) return "4 Divisions (Regional)";
        return "6 Divisions (Global)";
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className="text-gradient">Tournament Brackets</h1>
                <p>Manage and view live interactive tournament brackets</p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ color: '#aaa' }}>Format:</span>
                    {[2, 4, 6].map(div => (
                        <button
                            key={div}
                            onClick={() => setDivisions(div)}
                            className={divisions === div ? styles.activeTab : styles.tab}
                        >
                            {div} Divisions
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.divisionContainer}>
                <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem', textAlign: 'center' }}>
                    {getDivisionText(divisions)}
                </h2>

                <div className={styles.bracketWrapper}>
                    {bracketData.map((round, rIndex) => (
                        <div key={rIndex} className={styles.round}>
                            <h3 className={styles.roundTitle}>{round.roundName}</h3>
                            <div className={styles.matchesColumn}>
                                {round.matches.map(match => (
                                    <div key={match.id} className={styles.matchCard}>
                                        <div className={`${styles.player} ${match.winner === match.player1 ? styles.winner : ''}`}>
                                            <span>{match.player1}</span>
                                            <span className={styles.score}>{match.score1}</span>
                                        </div>
                                        <div className={styles.divider}></div>
                                        <div className={`${styles.player} ${match.winner === match.player2 ? styles.winner : ''}`}>
                                            <span>{match.player2}</span>
                                            <span className={styles.score}>{match.score2}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem', color: '#666' }}>
                <p>Interactive Bracket Management (Admin/Verified Hosts only)</p>
                <p>Max 50 participants allowed per tournament.</p>
            </div>
        </div>
    );
}
