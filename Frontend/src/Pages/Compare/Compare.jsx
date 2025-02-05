import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import Select from 'react-select';
import './Compare.css';

const Compare = () => {
  const [history, setHistory] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const requestsData = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          index: index + 1,
          ...doc.data(),
        }));

        setHistory(requestsData);
      } catch (err) {
        setError('Failed to fetch history!');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const truncateText = (text) => {
    const words = text.split(' ');
    return words.length > 40 ? words.slice(0, 40).join(' ') + '...' : text;
  };

  const options = history.map((item) => ({
    value: item.id,
    label: `${item.index}. ${truncateText(item.text)}`,
  }));

  const selectedData = history.filter(item => selectedOptions.some(option => option.value === item.id));

  const getChartData = (scoreKey) => ({
    labels: selectedData.map((item) => item.index),
    datasets: [{
      label: scoreKey === 'toxicity_score' ? 'Toxicity Score' : 'Education Score',
      data: selectedData.map((item) => item[scoreKey]),
      borderColor: scoreKey === 'toxicity_score' ? 'rgba(255, 99, 132, 1)' : 'rgba(75, 192, 192, 1)',
      backgroundColor: scoreKey === 'toxicity_score' ? 'rgba(255, 99, 132, 0.6)' : 'rgba(75, 192, 192, 0.6)',
      borderWidth: 2,
      fill: false,
    }],
  });

  const chartOptions = {
    scales: {
      y: {
        min: 0,
        max: 1,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            // Display the full precision value in the tooltip
            const label = context.dataset.label || '';
            const value = context.raw; // Use the raw value without rounding
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="compare-container">
      <h2>Compare Education and Toxicity Scores</h2>
      <Select
        options={options}
        isMulti
        onChange={setSelectedOptions}
        className="dropdown"
      />

      {selectedOptions.length === 0 ? (
        <div className="placeholder-message">
          Select texts to compare their scores
        </div>
      ) : (
        <div className="charts">
          <div className="charrt-container">
            <h4>Toxicity Score</h4>
            <Line data={getChartData('toxicity_score')} options={chartOptions} />
          </div>
          <div className="charrt-container">
            <h4>Education Score</h4>
            <Line data={getChartData('education_score')} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;