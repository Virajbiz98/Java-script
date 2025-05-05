(function() {
  // --- DOM Elements ---
  const tabs = document.querySelectorAll('.tab');
  const inputLabel = document.getElementById('input-label');
  const energyInput = document.getElementById('energy-input');
  const scaleIndicator = document.getElementById('scale-indicator');
  const scaleMinLabel = document.getElementById('scale-min-label');
  const scaleMaxLabel = document.getElementById('scale-max-label');
  const outputFields = {
    joules: document.querySelector('.output[data-unit-out="joules"]'),
    watts: document.querySelector('.output[data-unit-out="watts"]'),
    kilowatts: document.querySelector('.output[data-unit-out="kilowatts"]'),
    btu: document.querySelector('.output[data-unit-out="btu"]'),
    volts: document.querySelector('.output[data-unit-out="volts"]')
  };


  // --- State ---
  let currentUnit = 'joules';

  // --- Constants ---
  const JOULES_PER_BTU = 1055.06; // 1 BTU = 1055.06 J
  const WATTS_PER_KW = 1000;
  let maxValues = {};

  const unitLabels = {
    joules: 'Joules',
    watts: 'Watts',
    kilowatts: 'kW',
    btu: 'BTU',
    volts: 'Volts'
  };

  // Voltage inputs
  const currentInput = document.getElementById('current-input');
  const resistanceInput = document.getElementById('resistance-input');

  // --- Conversion Functions ---
  const timeInput = document.getElementById('time-input');

  function convertAll(value, fromUnit) {
    const time = parseFloat(timeInput.value) || 1;
    let watts = 0;

    switch(fromUnit) {
      case 'joules':
        watts = value / time; // P = E/t
        break;
      case 'btu':
        watts = (value * JOULES_PER_BTU) / time;
        break;
      case 'kilowatts':
        watts = value * 1000;
        break;
      case 'volts':
        const current = parseFloat(currentInput.value) || 1;
        const resistance = parseFloat(resistanceInput.value);
        watts = resistance ? Math.pow(value, 2) / resistance : value * current;
        break;
      default: // watts
        watts = value;
    }

    return {
      joules: watts * time,
      watts: watts,
      kilowatts: watts / 1000,
      btu: (watts * time) / JOULES_PER_BTU,
      volts: calculateVoltage(watts)
    };
  }

  function calculateVoltage(watts) {
    const current = parseFloat(currentInput.value);
    const resistance = parseFloat(resistanceInput.value);
    
    if (current > 0) return watts / current; // V = P/I
    if (resistance > 0) return Math.sqrt(watts * resistance); // V = âˆš(P*R)
    return 0;
  }

  // Initialize max values for realistic ranges
  maxValues = {
    joules: 3600000, // 1 kWh = 3.6MJ
    watts: 1000,
    kilowatts: 1,
    btu: 3412, // 1 kWh â‰ˆ 3412 BTU
    volts: 240
  };

  // --- UI Update Functions ---
  function updateUI() {
    const value = parseFloat(energyInput.value);
    const isValidInput = !isNaN(value);

    let results = { joules: '', watts: '', kilowatts: '', btu: '', volts: '' };
    let scalePercent = 0;

    if (isValidInput) {
      const converted = convertAll(value, currentUnit);
      
      results.joules = converted.joules.toFixed(4);
      results.watts = converted.watts.toFixed(4);
      results.kilowatts = converted.kilowatts.toFixed(6);
      results.btu = converted.btu.toFixed(4);
      results.volts = converted.volts.toFixed(4);

      // Update scale based on current unit
      const maxValue = maxValues[currentUnit] || 1000;
      scalePercent = Math.min((value / maxValue) * 100, 100);
    }

    Object.entries(results).forEach(([unit, val]) => {
      outputFields[unit].value = val;
    });
    scaleIndicator.style.left = `${scalePercent}%`;
  }

  function setActiveTab(unit) {
    currentUnit = unit;
    tabs.forEach(t => t.classList.toggle('active', t.dataset.unit === unit));
    inputLabel.textContent = unitLabels[unit];
    
    const maxVal = maxValues[unit];
    scaleMinLabel.textContent = `0 ${unitLabels[unit]}`;
    scaleMaxLabel.textContent = `${maxVal} ${unitLabels[unit]}`;
    
    energyInput.value = '';
    updateUI();
  }

  // --- Event Listeners ---
  tabs.forEach(tab => {
    tab.addEventListener('click', () => setActiveTab(tab.dataset.unit));
  });

  // Add event listeners for all inputs
  energyInput.addEventListener('input', updateUI);
  currentInput.addEventListener('input', updateUI);
  resistanceInput.addEventListener('input', updateUI);
  setActiveTab(currentUnit);
})();