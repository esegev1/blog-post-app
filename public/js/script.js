document.addEventListener('DOMContentLoaded', function() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const fileName = e.target.files[0]?.name || 'No file chosen';
            
            let fileNameDisplay = this.parentElement.querySelector('.file-name-display');
            
            if (!fileNameDisplay) {
                fileNameDisplay = document.createElement('div');
                fileNameDisplay.className = 'file-name-display';
                this.parentElement.appendChild(fileNameDisplay);
            }
            
            fileNameDisplay.textContent = fileName;
        });
    });
});

//Add event listener to submit button

// const submitButton = documemt.querySelector('post-form-submit');
// submitButton.addEventListener('submit')