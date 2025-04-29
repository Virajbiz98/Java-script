function convert() {
    const value = parseFloat(document.getElementById("inputTemp").value);
    const type = document.getElementById("conversionType").value;
    let result;
  
    switch(type) {
      case "CtoF":
        result = (value * 9/5) + 32 + " °F";
        break;
      case "FtoC":
        result = (value - 32) * 5/9 + " °C";
        break;
      case "CtoK":
        result = value + 273.15 + " K";
        break;
      case "KtoC":
        result = value - 273.15 + " °C";
        break;
      case "FtoK":
        result = ((value - 32) * 5/9) + 273.15 + " K";
        break;
      case "KtoF":
        result = ((value - 273.15) * 9/5) + 32 + " °F";
        break;
      default:
        result = "Invalid conversion";
    }
  
    document.getElementById("result").innerText = "Result: " + result;
  }
  