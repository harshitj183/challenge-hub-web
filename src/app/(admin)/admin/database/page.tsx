
"use client";
import { useState, useEffect } from 'react';
import styles from '../page.module.css';

interface Collection {
    name: string;
    count: number;
}

const ICONS: Record<string, string> = {
    users: '👤',
    challenges: '⚔️',
    submissions: '📷',
    votes: '❤️',
    comments: '💬',
    notifications: '🔔',
    default: '📄'
};

export default function DatabasePage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
    const [jsonInput, setJsonInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        fetchCollections();
    }, []);

    useEffect(() => {
        if (selectedCollection) {
            fetchDocuments(selectedCollection);
        }
    }, [selectedCollection]);

    useEffect(() => {
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            const filtered = documents.filter(doc =>
                JSON.stringify(doc).toLowerCase().includes(lower)
            );
            setFilteredDocuments(filtered);
        } else {
            setFilteredDocuments(documents);
        }
    }, [searchQuery, documents]);

    useEffect(() => {
        if (selectedDoc) {
            setJsonInput(JSON.stringify(selectedDoc, null, 2));
        } else {
            setJsonInput('');
        }
    }, [selectedDoc]);

    const fetchCollections = async () => {
        try {
            const res = await fetch('/api/admin/database');
            const data = await res.json();
            if (res.ok) setCollections(data.collections);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchDocuments = async (colName: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/database?collection=${colName}&limit=100`);
            const data = await res.json();
            if (res.ok) {
                setDocuments(data.documents);
                setFilteredDocuments(data.documents);
                setSelectedDoc(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedDoc || !selectedCollection) return;

        try {
            const parsedData = JSON.parse(jsonInput);
            setStatus('Saving...');

            const res = await fetch('/api/admin/database', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: selectedCollection,
                    id: selectedDoc._id,
                    data: parsedData
                })
            });

            if (res.ok) {
                const refreshed = { ...parsedData, _id: selectedDoc._id };
                setSelectedDoc(refreshed);
                setDocuments(docs => docs.map(d => d._id === selectedDoc._id ? refreshed : d));
                setStatus('✅ Saved successfully!');
                setTimeout(() => setStatus(''), 2000);
            } else {
                const err = await res.json();
                setStatus('❌ Error: ' + err.error);
            }
        } catch (e: any) {
            setStatus('❌ Invalid JSON: ' + e.message);
        }
    };


    const handleDelete = async () => {
        if (!selectedDoc || !selectedCollection || !confirm('Are you sure you want to delete this document? THIS CANNOT BE UNDONE.')) return;

        try {
            const res = await fetch(`/api/admin/database?collection=${selectedCollection}&id=${selectedDoc._id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setDocuments(docs => docs.filter(d => d._id !== selectedDoc._id));
                setSelectedDoc(null);
                setStatus('🗑️ Deleted successfully');
            } else {
                setStatus('❌ Delete failed');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const formatJSON = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            setJsonInput(JSON.stringify(parsed, null, 2));
        } catch (e) {
            alert("Invalid JSON data");
        }
    };

    // Helper to render a nice preview card
    const renderDocCard = (doc: any) => {
        const isSelected = selectedDoc?._id === doc._id;

        // Extract common fields for preview
        const img = doc.avatar || doc.image || doc.mediaUrl;
        const title = doc.name || doc.title || doc.email || doc.username || doc._id;
        const subtitle = doc.email || doc.status || doc.role || doc.category || (doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '');
        const extra = doc.participants ? `${doc.participants} participants` : doc.votes ? `${doc.votes} votes` : '';

        return (
            <div
                key={doc._id}
                onClick={() => setSelectedDoc(doc)}
                className="glass-card-hover"
                style={{
                    padding: '0.75rem',
                    background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: isSelected ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    marginBottom: '0.5rem'
                }}
            >
                {/* Thumbnail if available */}
                {img && typeof img === 'string' && img.startsWith('http') && (
                    <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}

                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 500, color: isSelected ? 'white' : '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{subtitle}</span>
                        {extra && <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: '3px' }}>{extra}</span>}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                        ID: {doc._id}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.adminDashboard} style={{ height: 'calc(100vh - 40px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <header className={styles.header} style={{ flexShrink: 0, marginBottom: '1rem', paddingBottom: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="text-gradient">Database Manager</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Directly manipulate database records</p>
                    </div>
                    <div style={{ padding: '0.5rem 1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <span style={{ color: '#818cf8', fontSize: '0.9rem' }}>🔑 Admin Access Authenticated</span>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 350px 1fr', gap: '1rem', flex: 1, height: '100%', overflow: 'hidden', paddingBottom: '1rem' }}>

                {/* 1. Collection List */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>Collections</h3>
                    </div>
                    <div style={{ overflowY: 'auto', padding: '0.5rem', flex: 1 }}>
                        {collections.map(col => (
                            <button
                                key={col.name}
                                onClick={() => setSelectedCollection(col.name)}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '0.75rem 1rem',
                                    background: selectedCollection === col.name ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0) 100%)' : 'transparent',
                                    borderLeft: selectedCollection === col.name ? '3px solid #6366f1' : '3px solid transparent',
                                    borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                                    color: selectedCollection === col.name ? 'white' : '#cbd5e1',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '2px',
                                    borderRadius: '0 6px 6px 0',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>{ICONS[col.name] || ICONS.default}</span>
                                    <span style={{ fontWeight: selectedCollection === col.name ? 600 : 400 }}>{col.name}</span>
                                </span>
                                <span style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '10px', color: '#94a3b8' }}>
                                    {col.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Document List Table/Grid */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '1rem' }}>{selectedCollection ? ICONS[selectedCollection] : ''} {selectedCollection ? ` ${selectedCollection}` : 'Select a Collection'}</h3>

                        {selectedCollection && (
                            <input
                                type="text"
                                placeholder="🔍 Search documents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '6px',
                                    color: 'white',
                                    fontSize: '0.85rem'
                                }}
                            />
                        )}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1rem' }}>
                        {loading ? (
                            <div className="spinner" style={{ margin: '2rem auto' }}></div>
                        ) : (
                            <>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textAlign: 'right' }}>
                                    Showing {filteredDocuments.length} records
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {filteredDocuments.map(doc => renderDocCard(doc))}
                                    {filteredDocuments.length === 0 && selectedCollection && (
                                        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                            No matching documents found
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* 3. Editor Panel */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h3 style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Object Editor</h3>
                            {selectedDoc && <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#6366f1' }}>{selectedDoc._id}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {status && <span style={{ fontSize: '0.8rem', color: status.includes('Error') ? '#ef4444' : '#10b981', marginRight: '0.5rem' }}>{status}</span>}
                            <button onClick={formatJSON} disabled={!selectedDoc} title="Format JSON" style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: selectedDoc ? 1 : 0.3 }}>✨</button>
                        </div>
                    </div>

                    <div style={{ flex: 1, position: 'relative', background: '#0f172a' }}>
                        {!selectedDoc && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', flexDirection: 'column', gap: '1rem' }}>
                                <span style={{ fontSize: '2rem', opacity: 0.5 }}>📝</span>
                                <p>Select a document to edit</p>
                            </div>
                        )}
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            disabled={!selectedDoc}
                            spellCheck={false}
                            style={{
                                width: '100%',
                                height: '100%',
                                padding: '1.5rem',
                                background: 'transparent',
                                border: 'none',
                                color: '#e2e8f0',
                                fontFamily: "'Fira Code', Consolas, Monaco, monospace",
                                fontSize: '14px',
                                lineHeight: '1.6',
                                resize: 'none',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ padding: '1rem', /* borderTop: '1px solid rgba(255,255,255,0.05)', */ background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '1rem' }}>
                        <button
                            disabled={!selectedDoc}
                            onClick={handleSave}
                            className="btn-primary"
                            style={{ flex: 1, padding: '0.75rem', opacity: !selectedDoc ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <span>💾</span> Save Changes
                        </button>
                        <button
                            disabled={!selectedDoc}
                            onClick={handleDelete}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#fca5a5',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                opacity: !selectedDoc ? 0.5 : 1,
                                transition: 'all 0.2s'
                            }}
                        >
                            🗑️ Delete
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
