import React, { useState, useRef } from 'react'
import './App.css'

const App = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState(null);
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
            <span role="img" aria-label="potato">🥔</span> Potato Disease Detector
          </h1>
          <div className="subtitle">Diagnose your potato leaf instantly!</div>
        </div>

        <div className="photoUpload">
          <input
            type="file"
            accept="image/*"
            id="potato-upload"
            className="hidden_file_input"
            onChange={handleImageChange}
            ref={fileInputRef}
          />

          {!preview ? (
            <label htmlFor="potato-upload" className="photo_area photo_area_upload custom_upload_area">
              <div className="upload_content custom_upload_content">
                <span className="upload_icon custom_upload_icon" role="img" aria-label="upload">📷</span>
                <span className="photo_area_text custom_upload_text">Upload your photo here</span>
              </div>
            </label>
          ) : (
            <div className="photo_area photo_area_preview custom_preview_area">
              <img src={preview} alt="uploaded" className="uploaded_image custom_uploaded_image" />
              <button className="remove_image_btn custom_remove_image_btn" onClick={handleRemoveImage} title="Remove" type="button">
                ×
              </button>
            </div>
          )}
        </div>

        <div className="predict_btn_wrap">
          <button
            className="predict_btn custom_predict_btn"
            onClick={handlePredict}
            disabled={!image || predicting}
          >
            {predicting ? (
              <>
                <span className="loader" />
                <span className="predict_btn_text">Predicting...</span>
              </>
            ) : <span className="predict_btn_text">Predict</span>}
          </button>
        </div>

        {result && (
          <div className={`result_box ${result.status} custom_result_box`}>
            {result.status === "error" ? (
              <strong className="result_error_msg">{result.message}</strong>
            ) : (
              <>
                <div className="result_disease custom_result_disease">
                  {result.disease}{" "}
                  {result.confidence && (
                    <span className="result_confidence custom_result_confidence">
                      ({result.confidence})
                    </span>
                  )}
                </div>
                <div className="result_advice custom_result_advice">{result.advice}</div>
              </>
            )}
          </div>
        )}
        {/* Loader spinner moved for CSS only */}
      </div>
      {/* Extra CSS for custom classes */}
      
    </div>
  );
}

export default App
