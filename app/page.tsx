'use client';

import { useState, useEffect } from 'react';

const SERVER = 'http://127.0.0.1:5000';

export default function Home() {
  const [inputCallSign, setCallSign] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPolling, setIsPolling] = useState(false);  /
  const [allGliders, setAllGliders] = useState(null);

  const fetchData = async () => {
    const response = await fetch(SERVER + '/api/get-glider-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 'call_sign': inputCallSign }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setErrorMessage(errorData.error); 
      setResponseData(null); 
    } else {
      const data = await response.json();
      setResponseData(data);
      setErrorMessage(''); 
    }
  };

  const fetchGliders = async () => {
    const response = await fetch(SERVER + '/api/get-gliders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 'empty': 'empty' }),
    });

    if (!response.ok) {
      console.log(response);
      const errorData = await response.json();
      setErrorMessage(errorData.error); 
      setAllGliders(null); // Clear the response data if there's an error.
    } else {
      const data = await response.json();
      setAllGliders(data);
      setErrorMessage(''); // Clear any previous error messages.
    }
  };

  // Start polling every 500ms.
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPolling) {
      intervalId = setInterval(() => {
        fetchData();
      }, 500);
    } else {
      if (intervalId) {
        clearInterval(intervalId); // Clear the interval when polling stops.
      }
    }

    // Cleanup the interval on component unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPolling, inputCallSign]);

  // Handle the submit button to start polling
  const handleSubmit = () => {
    setErrorMessage(''); // Clear any previous errors
    setResponseData(null); // Clear previous data
    setIsPolling(true); // Start polling
  };

  fetchGliders();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Glider Data Dashboard</h1>

      {allGliders && <GlidersDisplay data={allGliders} />}

      <div className="mb-4">
        <input
          type="text"
          value={inputCallSign}
          onChange={(e) => setCallSign(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          placeholder="Enter the glider's call sign"
        />
        <button
          onClick={handleSubmit}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Start Polling
        </button>
      </div>

      {errorMessage && <ErrorDisplay message={errorMessage} />}

      {responseData && <ResponseDisplay data={responseData} />}
    </div>
  );
}

type GlidersDisplayProps = {
  data: any;
};

function GlidersDisplay({ data }: GlidersDisplayProps) {
  let gliders = data["gliders"];
  return (
    <div className="border rounded p-4 bg-gray-100">
      <p>{gliders}</p>
    </div>
  );
}

type ErrorDisplayProps = {
  message: string;
};

function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <div className="border rounded p-4 bg-red-200 text-red-800 mb-4">
      <h3 className="font-bold text-lg">Error</h3>
      <p>{message}</p>
    </div>
  );
}

type ResponseDisplayProps = {
  data: any;
};

function ResponseDisplay({ data }: ResponseDisplayProps) {
  const orderedKeys = [
    "Lat", "Lon", "Alt", "Target_Lat", "Target_Lon", "Yaw", "Pitch", "Roll",
    "Time", "Temp", "Pressure", "Humidity", "Volts", "Received_Abort",
    "Tx_Count", "Rx_Count", "RSSI", "SNR", "Uploader_Lat", "Uploader_Lon",
    "Uploader_Alt", "ID"
  ];

  return (
    <div className="border rounded p-4 bg-gray-100">
      <h2 className="font-bold text-lg mb-4">Response Data</h2>
      <div className="grid grid-cols-2 gap-4">
        {orderedKeys.map((key) => (
          <div key={key} className="flex justify-between">
            <span className="font-semibold">{formatKey(key)}:</span>
            <span>{String(data[key]) ?? 'N/A'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatKey(key: string) {
  return key
    .replace(/_/g, ' ') 
    .replace(/\b\w/g, (char) => char.toUpperCase()); 
}
