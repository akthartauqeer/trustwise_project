import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import './History.css';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) {
          console.error('No user is signed in');
          return;
        }

        const tokenResult = await user.getIdTokenResult();
        const uid = tokenResult.claims.user_id;

        const db = getFirestore();
        const requestsRef = collection(db, 'users', uid, 'requests');
        const q = query(requestsRef, orderBy('timestamp', 'desc'));

        const querySnapshot = await getDocs(q);
        const requestsData = [];
        querySnapshot.forEach((doc) => {
          requestsData.push({ id: doc.id, ...doc.data() });
        });

        if (requestsData.length > 0) {
          setHistory(requestsData);
        } else {
          setError('No history found.');
        }
      } catch (err) {
        setError('Failed to fetch history!');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getChartData = () => {
    if (!selectedDocument) return {};

    return {
      labels: ['Toxicity Score', 'Education Score'],
      datasets: [
        {
          label: 'Scores',
          data: [selectedDocument.toxicity_score, selectedDocument.education_score],
          backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)'],
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)'],
          borderWidth: 1,
        },
      ],
    };
  };

  const getChartOptions = () => ({
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        min: 0,
        max: 1,
        title: {
          display: true,
          text: 'Score',
        },
        barPercentage: 0.1, // Adjust this value to change the width of the bars (0 to 1)
        categoryPercentage: 1,
      },
      y: {
        title: {
          display: true,
          text: 'Metrics',
        },
      },
    },
  });

  const truncateText = (text) => {
    return text.length > 25 ? text.substring(0, 25) + '...' : text;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="history-container">
      <div className="sidebar">
        <h3>History</h3>
        <ul>
          {history.map((request, index) => (
            <li
              key={request.id}
              onClick={() => setSelectedDocument(request)}
              className={`timestamp-item ${selectedDocument?.id === request.id ? 'selected' : ''}`}
            >
              <span className="timestamp-text">
                {index + 1}. {truncateText(request.text)} {/* Display index and truncated text */}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="main-content">
        {selectedDocument ? (
          <div className="details">
            <p><strong>Text:</strong> {selectedDocument.text}</p>
            <p><strong>Toxicity Score:</strong> {selectedDocument.toxicity_score}</p>
            <p><strong>Education Score:</strong> {selectedDocument.education_score}</p>

            <div className="score-graph">
              <Bar
                data={getChartData()}
                options={getChartOptions()}
                height={100}
              />
            </div>

            <div className="score-graph">
              <span className="graph-label">
                0 - Toxicity Score ({selectedDocument.toxicity_score}) - 1
              </span>
              <div className="loading-bar-container">
                <div
                  className="loading-bar"
                  style={{ width: `${selectedDocument.toxicity_score * 100}%`, backgroundColor: 'rgba(255, 99, 132, 0.6)' }}
                ></div>
              </div>
            </div>

            <div className="score-graph">
              <span className="graph-label">
                0 - Education Score ({selectedDocument.education_score}) - 1
              </span>
              <div className="loading-bar-container">
                <div
                  className="loading-bar"
                  style={{ width: `${selectedDocument.education_score * 100}%`, backgroundColor: 'rgba(75, 192, 192, 0.6)' }}
                ></div>
              </div>
            </div>

          </div>
        ) : (
          <div className="message">
            <p>Select a timestamp to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;