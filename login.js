//------------------------Firebase Config-----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import {
    getFirestore,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    getDoc,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithPhoneNumber,
    RecaptchaVerifier,
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBPyEBGDaOFeWNI7HnYmRe1XMjTl39MEv0",
    authDomain: "mywebapp-a3d83.firebaseapp.com",
    databaseURL: "https://mywebapp-a3d83-default-rtdb.firebaseio.com",
    projectId: "mywebapp-a3d83",
    storageBucket: "mywebapp-a3d83.appspot.com",
    messagingSenderId: "575814516293",
    appId: "1:575814516293:web:65744a268567bbe7fced2c"
};

//global var
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
// let signingIn = false
// let userExist = false

// function render() {
//     window.recaptchaVerifier = new RecaptchaVerifier(auth, 'send_btn', {
//         'size': 'invisible',
//         'callback': (response) => {
//             // reCAPTCHA solved, allow signInWithPhoneNumber.
//             console.log("from callback")
//         }
//     });
//     window.recaptchaVerifier.render();
// }

// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         console.log("if")
//         // User is already logged in, redirect to user page
//         if (!signingIn) window.location.href = "user.html";
//     } else {
//         render();
//     }
// });

// Add event listener for radio buttons
// const phoneRadio = document.getElementById("phoneRadio");
// const emailPasswordRadio = document.getElementById("emailPasswordRadio");

// phoneRadio.addEventListener("change", () => {
//     document.querySelector('.container-phoneNumber').style.display = 'block';
//     document.querySelector('.container-emailPassword').style.display = 'none';
// });

// emailPasswordRadio.addEventListener("change", () => {
//     document.querySelector('.container-phoneNumber').style.display = 'none';
//     document.querySelector('.container-emailPassword').style.display = 'block';
// });

// function signin() {
//     document.getElementById('send_btn').disabled = true;
//     document.getElementById('send_btn').innerHTML = '<span class="loading-spinner"></span>';
//     const countryCode = document.getElementById("countryCode").value;
//     const phoneNumberInput = document.getElementById("phoneNumber").value;

//     // Show loading spinner
//     const loadingSpinner = document.querySelector('.loading-spinner');
//     if (loadingSpinner) {
//         loadingSpinner.style.display = 'inline-block';
//     }

//     const phoneNumber = countryCode + phoneNumberInput;

//     // Check if the phone number is already registered
//     checkPhoneNumberExists(phoneNumber)
//         .then((exists) => {
//             if (exists) {
//                 // Phone number exists, proceed with sending OTP
//                 const appVerifier = window.recaptchaVerifier;
//                 signInWithPhoneNumber(auth, phoneNumber, appVerifier)
//                     .then(async (confirmationResult) => {
//                         // Store confirmationResult globally for later use
//                         window.confirmationResult = confirmationResult;
//                         console.log('OTP Sent');
//                         displayMessage("OTP Sent Successfully!", "success");
//                         document.getElementById('send_btn').disabled = false;
//                         document.getElementById('send_btn').textContent = 'Send OTP';

//                         // Hide loading spinner
//                         if (loadingSpinner) {
//                             loadingSpinner.style.display = 'none';
//                         }

//                         // Show the OTP verification UI
//                         showVerificationUI();
//                     })
//                     .catch((error) => {
//                         // Error; SMS not sent
//                         console.error(error);
//                         displayMessage("Error in sending OTP", "danger");
//                         document.getElementById("phoneNumber").value = "";
//                         document.getElementById('send_btn').disabled = true;
//                         document.getElementById('send_btn').textContent = 'Send OTP';

//                         // Hide loading spinner
//                         if (loadingSpinner) {
//                             loadingSpinner.style.display = 'none';
//                         }
//                     });
//             } else {
//                 // Phone number does not exist in the database
//                 displayMessage("Phone number not registered. Please sign up.", "danger");
//                 document.getElementById('send_btn').disabled = false;
//                 document.getElementById('send_btn').textContent = 'Send OTP';
//             }
//         })
//         .catch((error) => {
//             console.error("Error checking phone number:", error);
//         });
// }

