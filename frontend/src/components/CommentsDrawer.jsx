import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User } from 'lucide-react';
import { getComments, postComment, updateComment, deleteComment } from '../api';
import { useAuth } from '../context/AuthContext';
import CommentItem from './CommentItem';

const CommentsDrawer = ({ videoId = null, postId = null, onClose }) => {
    const { user, token } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyComment, setReplyComment] = useState('');
    const commentsBottomRef = useRef(null);

    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            try {
                const data = await getComments(videoId, postId);
                setComments(data);
            } catch (err) {
                console.error("Failed comments", err);
            } finally {
                setLoading(false);
            }
        };
        if (videoId || postId) fetchComments();
    }, [videoId, postId]);

    useEffect(() => {
        // Auto-scroll to bottom on load/new comment
        if (commentsBottomRef.current && !replyingTo) {
            commentsBottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [comments, replyingTo]);

    const handlePost = async (e, parentId = null) => {
        if (e) e.preventDefault();
        const content = parentId ? replyComment : newComment;
        if (!content.trim() || !user) return;

        try {
            const addedComment = await postComment({
                videoId,
                postId,
                content,
                parent_id: parentId
            }, token);

            if (parentId) {
                const updateReplies = (list) => list.map(c => {
                    if (c.id === parentId) {
                        return { ...c, replies: [...(c.replies || []), addedComment] };
                    }
                    if (c.replies) return { ...c, replies: updateReplies(c.replies) };
                    return c;
                });
                setComments(updateReplies(comments));
                setReplyingTo(null);
                setReplyComment('');
            } else {
                setComments(prev => [...prev, addedComment]);
                setNewComment('');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="comments-drawer-overlay" onClick={onClose}>
            <div className="comments-drawer" onClick={e => e.stopPropagation()}>
                <div className="comments-header">
                    <h3>{comments.length} Comments</h3>
                    <button className="icon-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="comments-list">
                    {loading ? (
                        <div className="loader-spinner" />
                    ) : comments.length === 0 ? (
                        <div className="empty-state">
                            <p>No comments yet. Say something nice!</p>
                        </div>
                    ) : (
                        comments.map(c => (
                            <CommentItem
                                key={c.id}
                                comment={c}
                                onReply={(id) => setReplyingTo(id)}
                                replyingTo={replyingTo}
                                replyComment={replyComment}
                                setReplyComment={setReplyComment}
                                onSubmitReply={(pid) => handlePost(null, pid)}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                    <div ref={commentsBottomRef} />
                </div>

                <div className="comment-input-area">
                    {user ? (
                        <form onSubmit={handlePost} className="input-wrapper">
                            <input
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                            />
                            <button type="submit" disabled={!newComment.trim()} className="send-btn">
                                <Send size={18} />
                            </button>
                        </form>
                    ) : (
                        <p className="login-prompt">Log in to comment</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentsDrawer;
