(function() {
    // --- DOM Elements ---
    const tabs = document.querySelectorAll('.tab');
    const energyInput = document.querySelector('.energy-input');
    const timeInput = document.getElementById('timeDuration');
    const outputFields = {
      joules: document.getElementById('joulesResult'),
      watts: document.getElementById('wattsResult'),
      kilowatts: document.getElementById('kilowattsResult'),
      btu: document.getElementById('btuResult'),
      volts: document.getElementById('voltageResult')
    };
  
    // --- State ---
    let currentUnit = 'joules';
  
    // --- Constants ---
    const JOULES_PER_BTU = 1055.06;
    const WATTS_PER_KW = 1000;
    const maxValues = {
      joules: 3600000,
      watts: 1000,
      kilowatts: 1,
      btu: 3412,
      volts: 240
    };
  
    // --- Conversion Logic ---
    function convertAll(value, fromUnit) {
      const time = parseFloat(timeInput.value) || 1;
      let watts = 0;
  
      switch(fromUnit) {
        case 'joules':
          watts = value / time;
          break;
        case 'btu':
          watts = (value * JOULES_PER_BTU) / time;
          break;
        case 'kilowatts':
          watts = value * WATTS_PER_KW;
          break;
        case 'volts':
          const current = 1; // Default current value
          const resistance = 1; // Default resistance value
          watts = resistance ? Math.pow(value, 2) / resistance : value * current;
          break;
        default: // watts
          watts = value;
      }
  
      return {
        joules: watts * time,
        watts: watts,
        kilowatts: watts / WATTS_PER_KW,
        btu: (watts * time) / JOULES_PER_BTU,
        volts: watts // Simplified for demonstration
      };
    }
  
    // --- UI Updates ---
    function updateUI() {
      const value = parseFloat(energyInput.value) || 0;
      const results = convertAll(value, currentUnit);
  
      outputFields.joules.value = results.joules.toFixed(2);
      outputFields.watts.value = results.watts.toFixed(2);
      outputFields.kilowatts.value = results.kilowatts.toFixed(4);
      outputFields.btu.value = results.btu.toFixed(2);
      outputFields.volts.textContent = results.volts.toFixed(2);
    }
  
    // --- Event Handlers ---
    function setActiveTab(unit) {
      currentUnit = unit;
      tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === unit));
      energyInput.placeholder = `Enter ${unit}`;
      updateUI();
    }
  
    // --- Initialize ---
    tabs.forEach(tab => {
      tab.addEventListener('click', () => setActiveTab(tab.dataset.tab));
    });
  
    energyInput.addEventListener('input', updateUI);
    timeInput.addEventListener('input', updateUI);
    setActiveTab('joules');
  })();