// Disable the Send OTP button initially
// document.getElementById('send_btn').disabled = true;

// document.getElementById('phoneNumber').addEventListener('input', function () {
//     const phoneNumberInput = this.value;
//     const sendBtn = document.getElementById('send_btn');
//     sendBtn.disabled = phoneNumberInput.length !== 10 || !(/^\d+$/.test(phoneNumberInput));

//     // If the Phone Number is valid, enable the Send OTP button
//     if (phoneNumberInput.length === 10 && /^\d+$/.test(phoneNumberInput)) {
//         sendBtn.disabled = false;
//     }
// });

// function showVerificationUI() {
//     // Hide the phone number input and show the OTP input form
//     document.querySelector('.container-phoneNumber').style.display = 'none';
//     document.querySelector('.container-otp').style.display = 'block';

//     // Disable the Submit button initially
//     document.getElementById('sub_btn1').disabled = true;

//     // Start the 30-second timer for OTP resend
//     startResendOTPTimer();
// }

// let resendOTPTimer;

// function startResendOTPTimer() {
//     let secondsLeft = 30;

//     function updateTimer() {
//         updateResendOTPTimer(secondsLeft);

//         if (secondsLeft <= 0) {
//             clearInterval(resendOTPTimer);
//             document.getElementById('resend_otp').disabled = false;
//         } else {
//             secondsLeft--;
//         }
//     }

//     // Initial call to display the initial time
//     updateTimer();

//     // Update the timer every second
//     resendOTPTimer = setInterval(updateTimer, 1000);
// }

// function updateResendOTPTimer(secondsLeft) {
//     const timerElement = document.getElementById('otp_timer');

//     if (secondsLeft > 0) {
//         timerElement.textContent = `Resend OTP in ${secondsLeft} seconds`;
//     } else {
//         timerElement.textContent = ''; // Clear the timer display
//     }
// }

// document.getElementById('send_btn').addEventListener('click', (e) => {
//     e.preventDefault();
//     signin();
//     // showOrHideForm();
// });

// document.getElementById('resend_otp').addEventListener('click', (e) => {
//     e.preventDefault();

//     // Disable the resend button and start the timer again
//     document.getElementById('resend_otp').disabled = true;
//     startResendOTPTimer();

//     // Resend the OTP logic
//     const countryCode = document.getElementById("countryCode").value;
//     const phoneNumberInput = document.getElementById("phoneNumber").value;
//     const phoneNumber = countryCode + phoneNumberInput;
//     const appVerifier = window.recaptchaVerifier;

//     signInWithPhoneNumber(auth, phoneNumber, appVerifier)
//         .then(async (confirmationResult) => {
//             // Store confirmationResult globally for later use
//             window.confirmationResult = confirmationResult;
//             console.log('New OTP Sent');
//             displayMessage("New OTP Sent Successfully!", "success");
//         })
//         .catch((error) => {
//             // Error; SMS not sent
//             console.error(error);
//             displayMessage("Error in sending new OTP", "danger");
//         });
// });

// document.getElementById('verify-otp').addEventListener('input', function () {
//     const otpInput = this.value;

//     // Enable/disable the submit button based on OTP input length
//     const submitBtn = document.getElementById('sub_btn1');
//     submitBtn.disabled = otpInput.length !== 6 || !(/^\d+$/.test(otpInput));

//     // If the OTP is valid, enable the Submit button
//     if (otpInput.length === 6 && /^\d+$/.test(otpInput)) {
//         submitBtn.disabled = false;
//     }
// });

// document.getElementById('sub_btn1').addEventListener('click', (e) => {
//     e.preventDefault();
//     const code = document.getElementById("verify-otp").value;
//     verifyOtp(code);
// });

