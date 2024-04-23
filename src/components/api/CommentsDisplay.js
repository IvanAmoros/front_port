import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./CommentsDisplay.css";
// import { useAuth } from '../../AuthContext';

const CommentsDisplay = () => {
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showJSON, setShowJSON] = useState(false);
    // const { user } = useAuth();

    const [newComment, setNewComment] = useState('');

    const apiUrl = process.env.REACT_APP_API_URL + '/base/comments/';

    const commentsDisplayRef = useRef(null);

    useEffect(() => {
        if (!isLoading) {
            const element = commentsDisplayRef.current;
            if (element) {
                element.scrollTop = element.scrollHeight;
            }
        }
    }, [isLoading]);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get(apiUrl);
                setComments(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchComments();
    }, [apiUrl]);

    const toggleView = () => setShowJSON(!showJSON);

    // const ensureHttpPrefix = (url) => {
    //     if (!url) return '';
    //     if (!url.startsWith('http://') && !url.startsWith('https://')) {
    //         return `https://${url}`;
    //     }
    //     return url;
    // };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        // Simple form validation
        if (newComment.length === 0 || newComment.length > 500) {
            alert("Comment must be between 1 and 500 characters.");
            return;
        }

        try {
            // POST request to your backend
            await axios.post(apiUrl, { text: newComment, /* any other necessary fields */ });
            setNewComment(''); // Reset comment field after submission
            // Optionally refresh comments list after submission
        } catch (error) {
            console.error("Failed to post comment:", error);
            // Handle error (e.g., show an error message)
        }
    };

    function convertToDate(input) {
        const parts = input.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
        if (!parts) return null; // or throw an error, based on your preference

        const isoString = `${parts[3]}-${parts[2]}-${parts[1]}T${parts[4]}:${parts[5]}`;

        return new Date(isoString);
    }

    function timeAgo(date) {

        const now = new Date();
        const commentDate = convertToDate(date); // Use the conversion function
        if (!commentDate) {
            console.error("Invalid date format:", date);
            return "Unknown time ago";
        }
        const diffInSeconds = Math.floor((now - commentDate) / 1000);

        const minute = 60;
        const hour = minute * 60;
        const day = hour * 24;
        const month = day * 30;
        const year = day * 365;

        if (diffInSeconds < minute) {
            return `${diffInSeconds} seconds ago`;
        } else if (diffInSeconds < hour) {
            return `${Math.floor(diffInSeconds / minute)} mins ago`;
        } else if (diffInSeconds < day) {
            return `${Math.floor(diffInSeconds / hour)} hours ago`;
        } else if (diffInSeconds < month) {
            return `${Math.floor(diffInSeconds / day)} days ago`;
        } else if (diffInSeconds < year) {
            return `${Math.floor(diffInSeconds / month)} months ago`;
        } else {
            return `${Math.floor(diffInSeconds / year)} years ago`;
        }
    }

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    if (showJSON) {
        return (
            <div className="comments-display">
                <h2>I was here</h2>
                <button onClick={toggleView}>Show Styled View</button>
                <h3>GET {apiUrl}</h3>
                <pre className="json-display">{JSON.stringify(comments, null, 2)}</pre>
            </div>
        );
    }

    const CommentItem = ({ comment }) => {
        const ensureHttpPrefix = (url) => {
            if (!url) return '';
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                return `https://${url}`;
            }
            return url;
        };

        return (
            <div>
                <div className="comment-item">
                    <div className="comment-header">
                    <h3 className="name">{comment.user_full_name}</h3>

                        <div className="comment-links">
                            {comment.web_url && <a href={ensureHttpPrefix(comment.web_url)} target="_blank" rel="noopener noreferrer">Website</a>}
                            {comment.linkedin_url && <a href={ensureHttpPrefix(comment.linkedin_url)} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
                            {comment.github_url && <a href={ensureHttpPrefix(comment.github_url)} target="_blank" rel="noopener noreferrer">GitHub</a>}
                        </div>
                    </div>
                    <div className="comment-body">
                        <p>{comment.text}</p>
                        <span className="comment-time">{timeAgo(comment.created)}</span>
                    </div>
                </div>
                {comment.responses && comment.responses.length > 0 && (
                    <div className="responses">
                        {comment.responses.map((response) => (
                            <CommentItem key={response.id} comment={response} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="comments-display">
            <h2>I was here</h2>
            <button onClick={toggleView}>Show Backend Response</button>
            <div className="comments-list" ref={commentsDisplayRef}>
                {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                ))}
            </div>
            <form onSubmit={handleSubmit} className="comment-form">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    maxLength="500"
                    placeholder="Write your comment here..."
                    required
                ></textarea>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default CommentsDisplay;
