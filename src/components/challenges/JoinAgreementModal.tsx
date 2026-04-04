import React, { useState } from 'react';
import styles from './JoinAgreementModal.module.css';

interface JoinAgreementModalProps {
    challengeTitle: string;
    rulesPdfUrl?: string;
    onConfirm: () => void;
    onClose: () => void;
    loading?: boolean;
}

const JoinAgreementModal: React.FC<JoinAgreementModalProps> = ({ 
    challengeTitle, 
    rulesPdfUrl, 
    onConfirm, 
    onClose,
    loading = false
}) => {
    const [agreedToRules, setAgreedToRules] = useState(false);
    const [agreedToNonRefundable, setAgreedToNonRefundable] = useState(false);

    const isReady = agreedToRules && agreedToNonRefundable;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                
                <h2 className="text-gradient">Join Challenge</h2>
                <p className={styles.subtitle}>Please review the rules and terms for <strong>{challengeTitle}</strong></p>

                <div className={styles.agreementContent}>
                    <div className={styles.infoBox}>
                        <h4>Final Step</h4>
                        <p>To ensure a fair and competitive environment, all participants must agree to the following terms. Your acceptance will be recorded with a timestamp and IP signature.</p>
                    </div>

                    {rulesPdfUrl && (
                        <a 
                            href={rulesPdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={styles.pdfLink}
                        >
                            <span style={{ marginRight: '0.5rem' }}>📄</span> Download Detailed Rules (PDF)
                        </a>
                    )}

                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                            <input 
                                type="checkbox" 
                                checked={agreedToRules} 
                                onChange={(e) => setAgreedToRules(e.target.checked)} 
                            />
                            <span className={styles.checkboxText}>
                                I have read and agree to the <strong>Challenge Rules</strong> and Platform TOS.
                            </span>
                        </label>

                        <label className={styles.checkboxLabel}>
                            <input 
                                type="checkbox" 
                                checked={agreedToNonRefundable} 
                                onChange={(e) => setAgreedToNonRefundable(e.target.checked)} 
                            />
                            <span className={styles.checkboxText}>
                                I understand that entry fees and submissions are <strong>Non-Refundable</strong>.
                            </span>
                        </label>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
                    <button 
                        className={styles.confirmBtn} 
                        onClick={onConfirm} 
                        disabled={!isReady || loading}
                    >
                        {loading ? 'Joining...' : 'Confirm & Join Challenge'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinAgreementModal;