// function verifyOtp(code) {
//     signingIn = true
//     document.getElementById('sub_btn1').disabled = true;
//     document.getElementById('sub_btn1').textContent = 'Verifying OTP ...';
//     // Use the stored confirmationResult to confirm the OTP
//     confirmationResult.confirm(code)
//         .then(async (result) => {
//             // User signed in successfully.
//             const user = result.user;
//             console.log(user);
//             displayMessage("OTP Verified. Logging in...", "success");
//             document.getElementById('sub_btn1').disabled = false;
//             document.getElementById('sub_btn1').textContent = 'Submit';

//             // // Update the user's phone number in Firestore
//             // const uid = user.uid;
//             // const phoneNumber = user.phoneNumber;

//             // // Reference to the user document in Firestore
//             // const userDocRef = doc(firestore, 'learners', uid);

//             // // Check if the user document exists
//             // const userDocSnapshot = await getDoc(userDocRef);

//             // if (userDocSnapshot.exists()) {
//             //     // User document exists, update the phone number
//             //     await updateDoc(userDocRef, {
//             //         phoneNumber: phoneNumber,
//             //     });
//             // } else {
//             //     // User document does not exist, create a new one
//             //     // await setDoc(userDocRef, {
//             //     //     phoneNumber: phoneNumber,
//             //     //     firstName: firstName,
//             //     //     lastName: lastName,
//             //     //     email: email
//             //     // });
//             // }

//             // Clear the phone number and OTP fields
//             document.getElementById("phoneNumber").value = "";
//             document.getElementById("verify-otp").value = "";
//             signingIn = false
//             window.location.href = "user.html";
//         })
//         .catch((error) => {
//             console.log("Error in verify OTP", error);
//             displayMessage("Error in verifying OTP", "danger");
//             document.getElementById('sub_btn1').disabled = false;
//             document.getElementById('sub_btn1').textContent = 'Submit';
//         });
// }

// async function checkPhoneNumberExists(phoneNumber) {
//     const userSnapshot = await getDocs(query(collection(firestore, 'learners'), where('phoneNumber', '==', phoneNumber)));
//     return !userSnapshot.empty;
// }

