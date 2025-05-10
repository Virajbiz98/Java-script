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
      
      // Simulate AI analysis (in a real app, this would call the Gemini API)
      setTimeout(() => {
        const result = simulateAIAnalysis(userData);
        
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
      }, 2000);
    });
  }
}

// Simulate AI analysis (in a real implementation, this would be an API call to Gemini)
function simulateAIAnalysis(userData) {
  // Extract job type from job description
  const jobDesc = userData.jobDescription.toLowerCase();
  let jobType = 'professional';
  
  if (jobDesc.includes('develop') || jobDesc.includes('code') || jobDesc.includes('software') || 
      jobDesc.includes('engineer') || jobDesc.includes('programming')) {
    jobType = 'tech';
  } else if (jobDesc.includes('market') || jobDesc.includes('brand') || 
             jobDesc.includes('advertis') || jobDesc.includes('social media')) {
    jobType = 'marketing';
  } else if (jobDesc.includes('design') || jobDesc.includes('ui') || 
             jobDesc.includes('ux') || jobDesc.includes('creative')) {
    jobType = 'design';
  } else if (jobDesc.includes('sales') || jobDesc.includes('account') || 
             jobDesc.includes('client') || jobDesc.includes('revenue')) {
    jobType = 'sales';
  } else if (jobDesc.includes('manag') || jobDesc.includes('lead') || 
             jobDesc.includes('direct') || jobDesc.includes('executive')) {
    jobType = 'management';
  }
  
  // Generate a relevant summary based on job type
  const summaries = {
    tech: `Innovative ${userData.jobTitle} with ${userData.experience}+ years of experience developing scalable solutions and driving technical excellence. Demonstrated expertise in optimizing system performance and implementing best practices for code quality. Passionate about solving complex problems through elegant, efficient solutions.`,
    
    marketing: `Results-driven ${userData.jobTitle} with ${userData.experience}+ years of experience creating data-driven marketing campaigns and growing brand presence. Proven track record of increasing engagement metrics and developing comprehensive marketing strategies that align with business objectives.`,
    
    design: `Creative ${userData.jobTitle} with ${userData.experience}+ years of experience crafting user-centered designs and compelling visual experiences. Strong portfolio demonstrating expertise in translating business requirements into intuitive interfaces that delight users and drive engagement.`,
    
    sales: `Dynamic ${userData.jobTitle} with ${userData.experience}+ years of experience exceeding targets and building strong client relationships. Consistent record of generating new business opportunities and retaining key accounts through consultative selling approaches and excellent communication.`,
    
    management: `Accomplished ${userData.jobTitle} with ${userData.experience}+ years of experience leading high-performing teams and driving organizational success. Strong strategic vision combined with hands-on operational expertise, resulting in improved efficiency and sustainable growth.`,
    
    professional: `Dedicated ${userData.jobTitle} with ${userData.experience}+ years of experience delivering exceptional results and building expertise in the field. Combines analytical thinking with practical problem-solving to overcome challenges and contribute to organizational success.`
  };
  
  // Generate relevant skills based on job type
  const skillsByType = {
    tech: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Git', 'System Design', 'API Development'],
    marketing: ['Social Media Strategy', 'Content Marketing', 'SEO', 'Google Analytics', 'Campaign Management', 'Market Research'],
    design: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Wireframing', 'User Research', 'Design Systems'],
    sales: ['Negotiation', 'Client Relationship Management', 'Sales Strategy', 'Pipeline Management', 'B2B Sales'],
    management: ['Team Leadership', 'Strategic Planning', 'Project Management', 'Stakeholder Management', 'Budget Administration'],
    professional: ['Problem Solving', 'Communication', 'Project Management', 'Data Analysis', 'Microsoft Office Suite']
  };
  
  // Extract relevant skills from job description
  function extractSkillsFromJobDescription(description, type) {
    const allSkills = [
      ...skillsByType.tech, 
      ...skillsByType.marketing, 
      ...skillsByType.design, 
      ...skillsByType.sales, 
      ...skillsByType.management, 
      ...skillsByType.professional
    ];
    
    // Find skills mentioned in the job description
    const mentionedSkills = allSkills.filter(skill => 
      description.toLowerCase().includes(skill.toLowerCase())
    );
    
    // Add some skills from the job type
    const typeSkills = skillsByType[type].slice(0, 3);
    
    // Combine and remove duplicates
    return [...new Set([...mentionedSkills, ...typeSkills])].slice(0, 5);
  }
  
  return {
    summary: summaries[jobType],
    skills: extractSkillsFromJobDescription(userData.jobDescription, jobType)
  };
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
/*
async function analyzeWithGemini(userData) {
  const API_KEY = 'AIzaSyCPtL3-uG3VtuL6PGrVVDThAU5o-C1gTwo';
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
  
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
    
    const data = await response.json();
    
    // Parse the response text as JSON
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
    return simulateAIAnalysis(userData);
  }
}
*/