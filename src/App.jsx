import React, { useState, useRef, useEffect } from 'react'
import { UploadIcon, CameraIcon, XIcon } from './Icons';
import './App.css'

const App = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState(null);
  const [serverReady, setServerReady] = useState(false);
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    } else {
      setImage(null);
      setPreview('');
      setResult(null);
    }
  };

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const res = await fetch('https://potato-disease-1-ypvi.onrender.com/');
        if (res.ok) {
          console.log('Server health check successful:', res.status);
          setServerReady(true);
        } else {
          console.error('Server health check failed with status:', res.status);
          setServerReady(false);
        }
      } catch (error) {
        console.error('Error during server health check:', error);
        setServerReady(false);
      }
    };

    checkServerStatus();
  }, []);

  const handleRemoveImage = () => {
    setImage(null);
    setPreview('');
    setResult(null);
    fileInputRef.current.value = '';
  };

  const handlePredict = async () => {
    if (!image) {
      setResult({ status: 'error', message: 'Please select an image first!' });
      return;
    }
    setPredicting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', image);

      // Note: Assuming the backend URL is correct. Ensure CORS is handled on the backend.
      const response = await fetch('https://potato-disease-1-ypvi.onrender.com/predict', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction.');
      }
      const data = await response.json();
      setResult({
        status: 'ok',
        disease: data.prediction || data.disease || data.class || "Disease detected",
        confidence: data.confidence !== undefined
          ? `${Math.floor(Number(data.confidence))}%`
          : data.probability !== undefined
            ? `${Math.floor(Number(data.probability) * 100)}%`
            : "",
        advice: data.advice || data.description || "Follow best agricultural practices or consult an expert."
      });
    } catch (error) {
      setResult({ status: 'error', message: 'Error predicting disease. Try again.' });
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="outer_div">
      <div className="inner_div">
        <div className="heading_box">
          <h1>
            Potato Disease Detector
          </h1>
          <div className="subtitle">Diagnose your potato leaf instantly using AI</div>
        </div>

        {!serverReady && (
          <div className="server_status_message">
            Server is starting... Please wait a moment.
          </div>
        )}

        <div className="photoUpload">
          <input
            type="file"
            accept="image/*"
            id="potato-upload"
            className="hidden_file_input"
            onChange={handleImageChange}
            ref={fileInputRef}
            ref={fileInputRef}
          />

          {!preview ? (
            <label htmlFor="potato-upload" className="photo_area photo_area_upload">
              <div className="upload_content">
                <span className="upload_icons_wrapper">
                  <UploadIcon />
                  <CameraIcon />
                </span>
                <span className="photo_area_text">Take a photo or upload</span>
              </div>
            </label>
          ) : (
            <div className="photo_area photo_area_preview">
              <img src={preview} alt="uploaded" className="uploaded_image" />
              <button className="remove_image_btn" onClick={handleRemoveImage} title="Remove" type="button">
                <XIcon />
              </button>
            </div>
          )}
        </div>

        <div className="predict_btn_wrap">
          <button
            className="predict_btn"
            onClick={handlePredict}
            disabled={!image || predicting || !serverReady}
          >
            {predicting ? (
              <>
                <span className="loader" />
                <span className="predict_btn_text">Analyzing...</span>
              </>
            ) : (
              <>
                <CameraIcon />
                <span className="predict_btn_text">Predict Disease</span>
              </>
            )}
          </button>
        </div>

        {result && (
          <div className={`result_box ${result.status}`}>
            {result.status === "error" ? (
              <strong className="result_error_msg">{result.message}</strong>
            ) : (
              <>
                <div className="result_disease">
                  {result.disease}
                  {result.confidence && (
                    <span className="result_confidence">
                      {result.confidence}
                    </span>
                  )}
                </div>
                <div className="result_advice">{result.advice}</div>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default App
