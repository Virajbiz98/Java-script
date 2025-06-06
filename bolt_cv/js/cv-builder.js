document.addEventListener('DOMContentLoaded', function() {
  // Initialize form interactions
  initFormInteractions();

  // Initialize live preview
  initLivePreview();

  // Initialize PDF download
  initPDFDownload();
  initTestPDFDownload(); // Initialize test PDF download
});

console.log('Type of html2pdf:', typeof html2pdf);

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

        reader.onerror = function(error) {
          showErrorMessage('Error uploading image: ' + error);
        };

        reader.onload = function(e) {
          try {
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
          } catch (error) {
            showErrorMessage('Error displaying image: ' + error);
          }
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

  if (!skillsTags || !previewSkills) {
    console.error('Skills container elements not found');
    return;
  }

  try {
    // Check for duplicate skill
    const existingSkill = Array.from(skillsTags.children)
      .find(tag => tag.textContent.trim().toLowerCase() === skill.toLowerCase());

    if (existingSkill) {
      showErrorMessage('This skill has already been added');
      return;
    }

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
  } catch (error) {
    console.error('Error adding skill:', error);
    showErrorMessage('Failed to add skill: ' + error.message);
  }
}

// Remove skill tag
window.removeSkill = function(element) {
  try {
    if (!element || !element.parentElement) {
      throw new Error('Invalid skill element');
    }

    const skill = element.parentElement.textContent.trim();
    element.parentElement.remove();

    // Remove from preview
    const previewSkills = document.getElementById('preview-skills');
    if (!previewSkills) {
      throw new Error('Preview skills container not found');
    }

    const skillElements = previewSkills.querySelectorAll('.preview-skill');
    let removed = false;

    skillElements.forEach(el => {
      if (el.getAttribute('data-skill') === skill) {
        el.remove();
        removed = true;
      }
    });

    if (!removed) {
      console.warn('Skill not found in preview:', skill);
    }
  } catch (error) {
    console.error('Error removing skill:', error);
    showErrorMessage('Failed to remove skill: ' + error.message);
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

  if (!downloadBtn || !cvDocument) {
    console.error('PDF download elements not found');
    return;
  }

  downloadBtn.addEventListener('click', function() {
    // Show loading state
    const loading = window.showLoading(this, 'Generating PDF...');

    // Get the CV content
    const content = cvDocument.cloneNode(true);

    // Create a temporary container
    const pdfContainer = document.createElement('div');
    pdfContainer.style.width = '210mm';
    pdfContainer.style.height = '297mm';
    pdfContainer.style.position = 'fixed';
    pdfContainer.style.top = '-9999px';
    pdfContainer.style.left = '-9999px';
    pdfContainer.style.zIndex = '-1';
    document.body.appendChild(pdfContainer);

    // Style the content for PDF
    content.style.width = '210mm';
    content.style.minHeight = '297mm';
    content.style.padding = '20mm';
    content.style.backgroundColor = 'white';
    content.style.margin = '0';
    content.style.boxSizing = 'border-box';
    content.style.transform = 'none';
    content.style.boxShadow = 'none';
    pdfContainer.appendChild(content);

    // Configure PDF options
    const opt = {
      filename: 'My_CV.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        foreignObjectRendering: true
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    // Generate PDF
    html2pdf()
      .from(pdfContainer)
      .set(opt)
      .save()
      .then(() => {
        loading.done('Downloaded!', 1500);
        showDownloadSuccessMessage();
        // Clean up
        if (pdfContainer && pdfContainer.parentNode) {
          pdfContainer.parentNode.removeChild(pdfContainer);
        }
      })
      .catch(err => {
        console.error('PDF generation failed:', err);
        loading.done('Error', 1500);
        showErrorMessage('Failed to generate PDF. Please try again.');
        // Clean up
        if (pdfContainer && pdfContainer.parentNode) {
          pdfContainer.parentNode.removeChild(pdfContainer);
        }
      });
  });
}

// Test PDF Download
function initTestPDFDownload() {
  const downloadBtn = document.getElementById('download-test-pdf');
  const testContent = document.getElementById('test-pdf-content');

  if (!downloadBtn || !testContent) {
    console.error('Test PDF download elements not found');
    return;
  }

  downloadBtn.addEventListener('click', function() {
    console.log('Attempting to download test PDF...');
    try {
      // Add a small delay to ensure rendering is complete
      setTimeout(() => {
        // Create a temporary container for the test content
        const pdfContainer = document.createElement('div');
        pdfContainer.style.width = '210mm';
        pdfContainer.style.height = '297mm';
        pdfContainer.style.position = 'relative'; // Use relative or absolute instead of fixed off-screen
        // Remove top, left, and z-index to make it visible
        // pdfContainer.style.top = '-9999px';
        // pdfContainer.style.left = '-9999px';
        // pdfContainer.style.zIndex = '-1';
        pdfContainer.style.backgroundColor = 'white'; // Ensure background is white
        pdfContainer.style.padding = '20px'; // Add some padding
        document.body.appendChild(pdfContainer);

        // Clone the test content and append to the temporary container
        const contentToRender = testContent.cloneNode(true);
        pdfContainer.appendChild(contentToRender);


        html2pdf()
          .from(pdfContainer) // Generate from the temporary container
          .set({
            filename: 'Test_PDF.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          })
          .save()
          .then(() => {
            console.log('Test PDF downloaded successfully.');
            // Clean up the temporary container
            if (pdfContainer && pdfContainer.parentNode) {
              pdfContainer.parentNode.removeChild(pdfContainer);
            }
          })
          .catch(err => {
            console.error('Test PDF generation failed (promise catch):', err);
            // Clean up the temporary container on error
            if (pdfContainer && pdfContainer.parentNode) {
              pdfContainer.parentNode.removeChild(pdfContainer);
            }
          });
      }, 100); // 100ms delay
    } catch (error) {
      console.error('Test PDF generation failed (try-catch):', error);
    }
  });
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

// Show error message
function showErrorMessage(message) {
  const errorMessage = document.createElement('div');
  errorMessage.className = 'error-message';
  errorMessage.textContent = message;
  errorMessage.style.position = 'fixed';
  errorMessage.style.bottom = '20px';
  errorMessage.style.right = '20px';
  errorMessage.style.background = 'rgba(220, 38, 38, 0.9)';
  errorMessage.style.color = 'white';
  errorMessage.style.padding = '15px 20px';
  errorMessage.style.borderRadius = '8px';
  errorMessage.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
  errorMessage.style.zIndex = '1000';
  errorMessage.style.maxWidth = '300px';
  errorMessage.style.animation = 'slideIn 0.3s ease forwards';

  document.body.appendChild(errorMessage);

  setTimeout(() => {
    if (document.body.contains(errorMessage)) {
      errorMessage.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => {
        errorMessage.remove();
      }, 300);
    }
  }, 5000);
}