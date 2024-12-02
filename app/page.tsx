'use client';

import { useState, useEffect } from 'react';

const SERVER = 'http://127.0.0.1:5000';

export default function Home() {
  const [responseData, setResponseData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const [allGliders, setAllGliders] = useState([]);
  const [selectedGlider, setSelectedGlider] = useState('');
  const [abort, setAbort] = useState('');
  const [tLat, setTLat] = useState('');
  const [tLon, setTLon] = useState('');

  useEffect(() => {
    const fetchGliders = async () => {
      try {
        const response = await fetch(SERVER + '/api/get-gliders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
        const data = await response.json();
        setAllGliders(data.gliders || []);
      } catch (error) {
        setErrorMessage('Failed to fetch gliders.');
      }
    };

    fetchGliders();
  }, []);

  useEffect(() => {
    if (isPolling) {
      const intervalId = setInterval(() => {
        fetchData();
      }, 500);

      return () => clearInterval(intervalId);
    }
  }, [isPolling, selectedGlider]);

  const fetchData = async () => {
    try {
      const response = await fetch(SERVER + '/api/get-glider-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ call_sign: selectedGlider }),
      });
      if (!response.ok) throw new Error('Failed to fetch glider data.');
      const data = await response.json();
      setResponseData(data);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Error fetching glider data.');
    }
  };

  const changeGlider = async () => {
    try {
      const response = await fetch(SERVER + '/api/change-glider-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          call_sign: selectedGlider,
          abort: Number(abort),
          t_lat: parseFloat(tLat),
          t_lon: parseFloat(tLon),
        }),
      });
      if (!response.ok) throw new Error('Failed to change glider data.');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Error changing glider data.');
    }
  };

  const handleStartPolling = () => {
    if (!selectedGlider) {
      setErrorMessage('Please select a glider.');
      return;
    } else {
      setErrorMessage('');
    }
    setResponseData(null);
    setIsPolling(true);
    fetchData();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-2">
        Glider Data Dashboard
      </h1>
      <p className="mb-8 text-center">Custom designed for <a className="text-blue-600 underline" href="https://github.com/crnicholson/StratoSoar-MK3">StratoSoar-MK3</a></p>

      <div className="bg-gray-50 rounded-lg shadow-lg p-6 mb-6">
        <label className="block text-lg font-medium text-gray-700 mb-2">
          Select a Glider:
        </label>
        <select
          value={selectedGlider}
          onChange={(e) => setSelectedGlider(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Select a Glider</option>
          {allGliders.map((glider) => (
            <option key={glider} value={glider}>
              {glider}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleStartPolling}
        className="w-full bg-blue-100 text-blue-700 text-lg font-medium py-3 rounded-lg shadow-md border border-blue-400 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        Start Polling
      </button>

      {isPolling && (
        <div className="bg-gray-50 rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Change Glider Data
          </h2>
          <input
            type="number"
            value={abort}
            onChange={(e) => setAbort(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Abort status (0 or 1)"
          />
          <input
            type="number"
            value={tLat}
            onChange={(e) => setTLat(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Target Latitude"
          />
          <input
            type="number"
            value={tLon}
            onChange={(e) => setTLon(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Target Longitude"
          />
          <button
            onClick={changeGlider}
            className="w-full bg-green-100 text-green-700 text-lg font-medium py-3 rounded-lg shadow-md border border-green-400 hover:bg-green-50 focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            Change Glider Data
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 -mb-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {responseData && <ResponseDisplay data={responseData} />}

      <p className="mt-10 text-center">Copyright 2024 Charles Nicholson. Open source on <a className="text-blue-600 underline" href="https://github.com/crnicholson/Telemetry-Veiwer">GitHub.</a></p>
    </div>
  );
}

type ResponseDisplayProps = {
  data: Record<string, any>;
};

function ResponseDisplay({ data }: ResponseDisplayProps) {
  const groupedData = {
    "Location Data": {
      Lat: data.Lat,
      Lon: data.Lon,
      Alt: data.Alt,
      "Target Lat": data.Target_Lat,
      "Target Lon": data.Target_Lon,
    },
    "Orientation Data": {
      Yaw: data.Yaw,
      Pitch: data.Pitch,
      Roll: data.Roll,
    },
    "Time Data": {
      Time: data.Time,
    },
    "Sensor Data": {
      Temp: data.Temp,
      Pressure: data.Pressure,
      Humidity: data.Humidity,
      Volts: data.Volts,
    },
    "Communication Data": {
      "Received Abort": data.Received_Abort,
      "Tx Count": data.Tx_Count,
      "Rx Count": data.Rx_Count,
      RSSI: data.RSSI,
      SNR: data.SNR,
    },
    "Uploader Data": {
      "Uploader Lat": data.Uploader_Lat,
      "Uploader Lon": data.Uploader_Lon,
      "Uploader Alt": data.Uploader_Alt,
    },
    "Miscellaneous Data": {
      ID: data.ID,
    },
  };

  return (
    <div className=" rounded-lg p-6 bg-gray-50 mt-6 shadow-lg">
      <h2 className="font-bold text-2xl mb-4 text-gray-800">Response Data</h2>
      {Object.entries(groupedData).map(([section, fields]) => (
        <div key={section} className="mb-6">
          <h3 className="font-semibold text-lg text-gray-700 bg-gray-100 p-2 rounded-md">
            {section}
          </h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {Object.entries(fields).map(([key, value]) => (
              <div key={key} className="flex justify-between text-gray-600">
                <span className="font-medium">{key}:</span>
                <span>{value !== undefined ? String(value) : "N/A"}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
