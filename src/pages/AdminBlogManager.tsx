import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import {
    Plus, Edit, Trash2, Search, ArrowLeft, Save,
    FileText, AlertCircle, Loader2, Check, X,
    Type, Sparkles, Eye, ShieldAlert
} from 'lucide-react'
import { getAdminRole } from '../utils/adminAuth'
import { KARTIKA_BLOG_POSTS, type KartikaBlogPost } from '../data/kartika-blog'
import type { LanguageCode } from '../utils/languageManager'
import { BlogContentEditor } from '../components/BlogContentEditor'
import './Admin.css'

const AdminBlogManager: React.FC = () => {
    const [view, setView] = useState<'list' | 'editor'>('list')
    const [posts, setPosts] = useState<KartikaBlogPost[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Editor state
    const [editingPost, setEditingPost] = useState<KartikaBlogPost | null>(null)

    // AI Generator state
    const [showAIModal, setShowAIModal] = useState(false)
    const [aiPrompt, setAiPrompt] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile')

    const [selectedLanguage, setSelectedLanguage] = useState('id')

    // Pagination state
    const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10)
    const [currentPage, setCurrentPage] = useState(1)

    const navigate = useNavigate()
    const role = getAdminRole()
    const canAccessBlog = role === 'Super Admin' || role === 'Content Writer'

    useEffect(() => {
        // 0. Purge any legacy Mangala data from localStorage
        localStorage.removeItem('mangala_blog_drafts')
        const existingKartika = localStorage.getItem('kartika_blog_drafts')
        if (existingKartika) {
            try {
                const parsed = JSON.parse(existingKartika) as KartikaBlogPost[]
                // Detect Mangala contamination: >10 articles or Mangala author
                const isMangalaData = parsed.length > 10 ||
                    (parsed[0] && (parsed[0].author === 'Helmi Ramdan' || parsed[0].slug?.includes('furnitur') || parsed[0].slug?.includes('bekasi')))
                if (isMangalaData) {
                    localStorage.removeItem('kartika_blog_drafts')
                }
            } catch {
                localStorage.removeItem('kartika_blog_drafts')
            }
        }

        // 1. Load from KARTIKA_BLOG_POSTS (base — clean Kartika data)
        const basePosts: KartikaBlogPost[] = KARTIKA_BLOG_POSTS.map(p => ({ ...p, status: 'synced' as const }))

        // 2. Load from localStorage (Kartika drafts only)
        const savedPosts = localStorage.getItem('kartika_blog_drafts')
        if (savedPosts) {
            try {
                const parsedDrafts = JSON.parse(savedPosts) as KartikaBlogPost[]
                const mergedPosts = [...basePosts]
                parsedDrafts.forEach(draft => {
                    const index = mergedPosts.findIndex(p => p.id === draft.id)
                    if (index !== -1) {
                        mergedPosts[index] = draft
                    } else {
                        mergedPosts.push(draft)
                    }
                })
                setPosts(mergedPosts)
            } catch (e) {
                console.error('Error loading drafts:', e)
                setPosts(basePosts)
            }
        } else {
            setPosts(basePosts)
        }
        setIsLoading(false)
    }, [])

    // Save to localStorage whenever posts change
    useEffect(() => {
        if (!isLoading) {
            const drafts = posts.filter(p => p.status === 'draft')
            localStorage.setItem('kartika_blog_drafts', JSON.stringify(drafts))
        }
    }, [posts, isLoading])

    const handleEdit = (post: KartikaBlogPost) => {
        setEditingPost({
            ...post,
            customContent: post.customContent || {
                introduction: '',
                keyPoints: [],
                language: 'id',
                sections: [],
                conclusion: ''
            }
        })
        setView('editor')
    }

    const handleNew = () => {
        const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1
        // Include full date and time
        const now = new Date()
        const dateString = now.toISOString().replace('T', ' ').substring(0, 16)

        setEditingPost({
            id: newId,
            slug: '',
            title: '',
            category: 'Tips and Trick',
            excerpt: '',
            image: '',
            date: dateString,
            author: 'Tim Kartika.id',
            status: 'draft',
            customContent: {
                introduction: '',
                keyPoints: [],
                language: 'id',
                sections: [],
                conclusion: ''
            }
        })
        setView('editor')
    }

    const handleSavePost = () => {
        if (!editingPost || !editingPost.slug || !editingPost.title) {
            setMessage({ type: 'error', text: 'Slug and Title are required' })
            return
        }

        // New or edited posts get 'draft' status
        const postToSave = { ...editingPost, status: 'draft' as const }

        // Update posts list
        const exists = posts.find(p => p.id === postToSave.id)
        let updatedPosts: KartikaBlogPost[]
        if (exists) {
            updatedPosts = posts.map(p => p.id === postToSave.id ? postToSave : p)
        } else {
            updatedPosts = [...posts, postToSave]
        }

        setPosts(updatedPosts)
        setView('list')
        setMessage({ type: 'success', text: 'Post saved locally as draft. Click "Deploy Changes" to make it live.' })
    }

    const handleSyncToFiles = async () => {
        setIsSaving(true)
        setMessage(null)

        try {
            setMessage({ type: 'success', text: 'Deploying changes to GitHub...' })

            const deployResponse = await fetch('/.netlify/functions/admin-deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    posts: posts,
                    commitMessage: `Update blog posts via admin (${new Date().toISOString().split('T')[0]})`
                })
            })

            const deployResult = await deployResponse.json()

            if (deployResponse.ok && deployResult.deployed) {
                // Mark all as synced and clear local drafts
                const syncedPosts = posts.map(p => ({ ...p, status: 'synced' as const }))
                setPosts(syncedPosts)
                localStorage.removeItem('kartika_blog_drafts')

                setMessage({
                    type: 'success',
                    text: '✅ Changes deployed! Vercel is rebuilding your site (1-2 minutes). Refresh to see updates.'
                })
            } else if (deployResponse.ok && !deployResult.deployed) {
                setMessage({
                    type: 'success',
                    text: 'No changes detected to deploy.'
                })
            } else {
                throw new Error(deployResult.error || deployResult.details || 'Auto-deploy failed')
            }
        } catch (error) {
            console.error('Deploy error:', error)
            setMessage({ type: 'error', text: `Auto-deploy failed: ${error instanceof Error ? error.message : 'Unknown error'}` })
        } finally {
            setIsSaving(false)
        }
    }

    const handleGenerateWithAI = async () => {
        if (!aiPrompt.trim()) {
            setMessage({ type: 'error', text: 'Please enter a prompt for AI generation' })
            return
        }

        setIsGenerating(true)
        setMessage(null)

        try {
            let article;
            try {
                const response = await fetch('/.netlify/functions/admin-generate-article', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: aiPrompt,
                        category: editingPost?.category,
                        model: selectedModel,
                        language: selectedLanguage
                    })
                });

                const text = await response.text();
                // If it returns HTML (SPA fallback), throw to trigger the mock
                if (text.startsWith('<')) throw new Error('API not available, using mock fallback');
                
                const result = JSON.parse(text);
                if (!response.ok || !result.success) throw new Error(result.error || 'AI generation failed');
                article = result.article;
            } catch (err) {
                // Mock AI Response for local development without backend
                console.warn('Using local mock for AI generation', err);
                await new Promise(r => setTimeout(r, 1500)); // Simulate delay
                article = {
                    title: aiPrompt,
                    slug: aiPrompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `artikel-${Date.now()}`,
                    excerpt: 'Menavigasi karir di bidang teknik bagi perempuan menghadirkan tantangan unik sekaligus peluang luar biasa. Artikel ini membahas strategi dan pengalaman inspiratif yang bisa menjadi referensi.',
                    category: editingPost?.category || 'Program',
                    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop',
                    language: selectedLanguage,
                    introduction: `<p>Dunia keteknikan sering kali dianggap sebagai ranah yang didominasi oleh laki-laki. Namun, perlahan tapi pasti, batasan ini mulai ditembus oleh para perempuan tangguh yang membuktikan bahwa kompetensi tidak mengenal gender.</p>
<p>Topik tentang <strong>${aiPrompt}</strong> menjadi semakin relevan saat kita berbicara tentang pembangunan inklusif. Di berbagai industri, mulai dari pertambangan, sipil, hingga teknologi informasi, kehadiran insinyur perempuan membawa perspektif baru yang lebih komprehensif dalam pemecahan masalah.</p>`,
                    keyPoints: [
                        'Pentingnya membangun jejaring (networking) dengan sesama insinyur perempuan.',
                        'Mengatasi imposter syndrome di lingkungan kerja yang didominasi laki-laki.',
                        'Peran mentorship dalam akselerasi karir profesional.'
                    ],
                    sections: [
                        { 
                            heading: 'Membangun Kepercayaan Diri di Lapangan', 
                            content: '<p>Salah satu tantangan terbesar bagi perempuan di bidang teknik adalah membangun kepercayaan diri, terutama saat harus mengambil keputusan di lapangan kerja. Berdasarkan pengalaman dari berbagai mentor di Kartika.id, kunci utamanya adalah persiapan teknis yang matang dan kemampuan komunikasi yang asertif.</p><p>Ketika seorang perempuan mampu menyampaikan ide teknisnya dengan jelas dan berlandaskan data, respek dari rekan kerja—baik laki-laki maupun perempuan—akan tumbuh dengan sendirinya.</p>'
                        },
                        { 
                            heading: 'Mencari Mentor yang Tepat', 
                            content: '<p>Tidak ada yang lebih berharga dibandingkan belajar dari mereka yang sudah lebih dulu melewati jalan yang sama. Program seperti Kartiship memberikan wadah bagi mahasiswi teknik untuk terhubung dengan profesional wanita. Mereka tidak hanya memberikan bimbingan teknis, tetapi juga insight tentang <em>work-life balance</em> dan negosiasi gaji.</p>'
                        }
                    ],
                    conclusion: '<p>Perjalanan karir di bidang teknik bagi perempuan memang memiliki tantangannya tersendiri. Namun, dengan dukungan komunitas, mentorship yang tepat, serta kepercayaan diri yang kuat, setiap hambatan dapat diubah menjadi pijakan untuk mencapai kesuksesan yang lebih tinggi.</p>'
                };
            }

            // Auto-fill form with AI-generated content
            setEditingPost(p => p ? {
                ...p,
                title: article.title || p.title,
                slug: article.slug || p.slug,
                excerpt: article.excerpt || p.excerpt,
                category: article.category || p.category,
                image: article.image || p.image,
                customContent: {
                    introduction: article.introduction || '',
                    keyPoints: article.keyPoints || [],
                    language: (article.language as LanguageCode) || selectedLanguage || 'id',
                    sections: article.sections || [],
                    conclusion: article.conclusion || ''
                }
            } : null)

            setShowAIModal(false)
            setAiPrompt('')
            setMessage({ type: 'success', text: '✨ Article generated successfully! Review and edit as needed.' })

        } catch (error) {
            console.error('AI generation error:', error)
            setMessage({ type: 'error', text: `AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}` })
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSuggestImage = async () => {
        if (!editingPost?.title) {
            setMessage({ type: 'error', text: 'Please enter a title first so AI can suggest a relevant image' })
            return
        }

        setIsGenerating(true)
        setMessage(null)

        try {
            let result;
            try {
                const response = await fetch('/.netlify/functions/admin-suggest-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: editingPost.title,
                        excerpt: editingPost.excerpt,
                        model: selectedModel
                    })
                });
                const text = await response.text();
                if (text.startsWith('<')) throw new Error('API not available, using mock fallback');
                result = JSON.parse(text);
                if (!response.ok || !result.success) throw new Error(result.error || 'Failed to suggest image');
            } catch (err) {
                console.warn('Using local mock for image suggestion', err);
                await new Promise(r => setTimeout(r, 1000));
                result = { image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&auto=format&fit=crop', searchQuery: 'technology women' };
            }

            if (result.image) {
                setEditingPost(p => p ? { ...p, image: result.image } : null)
                setMessage({ type: 'success', text: `✨ Found a perfect image for: "${result.searchQuery}"` })
            } else {
                setMessage({ type: 'error', text: 'No matching image found on Unsplash' })
            }
        } catch (error) {
            console.error('Suggest image error:', error)
            setMessage({ type: 'error', text: `Failed to suggest image: ${error instanceof Error ? error.message : 'Unknown error'}` })
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSuggestSectionImage = async (index: number) => {
        if (!editingPost || !editingPost.customContent?.sections?.[index]) return

        const section = editingPost.customContent.sections[index]
        if (!section.heading) {
            setMessage({ type: 'error', text: 'Please enter a section heading first' })
            return
        }

        setIsGenerating(true)
        setMessage(null)

        try {
            let result;
            try {
                const response = await fetch('/.netlify/functions/admin-suggest-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: section.heading,
                        excerpt: section.content,
                        model: selectedModel
                    })
                });
                const text = await response.text();
                if (text.startsWith('<')) throw new Error('API not available, using mock fallback');
                result = JSON.parse(text);
                if (!response.ok || !result.success) throw new Error(result.error || 'Failed to suggest image');
            } catch (err) {
                console.warn('Using local mock for section image suggestion', err);
                await new Promise(r => setTimeout(r, 1000));
                result = { image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop', searchQuery: 'team collaboration' };
            }

            if (result.image) {
                const updatedSections = [...(editingPost.customContent?.sections || [])]
                updatedSections[index] = {
                    ...updatedSections[index],
                    image: result.image,
                    imageAlt: result.searchQuery || section.heading
                }

                setEditingPost(p => p ? {
                    ...p,
                    customContent: {
                        ...p.customContent!,
                        sections: updatedSections
                    }
                } : null)

                setMessage({ type: 'success', text: `✨ Found section image for: "${result.searchQuery}"` })
            } else {
                setMessage({ type: 'error', text: 'No matching image found on Unsplash' })
            }
        } catch (error) {
            console.error('Suggest section image error:', error)
            setMessage({ type: 'error', text: `Failed to suggest image: ${error instanceof Error ? error.message : 'Unknown error'}` })
        } finally {
            setIsGenerating(false)
        }
    }

    const deletePost = (id: number) => {
        if (window.confirm('Delete this post? (Permanent after Sync)')) {
            setPosts(posts.filter(p => p.id !== id))
        }
    }

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Pagination Logic
    const sortedPosts = [...filteredPosts].reverse()
    const totalItems = sortedPosts.length
    const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / itemsPerPage)

    // Reset to page 1 if search changes or items per page changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, itemsPerPage])

    if (!canAccessBlog) {
        return (
            <div className="admin-dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
                <Helmet><title>Access Denied | Kartika.id</title></Helmet>
                <ShieldAlert size={64} color="#d93025" style={{ marginBottom: '20px' }} />
                <h2 style={{ fontFamily: '"Gelasio", serif', color: '#333' }}>Access Denied</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>You need Content Writer or Super Admin privileges to access the Blog Manager.</p>
                <button className="nav-btn" onClick={() => navigate('/admin/dashboard')}>Return to Dashboard</button>
            </div>
        )
    }

    const indexOfLastItem = currentPage * (itemsPerPage === 'all' ? totalItems : itemsPerPage)
    const indexOfFirstItem = indexOfLastItem - (itemsPerPage === 'all' ? totalItems : itemsPerPage)
    const currentItems = sortedPosts.slice(indexOfFirstItem, indexOfLastItem)

    if (isLoading) {
        return (
            <div className="admin-loading-screen-wrap">
                <div className="loader"></div>
                <p>Syncing Cloud Data...</p>
                <style>{`
                    .admin-loading-screen-wrap {
                        height: 100vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: #f8f9fa;
                        color: #8B7355;
                    }
                    .loader {
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #8B7355;
                        
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                        margin-bottom: 20px;
                    }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        )
    }

    return (
        <div className="admin-dashboard admin-blog-manager">
            <Helmet>
                <title>{view === 'list' ? 'Blog Manager' : 'Edit Post'} | Kartika Admin</title>
            </Helmet>

            <header className="admin-header">
                <div className="admin-header-title">
                    <button onClick={() => view === 'list' ? navigate('/admin/dashboard') : setView('list')} className="back-link">
                        <ArrowLeft size={18} />
                    </button>
                    <h1>{view === 'list' ? 'BLOG MANAGER' : 'EDIT ARTICLE'}</h1>
                </div>

                <div className="admin-user-nav">
                    {view === 'list' ? (
                        <>
                            <button className="save-btn" style={{ background: '#D04A02' }} onClick={handleNew}>
                                <Plus size={16} />
                                <span>New Article</span>
                            </button>
                            <button onClick={handleSyncToFiles} className="save-btn" disabled={isSaving}>
                                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                <span>{isSaving ? 'Deploying...' : 'Deploy Changes'}</span>
                            </button>
                        </>
                    ) : (
                        <>
                            {editingPost?.slug && (
                                <a
                                    href={editingPost.status === 'draft' ? `/sandbox/blog/${editingPost.slug}` : `/blog/${editingPost.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="save-btn"
                                    style={{ background: '#4a5568', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    title={editingPost.status === 'draft' ? 'Preview in Sandbox' : 'View Live'}
                                >
                                    <Eye size={16} />
                                    <span>{editingPost.status === 'draft' ? 'Sandbox Preview' : 'View Live'}</span>
                                </a>
                            )}
                            <button onClick={handleSavePost} className="save-btn">
                                <Check size={16} />
                                <span>Done Editing</span>
                            </button>
                        </>
                    )}
                </div>
            </header>

            <main className="admin-main">
                {message && (
                    <div className={`admin-msg ${message.type}`}>
                        {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                        <span>{message.text}</span>
                        <X size={14} className="close-msg" onClick={() => setMessage(null)} />
                    </div>
                )}



                {view === 'list' ? (
                    <>
                        <div className="manager-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#fff', padding: '15px 20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div className="search-box" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f5f5f5', padding: '8px 15px', borderRadius: '20px', flex: 1 }}>
                                <Search size={18} color="#888" />
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }}
                                />
                            </div>
                        </div>

                        <div className="posts-table-card card">
                            <table className="posts-table">
                                <thead>
                                    <tr>
                                        <th>Title & Thumbnail</th>
                                        <th>Category</th>
                                        <th>Lang</th>
                                        <th>Status</th>
                                        <th>Date & Time</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map(post => (
                                        <tr key={post.id}>
                                            <td>
                                                <div className="post-title-cell">
                                                    <div className="post-thumb">
                                                        {post.image ? (
                                                            <img src={post.image} alt="" />
                                                        ) : (
                                                            <div className="thumb-placeholder"><FileText size={14} /></div>
                                                        )}
                                                    </div>
                                                    <div className="post-title-info">
                                                        <span className="post-title-text">{post.title}</span>
                                                        <span className="post-slug-text">{post.slug}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="cat-badge">{post.category}</span></td>
                                            <td>
                                                <span className={`lang-badge ${post.customContent?.language || 'id'}`}>
                                                    {post.customContent?.language?.toUpperCase() || 'ID'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${post.status || 'synced'}`}>
                                                    {post.status === 'draft' ? 'Draft' : 'Live'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="post-date-cell">
                                                    {post.date}
                                                </div>
                                            </td>
                                            <td className="actions-cell">
                                                {post.status === 'draft' ? (
                                                    <a
                                                        href={`/sandbox/blog/${post.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="action-btn preview"
                                                        title="Preview in Sandbox"
                                                        style={{ background: '#4a5568' }}
                                                    >
                                                        <Eye size={16} />
                                                    </a>
                                                ) : (
                                                    <a
                                                        href={`/blog/${post.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="action-btn preview"
                                                        title="View Live Site"
                                                    >
                                                        <Eye size={16} />
                                                    </a>
                                                )}
                                                <button className="action-btn edit" onClick={() => handleEdit(post)} title="Edit Content">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="action-btn delete" onClick={() => deletePost(post.id)} title="Delete Post">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination Controls */}
                            <div className="pagination-wrapper">
                                <div className="pagination-info">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
                                </div>
                                <div className="pagination-controls">
                                    <div className="items-per-page">
                                        <span>Show:</span>
                                        {[10, 20, 50, 80, 'all'].map(size => (
                                            <button
                                                key={size}
                                                className={`size-btn ${itemsPerPage === size ? 'active' : ''}`}
                                                onClick={() => setItemsPerPage(size as any)}
                                            >
                                                {size === 'all' ? 'All' : size}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="page-btns">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => p - 1)}
                                            className="nav-btn"
                                        >
                                            Prev
                                        </button>
                                        <span className="page-num">Page {currentPage} of {totalPages}</span>
                                        <button
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(p => p + 1)}
                                            className="nav-btn"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="post-editor-container">
                        <div className="editor-header-actions">
                            <button
                                className="ai-generate-btn"
                                onClick={() => setShowAIModal(true)}
                                disabled={isGenerating}
                            >
                                <Sparkles size={18} />
                                <span>{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
                            </button>
                        </div>

                        <section className="editor-section card compact">
                            <h2 className="editor-h2"><Type size={16} /> Metadata Editor</h2>
                            <div className="editor-grid-compact">
                                <div className="input-group-compact span-2">
                                    <label>Article Title</label>
                                    <input
                                        type="text"
                                        value={editingPost?.title || ''}
                                        onChange={e => {
                                            const newTitle = e.target.value
                                            setEditingPost(p => p ? { 
                                                ...p, 
                                                title: newTitle,
                                                slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                                            } : null)
                                        }}
                                        placeholder="Headline of the article"
                                    />
                                </div>
                                <div className="input-group-compact">
                                    <label>URL Slug</label>
                                    <input
                                        type="text"
                                        value={editingPost?.slug || ''}
                                        readOnly
                                        disabled
                                        style={{ backgroundColor: '#f0f0f0', color: '#888', cursor: 'not-allowed' }}
                                        placeholder="Auto-generated from title"
                                        title="Slug is automatically generated from the title"
                                    />
                                </div>

                                <div className="input-group-compact">
                                    <label>Category</label>
                                    <select
                                        value={editingPost?.category || 'Program'}
                                        onChange={e => setEditingPost(p => p ? { ...p, category: e.target.value } : null)}
                                    >
                                        <option>Program</option>
                                        <option>Inspirasi</option>
                                        <option>Tips</option>
                                        <option>Komunitas</option>
                                        <option>Alumni Spotlight</option>
                                        <option>Beasiswa</option>
                                        <option>KartiShare</option>
                                        <option>KartiCare</option>
                                    </select>
                                </div>
                                <div className="input-group-compact">
                                    <label>Language</label>
                                    <select
                                        value={editingPost?.customContent?.language || 'id'}
                                        onChange={e => setEditingPost(p => p ? {
                                            ...p,
                                            customContent: {
                                                ...p.customContent,
                                                language: e.target.value as LanguageCode,
                                                introduction: p.customContent?.introduction || '',
                                                sections: p.customContent?.sections || [],
                                                conclusion: p.customContent?.conclusion || ''
                                            }
                                        } : null)}
                                    >
                                        <option value="id">Indonesian</option>
                                        <option value="en">English</option>
                                        <option value="ar">Arabic</option>
                                        <option value="zh">Chinese</option>
                                        <option value="ja">Japanese</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="ko">Korean</option>
                                    </select>
                                </div>
                                <div className="input-group-compact">
                                    <label>Publish Date</label>
                                    <input
                                        type="datetime-local"
                                        value={editingPost?.date?.includes(' ') ? editingPost.date.replace(' ', 'T') : editingPost?.date}
                                        onChange={e => setEditingPost(p => p ? { ...p, date: e.target.value.replace('T', ' ') } : null)}
                                    />
                                </div>

                                <div className="input-group-compact span-2">
                                    <label>Featured Image (URL or Upload)</label>
                                    <div className="input-with-action" style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            value={editingPost?.image || ''}
                                            onChange={e => setEditingPost(p => p ? { ...p, image: e.target.value } : null)}
                                            placeholder="Image URL or choose file..."
                                            style={{ flex: 1 }}
                                        />
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id="featured-image-upload"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    const reader = new FileReader()
                                                    reader.onload = (ev) => {
                                                        if (ev.target?.result) {
                                                            setEditingPost(p => p ? { ...p, image: ev.target!.result as string } : null)
                                                        }
                                                    }
                                                    reader.readAsDataURL(file)
                                                }
                                            }}
                                        />
                                        <label 
                                            htmlFor="featured-image-upload" 
                                            className="action-input-btn" 
                                            style={{ cursor: 'pointer', background: '#555', color: 'white', display: 'flex', alignItems: 'center', padding: '0 12px', borderRadius: '4px', fontSize: '0.9em' }}
                                        >
                                            📁 Upload
                                        </label>
                                        <button
                                            className="action-input-btn"
                                            onClick={handleSuggestImage}
                                            disabled={isGenerating}
                                            title="Suggest image from Unsplash based on Title"
                                        >
                                            <Sparkles size={14} />
                                            <span>AI Suggest</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="input-group-compact">
                                    <label>Author</label>
                                    <input
                                        type="text"
                                        value={editingPost?.author || ''}
                                        onChange={e => setEditingPost(p => p ? { ...p, author: e.target.value } : null)}
                                    />
                                </div>

                                <div className="input-group-compact span-3">
                                    <label>Meta Excerpt (SEO Description)</label>
                                    <textarea
                                        rows={2}
                                        value={editingPost?.excerpt || ''}
                                        onChange={e => setEditingPost(p => p ? { ...p, excerpt: e.target.value } : null)}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="editor-section">
                            <h2 className="section-title">
                                <FileText size={20} />
                                Blog Content Editor
                            </h2>

                            {editingPost && (
                                <BlogContentEditor
                                    introduction={editingPost.customContent?.introduction || ''}
                                    keyPoints={editingPost.customContent?.keyPoints || []}
                                    sections={editingPost.customContent?.sections || []}
                                    conclusion={editingPost.customContent?.conclusion || ''}
                                    onIntroductionChange={(value) =>
                                        setEditingPost(p => p ? {
                                            ...p,
                                            // Auto-generate excerpt if not already set manually
                                            excerpt: (!p.excerpt || p.excerpt === p.customContent?.introduction?.replace(/<[^>]*>/g, '').substring(0, 160) + ((p.customContent?.introduction?.length || 0) > 160 ? '...' : '')) 
                                                ? value.replace(/<[^>]*>/g, '').substring(0, 160) + (value.length > 160 ? '...' : '')
                                                : p.excerpt,
                                            customContent: {
                                                ...p.customContent,
                                                introduction: value,
                                                keyPoints: p.customContent?.keyPoints || [],
                                                sections: p.customContent?.sections || [],
                                                conclusion: p.customContent?.conclusion || ''
                                            }
                                        } : null)
                                    }
                                    onKeyPointsChange={(points) =>
                                        setEditingPost(p => p ? {
                                            ...p,
                                            customContent: {
                                                ...p.customContent,
                                                keyPoints: points,
                                                introduction: p.customContent?.introduction || '',
                                                sections: p.customContent?.sections || [],
                                                conclusion: p.customContent?.conclusion || ''
                                            }
                                        } : null)
                                    }
                                    onSectionsChange={(sections) =>
                                        setEditingPost(p => p ? {
                                            ...p,
                                            customContent: {
                                                ...p.customContent,
                                                sections: sections,
                                                introduction: p.customContent?.introduction || '',
                                                conclusion: p.customContent?.conclusion || ''
                                            }
                                        } : null)
                                    }
                                    onConclusionChange={(value) =>
                                        setEditingPost(p => p ? {
                                            ...p,
                                            customContent: {
                                                ...p.customContent,
                                                conclusion: value,
                                                introduction: p.customContent?.introduction || '',
                                                sections: p.customContent?.sections || []
                                            }
                                        } : null)
                                    }
                                    onSuggestSectionImage={handleSuggestSectionImage}
                                    isGenerating={isGenerating}
                                />
                            )}
                        </section>
                    </div>
                )}
            </main>

            {/* AI Generator Modal */}
            {showAIModal && (
                <div className="ai-modal-overlay" onClick={() => setShowAIModal(false)}>
                    <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="ai-modal-header">
                            <h2>
                                <Sparkles size={24} />
                                Generate Article with AI
                            </h2>
                            <button className="ai-modal-close" onClick={() => setShowAIModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="ai-modal-body">
                            <div className="input-group">
                                <label>Target Language</label>
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    disabled={isGenerating}
                                    className="ai-model-select"
                                    style={{ marginBottom: '15px' }}
                                >
                                    <option value="id">Indonesian (Bahasa Indonesia)</option>
                                    <option value="en">English (Global)</option>
                                    <option value="ar">Arabic (العربية)</option>
                                    <option value="zh">Chinese (中文)</option>
                                    <option value="ja">Japanese (日本語)</option>
                                    <option value="es">Spanish (Español)</option>
                                    <option value="fr">French (Français)</option>
                                    <option value="ko">Korean (한국어)</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label>Select AI Model</label>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    disabled={isGenerating}
                                    className="ai-model-select"
                                >
                                    <optgroup label="Groq (Fast)">
                                        <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Default - Fast & Balanced)</option>
                                        <option value="mixtral-8x7b-32768">Mixtral 8x7B (Creative)</option>
                                    </optgroup>
                                    <optgroup label="OpenRouter (Free Models)">
                                        <option value="tngtech/deepseek-r1t2-chimera:free">DeepSeek R1T2 Chimera (Reasoning)</option>
                                        <option value="arcee-ai/trinity-large-preview:free">Trinity Large (Creative Writing)</option>
                                        <option value="z-ai/glm-4.5-air:free">GLM 4.5 Air (Agent Tasks)</option>
                                        <option value="qwen/qwen3-coder:free">Qwen3 Coder 480B (Code Generation)</option>
                                        <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B (Balanced)</option>
                                        <option value="google/gemma-3-27b:free">Gemma 3 27B (Multilingual)</option>
                                        <option value="upstage/solar-pro-3:free">Solar Pro 3 (Korean/English)</option>
                                    </optgroup>
                                </select>
                            </div>

                            <label>What would you like to write about?</label>
                            <textarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="Example: Panduan memilih furniture cafe industrial yang tahan lama dan hemat budget untuk cafe kecil di Jakarta"
                                rows={5}
                                disabled={isGenerating}
                            />
                            <p className="ai-modal-hint">
                                💡 Tip: You can write the prompt in any language! The AI will automatically translate and generate the full article in the <strong>Target Language</strong> selected above.
                            </p>
                        </div>

                        <div className="ai-modal-footer">
                            <button
                                className="ai-modal-cancel"
                                onClick={() => setShowAIModal(false)}
                                disabled={isGenerating}
                            >
                                Cancel
                            </button>
                            <button
                                className="ai-modal-generate"
                                onClick={handleGenerateWithAI}
                                disabled={isGenerating || !aiPrompt.trim()}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Generate Article
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .close-msg { cursor: pointer; margin-left: auto; opacity: 0.5; }
                .post-editor-container { animation: fadeIn 0.3s ease; }
                .editor-h2 { 
                    display: flex; 
                    align-items: center; 
                    gap: 10px; 
                    margin-bottom: 20px; 
                    color: #2c3e50; 
                    font-size: 1.1rem;
                    border-bottom: 2px solid #8B7355;
                    padding-bottom: 10px;
                }
                .editor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .input-group { display: flex; flex-direction: column; gap: 8px; }
                .input-group.full { grid-column: span 2; }
                .input-group label { font-size: 0.85rem; font-weight: 700; color: #444; text-transform: uppercase; letter-spacing: 0.5px; }
                .input-group input, .input-group select, .input-group textarea {
                    padding: 12px;
                    border: 1px solid #ddd;
                    
                    font-size: 1rem;
                    outline-color: #8B7355;
                    background: #fff;
                    transition: border 0.2s;
                }
                .input-group input:focus { border-color: #8B7355; }
                
                .editor-notice {
                    margin-top: 30px;
                    background: rgba(139, 115, 85, 0.05);
                    border: 1px solid rgba(139, 115, 85, 0.2);
                    padding: 20px;
                    
                    display: flex;
                    align-items: flex-start;
                    gap: 15px;
                    color: #5d4d3a;
                }
                .editor-notice strong { display: block; margin-bottom: 5px; font-size: 1rem; }
                .editor-notice p { margin: 0; font-size: 0.9rem; line-height: 1.5; opacity: 0.9; }

                .dev-mode-notice {
                    margin-bottom: 25px;
                    background: rgba(41, 128, 185, 0.05);
                    border: 1px solid rgba(41, 128, 185, 0.2);
                    padding: 16px 20px;
                    
                    display: flex;
                    align-items: flex-start;
                    gap: 15px;
                    color: #2980b9;
                }
                .dev-mode-notice strong { display: block; margin-bottom: 5px; font-size: 0.95rem; }
                .dev-mode-notice p { margin: 0; font-size: 0.85rem; line-height: 1.5; opacity: 0.9; }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                .admin-blog-manager .manager-toolbar {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 25px;
                  gap: 20px;
                }
                .search-box {
                  flex: 1;
                  display: flex;
                  align-items: center;
                  background: #fff;
                  
                  padding: 12px 15px;
                  gap: 10px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                .search-box input { border: none; outline: none; width: 100%; font-size: 1rem; }
                .create-post-btn {
                  background: #2C3E50;
                  color: #fff;
                  border: none;
                  padding: 12px 24px;
                  
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  font-weight: 600;
                  transition: 0.2s;
                }
                .create-post-btn:hover { background: #34495e; transform: translateY(-1px); }
                
                .posts-table { width: 100%; border-collapse: collapse; text-align: left; }
                .posts-table th { padding: 18px 20px; font-size: 0.85rem; color: #888; text-transform: uppercase; border-bottom: 2px solid #f4f4f4; letter-spacing: 1px; }
                .posts-table td { padding: 18px 20px; border-bottom: 1px solid #f4f4f4; font-size: 0.95rem; }
                .post-title-cell { display: flex; align-items: center; gap: 12px; font-weight: 600; color: #2C3E50; }
                .post-title-cell span { max-width: 400px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .cat-badge { background: #f0ede9; color: #8B7355; padding: 5px 12px;  font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
                
                .actions-cell { display: flex; gap: 12px; }
                .action-btn { background: #f8f9fa; border: 1px solid #eee; cursor: pointer; padding: 8px;  transition: 0.2s; }
                .action-btn.edit { color: #2980b9; }
                .action-btn.edit:hover { background: #2980b9; color: #fff; }
                .action-btn.delete { color: #c0392b; }
                .action-btn.delete:hover { background: #c0392b; color: #fff; }
                
                .save-btn {
                  background: #8B7355;
                  color: #fff;
                  border: none;
                  padding: 10px 20px;
                  
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  font-weight: 600;
                  transition: all 0.2s;
                  box-shadow: 0 4px 12px rgba(139, 115, 85, 0.2);
                }
                .save-btn:hover:not(:disabled) { background: #7a654a; transform: translateY(-1px); box-shadow: 0 6px 15px rgba(139, 115, 85, 0.3); }
                .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                
                .admin-msg { padding: 16px 24px;  margin-bottom: 25px; display: flex; align-items: center; gap: 15px; font-weight: 500; }
                .admin-msg.success { background: #e6f4ea; color: #1e7e34; border-left: 5px solid #1e7e34; }
                .admin-msg.error { background: #fce8e8; color: #c53030; border-left: 5px solid #c53030; }
                
                /* Enhanced Table Styles */
                .post-thumb { width: 45px; height: 45px;  overflow: hidden; background: #eee; flex-shrink: 0; }
                .post-thumb img { width: 100%; height: 100%; object-fit: cover; }
                .thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #aaa; }
                .post-title-info { display: flex; flex-direction: column; gap: 2px; }
                .post-title-text { font-weight: 700; color: #2C3E50; line-height: 1.2; }
                .post-slug-text { font-size: 0.75rem; color: #888; font-weight: 400; font-family: monospace; }
                .post-date-cell { font-size: 0.85rem; color: #666; font-family: monospace; }
                
                .lang-badge { 
                    padding: 3px 8px; 
                     
                    font-size: 0.7rem; 
                    font-weight: 800; 
                    color: #fff;
                    text-shadow: 0 1px 1px rgba(0,0,0,0.1);
                }
                .lang-badge.id { background: #e74c3c; } /* Red */
                .lang-badge.en { background: #3498db; } /* Blue */
                .lang-badge.ar { background: #27ae60; } /* Green */
                .lang-badge.zh { background: #f1c40f; color: #333; } /* Yellow */
                .lang-badge.ja { background: #9b59b6; } /* Purple */
                .lang-badge.es { background: #e67e22; } /* Orange */
                .lang-badge.fr { background: #34495e; } /* Navy */
                .lang-badge.ko { background: #16a085; } /* Teal */
                
                .status-badge {
                    padding: 4px 10px;
                    
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: white;
                }
                .status-badge.draft { background: #e67e22; } /* Orange */
                .status-badge.synced { background: #27ae60; } /* Green */
                
                .action-btn.preview { color: #8B7355; margin-right: 8px; display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px;  border: 1.5px solid #eee; transition: 0.2s; }
                .action-btn.preview:hover { background: #fdfaf7; border-color: #8B7355; }

                /* Pagination Styles */
                .pagination-wrapper { 
                    padding: 20px; 
                    background: #fff; 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    border-top: 1px solid #f0f0f0;
                }
                .pagination-info { font-size: 0.85rem; color: #777; }
                .pagination-controls { display: flex; align-items: center; gap: 25px; }
                
                .items-per-page { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #555; }
                .size-btn { 
                    background: #f8f9fa; 
                    border: 1px solid #ddd; 
                    padding: 4px 10px; 
                     
                    cursor: pointer; 
                    font-size: 0.8rem;
                    transition: 0.2s;
                }
                .size-btn.active { background: #8B7355; color: #fff; border-color: #8B7355; }
                
                .page-btns { display: flex; align-items: center; gap: 15px; }
                .nav-btn {
                    padding: 6px 15px;
                    
                    border: 1px solid #ddd;
                    background: #fff;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: 0.2s;
                }
                .nav-btn:hover:not(:disabled) { border-color: #8B7355; color: #8B7355; }
                .nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .page-num { font-size: 0.9rem; font-weight: 600; color: #2C3E50; }

                .back-link { background: #fff; border: 1px solid #ddd; color: #444; cursor: pointer; padding: 8px;  margin-right: 15px; transition: 0.2s; }
                .back-link:hover { background: #f8f9fa; border-color: #8B7355; color: #8B7355; }

                /* Compact Editor Styles */
                .editor-grid-compact { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
                .input-group-compact { display: flex; flex-direction: column; gap: 5px; }
                .input-group-compact label { font-size: 0.75rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; }
                .input-group-compact input, .input-group-compact select, .input-group-compact textarea { 
                    padding: 8px 12px; border: 1.5px solid #eee;  font-size: 0.9rem; transition: 0.2s; background: #fff;
                }
                .input-group-compact input:focus, .input-group-compact select:focus, .input-group-compact textarea:focus { border-color: #8B7355; outline: none; box-shadow: 0 0 0 3px rgba(139, 115, 85, 0.1); }
                .span-2 { grid-column: span 2; }
                .span-3 { grid-column: span 3; }
                
                .input-with-action { display: flex; gap: 8px; }
                .input-with-action input { flex: 1; }
                .action-input-btn { 
                    display: flex; align-items: center; gap: 6px; padding: 0 15px; background: #8B7355; color: #fff; 
                    border: none;  cursor: pointer; font-size: 0.8rem; font-weight: 600; white-space: nowrap; transition: 0.2s;
                }
                .action-input-btn:hover:not(:disabled) { background: #6F5C44; transform: translateY(-1px); }
                .action-input-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                
                .editor-h2 { font-size: 1rem; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; color: #2C3E50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            `}</style>
        </div>
    )
}

export default AdminBlogManager

