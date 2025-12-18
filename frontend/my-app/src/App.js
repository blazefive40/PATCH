import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [users, setUsers] = useState([]);
  const [queryId, setQueryId] = useState('');
  const [queriedUser, setQueriedUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    loadComments();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error loading users:', err.message);
      setError('Failed to load users');
    }
  };

  const loadComments = async () => {
    try {
      const response = await axios.get(`${API_URL}/comments`);
      setComments(response.data.comments || []);
    } catch (err) {
      console.error('Error loading comments:', err.message);
    }
  };

  const handlePopulate = async () => {
    setError('');
    setLoading(true);
    try {
      await axios.get(`${API_URL}/populate`);
      await loadUsers();
      setError('');
    } catch (err) {
      console.error('Error populating users:', err);
      setError('Failed to populate users');
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send userId as JSON with proper content type
      const response = await axios.post(
        `${API_URL}/user`,
        { userId: parseInt(queryId) },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      setQueriedUser(response.data.user);
    } catch (err) {
      console.error('Error querying user:', err);
      setError(err.response?.data?.error || 'Failed to query user');
      setQueriedUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_URL}/comment`, newComment, {
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      setNewComment('');
      await loadComments();
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError(err.response?.data?.error || 'Failed to submit comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔒 IPSSI PATCH - Secured Application</h1>

        {error && (
          <div style={{
            color: '#ff6b6b',
            padding: '1rem',
            marginBottom: '1rem',
            border: '2px solid #ff6b6b',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 107, 107, 0.1)'
          }}>
            ⚠️ {error}
          </div>
        )}

        <section style={{ marginBottom: '3rem', border: '2px solid #61dafb', padding: '1rem', borderRadius: '8px' }}>
          <h3>👥 Users IDs in PostgreSQL</h3>

          <button
            onClick={handlePopulate}
            disabled={loading}
            style={{
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#61dafb',
              color: '#282c34',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Generating...' : '➕ Generate 3 Random Users'}
          </button>

          {users.length === 0 ? (
            <p>No users yet. Click the button above to generate some!</p>
          ) : (
            users.map(u => <p key={u.id}>User ID: {u.id} - {u.firstName} {u.lastName}</p>)
          )}

          <form onSubmit={handleQuery} style={{ marginTop: '1rem' }}>
            <input
              type="number"
              placeholder="Enter user ID"
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
              min="1"
              required
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Query User'}
            </button>
          </form>

          {queriedUser && (
            <div style={{ marginTop: '1rem' }}>
              <h3>Queried User:</h3>
              <p>
                ID: {queriedUser.id} — First Name: {queriedUser.firstName} — Last Name: {queriedUser.lastName} — Email: {queriedUser.email} — Age: {queriedUser.age}
              </p>
            </div>
          )}
        </section>

        <section style={{ border: '2px solid #ff6b6b', padding: '1rem', borderRadius: '8px' }}>
          <h3>💬 Comments Section</h3>

          <form onSubmit={handleCommentSubmit} style={{ marginTop: '1rem' }}>
            <textarea
              placeholder="Enter your comment (XSS protected)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{
                width: '80%',
                height: '80px',
                marginBottom: '0.5rem',
                padding: '0.5rem',
                fontSize: '1rem'
              }}
              required
              disabled={loading}
            />
            <br />
            <button type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '80%', margin: '2rem auto' }}>
            <h3>Recent Comments:</h3>
            {comments.length === 0 ? (
              <p>No comments yet. TYPE ONE NOW !</p>
            ) : (
              comments.map(comment => (
                <div
                    key={comment.id}
                    style={{
                      background: '#282c34',
                      padding: '1rem',
                      marginBottom: '1rem',
                      borderRadius: '4px',
                      border: '1px solid #444'
                    }}
                  >
                    {comment.content}
                  </div>
              ))
            )}
          </div>
        </section>
      </header>
    </div>
  );
}

export default App;