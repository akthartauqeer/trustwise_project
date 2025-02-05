import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { getAuth } from 'firebase/auth';
import './Home.css';

const Home = () => {
    const [inputText, setInputText] = useState('');
    const [submittedText, setSubmittedText] = useState('');
    const [selectedOption, setSelectedOption] = useState('checkBoth');
    const [result, setResult] = useState(null);
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [resultsSubmitted, setResultsSubmitted] = useState(false);
    const [infoBoxVisible, setInfoBoxVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // New loading state
    const fullWelcomeMessage = "Weelcome to Tauqeer's Trustwise Project! \nEnter any text to check its Education\n and Toxicity Score.";

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index < fullWelcomeMessage.length - 1) {
                setWelcomeMessage((prev) => prev + fullWelcomeMessage[index]);
                index++;
            } else {
                clearInterval(interval);
                // Show info box after welcome message
                setTimeout(() => {
                    setInfoBoxVisible(true);
                }, 500); // Delay before showing info boxes
            }
        }, 40);

        return () => clearInterval(interval);
    }, []);

    const handleInputChange = (event) => {
        setInputText(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (inputText.trim() === '') return;

        setSubmittedText(inputText);
        setIsLoading(true); // Set loading state to true
        await fetchResult(inputText);
        setResultsSubmitted(true);
        setInfoBoxVisible(false); 
        setIsLoading(false); // Reset loading state after fetching
    };

    const fetchResult = async (text) => {
        try {
            const user = getAuth().currentUser ;
            if (!user) {
                console.error('No user is signed in');
                return;
            }

            const token = await user.getIdToken();
            console.log(token);

            const response = await fetch('http://127.0.0.1:5002/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const data = await response.json();
            console.log("JWT Token:", data);  

            setResult(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const chartOptions = {
        indexAxis: 'x', 
        scales: {
            x: {
                beginAtZero: true,
                max: 1,
                ticks: {
                    color: '#111',
                },
                barPercentage: 0.1, // Adjust this value to change the width of the bars (0 to 1)
                categoryPercentage: 0.5,
            },
            y: {
                ticks: {
                    color: '#111',
                },
            },
        },
        plugins: {
            legend: {
                display: false, 
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
                    },
                },
            },
        },
    };

    return (
        <div className="container">
            <div className="form-container">
                {/* Welcome Message */}
                {!resultsSubmitted && (
                    <h2 className="welcome-message" style={{ whiteSpace: 'pre-line', color: '#111' }}>
                        {welcomeMessage}
                    </h2>
                )}

                {infoBoxVisible && (
                    <div className="info-box-wrapper">
                        <div className="info-box" title="A toxicity score is a numerical value (ranging from 0 to 1) assigned by an LLM model to indicate how toxic a given text is. A score of 0 means the text is completely non-toxic, while a score of 1 means the text is highly toxic. Toxicity is typically assessed based on factors like offensive language, hate speech, harassment, insults, or harmful intent.">
                            <span>What is Toxicity Score?</span>
                        </div>
                        <div className="info-box" title="An educational score is a numerical value (ranging from 0 to 1) assigned by an LLM model to measure how informative and educational a piece of text is. A score of 0 means the text has no educational value, while a score of 1 means the text is highly informative, well-structured, and contains valuable learning content. This score may consider factors like factual accuracy, clarity, depth, and relevance to an educational context.">
                            <span>What is Educational Score?</span>
                        </div>
                    </div>
                )}

                <div className="result-container">
                    {result && (
                        <>
                            <h3 style={{ color: '#111' }}>Results:</h3>
                            <p style={{ color: '#111' }}><strong>Text: </strong>{result.text}</p>

                            {/* Conditional Rendering Based on Selected Option */}
                            {selectedOption === 'checkToxicityScore' && (
                                <>
                                    <p style={{ color: '#111' }}><strong>Toxicity Score: </strong>{result.toxicity?.score}</p>
                                    <div className="chart-container">
                                        <Bar data={{
                                            labels: ['Toxicity Score'],
                                            datasets: [{
                                                label: '', // Set label to empty to remove it from the graph
                                                data: [result.toxicity?.score ?? 0],
                                                backgroundColor: ['rgba(255, 99, 132, 0.6)'], // Light red
                                                borderColor: ['rgba(255, 99, 132, 1)'],
                                                borderWidth: 1,
                                            }],
                                        }} options={chartOptions} />
                                    </div>
                                    <div className="progress-container">
                                        <div className="progress-bar">
                                            <div className="progress-label">0 - Toxicity Score({result.toxicity?.score}) - 1</div>
                                            <div className="progress" style={{ width: `${(result.toxicity?.score ?? 0) * 100}%`, backgroundColor: 'rgba(255, 99, 132, 0.6)' }}></div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {selectedOption === 'checkEducationalScore' && (
                                <>
                                    <p style={{ color: '#111' }}><strong>Education Score: </strong>{result.education?.score}</p>
                                    <div className="chart-container">
                                        <Bar data={{
                                            labels: ['Education Score'],
                                            datasets: [{
                                                label: '', // Set label to empty to remove it from the graph
                                                data: [result.education?.score ?? 0],
                                                backgroundColor: ['rgba(75, 192, 192, 0.6)'], // Light green
                                                borderColor: ['rgba(75, 192, 192, 1)'],
                                                borderWidth: 1,
                                            }],
                                        }} options={chartOptions} />
                                    </div>
                                    <div className="progress-container">
                                        <div className="progress-bar">
                                            <div className="progress-label">0 - Education Score({result.education?.score}) - 1</div>
                                            <div className="progress" style={{ width: `${(result.education?.score ?? 0) * 100}%`, backgroundColor: 'rgba(75, 192, 192, 0.6)' }}></div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {selectedOption === 'checkBoth' && (
                                <>
                                    <p style={{ color: '#111' }}><strong>Toxicity Score: </strong>{result.toxicity?.score}</p>
                                    <p style={{ color: '#111' }}><strong>Education Score: </strong>{result.education?.score}</p>
                                    <div className="chart-container">
                                        <Bar data={{
                                            labels: ['Toxicity Score', 'Education Score'],
                                            datasets: [{
                                                label: '', // Set label to empty to remove it from the graph
                                                data: [result.toxicity?.score ?? 0, result.education?.score ?? 0],
                                                backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)'], // Light red and light green
                                                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)'],
                                                borderWidth: 1,
                                            }],
                                        }} options={chartOptions} />
                                    </div>
                                    <div className="progress-container">
                                        <div className="progress-bar">
                                            <div className="progress-label">0 - Toxicity Score({result.toxicity?.score}) - 1</div>
                                            <div className="progress" style={{ width: `${(result.toxicity?.score ?? 0) * 100}%`, backgroundColor: 'rgba(255, 99, 132, 0.6)' }}></div>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-label">0 - Education Score({result.education?.score}) - 1</div>
                                            <div className="progress" style={{ width: `${(result.education?.score ?? 0) * 100}%`, backgroundColor: 'rgba(75, 192, 192, 0.6)' }}></div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="form">
                    {/* Text Box */}
                    <textarea
                        value={inputText}
                        onChange={handleInputChange}
                        placeholder="Enter your text here..."
                        className="input-text"
                        rows={4}
                    />
                    
                    <button type="submit" className="submit-btn" style={{ color: '#111' }}>
                        {isLoading ? 'Fetching...' : 'Submit'} {/* Change button text based on loading state */}
                    </button>

                    {/* Options (Horizontal) */}
                    <div className="options">
                        <label style={{ color: '#111' }}>
                            <input
                                type="radio"
                                name="option"
                                value="checkEducationalScore"
                                checked={selectedOption === 'checkEducationalScore'}
                                onChange={() => setSelectedOption('checkEducationalScore')}
                            />
                            Check Educational Score
                        </label>
                        <label style={{ color: '#111' }}>
                            <input
                                type="radio"
                                name="option"
                                value="checkToxicityScore"
                                checked={selectedOption === 'checkToxicityScore'}
                                onChange={() => setSelectedOption('checkToxicityScore')}
                            />
                            Check Toxicity Score
                        </label>
                        <label style={{ color: '#111' }}>
                            <input
                                type="radio"
                                name="option"
                                value="checkBoth"
                                checked={selectedOption === 'checkBoth'}
                                onChange={() => setSelectedOption('checkBoth')}
                            />
                            Check Both
                        </label>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Home;