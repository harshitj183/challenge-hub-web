"use client";

import { useState } from 'react';
import Image from 'next/image';
import styles from './SubmissionModal.module.css';

interface SubmissionModalProps {
    challengeId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function SubmissionModal({ challengeId, onClose, onSuccess }: SubmissionModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) return;

        setUploading(true);
        setError('');

        try {
            // 1. Upload File
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

            const imageUrl = uploadData.url;

            // 2. Create Submission
            const subRes = await fetch('/api/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    challengeId,
                    title,
                    description,
                    mediaUrl: imageUrl,
                    mediaType: 'image'
                }),
            });


            const subData = await subRes.json();
            if (!subRes.ok) throw new Error(subData.error || 'Submission failed');

            console.log('Submission created:', subData.submission);

            // Success - wait a bit for database to fully save
            await new Promise(resolve => setTimeout(resolve, 500));
            onSuccess();
            onClose();

        } catch (err: any) {
            console.error('Submission error:', err);
            setError(err.message || 'Something went wrong');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Submit Entry</h2>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.field}>
                        <label className={styles.label}>Submission Title</label>
                        <input
                            className={styles.input}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Give your masterpiece a name"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Description (Optional)</label>
                        <textarea
                            className={styles.textarea}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell us about your submission..."
                            rows={3}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Upload Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className={styles.fileArea}>
                            {file ? (
                                <div>
                                    <p>✅ {file.name}</p>
                                    {preview && (
                                        <div className={styles.preview}>
                                            <Image
                                                src={preview}
                                                alt="Preview"
                                                width={400}
                                                height={200}
                                                style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
                                            />
                                        </div>
                                    )}
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#999' }}>Click to change</p>
                                </div>
                            ) : (
                                <div>
                                    <p style={{ fontSize: '2rem' }}>📁</p>
                                    <p>Click to select an image</p>
                                    <p style={{ fontSize: '0.8rem', color: '#666' }}>JPG, PNG supported</p>
                                </div>
                            )}
                        </label>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={uploading}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={uploading || !file || !title}>
                            {uploading ? 'Uploading...' : 'Submit Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
