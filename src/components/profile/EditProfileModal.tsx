"use client";
import { useState } from 'react';
import styles from './EditProfileModal.module.css';

interface UserData {
    name: string;
    email: string;
    avatar: string;
    bio?: string;
    location?: string;
    website?: string;
    instagram?: string;
}

interface EditProfileModalProps {
    user: UserData;
    onClose: () => void;
    onUpdate: () => void;
}

export default function EditProfileModal({ user, onClose, onUpdate }: EditProfileModalProps) {
    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio || '');
    const [location, setLocation] = useState(user.location || '');
    const [website, setWebsite] = useState(user.website || '');
    const [instagram, setInstagram] = useState(user.instagram || '');

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState(user.avatar);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let avatarUrl = user.avatar;

            // 1. Upload new avatar if selected
            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) {
                    throw new Error('Failed to upload image');
                }

                const uploadData = await uploadRes.json();
                avatarUrl = uploadData.url;
            }

            // 2. Update Profile
            const updateRes = await fetch('/api/users/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    avatar: avatarUrl,
                    bio,
                    location,
                    website,
                    instagram
                }),
            });


            if (!updateRes.ok) {
                const data = await updateRes.json();
                throw new Error(data.error || 'Failed to update profile');
            }

            const updateData = await updateRes.json();
            console.log('Profile updated successfully:', updateData);

            // Success - refresh profile data first, then close modal
            await onUpdate();

            // Small delay to ensure UI updates
            setTimeout(() => {
                onClose();
            }, 100);

        } catch (err: any) {
            console.error('Profile update error:', err);
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Edit Profile</h2>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <form className={styles.form} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                    {error && <div style={{ color: '#ff3b30', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                    <div className={styles.group}>
                        <label className={styles.label}>Avatar</label>
                        <div className={styles.uploadContainer}>
                            {previewUrl && (
                                <div className={styles.imagePreview}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={previewUrl} alt="Preview" />
                                </div>
                            )}
                            <label className={styles.uploadBtn}>
                                {file ? 'Change Photo' : 'Upload New Photo'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Full Name</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            minLength={2}
                            maxLength={50}
                        />
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Bio</label>
                        <textarea
                            className={styles.input}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={160}
                            rows={3}
                            placeholder="Tell us about yourself..."
                            style={{ resize: 'none', fontFamily: 'inherit' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className={styles.group}>
                            <label className={styles.label}>Location</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="City, Country"
                                maxLength={50}
                            />
                        </div>
                        <div className={styles.group}>
                            <label className={styles.label}>Instagram (Username)</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                placeholder="@username"
                                maxLength={30}
                            />
                        </div>
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Website</label>
                        <input
                            type="url"
                            className={styles.input}
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://example.com"
                        />
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Email (Cannot be changed)</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={user.email}
                            disabled
                            style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
