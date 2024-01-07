//------------------------Firebase Config-----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBPyEBGDaOFeWNI7HnYmRe1XMjTl39MEv0",
    authDomain: "mywebapp-a3d83.firebaseapp.com",
    databaseURL: "https://mywebapp-a3d83-default-rtdb.firebaseio.com",
    projectId: "mywebapp-a3d83",
    storageBucket: "mywebapp-a3d83.appspot.com",
    messagingSenderId: "575814516293",
    appId: "1:575814516293:web:65744a268567bbe7fced2c"
};

// Initialize firebase || gloabal var
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
var loggedIn = null

//get user snapshot cart(dependency)
function getUserSnapshot(uid) {
    const userRef = doc(firestore, 'learners', uid)
    // console.log('3')
    return new Promise((resolve, reject) => {
        resolve(getDoc(userRef))
    })
}


document.getElementById("signupForm").addEventListener("submit", submitForm);

//event for firstName validation
document.querySelector("#name").addEventListener("keyup", () => {
    if (!validateName(document.querySelector("#name").value)) {
        // Display an error message
        document.getElementById("nameError").textContent =
            "*Name must be at least 3 characters.";
    }
    else {
        document.getElementById("nameError").textContent = ''
    }
});

// Function to toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById("password");
    const passwordToggle = document.getElementById("passwordToggle");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        passwordToggle.classList.remove("fa-eye");
        passwordToggle.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = "password";
        passwordToggle.classList.remove("fa-eye-slash");
        passwordToggle.classList.add("fa-eye");
    }
}

// Add a click event listener to the password toggle icon
const passwordToggle = document.getElementById("passwordToggle");
if (passwordToggle) {
    passwordToggle.addEventListener("click", togglePasswordVisibility);
}

// Function to send verification email
async function sendVerificationEmail(email) {
    try {
        const actionCodeSettings = {
            // url: `https://laragrooming.com/post-signup-details.html?userId=${auth.currentUser.uid}`,
            url: `http://127.0.0.1:5500/post-signup-details.html?userId=${auth.currentUser.uid}`,
            handleCodeInApp: true,
        };

        await sendEmailVerification(auth.currentUser, actionCodeSettings);

        // Display verification message
        document.getElementById("verificationMessage").style.display = "block";
    } catch (error) {
        console.error('Error sending verification email:', error);
        displayMessage('Error sending verification email. Please try again later.', 'error');
    }
}

// Submit form
async function submitForm(e) {
    e.preventDefault();

    document.querySelector('#sub_btn').textContent = 'Signing up ...'
    document.querySelector('#sub_btn').disabled = true

    // Get values
    const name = getInputVal("name");
    // const lastName = getInputVal("lastName");
    // const countryCode = document.querySelector("countryCode").textContent;
    // const phoneNumber = getInputVal("phoneNumber");
    const email = getInputVal("email");
    const password = getInputVal("password");
    const role = "ROLE_LEARNER";

    // Perform validation
    const nameValid = validateName(name);
    // const phoneNumberValid = validatePhoneNumber(phoneNumber);
    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);

    // Display error
    displayError("nameError", nameValid, "Please enter a valid first name");
    // displayError("phoneNumberError", phoneNumberValid, "Please enter a valid phone number");
    displayError("emailError", emailValid, "Please enter a valid email");
    displayError("passWordError", passwordValid, "Please enter a valid password");


    // Send message values to Firestore
    if (
        nameValid &&
        // phoneNumberValid &&
        emailValid &&
        passwordValid
    ) {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Send verification email
            await sendVerificationEmail(email);

            // Display success message
            document.getElementById("verificationMessage").style.display = "block";
            document.querySelector('.form-container').style.display = 'none';

            const user = userCredential.user;
            // console.log(user);
            const uid = user.uid;

            // Save user data to Firestore
            const usersRef = collection(firestore, "learners");
            const userDocRef = doc(usersRef, uid);
            const encryptedPassword = encPass(password);
            // console.log(name)
            // console.log(lastName)
            // console.log(email)
            // console.log(phoneNumber)
            // console.log(password);

            await setDoc(userDocRef, {
                name: name,
                // lastName: lastName,
                // phoneNumber: phoneNumber,
                email: email,
                password: encryptedPassword,
                role: role,
            });

            document.querySelector('#sub_btn').textContent = 'Submit'
            // displayMessage("Signup Successful!", 'success')
            // await signInWithEmailAndPassword(auth, email, password)
            await signOut(auth)

            document.getElementById("signupForm").reset();
            document.querySelector('#sub_btn').disabled = false
            // setTimeout(() => {
            //     window.location.href = "login.html";
            // }, 2000);

        } catch (error) {
            // console.log("5")
            document.querySelector('#sub_btn').textContent = 'Submit'
            document.querySelector('#sub_btn').disabled = false
            console.error("Create user error:", error);
            if (error.code && error.code.startsWith("auth/")) {
                const errorCode = error.code.split('/')[1]
                if (errorCode === 'email-already-in-use') {
                    document.querySelector('#emailError').textContent = errorCode.split('-').join(' ')
                    document.querySelector('#sub_btn').textContent = 'Submit'
                    document.querySelector('#sub_btn').disabled = false
                }
                else {
                    document.querySelector('#sub_btn').textContent = 'Submit'
                    document.querySelector('#sub_btn').disabled = false
                    document.querySelector('#authError').textContent = error.message.match(/Firebase:(.*)\(auth\/.*\)/)[1];
                }
            }
        }
    }
    else {
        document.querySelector('#sub_btn').textContent = 'Submit'
        document.querySelector('#sub_btn').disabled = false
    }

}

function getInputVal(id) {
    return document.getElementById(id).value;
}

function encPass(password) {
    const secretKey = "yourSecretKey";
    const encryptPassword = CryptoJS.AES.encrypt(
        password,
        secretKey
    ).toString();
    // console.log(encryptPassword);
    return encryptPassword;
}

function validateName(name) {
    return name.length >= 3;
}

// function validatePhoneNumber(phoneNumber) {
//     const phoneNumberPattern = /^\d{10}$/;
//     return phoneNumberPattern.test(phoneNumber);
// }

function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Function to display error messages
function displayError(errorElementId, isValid, errorMessage) {
    const errorElement = document.getElementById(errorElementId);
    if (!isValid) {
        errorElement.textContent = errorMessage;
    } else {
        errorElement.textContent = "";
    }
}

//display message function
function displayMessage(message, type) {
    // Get the toast container element
    const toastContainer = document.querySelector(".toast-container");

    // Create a clone of the toast template
    const toast = document.querySelector(".toast").cloneNode(true);

    // Set the success message
    toast.querySelector(".toast-body").textContent = message;

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