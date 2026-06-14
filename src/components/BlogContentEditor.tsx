import { Plus, Trash2, Sparkles } from 'lucide-react';
interface ContentSection {
    heading: string;
    content: string;
    image?: string;
    imageAlt?: string;
    productId?: number;
}

interface BlogContentEditorProps {
    introduction: string;
    keyPoints?: string[];
    sections: ContentSection[];
    conclusion: string;
    onIntroductionChange: (value: string) => void;
    onKeyPointsChange: (points: string[]) => void;
    onSectionsChange: (sections: ContentSection[]) => void;
    onConclusionChange: (value: string) => void;
    onSuggestSectionImage?: (index: number) => void;
    isGenerating?: boolean;
}

export const BlogContentEditor: React.FC<BlogContentEditorProps> = ({
    introduction,
    keyPoints = [],
    sections,
    conclusion,
    onIntroductionChange,
    onKeyPointsChange,
    onSectionsChange,
    onConclusionChange,
    onSuggestSectionImage,
    isGenerating = false
}) => {
    const addSection = () => {
        onSectionsChange([...sections, { heading: '', content: '', image: '', imageAlt: '', productId: undefined }]);
    };

    const updateSection = (index: number, field: keyof ContentSection, value: any) => {
        const updated = [...sections];
        (updated[index] as any)[field] = value;
        onSectionsChange(updated);
    };

    const removeSection = (index: number) => {
        onSectionsChange(sections.filter((_, i) => i !== index));
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index > 0) {
            const updated = [...sections];
            [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
            onSectionsChange(updated);
        } else if (direction === 'down' && index < sections.length - 1) {
            const updated = [...sections];
            [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
            onSectionsChange(updated);
        }
    };

    return (
        <div className="content-editor">
            <div className="editor-section-block">
                <div className="editor-section">
                    <label>📝 Introduction</label>
                    <textarea
                        value={introduction}
                        onChange={(e) => onIntroductionChange(e.target.value)}
                        className="content-textarea"
                        rows={6}
                        placeholder="Write an engaging introduction..."
                    />
                </div>

                <div className="editor-section">
                    <div className="section-header">
                        <label>🔑 Key Takeaways (Optional)</label>
                        <button
                            className="add-section-btn small"
                            onClick={() => onKeyPointsChange([...keyPoints, ''])}
                        >
                            <Plus size={14} style={{ marginRight: '5px' }} />
                            Add Point
                        </button>
                    </div>
                    <div className="keypoints-list">
                        {keyPoints.map((point: string, index: number) => (
                            <div key={index} className="keypoint-item">
                                <div className="keypoint-number">{index + 1}</div>
                                <input
                                    type="text"
                                    value={point}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const newPoints = [...keyPoints];
                                        newPoints[index] = e.target.value;
                                        onKeyPointsChange(newPoints);
                                    }}
                                    className="keypoint-input"
                                    placeholder="Enter a key insight or takeaway..."
                                />
                                <button
                                    className="remove-btn"
                                    onClick={() => onKeyPointsChange(keyPoints.filter((_: string, i: number) => i !== index))}
                                    title="Remove Point"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        {keyPoints.length === 0 && (
                            <p className="empty-state-text">No key points added yet. Add points to highlight main takeaways.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="editor-section-block">
                <div className="section-header">
                    <h3 className="editor-section-title">📚 Content Sections</h3>
                    <button type="button" onClick={addSection} className="add-section-btn">
                        <Plus size={16} style={{ marginRight: '8px' }} />
                        Add Section
                    </button>
                </div>

                {sections.map((section: ContentSection, index: number) => (
                    <div key={index} className="dynamic-section">
                        <div className="section-controls">
                            <span className="section-number">Section {index + 1}</span>
                            <div className="section-actions">
                                <button
                                    type="button"
                                    onClick={() => moveSection(index, 'up')}
                                    disabled={index === 0}
                                    className="move-btn"
                                    title="Move Up"
                                >
                                    ↑
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveSection(index, 'down')}
                                    disabled={index === sections.length - 1}
                                    className="move-btn"
                                    title="Move Down"
                                >
                                    ↓
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeSection(index)}
                                    className="remove-btn"
                                    title="Remove Section"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <input
                            type="text"
                            value={section.heading}
                            onChange={(e) => {
                                const val = e.target.value
                                const updated = [...sections]
                                updated[index].heading = val
                                // Auto-fill alt text if empty or if it perfectly matches the previous heading
                                if (!updated[index].imageAlt || updated[index].imageAlt === section.heading) {
                                    updated[index].imageAlt = val
                                }
                                onSectionsChange(updated)
                            }}
                            placeholder="Section Heading"
                            className="section-heading-input"
                        />

                        <textarea
                            value={section.content}
                            onChange={(e) => updateSection(index, 'content', e.target.value)}
                            placeholder="Write section content..."
                            rows={6}
                            className="content-textarea"
                        />

                        <div className="section-featured-fields" style={{ display: 'grid', gridTemplateColumns: index === 0 ? '1fr 1fr' : '1fr', gap: '15px', marginTop: '10px' }}>
                            {/* Section 1 gets Image fields, Section 2 empty, Section 3+ get Product Mention */}
                            {index === 0 ? (
                                <>
                                    <div className="input-group-compact">
                                        <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px', display: 'block' }}>Section Image (Promo/Visual)</label>
                                        <div className="input-with-action" style={{ display: 'flex' }}>
                                            <input
                                                type="text"
                                                value={section.image || ''}
                                                onChange={(e) => updateSection(index, 'image', e.target.value)}
                                                placeholder="Image URL or upload..."
                                                style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px 0 0 4px', borderRight: 'none' }}
                                            />
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                id={`section-image-upload-${index}`}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        const reader = new FileReader()
                                                        reader.onload = (ev) => {
                                                            if (ev.target?.result) {
                                                                updateSection(index, 'image', ev.target!.result as string)
                                                            }
                                                        }
                                                        reader.readAsDataURL(file)
                                                    }
                                                }}
                                            />
                                            <label 
                                                htmlFor={`section-image-upload-${index}`}
                                                title="Upload Local Image"
                                                style={{
                                                    padding: '8px 12px',
                                                    background: '#555',
                                                    color: 'white',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    fontSize: '11px'
                                                }}
                                            >
                                                📁
                                            </label>
                                            <button
                                                type="button"
                                                className="action-input-btn"
                                                onClick={() => onSuggestSectionImage?.(index)}
                                                disabled={isGenerating || !section.heading}
                                                title="Suggest image from Unsplash"
                                                style={{
                                                    padding: '8px 12px',
                                                    background: '#8B7355',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '0 4px 4px 0',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}
                                            >
                                                <Sparkles size={12} />
                                                <span style={{ fontSize: '11px' }}>AI Suggest</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="input-group-compact">
                                        <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px', display: 'block' }}>Alt Text (SEO)</label>
                                        <input
                                            type="text"
                                            value={section.imageAlt || ''}
                                            onChange={(e) => updateSection(index, 'imageAlt', e.target.value)}
                                            placeholder="e.g. industrial cafe table design"
                                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        />
                                    </div>
                                </>
                            ) : null}
                        </div>

                        {/* Optional collapsible image fields for non-section-1 for advanced users */}
                        {index > 0 && (
                            <details style={{ marginTop: '10px' }}>
                                <summary style={{ fontSize: '11px', color: '#888', cursor: 'pointer' }}>Advanced: Override Section Image</summary>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '5px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                                    <div className="input-group-compact">
                                        <input
                                            type="text"
                                            value={section.image || ''}
                                            onChange={(e) => updateSection(index, 'image', e.target.value)}
                                            placeholder="Image URL"
                                            style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}
                                        />
                                    </div>
                                    <div className="input-group-compact">
                                        <input
                                            type="text"
                                            value={section.imageAlt || ''}
                                            onChange={(e) => updateSection(index, 'imageAlt', e.target.value)}
                                            placeholder="Alt Text"
                                            style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}
                                        />
                                    </div>
                                </div>
                            </details>
                        )}
                    </div>
                ))}

                {sections.length === 0 && (
                    <p className="empty-state">No sections yet. Click "+ Add Section" to create one.</p>
                )}
            </div>

            <div className="editor-section-block">
                <h3 className="editor-section-title">🎯 Conclusion</h3>
                <textarea
                    value={conclusion}
                    onChange={(e) => onConclusionChange(e.target.value)}
                    placeholder="Write a compelling conclusion..."
                    rows={4}
                    className="content-textarea"
                />
            </div>

            <div className="editor-info-box">
                <strong>ℹ️ Auto-Generated Components:</strong>
                <p>The following will be automatically added to your blog post:</p>
                <ul>
                    <li>Author Bio (at the end)</li>
                    <li>CTA Section (at the end)</li>
                    <li>Random Unsplash Images (if not specified)</li>
                </ul>
            </div>
        </div>
    );
};
