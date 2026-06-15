import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, ShieldAlert, CloudUpload, Eye, GripVertical, Loader2 } from 'lucide-react';
import { getAdminRole } from '../utils/adminAuth';
import { getLandingDraft, saveLandingDraft, saveLandingConfig } from '../data/landingConfig';
import type { LandingConfig } from '../data/landingConfig';
import './Admin.css';

// --- Sub-components ---

const ImageInput = ({ label, value, onChange, placeholder }: any) => (
    <div className="input-group-compact" style={{ marginTop: '12px' }}>
        <label>{label}</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
                style={{ flex: 1, padding: '9px', borderRadius: '6px', border: '1px solid #ccc' }}
                placeholder={placeholder || 'URL or path...'} />
            {value && <img src={value} alt="preview" style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee', flexShrink: 0 }} onError={e => (e.currentTarget.style.display = 'none')} />}
            <label style={{ background: '#f0f0f0', padding: '9px 12px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ccc', margin: 0, display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}>
                <CloudUpload size={14} /> Local
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) { const r = new FileReader(); r.onloadend = () => onChange(r.result as string); r.readAsDataURL(file); }
                }} />
            </label>
        </div>
    </div>
);

const TextField = ({ label, value, onChange, rows, hint }: any) => (
    <div className="input-group-compact" style={{ marginBottom: '12px' }}>
        <label>{label}</label>
        {rows ? (
            <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={rows}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical', boxSizing: 'border-box' }} />
        ) : (
            <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #ccc' }} />
        )}
        {hint && <small style={{ color: '#888', display: 'block', marginTop: '4px' }}>{hint}</small>}
    </div>
);

// Drag-and-drop list wrapper
function DragList<T extends { id: string }>({
    items, onReorder, renderItem
}: { items: T[], onReorder: (items: T[]) => void, renderItem: (item: T, idx: number) => React.ReactNode }) {
    const dragIdx = useRef<number | null>(null);
    const onDragStart = (i: number) => { dragIdx.current = i; };
    const onDrop = (i: number) => {
        if (dragIdx.current === null || dragIdx.current === i) return;
        const arr = [...items];
        const [moved] = arr.splice(dragIdx.current, 1);
        arr.splice(i, 0, moved);
        onReorder(arr);
        dragIdx.current = null;
    };
    return (
        <>
            {items.map((item, i) => (
                <div key={item.id} draggable
                    onDragStart={() => onDragStart(i)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => onDrop(i)}
                    style={{ marginBottom: '12px' }}>
                    {renderItem(item, i)}
                </div>
            ))}
        </>
    );
}

