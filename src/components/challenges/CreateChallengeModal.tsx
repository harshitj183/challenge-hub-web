"use client";

import { useState } from 'react';
import Image from 'next/image';
import styles from './CreateChallengeModal.module.css';

interface CreateChallengeModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateChallengeModal({ onClose, onSuccess }: CreateChallengeModalProps) {
    const [step, setStep] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Creative',
        startDate: '',
        endDate: '',
        isFree: true,
        entryFee: 0,
        prizeType: 'NONE' as 'MONEY' | 'COINS' | 'NONE',
        prizePool: 0,
        isPromoted: false,
        ageRestriction: 0,
        type: 'VIRTUAL' as 'VIRTUAL' | 'IN_PERSON',
        locationAddr: '',
        mapUrl: '',
    });

    const [files, setFiles] = useState<{
        image: File | null;
        video: File | null;
    }>({
        image: null,
        video: null
    });

    const [previews, setPreviews] = useState<{
        image: string | null;
        video: string | null;
    }>({
        image: null,
        video: null
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFiles(prev => ({ ...prev, [type]: file }));
            setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
        }
    };

    const uploadFile = async (file: File, type: 'image' | 'video') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) throw new Error(`${type} upload failed`);
        const data = await res.json();
        return data.url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setUploading(true);

        try {
            // Validation
            if (!files.image) throw new Error("Cover image is required");
            if (formData.type === 'IN_PERSON' && !formData.locationAddr) throw new Error("Address is required for In-Person events");

            // Upload Files
            const imageUrl = await uploadFile(files.image, 'image');
            let videoUrl = '';
            if (files.video) {
                videoUrl = await uploadFile(files.video, 'video');
            }

            // Prepare Payload
            const payload = {
                ...formData,
                image: imageUrl,
                videoUrl,
                location: formData.type === 'IN_PERSON' ? {
                    address: formData.locationAddr,
                    mapUrl: formData.mapUrl
                } : undefined
            };

            // Send to API
            const res = await fetch('/api/challenges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create challenge');

            onSuccess();
            onClose();

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Something went wrong');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Create Challenge</h2>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                <div className={styles.content}>
                    {error && <div className={styles.error}>{error}</div>}

                    {/* Section 1: Basic Info */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Basic Information</h3>

                        <div className={styles.field}>
                            <label className={styles.label}>Challenge Title</label>
                            <input className={styles.input} value={formData.title} onChange={e => handleChange('title', e.target.value)} placeholder="e.g. Summer Fitness Goal" />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Description</label>
                            <textarea className={styles.textarea} value={formData.description} onChange={e => handleChange('description', e.target.value)} placeholder="Describe the challenge..." rows={3} />
                        </div>

                        <div className={styles.row}>
                            <div className={`${styles.field} ${styles.half}`}>
                                <label className={styles.label}>Category</label>
                                <select className={styles.select} value={formData.category} onChange={e => handleChange('category', e.target.value)}>
                                    <option value="Creative">Creative</option>
                                    <option value="Fitness">Fitness</option>
                                    <option value="Learning">Learning</option>
                                    <option value="Lifestyle">Lifestyle</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className={`${styles.field} ${styles.half}`}>
                                <label className={styles.label}>Type</label>
                                <select className={styles.select} value={formData.type} onChange={e => handleChange('type', e.target.value)}>
                                    <option value="VIRTUAL">Virtual</option>
                                    <option value="IN_PERSON">In Person</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Uploads */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Media</h3>
                        <div className={styles.row}>
                            <div className={styles.half}>
                                <label className={styles.label}>Cover Image (Required)</label>
                                <input type="file" accept="image/*" id="cover-upload" style={{ display: 'none' }} onChange={e => handleFileChange(e, 'image')} />
                                <label htmlFor="cover-upload" className={styles.fileArea}>
                                    {previews.image ? <img src={previews.image} className={styles.preview} alt="Preview" /> : <span>Click to upload Image</span>}
                                </label>
                            </div>
                            <div className={styles.half}>
                                <label className={styles.label}>Challenge Video (Optional)</label>
                                <input type="file" accept="video/*" id="video-upload" style={{ display: 'none' }} onChange={e => handleFileChange(e, 'video')} />
                                <label htmlFor="video-upload" className={styles.fileArea}>
                                    {previews.video ? (
                                        <div className={styles.preview}>
                                            <p>✅ Video Selected</p>
                                        </div>
                                    ) : <span>Click to upload Video</span>}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Schedule & Location */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>When & Where</h3>
                        <div className={styles.row}>
                            <div className={`${styles.field} ${styles.half}`}>
                                <label className={styles.label}>Start Date</label>
                                <input type="datetime-local" className={styles.input} value={formData.startDate} onChange={e => handleChange('startDate', e.target.value)} />
                            </div>
                            <div className={`${styles.field} ${styles.half}`}>
                                <label className={styles.label}>End Date</label>
                                <input type="datetime-local" className={styles.input} value={formData.endDate} onChange={e => handleChange('endDate', e.target.value)} />
                            </div>
                        </div>

                        {formData.type === 'IN_PERSON' && (
                            <>
                                <div className={styles.field}>
                                    <label className={styles.label}>Location Address</label>
                                    <input className={styles.input} value={formData.locationAddr} onChange={e => handleChange('locationAddr', e.target.value)} placeholder="Full address" />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Map URL (Google Maps)</label>
                                    <input className={styles.input} value={formData.mapUrl} onChange={e => handleChange('mapUrl', e.target.value)} placeholder="https://maps.google.com/..." />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Section 4: Budget & Prizes */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Entry Fee & Prizes</h3>

                        <div className={styles.field} style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                            <input type="checkbox" id="isFree" checked={formData.isFree} onChange={e => handleChange('isFree', e.target.checked)} />
                            <label htmlFor="isFree" className={styles.label}>This challenge is free to enter</label>
                        </div>

                        {!formData.isFree && (
                            <div className={styles.row}>
                                <div className={`${styles.field} ${styles.half}`}>
                                    <label className={styles.label}>Entry Fee</label>
                                    <input type="number" className={styles.input} value={formData.entryFee} onChange={e => handleChange('entryFee', parseFloat(e.target.value))} />
                                </div>
                                <div className={`${styles.field} ${styles.half}`}>
                                    <div className={styles.commissionNote}>
                                        * 15% commission will be deducted for the organizer from total fees.
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={styles.field} style={{ marginTop: '1rem' }}>
                            <label className={styles.label}>Prize Type</label>
                            <div className={styles.cardOption}>
                                {['NONE', 'MONEY', 'COINS'].map(type => (
                                    <div
                                        key={type}
                                        className={`${styles.optionBtn} ${formData.prizeType === type ? styles.active : ''}`}
                                        onClick={() => handleChange('prizeType', type)}
                                    >
                                        {type}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {formData.prizeType !== 'NONE' && (
                            <div className={styles.field}>
                                <label className={styles.label}>{formData.prizeType === 'COINS' ? 'Coin Prize Pool' : 'Money Prize Pool'}</label>
                                <input type="number" className={styles.input} value={formData.prizePool} onChange={e => handleChange('prizePool', parseFloat(e.target.value))} />
                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                                    Funds/Coins will be automatically distributed to the winner.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Section 5: Restrictions & Promotion */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Settings</h3>

                        <div className={styles.row}>
                            <div className={`${styles.field} ${styles.half}`}>
                                <label className={styles.label}>Age Restriction (Min Age)</label>
                                <input type="number" className={styles.input} value={formData.ageRestriction} onChange={e => handleChange('ageRestriction', parseInt(e.target.value))} placeholder="0 for none" />
                            </div>

                            <div className={`${styles.field} ${styles.half}`}>
                                <label className={styles.label}>Boost Promotion</label>
                                <div
                                    className={`${styles.optionBtn} ${formData.isPromoted ? styles.active : ''}`}
                                    onClick={() => handleChange('isPromoted', !formData.isPromoted)}
                                >
                                    {formData.isPromoted ? '🚀 Promoted' : 'Standard'}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className={styles.footer}>
                    <button type="button" className={styles.closeBtn} style={{ fontSize: '1rem' }} onClick={onClose}>Cancel</button>
                    <button type="button" className={styles.submitBtn} onClick={handleSubmit} disabled={uploading}>
                        {uploading ? 'Creating...' : 'Create Challenge'}
                    </button>
                </div>
            </div>
        </div>
    );
}
