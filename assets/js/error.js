/**
 * @param {*} errorCode 
 * 
 * @author dev
 */
export function firebaseErrorHandler(error) {
    // console.log(error.code)
    switch (error.code) {
        case 'unavailable':
            displayMessage('Please check your internet connection. !', 'danger')
            break
        case 'resource-exhausted':
            displayMessage('Quota has exceeded. !', 'danger')
            // const firebaseConfig = {
            //     apiKey: "AIzaSyDtX4OWk4DBn5f_APfGcwiwI6qMXBCKfhk",
            //     authDomain: "myfireapp-8d543.firebaseapp.com",
            //     databaseURL: "https://myfireapp-8d543-default-rtdb.firebaseio.com",
            //     projectId: "myfireapp-8d543",
            //     storageBucket: "myfireapp-8d543.appspot.com",
            //     messagingSenderId: "484285304427",
            //     appId: "1:484285304427:web:54c53464c02f04a4646b2e"
            // };

            break
        default:
            displayMessage('Unknown Error occurred ! Please try again.', 'danger')
            console.log(error)
    }
}

/**
 * 
 * @param {*} message 
 * @param {*} type 
 * 
 * Toast message
 */
function displayMessage(message, type) {
    // Get the toast container element
    const toastContainer = document.querySelector(".toast-container");

    // Create a clone of the toast template
    const toast = document.querySelector(".toast").cloneNode(true);

    console.log(toast)
    // Set the success message
    toast.querySelector(".compare-note").innerHTML = message;

    //set text type  success/danger
    if (type === "danger") {
        toast.classList.remove("bg-success");
        toast.classList.add("bg-danger");
    } else {
        toast.classList.add("bg-success");
        toast.classList.remove("bg-danger");
    }

    // Append the toast to the container
    toastContainer.appendChild(toast);

    // Initialize the Bootstrap toast and show it
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    // Remove the toast after it's closed
    toast.addEventListener("hidden.bs.toast", function () {
        toast.remove();
    });
}