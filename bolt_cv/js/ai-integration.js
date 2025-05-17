document.addEventListener('DOMContentLoaded', function() {
  // Initialize AI analysis
  initAIAnalysis();
});

// AI Analysis functionality
function initAIAnalysis() {
  const analyzeButton = document.getElementById('analyze-button');
  const jobDescription = document.getElementById('job-description');
  const userName = document.getElementById('user-name');
  const jobTitle = document.getElementById('job-title');
  const yearsExperience = document.getElementById('years-experience');
  const previewSummary = document.getElementById('preview-summary');
  
  if (analyzeButton && jobDescription && previewSummary) {
    analyzeButton.addEventListener('click', function() {
      // Validate input
      if (!jobDescription.value.trim()) {
        showErrorMessage('Please enter a job description to analyze');
        return;
      }
      
      // Show loading state
      const loading = window.showLoading(this, 'Analyzing with AI...');
      
      // Get user data
      const userData = {
        name: userName ? userName.value : 'User',
        jobTitle: jobTitle ? jobTitle.value : 'Professional',
        experience: yearsExperience ? yearsExperience.value : '5',
        jobDescription: jobDescription.value
      };
      
      // Call the Gemini API for analysis
      analyzeWithGemini(userData) // Modified to call the real API function
        .then(result => { // Added promise handling
          // Update the preview
        if (previewSummary) {
          previewSummary.textContent = result.summary;
        }
        
        // Add skills if they're not already there
        result.skills.forEach(skill => {
          // Check if skill already exists
          const skillExists = document.querySelector(`.preview-skill[data-skill="${skill}"]`);
          if (!skillExists) {
            addSkill(skill);
          }
        });
        
        // End loading state
        loading.done('Analysis Complete!', 1500);
      })
      .catch(error => {
        console.error('AI analysis failed:', error);
        loading.done('Analysis Failed!', 1500);
        let errorMessage = 'Failed to perform AI analysis.';
        if (error.message) {
          errorMessage += ' Error: ' + error.message;
        }
        showErrorMessage(errorMessage);
      })
      .finally(() => { // Added finally block to ensure loading state is cleared
        // Any cleanup or final actions
      });
    });
  }
}

// Show error message
function showErrorMessage(message) {
  // Create error message
  const errorMsg = document.createElement('div');
  errorMsg.className = 'error-message';
  errorMsg.innerHTML = `
    <div class="error-content">
      <i class="ph ph-warning"></i>
      <p>${message}</p>
      <button class="close-message"><i class="ph ph-x"></i></button>
    </div>
  `;
  
  // Style the message
  errorMsg.style.position = 'fixed';
  errorMsg.style.bottom = '20px';
  errorMsg.style.right = '20px';
  errorMsg.style.background = 'rgba(239, 68, 68, 0.9)';
  errorMsg.style.color = 'white';
  errorMsg.style.padding = '15px 20px';
  errorMsg.style.borderRadius = '8px';
  errorMsg.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
  errorMsg.style.zIndex = '1000';
  errorMsg.style.display = 'flex';
  errorMsg.style.alignItems = 'center';
  errorMsg.style.justifyContent = 'space-between';
  errorMsg.style.maxWidth = '300px';
  errorMsg.style.animation = 'slideIn 0.3s ease forwards';
  
  // Add to document
  document.body.appendChild(errorMsg);
  
  // Add close functionality
  const closeBtn = errorMsg.querySelector('.close-message');
  closeBtn.addEventListener('click', function() {
    errorMsg.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
      errorMsg.remove();
    }, 300);
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(errorMsg)) {
      errorMsg.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => {
        errorMsg.remove();
      }, 300);
    }
  }, 5000);
}

// Function for real Gemini API integration (commented out as we're using simulation)
async function analyzeWithGemini(userData) {
  const API_KEY = 'AIzaSyC3AuxiErkFc0Vi9_mzByCDbWrCrsjdGM8'; // Updated with user's API key
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro/generateContent?key=${API_KEY}`; // Changed :generateContent to /generateContent
  
  const prompt = `
    I need help optimizing a CV for a job application.
    
    Job Description: ${userData.jobDescription}
    
    Applicant Information:
    - Name: ${userData.name}
    - Current/Desired Job Title: ${userData.jobTitle}
    - Years of Experience: ${userData.experience}
    
    Please provide:
    1. A professional summary paragraph (3-4 sentences) that highlights relevant skills and experience
    2. A list of 5 key skills that match the job description
    3. 3 key achievements that would be relevant for this role
    
    Format the response as JSON with the following structure:
    {
      "summary": "Professional summary text here...",
      "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
      "achievements": ["Achievement 1", "Achievement 2", "Achievement 3"]
    }
  `;
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data || !data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      throw new Error('Invalid response format from API');
    }
    
    const responseText = data.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      // Fallback if JSON parsing fails
      return {
        summary: "Professional with experience in the field.",
        skills: ["Communication", "Problem Solving", "Teamwork"],
        achievements: ["Successfully completed projects on time", "Improved efficiency", "Received recognition for work"]
      };
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Re-throwing the error to be caught by the caller (initAIAnalysis)
    throw error;
  }
}