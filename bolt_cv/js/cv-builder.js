document.addEventListener('DOMContentLoaded', function() {
  // Initialize form interactions
  initFormInteractions();
  
  // Initialize live preview
  initLivePreview();
  
  // Initialize PDF download
  initPDFDownload();
});

// Form Interactions
function initFormInteractions() {
  // Add Experience button
  const addExperienceBtn = document.getElementById('add-experience');
  if (addExperienceBtn) {
    addExperienceBtn.addEventListener('click', function() {
      const experienceList = document.getElementById('experience-list');
      const newExperience = createExperienceItem();
      experienceList.appendChild(newExperience);
    });
  }
  
  // Add Education button
  const addEducationBtn = document.getElementById('add-education');
  if (addEducationBtn) {
    addEducationBtn.addEventListener('click', function() {
      const educationList = document.getElementById('education-list');
      const newEducation = createEducationItem();
      educationList.appendChild(newEducation);
    });
  }
  
  // Skills input
  const skillsInput = document.getElementById('skills-input');
  const skillsTags = document.getElementById('skills-tags');
  
  if (skillsInput && skillsTags) {
    skillsInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addSkill(this.value.trim());
        this.value = '';
      }
    });
  }
  
  // Photo upload
  const photoInput = document.getElementById('photo-input');
  const photoPreview = document.getElementById('photo-preview');
  const profileImagePreview = document.getElementById('profile-image-preview');
  
  if (photoInput && photoPreview && profileImagePreview) {
    photoInput.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          // Update photo preview
          photoPreview.innerHTML = '';
          const img = document.createElement('img');
          img.src = e.target.result;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          photoPreview.appendChild(img);
          
          // Update CV preview
          profileImagePreview.innerHTML = '';
          const cvImg = document.createElement('img');
          cvImg.src = e.target.result;
          cvImg.style.width = '100%';
          cvImg.style.height = '100%';
          cvImg.style.objectFit = 'cover';
          profileImagePreview.appendChild(cvImg);
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

// Live Preview
function initLivePreview() {
  // Personal information
  updateField('user-name', 'preview-name');
  updateField('job-title', 'preview-job-title');
  updateField('phone', 'preview-phone', '<i class="ph ph-phone"></i> ');
  updateField('email', 'preview-email', '<i class="ph ph-envelope"></i> ');
  updateField('location', 'preview-location', '<i class="ph ph-map-pin"></i> ');
  
  // Listen for changes in experience items
  document.addEventListener('input', function(e) {
    if (e.target.classList.contains('job-title-input') || 
        e.target.classList.contains('company-input') || 
        e.target.classList.contains('start-date-input') || 
        e.target.classList.contains('end-date-input') || 
        e.target.classList.contains('job-description-input')) {
      updateExperiencePreview();
    }
    
    if (e.target.classList.contains('degree-input') || 
        e.target.classList.contains('institution-input') || 
        e.target.classList.contains('education-start-input') || 
        e.target.classList.contains('education-end-input')) {
      updateEducationPreview();
    }
  });
  
  // Initial update
  updateExperiencePreview();
  updateEducationPreview();
}

// Helper function to update field values
function updateField(inputId, previewId, prefix = '') {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  
  if (input && preview) {
    input.addEventListener('input', function() {
      preview.innerHTML = prefix + this.value;
      if (this.value === '') {
        preview.innerHTML = prefix + preview.getAttribute('data-placeholder') || '';
      }
    });
  }
}

// Create new experience item
function createExperienceItem() {
  const item = document.createElement('div');
  item.className = 'experience-item-form';
  
  item.innerHTML = `
    <div class="form-group">
      <label>Job Title</label>
      <input type="text" class="job-title-input" placeholder="e.g., Marketing Specialist">
    </div>
    <div class="form-group">
      <label>Company</label>
      <input type="text" class="company-input" placeholder="e.g., Acme Inc.">
    </div>
    <div class="form-row">
      <div class="form-group half">
        <label>Start Date</label>
        <input type="text" class="start-date-input" placeholder="e.g., Jan 2018">
      </div>
      <div class="form-group half">
        <label>End Date</label>
        <input type="text" class="end-date-input" placeholder="e.g., Present">
      </div>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea class="job-description-input" placeholder="Brief description of your responsibilities and achievements"></textarea>
    </div>
    <button class="remove-button" onclick="this.parentElement.remove(); updateExperiencePreview();">
      <i class="ph ph-trash"></i> Remove
    </button>
  `;
  
  return item;
}

// Create new education item
function createEducationItem() {
  const item = document.createElement('div');
  item.className = 'education-item-form';
  
  item.innerHTML = `
    <div class="form-group">
      <label>Degree</label>
      <input type="text" class="degree-input" placeholder="e.g., Bachelor of Science">
    </div>
    <div class="form-group">
      <label>Institution</label>
      <input type="text" class="institution-input" placeholder="e.g., University of Example">
    </div>
    <div class="form-row">
      <div class="form-group half">
        <label>Start Year</label>
        <input type="text" class="education-start-input" placeholder="e.g., 2014">
      </div>
      <div class="form-group half">
        <label>End Year</label>
        <input type="text" class="education-end-input" placeholder="e.g., 2018">
      </div>
    </div>
    <button class="remove-button" onclick="this.parentElement.remove(); updateEducationPreview();">
      <i class="ph ph-trash"></i> Remove
    </button>
  `;
  
  return item;
}

// Add skill tag
function addSkill(skill) {
  if (!skill) return;
  
  const skillsTags = document.getElementById('skills-tags');
  const previewSkills = document.getElementById('preview-skills');
  
  if (skillsTags && previewSkills) {
    // Create skill tag
    const skillTag = document.createElement('div');
    skillTag.className = 'skill-tag';
    skillTag.innerHTML = `
      ${skill}
      <i class="ph ph-x" onclick="removeSkill(this)"></i>
    `;
    skillsTags.appendChild(skillTag);
    
    // Add to preview
    const previewSkill = document.createElement('div');
    previewSkill.className = 'preview-skill';
    previewSkill.setAttribute('data-skill', skill);
    
    const random = Math.floor(Math.random() * 31) + 70; // Random value between 70-100
    
    previewSkill.innerHTML = `
      <div class="preview-skill-name">${skill}</div>
      <div class="preview-skill-bar">
        <div class="preview-skill-level" style="width: ${random}%"></div>
      </div>
    `;
    previewSkills.appendChild(previewSkill);
  }
}

// Remove skill tag
window.removeSkill = function(element) {
  const skill = element.parentElement.textContent.trim();
  element.parentElement.remove();
  
  // Remove from preview
  const previewSkills = document.getElementById('preview-skills');
  if (previewSkills) {
    const skillElements = previewSkills.querySelectorAll('.preview-skill');
    skillElements.forEach(el => {
      if (el.getAttribute('data-skill') === skill) {
        el.remove();
      }
    });
  }
};

// Update experience preview
function updateExperiencePreview() {
  const previewExperience = document.getElementById('preview-experience');
  if (!previewExperience) return;
  
  previewExperience.innerHTML = '';
  
  const experienceForms = document.querySelectorAll('.experience-item-form');
  experienceForms.forEach(form => {
    const jobTitle = form.querySelector('.job-title-input').value || 'Job Title';
    const company = form.querySelector('.company-input').value || 'Company';
    const startDate = form.querySelector('.start-date-input').value || 'Start Date';
    const endDate = form.querySelector('.end-date-input').value || 'Present';
    const description = form.querySelector('.job-description-input').value || 'Job description';
    
    const experienceItem = document.createElement('div');
    experienceItem.className = 'preview-experience-item';
    experienceItem.innerHTML = `
      <div class="preview-job-title">${jobTitle}</div>
      <div class="preview-company">${company}</div>
      <div class="preview-date">${startDate} - ${endDate}</div>
      <p>${description}</p>
    `;
    
    previewExperience.appendChild(experienceItem);
  });
}

// Update education preview
function updateEducationPreview() {
  const previewEducation = document.getElementById('preview-education');
  if (!previewEducation) return;
  
  previewEducation.innerHTML = '';
  
  const educationForms = document.querySelectorAll('.education-item-form');
  educationForms.forEach(form => {
    const degree = form.querySelector('.degree-input').value || 'Degree';
    const institution = form.querySelector('.institution-input').value || 'Institution';
    const startYear = form.querySelector('.education-start-input').value || 'Start Year';
    const endYear = form.querySelector('.education-end-input').value || 'End Year';
    
    const educationItem = document.createElement('div');
    educationItem.className = 'preview-education-item';
    educationItem.innerHTML = `
      <div class="preview-degree">${degree}</div>
      <div class="preview-institution">${institution}</div>
      <div class="preview-date">${startYear} - ${endYear}</div>
    `;
    
    previewEducation.appendChild(educationItem);
  });
}

// PDF Download
function initPDFDownload() {
  const downloadBtn = document.getElementById('download-cv');
  const cvDocument = document.getElementById('cv-document');
  
  if (downloadBtn && cvDocument) {
    downloadBtn.addEventListener('click', function() {
      // Show loading state
      const loading = window.showLoading(this, 'Generating PDF...');
      
      // Clone the CV document to avoid modifying the original
      const clonedCV = cvDocument.cloneNode(true);
      
      // Set specific styles for PDF export
      const originalStyles = cvDocument.getAttribute('style') || '';
      clonedCV.setAttribute('style', originalStyles + 'width: 210mm; background-color: white; padding: 20mm;');
      
      // Generate PDF
      const options = {
        margin: [0, 0, 0, 0],
        filename: 'ShimmerCV_Resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().set(options).from(clonedCV).save()
        .then(() => {
          // Remove loading state
          loading.done('Downloaded!', 1500);
          
          setTimeout(() => {
            showDownloadSuccessMessage();
          }, 1000);
        })
        .catch(err => {
          console.error('PDF generation failed', err);
          loading.done('Error - Try Again', 1500);
        });
    });
  }
}

// Show download success message
function showDownloadSuccessMessage() {
  // Create success message
  const message = document.createElement('div');
  message.className = 'download-success-message';
  message.innerHTML = `
    <div class="success-content">
      <i class="ph ph-check-circle"></i>
      <p>Your CV has been successfully downloaded!</p>
      <button class="close-message"><i class="ph ph-x"></i></button>
    </div>
  `;
  
  // Style the message
  message.style.position = 'fixed';
  message.style.bottom = '20px';
  message.style.right = '20px';
  message.style.background = 'rgba(16, 185, 129, 0.9)';
  message.style.color = 'white';
  message.style.padding = '15px 20px';
  message.style.borderRadius = '8px';
  message.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
  message.style.zIndex = '1000';
  message.style.display = 'flex';
  message.style.alignItems = 'center';
  message.style.justifyContent = 'space-between';
  message.style.maxWidth = '300px';
  message.style.animation = 'slideIn 0.3s ease forwards';
  
  // Add keyframes for animation
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  // Add to document
  document.body.appendChild(message);
  
  // Add close functionality
  const closeBtn = message.querySelector('.close-message');
  closeBtn.addEventListener('click', function() {
    message.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
      message.remove();
    }, 300);
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(message)) {
      message.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => {
        message.remove();
      }, 300);
    }
  }, 5000);
}