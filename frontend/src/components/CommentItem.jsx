import React from 'react';
import { Send } from 'lucide-react';

const CommentItem = ({
    comment,
    onReply,
    replyingTo,
    replyComment,
    setReplyComment,
    onSubmitReply,
    level = 0
}) => {
    const [showAllReplies, setShowAllReplies] = React.useState(false);
    const isReplying = replyingTo === comment.id;

    // Smart visibility logic:
    // "High interaction" = has its own replies.
    // Display high interaction ones always, others only if showAllReplies is true.
    const allReplies = comment.replies || [];
    const highInteractionReplies = allReplies.filter(r => r.replies && r.replies.length > 0);
    const lowInteractionReplies = allReplies.filter(r => !r.replies || r.replies.length === 0);

    const displayedReplies = showAllReplies ? allReplies : highInteractionReplies;
    const hiddenCount = lowInteractionReplies.length;

    return (
        <div className="comment-thread" style={{ marginLeft: level > 0 ? '1.5rem' : '0', marginTop: '1rem' }}>
            <div className="comment-item" style={{ display: 'flex', gap: '1rem' }}>
                <div className="avatar-placeholder" style={{
                    width: level === 0 ? '36px' : '28px',
                    height: level === 0 ? '36px' : '28px',
                    borderRadius: '50%',
                    background: '#444',
                    flexShrink: 0,
                    overflow: 'hidden'
                }}>
                    {comment.owner?.profile_pic ? (
                        <img src={comment.owner.profile_pic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: level === 0 ? '0.9rem' : '0.7rem' }}>
                            {comment.owner?.username?.[0].toUpperCase() || '?'}
                        </div>
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 600, fontSize: level === 0 ? '0.9rem' : '0.85rem' }}>
                            @{comment.owner?.username || 'User'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'Just now'}
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.4', marginBottom: '0.5rem' }}>
                        {comment.content}
                    </p>

                    <button
                        onClick={() => onReply(isReplying ? null : comment.id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-primary)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: '4px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        {isReplying ? 'Cancel' : 'Reply'}
                    </button>

                    {isReplying && (
                        <form onSubmit={(e) => { e.preventDefault(); onSubmitReply(comment.id); }} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', marginBottom: '1rem' }}>
                            <input
                                type="text"
                                value={replyComment}
                                onChange={(e) => setReplyComment(e.target.value)}
                                placeholder={`Reply to @${comment.owner?.username}...`}
                                className="glass"
                                autoFocus
                                style={{
                                    flex: 1,
                                    padding: '0.6rem 0.8rem',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    border: '1px solid var(--border-glass)',
                                    outline: 'none',
                                    background: 'rgba(255,255,255,0.05)'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!replyComment.trim()}
                                style={{
                                    background: 'var(--accent-primary)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    opacity: replyComment.trim() ? 1 : 0.5
                                }}
                            >
                                <Send size={16} color="white" />
                            </button>
                        </form>
                    )}

                    {/* Recursive Replies */}
                    {allReplies.length > 0 && (
                        <div className="replies-list" style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', marginLeft: '4px' }}>
                            {displayedReplies.map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    onReply={onReply}
                                    replyingTo={replyingTo}
                                    replyComment={replyComment}
                                    setReplyComment={setReplyComment}
                                    onSubmitReply={onSubmitReply}
                                    level={level + 1}
                                />
                            ))}

                            {/* Toggles */}
                            {!showAllReplies && hiddenCount > 0 && (
                                <button
                                    onClick={() => setShowAllReplies(true)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'rgba(255,255,255,0.4)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        padding: '8px 0',
                                        marginLeft: '1.5rem',
                                        display: 'block'
                                    }}
                                >
                                    Show {hiddenCount} more {hiddenCount === 1 ? 'reply' : 'replies'}...
                                </button>
                            )}

                            {showAllReplies && lowInteractionReplies.length > 0 && (
                                <button
                                    onClick={() => setShowAllReplies(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'rgba(255,255,255,0.4)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        padding: '8px 0',
                                        marginLeft: '1.5rem',
                                        display: 'block'
                                    }}
                                >
                                    Hide replies
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentItem;