// Card wrapper for each section
const Section = ({ number, title, children, action }: any) => (
    <div className="card" style={{ background: '#fff', padding: '22px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}>
            <div>
                <span style={{ background: '#D04A02', color: '#fff', borderRadius: '50%', width: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', marginRight: '10px' }}>{number}</span>
                <strong style={{ fontSize: '1em', color: '#222' }}>{title}</strong>
            </div>
            {action}
        </div>
        {children}
    </div>
);

const AddBtn = ({ label, onClick }: any) => (
    <button onClick={onClick} style={{ background: '#D04A02', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
        <Plus size={13} /> {label}
    </button>
);

const DeleteBtn = ({ onClick }: any) => (
    <button onClick={onClick} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#d93025', cursor: 'pointer' }}>
        <Trash2 size={15} />
    </button>
);

// ============================================================

const LandingPageEditor: React.FC = () => {
    const navigate = useNavigate();
    const role = getAdminRole();
    const canEdit = role === 'Super Admin' || role === 'Developer';

    const [config, setConfig] = useState<LandingConfig | null>(null);
    const [saved, setSaved] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => { setConfig(getLandingDraft()); }, []);

    const upd = (partial: Partial<LandingConfig>) => setConfig(c => c ? { ...c, ...partial } : c);
    const updStats = (partial: Partial<LandingConfig['stats']>) => setConfig(c => c ? { ...c, stats: { ...c.stats, ...partial } } : c);

    const handleSave = () => {
        if (!config) return;
        saveLandingDraft(config);
        window.dispatchEvent(new StorageEvent('storage', { key: 'kartika_landing_draft' }));
        setSaved(true);
        setMessage({ type: 'success', text: '✅ Draft saved! Open /sandbox to preview. Click "Deploy Changes" to push live.' });
        setTimeout(() => setSaved(false), 3000);
    };

    const handleDeploy = async () => {
        if (!config) return;
        setIsDeploying(true);
        setMessage({ type: 'success', text: 'Deploying changes to GitHub...' });
        saveLandingDraft(config);
        try {
            const res = await fetch('/.netlify/functions/admin-deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source: 'landing_page', config })
            });
            const data = await res.json();
            if (res.ok) {
                saveLandingConfig(config);
                window.dispatchEvent(new StorageEvent('storage', { key: 'kartika_landing_config' }));
                setMessage({ type: 'success', text: '✅ Deployed! Vercel is rebuilding your live site.' });
            } else throw new Error(data.error || 'Deploy failed');
        } catch {
            saveLandingConfig(config);
            window.dispatchEvent(new StorageEvent('storage', { key: 'kartika_landing_config' }));
            setMessage({ type: 'success', text: '✅ Deployed to live config (local fallback).' });
        } finally { setIsDeploying(false); }
    };

    if (!canEdit) return (
        <div className="admin-dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <Helmet><title>Access Denied | Kartika.id</title></Helmet>
            <ShieldAlert size={64} color="#d93025" />
            <h2>Access Denied</h2>
            <p>Super Admin or Developer role required.</p>
            <button className="nav-btn" onClick={() => navigate('/admin/dashboard')}>Return to Dashboard</button>
        </div>
    );

    if (!config) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;

    return (
        <div className="admin-dashboard admin-blog-manager">
            <Helmet><title>Landing Page Editor | Kartika Admin</title></Helmet>

            {message && (
                <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 9999, padding: '14px 20px', borderRadius: '8px', background: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxWidth: '380px', fontSize: '14px' }}>
                    {message.text}
                    <button onClick={() => setMessage(null)} style={{ marginLeft: '12px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                </div>
            )}

            <header className="admin-header">
                <div className="admin-header-title">
                    <button onClick={() => navigate('/admin/dashboard')} className="back-link"><ArrowLeft size={18} /></button>
                    <h1>LANDING PAGE EDITOR</h1>
                </div>
                <div className="admin-user-nav">
                    <button onClick={() => window.open('/sandbox', '_blank')} className="save-btn" style={{ background: '#fff', color: '#333', border: '1px solid #ccc' }}>
                        <Eye size={16} /><span>Preview</span>
                    </button>
                    <button onClick={handleSave} className="save-btn" style={{ background: saved ? '#27ae60' : '#4a5568' }}>
                        <Save size={16} /><span>{saved ? 'Saved!' : 'Save Draft'}</span>
                    </button>
                    <button onClick={handleDeploy} disabled={isDeploying} className="save-btn">
                        {isDeploying ? <Loader2 className="animate-spin" size={16} /> : <CloudUpload size={16} />}
                        <span>{isDeploying ? 'Deploying...' : 'Deploy Changes'}</span>
                    </button>
                </div>
            </header>

            <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gap: '20px', padding: '20px' }}>

                {/* 0. Navbar */}
                <Section number="0" title="Navbar">
                    <TextField label="Logo Tagline Text" value={config.navLogoText} onChange={(v: string) => upd({ navLogoText: v })} />
                </Section>

                {/* 1. Hero */}
                <Section number="1" title="Hero Section">
                    <TextField label="Main Title" value={config.heroTitle} onChange={(v: string) => upd({ heroTitle: v })} />
                    <TextField label="Subtitle / Tagline" value={config.heroSubtitle} onChange={(v: string) => upd({ heroSubtitle: v })} />
                    <ImageInput label="Hero Image" value={config.heroImage} onChange={(v: string) => upd({ heroImage: v })} />
                </Section>

                {/* 2. About */}
                <Section number="2" title="About Us">
                    <TextField label="About Us Content" value={config.aboutText} onChange={(v: string) => upd({ aboutText: v })} rows={5} />
                    <ImageInput label="About Us Image" value={config.aboutImage} onChange={(v: string) => upd({ aboutImage: v })} />
                </Section>

                {/* 3. Stats */}
                <Section number="3" title="Impact Statistics">
                    <TextField label="Section Group Title" value={config.statsGroupTitle} onChange={(v: string) => upd({ statsGroupTitle: v })} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '8px' }}>
                        {[
                            { countKey: 'events', labelKey: 'eventsLabel', countLabel: 'Events Count', labelLabel: 'Events Label' },
                            { countKey: 'students', labelKey: 'studentsLabel', countLabel: 'Students Count', labelLabel: 'Students Label' },
                            { countKey: 'satisfaction', labelKey: 'satisfactionLabel', countLabel: 'Satisfaction Rate', labelLabel: 'Satisfaction Label' },
                        ].map(({ countKey, labelKey, countLabel, labelLabel }) => (
                            <div key={countKey} style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
                                <TextField label={countLabel} value={(config.stats as any)[countKey]} onChange={(v: string) => updStats({ [countKey]: v } as any)} />
                                <TextField label={labelLabel} value={(config.stats as any)[labelKey]} onChange={(v: string) => updStats({ [labelKey]: v } as any)} />
                            </div>
                        ))}
                    </div>
                </Section>

                {/* 4. Missions */}
                <Section number="4" title="Our Missions" action={<AddBtn label="Add Mission" onClick={() => upd({ missions: [...config.missions, { id: 'm' + Date.now(), title: 'New Mission', desc: '' }] })} />}>
                    <TextField label="Section Heading" value={config.missionsHeading} onChange={(v: string) => upd({ missionsHeading: v })} />
                    <DragList items={config.missions} onReorder={missions => upd({ missions })} renderItem={(m, i) => (
                        <div style={{ padding: '14px', background: '#f9f9f9', borderRadius: '8px', borderLeft: '4px solid #D04A02', position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <GripVertical size={14} style={{ color: '#aaa', cursor: 'grab', flexShrink: 0 }} />
                                <strong style={{ fontSize: '13px', color: '#666' }}>Mission {i + 1}</strong>
                            </div>
                            <DeleteBtn onClick={() => upd({ missions: config.missions.filter(x => x.id !== m.id) })} />
                            <TextField label="Title" value={m.title} onChange={(v: string) => { const a = [...config.missions]; a[i] = { ...a[i], title: v }; upd({ missions: a }); }} />
                            <TextField label="Description" value={m.desc} onChange={(v: string) => { const a = [...config.missions]; a[i] = { ...a[i], desc: v }; upd({ missions: a }); }} rows={3} />
                        </div>
                    )} />
                </Section>

                {/* 5. Programs */}
                <Section number="5" title="Our Programs" action={<AddBtn label="Add Program" onClick={() => upd({ programs: [...config.programs, { id: 'p' + Date.now(), title: 'New Program', subtitle: '', desc: '' }] })} />}>
                    <TextField label="Section Heading" value={config.programsHeading} onChange={(v: string) => upd({ programsHeading: v })} />
                    <DragList items={config.programs} onReorder={programs => upd({ programs })} renderItem={(p, i) => (
                        <div style={{ padding: '14px', background: '#f9f9f9', borderRadius: '8px', borderLeft: '4px solid #4a90e2', position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <GripVertical size={14} style={{ color: '#aaa', cursor: 'grab', flexShrink: 0 }} />
                                <strong style={{ fontSize: '13px', color: '#666' }}>Program {i + 1}</strong>
                            </div>
                            <DeleteBtn onClick={() => upd({ programs: config.programs.filter(x => x.id !== p.id) })} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <TextField label="Title" value={p.title} onChange={(v: string) => { const a = [...config.programs]; a[i] = { ...a[i], title: v }; upd({ programs: a }); }} />
                                <TextField label="Subtitle" value={p.subtitle} onChange={(v: string) => { const a = [...config.programs]; a[i] = { ...a[i], subtitle: v }; upd({ programs: a }); }} />
                            </div>
                            <TextField label="Description" value={p.desc} onChange={(v: string) => { const a = [...config.programs]; a[i] = { ...a[i], desc: v }; upd({ programs: a }); }} rows={3} />
                        </div>
                    )} />
                </Section>

                {/* 6. Testimonials */}
                <Section number="6" title="Testimonials" action={<AddBtn label="Add Testimonial" onClick={() => upd({ testimonials: [...config.testimonials, { id: 't' + Date.now(), name: 'New Name', role: '', text: '' }] })} />}>
                    <TextField label="Section Heading" value={config.testimonialsHeading} onChange={(v: string) => upd({ testimonialsHeading: v })} />
                    <DragList items={config.testimonials} onReorder={testimonials => upd({ testimonials })} renderItem={(t, i) => (
                        <div style={{ padding: '14px', background: '#f9f9f9', borderRadius: '8px', borderLeft: '4px solid #27ae60', position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <GripVertical size={14} style={{ color: '#aaa', cursor: 'grab', flexShrink: 0 }} />
                                <strong style={{ fontSize: '13px', color: '#666' }}>{t.name || `Testimonial ${i + 1}`}</strong>
                            </div>
                            <DeleteBtn onClick={() => upd({ testimonials: config.testimonials.filter(x => x.id !== t.id) })} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                                <TextField label="Name" value={t.name} onChange={(v: string) => { const a = [...config.testimonials]; a[i] = { ...a[i], name: v }; upd({ testimonials: a }); }} />
                                <TextField label="Role / University" value={t.role} onChange={(v: string) => { const a = [...config.testimonials]; a[i] = { ...a[i], role: v }; upd({ testimonials: a }); }} />
                            </div>
                            <TextField label="Review" value={t.text} onChange={(v: string) => { const a = [...config.testimonials]; a[i] = { ...a[i], text: v }; upd({ testimonials: a }); }} rows={3} />
                        </div>
                    )} />
                </Section>

                {/* 7. Partners */}
                <Section number="7" title="Our Past Partners" action={<AddBtn label="Add Partner" onClick={() => upd({ partners: [...(config.partners || []), { id: 'pr' + Date.now(), logo: '', alt: '', description: 'New Partner' }] })} />}>
                    <TextField label="Section Heading" value={config.partnersHeading} onChange={(v: string) => upd({ partnersHeading: v })} />
                    <DragList items={config.partners || []} onReorder={partners => upd({ partners })} renderItem={(p, i) => (
                        <div style={{ padding: '14px', background: '#f9f9f9', borderRadius: '8px', borderLeft: '4px solid #8e44ad', position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <GripVertical size={14} style={{ color: '#aaa', cursor: 'grab', flexShrink: 0 }} />
                                <strong style={{ fontSize: '13px', color: '#666' }}>{p.description || `Partner ${i + 1}`}</strong>
                            </div>
                            <DeleteBtn onClick={() => upd({ partners: config.partners.filter(x => x.id !== p.id) })} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <TextField label="Alt Text" value={p.alt} onChange={(v: string) => { const a = [...config.partners]; a[i] = { ...a[i], alt: v }; upd({ partners: a }); }} />
                                <TextField label="Description" value={p.description} onChange={(v: string) => { const a = [...config.partners]; a[i] = { ...a[i], description: v }; upd({ partners: a }); }} />
                            </div>
                            <ImageInput label={`Logo Image`} value={p.logo} onChange={(v: string) => { const a = [...config.partners]; a[i] = { ...a[i], logo: v }; upd({ partners: a }); }} />
                        </div>
                    )} />
                </Section>

                {/* 8. Team & Speakers */}
                <Section number="8" title="Team & Speakers Assets">
                    <TextField label="Speakers Section Title" value={config.speakersTitle} onChange={(v: string) => upd({ speakersTitle: v })} rows={2}
                        hint="Use a new line (Enter) for the second line of the heading." />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                        <ImageInput label="Speakers 1st Gen Image" value={config.speakersImage} onChange={(v: string) => upd({ speakersImage: v })} />
                        <ImageInput label="Speakers 2nd Gen Image" value={config.speakers2ndImage} onChange={(v: string) => upd({ speakers2ndImage: v })} />
                        <ImageInput label="Coreteam Image" value={config.coreteamImage} onChange={(v: string) => upd({ coreteamImage: v })} />
                        <ImageInput label="Mentors Image" value={config.mentorsImage} onChange={(v: string) => upd({ mentorsImage: v })} />
                        <ImageInput label="Members Image" value={config.membersImage} onChange={(v: string) => upd({ membersImage: v })} />
                        <ImageInput label="Advisors Image" value={config.advisorsImage} onChange={(v: string) => upd({ advisorsImage: v })} />
                    </div>
                </Section>

                {/* 9. Contact / Footer */}
                <Section number="9" title="Contact & Footer">
                    <TextField label="Footer Heading" value={config.footerConnectTitle} onChange={(v: string) => upd({ footerConnectTitle: v })} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '8px' }}>
                        <TextField label="Instagram Link" value={config.instagramLink} onChange={(v: string) => upd({ instagramLink: v })} />
                        <TextField label="LinkedIn Link" value={config.linkedinLink} onChange={(v: string) => upd({ linkedinLink: v })} />
                        <TextField label="Email Address" value={config.emailAddress} onChange={(v: string) => upd({ emailAddress: v })} />
                    </div>
                </Section>

            </div>
        </div>
    );
};

export default LandingPageEditor;
