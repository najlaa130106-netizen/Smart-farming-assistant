/* ==========================================================
   SMART FARMING ASSISTANT - INTERACTIVE LOGIC (script.js)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. THEME TOGGLE (DARK / LIGHT MODE) ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDarkMode = document.body.classList.contains('dark-mode');
      themeToggleBtn.innerHTML = isDarkMode ? '☀️' : '🌙';
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });

    // Load saved theme preference
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
      themeToggleBtn.innerHTML = '☀️';
    }
  }

  // --- 2. LIVE IOT SENSOR SIMULATION ---
  const sensorValues = {
    moisture: document.getElementById('val-moisture'),
    temperature: document.getElementById('val-temp'),
    humidity: document.getElementById('val-humidity'),
    ph: document.getElementById('val-ph')
  };

  function updateSensorTelemetry() {
    // Generate realistic small fluctuations
    if (sensorValues.moisture) {
      const currentMoisture = parseFloat(sensorValues.moisture.innerText) || 42;
      const newMoisture = Math.max(20, Math.min(80, (currentMoisture + (Math.random() * 2 - 1)).toFixed(1)));
      sensorValues.moisture.innerText = `${newMoisture}%`;
    }

    if (sensorValues.temperature) {
      const currentTemp = parseFloat(sensorValues.temperature.innerText) || 28;
      const newTemp = Math.max(15, Math.min(45, (currentTemp + (Math.random() * 0.8 - 0.4)).toFixed(1)));
      sensorValues.temperature.innerText = `${newTemp}°C`;
    }

    if (sensorValues.humidity) {
      const currentHum = parseFloat(sensorValues.humidity.innerText) || 65;
      const newHum = Math.max(30, Math.min(95, (currentHum + (Math.random() * 1.5 - 0.75)).toFixed(1)));
      sensorValues.humidity.innerText = `${newHum}%`;
    }

    if (sensorValues.ph) {
      const currentPh = parseFloat(sensorValues.ph.innerText) || 6.5;
      const newPh = Math.max(5.5, Math.min(8.5, (currentPh + (Math.random() * 0.1 - 0.05)).toFixed(2)));
      sensorValues.ph.innerText = newPh;
    }
  }

  // Update sensors every 3 seconds
  setInterval(updateSensorTelemetry, 3000);

  // --- 3. CHART.JS INITIALIZATION & REAL-TIME UPDATES ---
  const chartCanvas = document.getElementById('telemetryChart');
  let telemetryChart;

  if (chartCanvas && typeof Chart !== 'undefined') {
    const ctx = chartCanvas.getContext('2d');
    
    // Initial dataset (7 time intervals)
    const initialLabels = ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'];
    const moistureData = [40, 42, 41, 43, 42, 44, 42];
    const tempData = [26, 27, 27, 28, 28, 29, 28];

    telemetryChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: initialLabels,
        datasets: [
          {
            label: 'Soil Moisture (%)',
            data: moistureData,
            borderColor: '#0288d1',
            backgroundColor: 'rgba(2, 136, 209, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Temperature (°C)',
            data: tempData,
            borderColor: '#e65100',
            backgroundColor: 'rgba(230, 81, 0, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: { beginAtZero: false }
        }
      }
    });

    // Append new data point to chart every 5 seconds
    setInterval(() => {
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      const latestMoisture = parseFloat(sensorValues.moisture?.innerText) || 42;
      const latestTemp = parseFloat(sensorValues.temperature?.innerText) || 28;

      telemetryChart.data.labels.push(timeString);
      telemetryChart.data.datasets[0].data.push(latestMoisture);
      telemetryChart.data.datasets[1].data.push(latestTemp);

      // Keep maximum 10 points on screen
      if (telemetryChart.data.labels.length > 10) {
        telemetryChart.data.labels.shift();
        telemetryChart.data.datasets[0].data.shift();
        telemetryChart.data.datasets[1].data.shift();
      }

      telemetryChart.update();
    }, 5000);
  }

  // --- 4. SMART CROP RECOMMENDATION ENGINE ---
  const cropForm = document.getElementById('crop-rec-form');
  const cropResultDiv = document.getElementById('crop-result');

  if (cropForm) {
    cropForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const soilType = document.getElementById('soil-type')?.value || 'loamy';
      const phVal = parseFloat(document.getElementById('input-ph')?.value) || 6.5;

      let recommendedCrop = '';
      let advice = '';

      if (phVal < 6.0) {
        recommendedCrop = soilType === 'sandy' ? 'Potatoes or Groundnuts' : 'Tea or Oats';
        advice = 'Soil is slightly acidic. Add agricultural lime to increase pH for standard crops.';
      } else if (phVal >= 6.0 && phVal <= 7.5) {
        recommendedCrop = soilType === 'clay' ? 'Rice or Wheat' : 'Maize, Tomatoes, or Beans';
        advice = 'Optimal pH range! Ideal for high-yield cereal and vegetable crops.';
      } else {
        recommendedCrop = 'Barley, Sugar Beets, or Asparagus';
        advice = 'Soil is alkaline. Consider adding organic matter or sulfur to bring pH down.';
      }

      if (cropResultDiv) {
        cropResultDiv.innerHTML = `
          <div style="background: rgba(76, 175, 80, 0.1); border-left: 4px solid #4caf50; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
            <h4 style="color: #2e7d32; margin-bottom: 0.5rem;">🌾 Best Match: ${recommendedCrop}</h4>
            <p style="font-size: 0.9rem;"><strong>Agronomist Note:</strong> ${advice}</p>
          </div>
        `;
      }
    });
  }

  // --- 5. IRRIGATION AUTOMATION TOGGLE ---
  const irrigationToggle = document.getElementById('irrigation-switch');
  const irrigationStatusText = document.getElementById('irrigation-status');

  if (irrigationToggle && irrigationStatusText) {
    irrigationToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        irrigationStatusText.innerText = 'Valve Status: OPEN (Watering Active)';
        irrigationStatusText.style.color = '#0288d1';
      } else {
        irrigationStatusText.innerText = 'Valve Status: CLOSED (Standby)';
        irrigationStatusText.style.color = 'var(--text-muted)';
      }
    });
  }

  // --- 6. PEST & DISEASE DIAGNOSTIC SIMULATOR ---
  const pestForm = document.getElementById('pest-form');
  const pestResultDiv = document.getElementById('pest-result');

  if (pestForm) {
    pestForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (pestResultDiv) {
        pestResultDiv.innerHTML = `<p style="color: var(--text-muted);">Analyzing sample image...</p>`;

        setTimeout(() => {
          pestResultDiv.innerHTML = `
            <div style="background: rgba(230, 81, 0, 0.1); border-left: 4px solid #e65100; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
              <h4 style="color: #e65100; margin-bottom: 0.4rem;">⚠️ Detection Result: Early Blight</h4>
              <p style="font-size: 0.85rem; margin-bottom: 0.5rem;"><strong>Confidence:</strong> 94.2%</p>
              <p style="font-size: 0.85rem;"><strong>Recommended Treatment:</strong> Apply copper-based fungicide or neem oil spray every 7 days. Ensure adequate crop spacing to improve air circulation.</p>
            </div>
          `;
        }, 1200);
      }
    });
  }
});