document.addEventListener("DOMContentLoaded", function () {
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

    const passwordToggle = document.getElementById("passwordToggle");
    if (passwordToggle) {
        passwordToggle.addEventListener("click", togglePasswordVisibility);
    }

    function saveLoginCredentials(email) {
        localStorage.setItem("rememberedEmail", email);
    }

    function getRememberedCredentials() {
        const rememberedEmail = localStorage.getItem("rememberedEmail");
        if (rememberedEmail) {
            document.getElementById("email").value = rememberedEmail;
            document.getElementById("rememberMe").checked = true;
        }
    }

    function rememberMe() {
        if (document.getElementById("rememberMe").checked) {
            const email = document.getElementById("email").value;
            saveLoginCredentials(email);
        }
        else {
            localStorage.removeItem("rememberedEmail");
        }
    }

    getRememberedCredentials();
    async function detectUserRole(email) {
        // console.log(email);
        const usersRef = collection(firestore, "learners");
        try {
            const querySnapshot = await getDocs(query(usersRef, where("email", "==", email)));

            // console.log(querySnapshot.empty);

            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    // console.log(doc.data());
                    const role = doc.data().role;
                    console.log(role);
                    // Redirect the user based on their role
                    if (role === "ROLE_ADMIN") {
                        window.location.href = "admin-dash.html";
                        window.history.replaceState({}, "", "admin-dash.html");
                    } else if (role === "ROLE_LEARNER") {
                        window.location.href = "user.html";
                        window.history.replaceState({}, "", "user.html");
                    } else if (role === "ROLE_TPO") {
                        window.location.href = "tpo-dash.html";
                        window.history.replaceState({}, "", "tpo-dash.html");
                    }
                });
            }
            else {
            }
        } catch (error) {
            console.error("Error getting documents: ", error);
        }
    }


    async function loginUser(email, password) {

        // console.log(email, password)
        // const decryptedPassword = decPass(password);
        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                // display message
                document.querySelector('#sub_btn').textContent = 'Submit'
                displayMessage('Login Successful!', 'success')
                // User successfully signed in
                rememberMe();
                const user = userCredential.user;
                // console.log(user)


                // Reset the form
                const loginForm = document.getElementById("loginForm");
                loginForm.reset();
                document.querySelector('#sub_btn').disabled = false
                detectUserRole(email);

            })
            .catch((error) => {
                const authError = document.getElementById("loginError");
                console.error(error)
                if (error.code && error.code.startsWith("auth/")) {
                    const errorCode = error.code.split("/")[1];
                    if (errorCode === 'wrong-password') {
                        authError.textContent = 'Bad Credentials';
                    }
                    else if (errorCode === 'missing-password')
                        authError.textContent = 'Bad Credentials';
                    else
                    authError.innerHTML = errorCode.split('-').join(' ') + '<br>' + error.message.match(/Firebase:(.*)\(auth\/.*\)/)[1];
                } else {
                    authError.textContent = "An error occurred. Please try again later.";
                }
                authError.style.display = "block";

                document.querySelector('#sub_btn').disabled = false
                document.querySelector('#sub_btn').textContent = 'Submit'
            });
    }

    function showLoginForm() {
        const loginForm = document.getElementById("loginForm");
        const forgotPasswordForm =
            document.getElementById("forgotPasswordForm");

        loginForm.style.display = "block";
        forgotPasswordForm.style.display = "none";
    }

    const backToLoginButton = document.getElementById("backToLoginButton");
    backToLoginButton.addEventListener("click", (e) => {
        e.preventDefault();
        showLoginForm();
    });

    const loginForm = document.getElementById("formContainer");
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        document.querySelector('#sub_btn').disabled = true
        document.querySelector('#sub_btn').textContent = 'Logging in ...'
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // console.log("1")
        loginUser(email, password);
        // console.log("2")
    });

    function showForgotPasswordForm() {
        const loginForm = document.getElementById("loginForm");
        const forgotPasswordForm = document.getElementById("forgotPasswordForm");

        loginForm.style.display = "none";
        forgotPasswordForm.style.display = "block";
    }

    const forgotPasswordLink =
        document.getElementById("forgotPasswordLink");
    forgotPasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        showForgotPasswordForm();
    });

    const forgotPasswordSubmitButton = document.getElementById(
        "forgotPasswordSubmit"
    );
    forgotPasswordSubmitButton.addEventListener("click", (e) => {
        e.preventDefault();
        forgotPasswordSubmitButton.textContent = 'Sending Link ...'
        forgotPasswordSubmitButton.disabled = true
        const forgotEmail = document.getElementById("forgotEmail").value;
        sendPasswordResetEmail(auth, forgotEmail)
            .then(() => {
                // Password reset email sent successfully
                displayMessage('Password reset link sent successfully to your email!', 'success')

                forgotPasswordSubmitButton.textContent = 'Submit'
                forgotPasswordSubmitButton.disabled = false
                document.getElementById("forgotEmail").value = "";
            })
            .catch((error) => {
                displayMessage('Please enter your registered email!', 'danger')

                forgotPasswordSubmitButton.textContent = 'Submit'
                forgotPasswordSubmitButton.disabled = false
                document.getElementById("forgotEmail").value = "";
            });
    });
});

// async function showOrHideForm() {
//     console.log("from showorhide")
//     const countryCode = document.getElementById("countryCode").value;
//     const phoneNumberInput = document.getElementById("phoneNumber").value;
//     const phoneNumber = countryCode + phoneNumberInput;
//     const userSnapshot = await getDocs(query(collection(firestore, 'learners',), where('phoneNumber', '==', phoneNumber)))

//     console.log(userSnapshot.empty)
//     console.log(phoneNumber)
//     if (userSnapshot.empty) {
//         document.querySelector('.form').classList.remove('d-none')
//         userExist = false
//     }
//     else {
//         document.querySelector('.form').classList.add('d-none')
//         userExist = true
//     }

// }

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