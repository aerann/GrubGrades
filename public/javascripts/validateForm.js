 (function () {
      'use strict'

      bsCustomFileInput.init() //any custom file input on the change will have some js functionality 
    
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      const forms = document.querySelectorAll('.validated-form')
    
      // Loop over them and prevent submission
      Array.from(forms) //make an array out of forms
        .forEach(function (form) {
          form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
              event.preventDefault()
              event.stopPropagation()
            }
    
            form.classList.add('was-validated')
          }, false)
        })
    })()