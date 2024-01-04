//------------------------Firebase Config-----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    getStorage,
    deleteObject
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js";

import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    setDoc,
    onSnapshot,
    addDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

import {
    getAuth,
    signOut,
    onAuthStateChanged,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBPyEBGDaOFeWNI7HnYmRe1XMjTl39MEv0",
    authDomain: "mywebapp-a3d83.firebaseapp.com",
    databaseURL: "https://mywebapp-a3d83-default-rtdb.firebaseio.com",
    projectId: "mywebapp-a3d83",
    storageBucket: "mywebapp-a3d83.appspot.com",
    messagingSenderId: "575814516293",
    appId: "1:575814516293:web:65744a268567bbe7fced2c"
};

//global
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
var userData = null;
var loggedIn = null;


/**
 * logout btn event listenser
 * @author mydev
 */
confirmLogoutBtn.addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            console.log("User logged out successfully");
            window.location.href = "login.html";
        })
        .catch((error) => {
            console.error("Error during logout:", error);
        });
});


/**
 * validation phone number
 * @author mydev
 */
// document.querySelector("#phone").addEventListener("keyup", () => {
//     if (!isValidPhoneNumber(document.querySelector("#phone").value)) {
//         document.getElementById("phoneError").textContent =
//             "*Phone number must be 10 digits.";
//         document.getElementById("phoneError").style.scale = "1"
//     } else {
//         document.getElementById("phoneError").textContent = "";
//     }
// });

/**
 * validation name of the user
 * @author mydev
 */
document.querySelector("#displayName").addEventListener("keyup", () => {
    if (!isValidName(document.querySelector("#displayName").value)) {
        document.getElementById("nameError").textContent =
            "*Name must be at least 3 characters.";
    }
    else {
        document.getElementById("nameError").textContent = ''
    }
});

/**
 * validation password
 * @author mydev
 */
document.querySelector("#newPassword").addEventListener("keyup", () => {
    if (!isValidPassword(document.querySelector("#newPassword").value)) {
        document.getElementById("passwordError").textContent =
            "*Password must be atleast 6 characters."
    }
    else {
        document.getElementById("passwordError").textContent = ''
    }
});

/**
 * Use onAuthStateChanged to control access to admin dashboard
 * @author mydev
 */
onAuthStateChanged(auth, (user) => {

    console.log("auth")
    if (user) {
        console.log("if")
        loggedIn = true
        onLoggedIn();

        userDisplayMessage();
        const docRef = doc(firestore, "learners", user.uid);
        console.log(user.uid)
        const docSnap = getDoc(docRef);
        docSnap.then((docSnapshot) => {
            if (docSnapshot.exists()) {
                userData = docSnapshot.data();
                roleAccess(userData.role);
                populateShownDetails();
                populateProfileData(userData);
                getUserRealTime();
                stopLoader();
            }
        });
    }
    else {
        console.log("else")
        window.location.href = "login.html";
    }
});

/**
 * 
 * @param {user role} role 
 */
function roleAccess(role) {
    const roleMap = new Map([
        ["ROLE_ADMIN", "userAppbar"],
        ["ROLE_LEARNER", "userAppbar"],
        ["ROLE_TPO", "tpoAppbar"],
    ]);
    const appbarList = document.querySelectorAll(`#${roleMap.get(role)}`);
    appbarList.forEach((appbar) => {
        appbar.classList.remove("d-none");
    })
}

/**
 * after login 
 * @author mydev
 */
function onLoggedIn() {
    var navItemList = document.querySelectorAll(".loggedIn");
    navItemList.forEach((navItem) => {
        navItem.style.display = "block";
    });

    navItemList = document.querySelectorAll(".loggedOut");
    navItemList.forEach((navItem) => {
        navItem.style.display = "none";
    });
}

/**
 * to execute upon logging out
 * @author mydev
 */
function onLoggedOut() {
    var navItemList = document.querySelectorAll(".loggedOut");
    navItemList.forEach((navItem) => {
        navItem.style.display = "block";
    });

    navItemList = document.querySelectorAll(".loggedIn");
    navItemList.forEach((navItem) => {
        navItem.style.display = "none";
    });
}

/**
 * stop the loader show the main body
 * @author mydev
 */
function stopLoader() {
    document.querySelector("#overlay").classList.add("hidden");
    document.querySelector("#main").classList.remove("hidden");
}

/**
 * populate the user data
 * @param {*} userData 
 */
function populateProfileData(userData) {
    document.getElementById("displayName").value =
        userData.name || "";
    document.getElementById("email").value = userData.email || "";
    // document.getElementById("phone").value = userData.phoneNumber || "";
}


/**
 * populate the user details in the user profile section
 * @author mydev
 */
function populateShownDetails() {
    if (userData) {
        const shownProfilePicture = document.getElementById("shown-profilePicture");
        shownProfilePicture.src = userData.profilePicture || "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp";
    }
}

/**
 * real update the selected profile pic
 * @author mydev
 */
document.getElementById("profilePicture").addEventListener("change", handleProfilePictureChange);
function handleProfilePictureChange() {
    const profilePictureInput = document.getElementById("profilePicture");
    const shownProfilePicture = document.getElementById("shown-profilePicture");

    const file = profilePictureInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            shownProfilePicture.src = e.target.result;
        };

        reader.readAsDataURL(file);
    } else {
        shownProfilePicture.src =
            "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp";
    }
}

/**
 * save profile with profile image
 * @author mydev
 */
document.getElementById("saveProfileChangesBtn").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (user) {
        document.querySelector('#saveProfileChangesBtn').disabled = true
        document.querySelector('#saveProfileChangesBtn').textContent = 'Updating Profile....'
        const name = document.getElementById("displayName").value;
        // const phone = document.getElementById("phone").value;
        const email = document.getElementById("email").value;
        const profilePictureInput = document.getElementById("profilePicture");
        const profilePictureFile = profilePictureInput.files[0];

        if (!isValidName(name)) {
            document.querySelector('#saveProfileChangesBtn').disabled = false
            document.querySelector('#saveProfileChangesBtn').textContent = 'Save Changes'
            displayMessage('Please check your entered values!', 'danger')
            return;
        }

        if (profilePictureFile) {
            const storageRef = ref(storage, "avatars/" + user.uid + '.' + 'jpeg');
            const uploadTask = await uploadBytes(storageRef, profilePictureFile);
            const url = await getDownloadURL(uploadTask.ref)
            const userJson = {
                name: name,
                // lastName: lastName,
                // phoneNumber: phone,
                email: email,
                profilePicture: url,
            };
            saveUserProfile(user.uid, userJson);
        }
        else {
            const userJson = {
                name: name,
                // lastName: lastName,
                // phoneNumber: phone,
                email: email,
            };
            saveUserProfile(user.uid, userJson);
        }
    }
});

/**
 * save user profile along pic url
 * @param {*} uid 
 * @param {*} profileData 
 */
async function saveUserProfile(uid, profileData) {
    const docRef = doc(firestore, "learners", uid);
    setDoc(docRef, profileData, { merge: true })
        .then(async () => {
            displayMessage("Profile updated successfully!", "success");
            console.log("Profile updated successfully");

            document.querySelector('#saveProfileChangesBtn').disabled = false;
            document.querySelector('#saveProfileChangesBtn').textContent = 'Save Changes';
            userData = await getUpdatedUserData();
            populateShownDetails();
        })
        .catch((error) => {
            displayMessage("Error updating profile. Please try again.", "danger");
            document.querySelector('#saveProfileChangesBtn').disabled = false
            document.querySelector('#saveProfileChangesBtn').textContent = 'Save Changes'

            console.error("Error updating profile:", error);
        });
}

/**
 * change password or update password
 * @author mydev
 */
document.getElementById("changePasswordBtn").addEventListener("click", () => {
    document.querySelector('#changePasswordBtn').disabled = true
    document.querySelector('#changePasswordBtn').textContent = 'Updating Password....'
    const user = auth.currentUser;
    if (user) {
        const currentPassword =
            document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmNewPassword =
            document.getElementById("confirmNewPassword").value;
        if (currentPassword === newPassword) {
            displayMessage(
                "Current password and new password should not be the same.",
                "danger"
            );
            document.querySelector('#changePasswordBtn').disabled = false
            document.querySelector('#changePasswordBtn').textContent = 'Change Password'
            return;
        }

        if (newPassword !== confirmNewPassword) {
            displayMessage(
                "New password and confirm new password do not match.",
                "danger"
            );
            document.querySelector('#changePasswordBtn').disabled = false
            document.querySelector('#changePasswordBtn').textContent = 'Change Password'
            return;
        }
        // function call
        updatePasswordFn(user, currentPassword, newPassword);
        const changePasswordModal = new bootstrap.Modal(
            document.getElementById("changePasswordModalLabel")
        );
        changePasswordModal.hide();
    }
});

/**
 * update password 
 * @param {*} user 
 * @param {*} currentPassword 
 * @param {*} newPassword 
 * @returns 
 */
function updatePasswordFn(user, currentPassword, newPassword) {
    if (!isValidPassword(document.querySelector("#newPassword").value)) return;
    const credentials = EmailAuthProvider.credential(
        user.email,
        currentPassword
    );

    reauthenticateWithCredential(user, credentials).then(() => {
        updatePassword(user, newPassword)
            .then(() => {
                displayMessage("Password updated successfully!", "success");
                document.querySelector('#changePasswordBtn').disabled = false
                document.querySelector('#changePasswordBtn').textContent = 'Change Password'
                const changePasswordModal = new bootstrap.Modal(
                    document.getElementById("changePasswordModalLabel")
                );
                changePasswordModal.hide();
            })
            .catch((error) => {
                console.error("Error updating password:", error);
                displayMessage(
                    "Error updating password. Please try again.",
                    "danger"
                );
                document.querySelector('#changePasswordBtn').disabled = false
                document.querySelector('#changePasswordBtn').textContent = 'Change Password'
            });
    })
        .catch((error) => {
            console.error("Error reauthenticating user:", error);
            displayMessage(
                "Error reauthenticating user. Please check your current password.",
                "danger"
            );
            document.querySelector('#changePasswordBtn').disabled = false
            document.querySelector('#changePasswordBtn').textContent = 'Change Password'
        });
}

/**
 * toggle password input field 
 * @param {*} inputId 
 * @param {*} toggleBtnId 
 */
function togglePasswordVisibility(inputId, toggleBtnId) {
    const passwordInput = document.getElementById(inputId);
    const toggleBtn = document.getElementById(toggleBtnId);

    toggleBtn.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            toggleBtn.innerHTML = '<i class="fi-rr-eye-crossed"></i>';
        } else {
            passwordInput.type = "password";
            toggleBtn.innerHTML = '<i class="fi-rr-eye"></i>';
        }
    });
}

togglePasswordVisibility("currentPassword", "currentPasswordToggle");
togglePasswordVisibility("newPassword", "newPasswordToggle");

//------------------------- check user details and notify the to user--------------------------
/**
 * 
 */
async function checkUserAddressSchoolDocumentExists(userId){
    const userAddressCollectionRef = collection(firestore,'learners',userId,'useraddress');
    const userAddressSnapshot = await getDocs(userAdditionalCollectionRef);
    return !userAddressSnapshot;
}

/**
 * it checking the 10th class doc exists or not 
 * @param {*} userId 
 * @returns 
 */
async function checkUserSchoolDocumentExists(userId) {
    const userSchoolCollectionRef = collection(firestore, 'learners', userId, 'userschool');
    const userSchoolSnapshot = await getDocs(userSchoolCollectionRef);
    return !userSchoolSnapshot.empty;
}

// async function checkUserInterDocumentsExists(userId){
//     const userInterCollectionRef = collection(fir)
// }


// ------------------------------------------------------------------------------------

// ------------------ Display the message -------------------------------
function userDisplayMessage(){
     userAddressDisplayMsg();
     userSchoolDisplayMsg();
     userInterDisplayMsg();
     userDegreeDisplayMsg();
     userMastersDisplayMsg();
     userInternshipDisplayMsg();
     userAdditionalDisplayMsg()
} 

//---------------------------------- user Add or update section------------------------

/**
 * to hide the save address form 
 * @author mydev
 */
// document.querySelector('#address-accordion-btn').addEventListener('click',async(e)=>{
//     await showOrHideUserAddressForm();
// })

async function showOrHideUserAddressForm() {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (userId) {
        const addressExists = await checkAddressDocumentExists(userId);

        if (addressExists) {
            console.log("if")
            document.getElementById('user-address-form').style.display = 'none';
            document.querySelector('.address-message').style.display = 'block'
            document.getElementById('edit-user-address').style.display = 'block';
            document.querySelector('.address-message').textContent = 'Address Details Already Exists, Please Update the Address Details';
        } else {
            console.log("else")
            document.getElementById('user-address-form').style.display = 'block';
            document.querySelector('.address-message').style.display = 'block'
            document.getElementById('edit-user-address').style.display = 'none';
            document.querySelector('.address-message').textContent = 'Please Enter Address Details';
        }
    }
}

/**
 * it checking the address doc exists or not 
 * @param {*} userId 
 * @returns 
 */
async function checkAddressDocumentExists(userId) {
    const addressCollectionRef = collection(firestore, 'learners', userId, 'useraddress');
    const addressSnapshot = await getDocs(addressCollectionRef);
    return !addressSnapshot.empty;
}

/**
 * 
 * to display address message
 */
 async function userAddressDisplayMsg(){
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const userAddressDataExist = await checkAddressDocumentExists(userId);

    if(!userAddressDataExist){
        document.querySelector('.user-address-display-message').classList.remove('d-none');
        document.querySelector('.user-address-display-message').textContent = "Please fill your address details"
    }
    else{
        document.querySelector('.user-address-display-message').classList.add('d-none'); 
    }
}

/**
 * edit the address details
 * @author mydev
 */
const accordionAddressBtn = document.querySelector("#address-accordion-btn");
accordionAddressBtn.addEventListener('click', async () => {
    // Check if the accordion is currently collapsing (closing)
    if (!accordionAddressBtn.classList.contains('collapsed')) {
        const userId = auth.currentUser.uid;
        openUserAddressModel(userId);
    }
});

var userAddressDocId = null;
async function openUserAddressModel(userId) {
    const userAddressEdit = document.querySelector('#user-address');
    const userPostcodeEdit = document.querySelector('#user-postcode');
    const userCityEdit = document.querySelector('#user-city');
    const userStateEdit = document.querySelector('#user-state');
    const userCountryEdit = document.querySelector('#user-country');

    if (userId) {
        const userAddressCollectionRef = collection(firestore, 'learners', userId, 'useraddress');
        const userAddressSnapshot = await getDocs(userAddressCollectionRef);

        if (!userAddressSnapshot.empty) {
            userAddressDocId = userAddressSnapshot.docs[0].id
            const userAddressData = userAddressSnapshot.docs[0].data();
            userAddressEdit.value = userAddressData.address || '';
            userPostcodeEdit.value = userAddressData.postcode || '';
            userCityEdit.value = userAddressData.city || '';
            userStateEdit.value = userAddressData.state || '';
            userCountryEdit.value = userAddressData.country || '';
        }
        else {
            console.log('No Address details found for the user, please fill the details');
            displayMessage('No Address details found for the user, please fill the details', 'danger');
        }
    }
    else {
        console.log('User ID is required');
        displayMessage('User ID is required', 'danger')
    }
}

document.getElementById('save-user-address-button').addEventListener('click', async function () {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const userAddressEdit = document.querySelector('#user-address').value;
    const userPostcodeEdit = document.querySelector('#user-postcode').value;
    const userCityEdit = document.querySelector('#user-city').value;
    const userStateEdit = document.querySelector('#user-state').value;
    const userCountryEdit = document.querySelector('#user-country').value;

    if(userAddressEdit && userPostcodeEdit && userCityEdit && userStateEdit && userCountryEdit){

        if (userId) {
            const userAddressCollectionRef = collection(firestore, 'learners', userId, 'useraddress');
            const userAddressSnapshot = await getDocs(userAddressCollectionRef);

            if(!userAddressSnapshot.empty){
                userAddressSnapshot.forEach(async(document)=>{
                    const userAddressData = document.data();

                    const userAdditionalDocRef = doc(firestore, 'learners', userId, 'useraddress',document.id)
                    await updateDoc(userAdditionalDocRef,{
                        address:userAddressEdit,
                        postcode:userPostcodeEdit,
                        city: userCityEdit,
                        state: userStateEdit,
                        country:userCountryEdit
                    })
                    console.log('User Address details updated successfully');
                    displayMessage('User Address details updated successfully', 'success');
                    openUserAddressModel(userId)
                    await userAddressDisplayMsg()
                })
            }
            else{
                const userAddressDocRef = await addDoc(userAddressCollectionRef,{
                    address:userAddressEdit,
                    postcode:userPostcodeEdit,
                    city: userCityEdit,
                    state: userStateEdit,
                    country:userCountryEdit
                })
                console.log('User Address details saved successfully');
                displayMessage('User Address details saved successfully', 'success');
                await updateDoc(userAddressDocRef,{userAddressId : userAddressDocRef.id});
                openUserAddressModel(userId);
                await userAddressDisplayMsg()
            }
    
        } else {
            console.log('User is not authenticated');
            displayMessage('User is not authenticated', 'danger');
        }
    }
    else {
        console.log('please fill all the details');
        displayMessage('please fill all the details', 'danger');
    }
});
//---------------------------------------------------------------------------------------------------


//------------------------------------ School Details ---------------------------------------------------
/**
 * it checking the user school doc exists or not 
 * @param {*} userId 
 * @returns 
 */
async function checkSchoolDocumentExists(userId) {
    const userschoolCollectionRef = collection(firestore, 'learners', userId, 'userschool');
    const userSchoolSnapshot = await getDocs(userschoolCollectionRef);
    return !userSchoolSnapshot.empty;
}

/**
 * 
 * to display school edu details message
 */
async function userSchoolDisplayMsg(){
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const userSchoolDataExist = await checkSchoolDocumentExists(userId);

    if(!userSchoolDataExist){
        document.querySelector('.user-school-display-message').classList.remove('d-none');
        document.querySelector('.user-school-display-message').textContent = "Please fill your school education details"
    }
    else{
        document.querySelector('.user-school-display-message').classList.add('d-none'); 
    }
}


/**
 * edit or update the 10th class details;
 * @author mydev
 */
const accordionSchoolBtn = document.querySelector("#user-school-accordion-btn");
accordionSchoolBtn.addEventListener('click', async () => {
    console.log('1')
    // Check if the accordion is currently collapsing (closing)
    if (!accordionSchoolBtn.classList.contains('collapsed')) {
        const userId = auth.currentUser.uid;
        openUserSchoolModel(userId);
    }
});

var userSchoolDocId = null;
async function openUserSchoolModel(userId) {
    console.log("3")
    const userSchoolBoardEdit = document.querySelector('#school-board');
    const userSchoolNameEdit = document.querySelector('#school-name');
    const userSchoolCityEdit = document.querySelector('#school-education-city');
    const userSchoolStateEdit = document.querySelector('#school-education-state');
    const userSchoolStartDateEdit = document.querySelector('#school-education-sDate');
    const userSchoolEndDateEdit = document.querySelector('#school-education-eDate');
    const userSchoolPercentageEdit = document.querySelector('#school-education-percentage');
    const userSchoolCertificateEdit = document.querySelector('#school-education-cert')


    if (userId) {
        const userSchoolCollectionRef = collection(firestore, 'learners', userId, 'userschool');
        const userSchoolSnapshot = await getDocs(userSchoolCollectionRef);

        if (!userSchoolSnapshot.empty) {
            userSchoolDocId = userSchoolSnapshot.docs[0].id
            console.log(userSchoolDocId);
            const userSchoolData = userSchoolSnapshot.docs[0].data();
            // console.log(userSchoolData)
            const fileName = getFileNameFromUrl(userSchoolData.schoolCertificateImageUrl);
            console.log(fileName);
            userSchoolBoardEdit.value = userSchoolData.userSchoolBoard || '';
            userSchoolNameEdit.value = userSchoolData.userSchoolEducationName || '';
            userSchoolCityEdit.value = userSchoolData.userSchoolEducationCity || '';
            userSchoolStateEdit.value = userSchoolData.userSchoolEducationState || '';
            userSchoolStartDateEdit.value = userSchoolData.userSchoolStart || '';
            userSchoolEndDateEdit.value = userSchoolData.userSchoolEnd || '';
            userSchoolPercentageEdit.value = userSchoolData.userSchoolPercentage || '';
            // document.getElementById('school-cert-file-display').textContent = `Selected File: ${fileName}`;
            const fileLink = document.getElementById('school-cert-file-link');

            if (fileName) {
                fileLink.href = userSchoolData.schoolCertificateImageUrl;
                fileLink.textContent = `Selected File: ${fileName}`;
                fileLink.style.display = 'inline-block'; // Display the link
            } else {
                fileLink.style.display = 'none'; // Hide the link if there is no file
            }
        }
        else {
            console.log('No 10th class details found for the user, please fill the details');
            displayMessage('No 10th class details found for the user, please fill the details', 'danger');
        }
    }
    else {
        console.log('User ID is required');
        displayMessage('User ID is required', 'danger')
    }
}

document.getElementById('save-school-edu-button').addEventListener('click', async function () {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const userSchoolBoardEdit = document.querySelector('#school-board').value;
    const userSchoolNameEdit = document.querySelector('#school-name').value;
    const userSchoolCityEdit = document.querySelector('#school-education-city').value;
    const userSchoolStateEdit = document.querySelector('#school-education-state').value;
    const userSchoolStartDateEdit = document.querySelector('#school-education-sDate').value;
    const userSchoolEndDateEdit = document.querySelector('#school-education-eDate').value;
    const userSchoolPercentageEdit = document.querySelector('#school-education-percentage').value;
    const userSchoolCertificateEdit = document.querySelector('#school-education-cert')
    const userSchoolCertificateImageFileEdit = userSchoolCertificateEdit.files[0];
    const fileLink = document.getElementById('school-cert-file-link');
    const fileLinkContainer = document.getElementById('file-link-container');

    if (userSchoolCertificateEdit.files.length > 0) {
        fileLink.href = URL.createObjectURL(userSchoolCertificateImageFileEdit);
        fileLink.textContent = `Selected File: ${userSchoolCertificateImageFileEdit.name}`;
        fileLink.style.display = 'inline-block'; // Display the link
        fileLinkContainer.style.display = 'block';
    } else {
        fileLink.style.display = 'none'; // Hide the link if there is no file
        fileLinkContainer.style.display = 'none';
    }

    if (userSchoolBoardEdit && userSchoolNameEdit && userSchoolCityEdit && userSchoolStateEdit
        && userSchoolStartDateEdit && userSchoolEndDateEdit && userSchoolPercentageEdit) {

        if (!userId) {
            console.log('User is not authenticated');
            displayMessage('User is not authenticated', 'danger')
            return;
        }
        const userSchoolCollectionRef = collection(firestore, 'learners', userId, 'userschool');
        const userSchoolSnapshot = await getDocs(userSchoolCollectionRef);

        if (!userSchoolSnapshot.empty) {
            userSchoolSnapshot.forEach(async (document) => {
                const userData = document.data();
                if (userSchoolCertificateEdit.files.length > 0) {

                    console.log("if")
                    if (userData.certificateImageUrl) {
                        const fileName = getFileNameFromUrl(userData.schoolCertificateImageUrl);
                        console.log(fileName)
                        if (fileName) {
                            const storageRef = ref(storage, 'certificate_images/' + fileName);
                            await deleteObject(storageRef);
                        }
                    }

                    const storageRef = ref(storage, 'certificate_images/' + userSchoolCertificateImageFileEdit.name);
                    await uploadBytes(storageRef, userSchoolCertificateImageFileEdit);
                    const certificateImageUrl = await getDownloadURL(storageRef);

                    const userSchoolDocRef = doc(firestore, 'learners', userId, 'userschool', document.id)
                    await updateDoc(userSchoolDocRef,
                        {
                            userSchoolBoard: userSchoolBoardEdit,
                            userSchoolEducationName: userSchoolNameEdit,
                            userSchoolEducationCity: userSchoolCityEdit,
                            userSchoolEducationState: userSchoolStateEdit,
                            userSchoolStart: userSchoolStartDateEdit,
                            userSchoolEnd: userSchoolEndDateEdit,
                            userSchoolPercentage: userSchoolPercentageEdit,
                            schoolCertificateImageUrl: certificateImageUrl
                        });
                    console.log('User 10th Class details saved successfully');
                    displayMessage('User 10th Class details saved successfully', 'success');
                    openUserSchoolModel(userId)
                    await userSchoolDisplayMsg();
                }
                else {
                    console.log("else")
                    const userSchoolDocRef = doc(firestore, 'learners', userId, 'userschool', document.id)
                    await updateDoc(userSchoolDocRef,
                        {
                            userSchoolBoard: userSchoolBoardEdit,
                            userSchoolEducationName: userSchoolNameEdit,
                            userSchoolEducationCity: userSchoolCityEdit,
                            userSchoolEducationState: userSchoolStateEdit,
                            userSchoolStart: userSchoolStartDateEdit,
                            userSchoolEnd: userSchoolEndDateEdit,
                            userSchoolPercentage: userSchoolPercentageEdit,
                        });
                    console.log('User 10th Class details saved successfully');
                    displayMessage('User 10th Class details saved successfully', 'success');
                    openUserSchoolModel(userId)
                    await userSchoolDisplayMsg();
                }
            })

        }
        else {
            if(userSchoolCertificateEdit.files.length > 0){
                const storageRef = ref(storage, 'certificate_images/' + userSchoolCertificateImageFileEdit.name);
                await uploadBytes(storageRef, userSchoolCertificateImageFileEdit);
                const certificateImageUrl = await getDownloadURL(storageRef);
    
                const userSchoolDocRef = await addDoc(userSchoolCollectionRef,{
                    userSchoolBoard: userSchoolBoardEdit,
                    userSchoolEducationName: userSchoolNameEdit,
                    userSchoolEducationCity: userSchoolCityEdit,
                    userSchoolEducationState: userSchoolStateEdit,
                    userSchoolStart: userSchoolStartDateEdit,
                    userSchoolEnd: userSchoolEndDateEdit,
                    userSchoolPercentage: userSchoolPercentageEdit,
                    schoolCertificateImageUrl: certificateImageUrl
                })
                console.log('user 10th class details saved successfully');
                displayMessage('user 10th class details saved successfully', 'success');
                
                await updateDoc(userSchoolDocRef,{userSchoolId : userSchoolDocRef.id});
                openUserSchoolModel(userId);
                await userSchoolDisplayMsg();
            }
            else{
                console.log('Please fill the all fields');
                displayMessage('Please fill the all fields', 'danger');
            }
        }
    }
    else {
        console.log('Please fill all the details');
        displayMessage('Please fill all the details', 'danger');
    }
});
//--------------------------------------------------------------------------------------------------------


//-----------------------------------------Inter/12th Details-----------------------------------------------

/**
 * it checking the user inter/12th class doc exists or not 
 * @param {*} userId 
 * @returns 
 */
async function checkInterDocumentExists(userId) {
    const userInterCollectionRef = collection(firestore, 'learners', userId, 'userinter');
    const userInterSnapshot = await getDocs(userInterCollectionRef);
    return !userInterSnapshot.empty;
}

/**
 * 
 * to display inter/12th class edu details message
 */
async function userInterDisplayMsg(){
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const userInterDataExist = await checkInterDocumentExists(userId);

    if(!userInterDataExist){
        document.querySelector('.user-inter-display-message').classList.remove('d-none');
        document.querySelector('.user-inter-display-message').textContent = "Please fill your inter/12th class education details"
    }
    else{
        document.querySelector('.user-inter-display-message').classList.add('d-none'); 
    }
}

/**
 * edit or update the intermediate/12th details;
 * @author mydev
 */
const accordionInterBtn = document.querySelector("#user-inter-accordion-btn");
accordionInterBtn.addEventListener('click', async () => {
    console.log('1')
    // Check if the accordion is currently collapsing (closing)
    if (!accordionInterBtn.classList.contains('collapsed')) {
        const userId = auth.currentUser.uid;
        openUserInterModel(userId);
    }
});

var userInterDocId = null;
async function openUserInterModel(userId) {
    console.log("3")
    const userInterBoardEdit = document.querySelector('#inter-board');
    const userInterNameEdit = document.querySelector('#inter-college-name');
    const userInterCityEdit = document.querySelector('#inter-education-city');
    const userInterStateEdit = document.querySelector('#inter-education-state');
    const userInterStartDateEdit = document.querySelector('#inter-education-sDate');
    const userInterEndDateEdit = document.querySelector('#inter-education-eDate');
    const userInterPercentageEdit = document.querySelector('#inter-education-percentage');


    if (userId) {
        const userInterCollectionRef = collection(firestore, 'learners', userId, 'userinter');
        const userInterSnapshot = await getDocs(userInterCollectionRef);

        if (!userInterSnapshot.empty) {
            userInterDocId = userInterSnapshot.docs[0].id
            console.log(userInterDocId);
            const userInterData = userInterSnapshot.docs[0].data();
            const fileName = getFileNameFromUrl(userInterData.interCertificateImageUrl);
            console.log(userInterData);
            userInterBoardEdit.value = userInterData.userInterBoard || '';
            userInterNameEdit.value = userInterData.userInterEducationName || '';
            userInterCityEdit.value = userInterData.userInterEducationCity || '';
            userInterStateEdit.value = userInterData.userInterEducationState || ''
            userInterStartDateEdit.value = userInterData.userInterStart || '';
            userInterEndDateEdit.value = userInterData.userInterEnd || '';
            userInterPercentageEdit.value = userInterData.userInterPercentage || '';
            // document.getElementById('inter-cert-file-display').textContent = `Selected File: ${fileName}`;
            const fileLink = document.getElementById('inter-cert-file-link');

            if (fileName) {
                fileLink.href = userInterData.interCertificateImageUrl;
                fileLink.textContent = `Selected File: ${fileName}`;
                fileLink.style.display = 'inline-block'; // Display the link
            } else {
                fileLink.style.display = 'none'; // Hide the link if there is no file
            }
        }
        else {
            console.log('No Intermediate/12th details found for the user, please fill the details');
            displayMessage('No Intermediate/12th details found for the user, please fill the details', 'danger');
        }
    }
    else {
        console.log('User ID is required');
        displayMessage('User ID is required', 'danger')
    }
}

document.getElementById('save-inter-edu-button').addEventListener('click', async function () {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const userInterBoardEdit = document.querySelector('#inter-board').value;
    const userInterEducationNameEdit = document.querySelector('#inter-college-name').value;
    const userInterCityEdit = document.querySelector('#inter-education-city').value;
    const userInterStateEdit = document.querySelector('#inter-education-state').value;
    const userInterStartDateEdit = document.querySelector('#inter-education-sDate').value;
    const userInterEndDateEdit = document.querySelector('#inter-education-eDate').value;
    const userInterPercentageEdit = document.querySelector('#inter-education-percentage').value;
    const userInterCertificateEdit = document.querySelector('#inter-education-cert')
    const userInterCertificateImageFileEdit = userInterCertificateEdit.files[0];
    const fileLink = document.getElementById('inter-cert-file-link');
    const fileLinkContainer = document.getElementById('file-link-container');

    if (userInterCertificateEdit.files.length > 0) {
        fileLink.href = URL.createObjectURL(userInterCertificateImageFileEdit);
        fileLink.textContent = `Selected File: ${userInterCertificateImageFileEdit.name}`;
        fileLink.style.display = 'inline-block'; // Display the link
        fileLinkContainer.style.display = 'block';
    } else {
        fileLink.style.display = 'none'; // Hide the link if there is no file
        fileLinkContainer.style.display = 'none';
    }

    if (userInterBoardEdit && userInterEducationNameEdit && userInterCityEdit && userInterStartDateEdit
        && userInterStateEdit && userInterEndDateEdit && userInterPercentageEdit) {

        if (!userId) {
            console.log('User is not authenticated');
            displayMessage('User is not authenticated', 'danger')
            return;
        }
        const userInterCollectionRef = collection(firestore, 'learners', userId, 'userinter');
        const userInterSnapshot = await getDocs(userInterCollectionRef);

        if (!userInterSnapshot.empty) {
            userInterSnapshot.forEach(async (document) => {
                const userInterData = document.data();
                if (userInterCertificateEdit.files.length > 0) {

                    console.log("if")
                    if (userData.interCertificateImageUrl) {
                        const fileName = getFileNameFromUrl(userInterData.interCertificateImageUrl);
                        console.log(fileName)
                        if (fileName) {
                            const storageRef = ref(storage, 'inter_certificate_images/' + fileName);
                            await deleteObject(storageRef);
                        }
                    }

                    const storageRef = ref(storage, 'inter_certificate_images/' + userInterCertificateImageFileEdit.name);
                    await uploadBytes(storageRef, userInterCertificateImageFileEdit);
                    const certificateImageUrl = await getDownloadURL(storageRef);

                    const userInterDocRef = doc(firestore, 'learners', userId, 'userinter', document.id)
                    await updateDoc(userInterDocRef,
                        {
                            userInterBoard: userInterBoardEdit,
                            userInterEducationName: userInterEducationNameEdit,
                            userInterEducationCity: userInterCityEdit,
                            userInterEducationState: userInterStateEdit,
                            userInterStart: userInterStartDateEdit,
                            userInterEnd: userInterEndDateEdit,
                            userInterPercentage: userInterPercentageEdit,
                            interCertificateImageUrl: certificateImageUrl
                        });
                    console.log('User Intermediate/12th details saved successfully');
                    displayMessage('User Intermediate/12th details saved successfully', 'success');
                    openUserInterModel(userId)
                }
                else {
                    console.log("else")
                    const userInterDocRef = doc(firestore, 'learners', userId, 'userinter', document.id)
                    await updateDoc(userInterDocRef,
                        {
                            userInterBoard: userInterBoardEdit,
                            userInterEducationName: userInterEducationNameEdit,
                            userInterEducationCity: userInterCityEdit,
                            userInterEducationState: userInterStateEdit,
                            userInterStart: userInterStartDateEdit,
                            userInterEnd: userInterEndDateEdit,
                            userInterPercentage: userInterPercentageEdit,
                        });
                    console.log('User Intermediate/12th details saved successfully');
                    displayMessage('User Intermediate/12th details saved successfully', 'success');
                    openUserInterModel(userId)
                }
            })

        }
        else {
            if(userInterCertificateEdit.files.length > 0){
                const storageRef = ref(storage, 'inter_certificate_images/' + userInterCertificateImageFileEdit.name);
                await uploadBytes(storageRef, userInterCertificateImageFileEdit);
                const certificateImageUrl = await getDownloadURL(storageRef);
    
                const userInterDocRef = await addDoc(userInterCollectionRef,{
                    userInterBoard: userInterBoardEdit,
                    userInterEducationName: userInterEducationNameEdit,
                    userInterEducationCity: userInterCityEdit,
                    userInterEducationState: userInterStateEdit,
                    userInterStart: userInterStartDateEdit,
                    userInterEnd: userInterEndDateEdit,
                    userInterPercentage: userInterPercentageEdit,
                    interCertificateImageUrl: certificateImageUrl
                })
                console.log('intermediate/12th details not exist for the user');
                displayMessage('intermediate/12th details not exist for the user', 'success');
                
                await updateDoc(userInterDocRef,{userInterId : userInterDocRef.id});
                openUserInterModel(userId);
                await userInterDisplayMsg();
            }
            else{
                console.log('Please fill the all fields');
                displayMessage('Please fill the all fields', 'danger');
            }   
        }
    }
    else {
        console.log('Please fill all the details');
        displayMessage('Please fill all the details', 'danger');
    }
});
//-------------------------------------------------------------------------------------------------------


//--------------------------------------- Graduation Details---------------------------------------------

/**
 * it checking the user graduation doc exists or not 
 * @param {*} userId 
 * @returns 
 */
async function checkDegreeDocumentExists(userId) {
    const userDegreeCollectionRef = collection(firestore, 'learners', userId, 'userdegree');
    const userDegreeSnapshot = await getDocs(userDegreeCollectionRef);
    return !userDegreeSnapshot.empty;
}

/**
 * 
 * to display graduation edu details message
 */
async function userDegreeDisplayMsg(){
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const userDegreeDataExist = await checkDegreeDocumentExists(userId);

    if(!userDegreeDataExist){
        document.querySelector('.user-degree-display-message').classList.remove('d-none');
        document.querySelector('.user-degree-display-message').textContent = "Please fill your graduation details"
    }
    else{
        document.querySelector('.user-degree-display-message').classList.add('d-none'); 
    }
}

/**
 * edit or update the graduation/degree details;
 * @author mydev
 */
const accordionDegreeBtn = document.querySelector("#user-degree-accordion-btn");
accordionDegreeBtn.addEventListener('click', async () => {
    console.log('1')
    // Check if the accordion is currently collapsing (closing)
    if (!accordionDegreeBtn.classList.contains('collapsed')) {
        const userId = auth.currentUser.uid;
        openUserDegreeModel(userId);
    }
});

var userDegreeDocId = null;
async function openUserDegreeModel(userId) {
    console.log("3")
    const userDegreeBoardEdit = document.querySelector('#degree-board');
    const userDegreeEducationNameEdit = document.querySelector('#degree-college-name');
    const userDegreeSpeEdit =  document.querySelector('#degree-specialization-name');
    const userDegreeCityEdit = document.querySelector('#degree-education-city');
    const userDegreeStateEdit = document.querySelector('#degree-education-state');
    const userDegreeStartDateEdit = document.querySelector('#degree-education-sDate');
    const userDegreeEndDateEdit = document.querySelector('#degree-education-eDate');
    const userDegreePercentageEdit = document.querySelector('#degree-education-percentage');


    if (userId) {
        const userDegreeCollectionRef = collection(firestore, 'learners', userId, 'userdegree');
        const userDegreeSnapshot = await getDocs(userDegreeCollectionRef);

        if (!userDegreeSnapshot.empty) {
            userDegreeDocId = userDegreeSnapshot.docs[0].id
            console.log(userDegreeDocId);
            const userDegreeData = userDegreeSnapshot.docs[0].data();
            const fileName = getFileNameFromUrl(userDegreeData.degreeCertificateImageUrl);
            console.log(userDegreeData)
            userDegreeBoardEdit.value = userDegreeData.userDegreeBoard || '';
            userDegreeEducationNameEdit.value = userDegreeData.userDegreeEducationName || '';
            userDegreeSpeEdit.value = userDegreeData.userDegreeSpecialization || ''
            userDegreeCityEdit.value = userDegreeData.userDegreeEducationCity || '';
            userDegreeStateEdit.value = userDegreeData.userDegreeEducationState || '';
            userDegreeStartDateEdit.value = userDegreeData.userDegreeStart || '';
            userDegreeEndDateEdit.value = userDegreeData.userDegreeEnd || '';
            userDegreePercentageEdit.value = userDegreeData.userDegreePercentage || '';
            //  document.getElementById('degree-cert-file-display').textContent = `Selected File: ${fileName}`;
            const fileLink = document.getElementById('degree-cert-file-link');

            if (fileName) {
                fileLink.href = userDegreeData.degreeCertificateImageUrl;
                fileLink.textContent = `Selected File: ${fileName}`;
                fileLink.style.display = 'inline-block'; // Display the link
            } else {
                fileLink.style.display = 'none'; // Hide the link if there is no file
            }
        }
        else {
            console.log('No Graduation/Degree details found for the user, please fill the details');
            displayMessage('No Graduation/Degree details found for the user, please fill the details', 'danger');
        }
    }
    else {
        console.log('User ID is required');
        displayMessage('User ID is required', 'danger')
    }
}

document.getElementById('save-degree-edu-button').addEventListener('click', async function () {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const userDegreeBoardEdit = document.querySelector('#degree-board').value;
    const userDegreeEducationNameEdit = document.querySelector('#degree-college-name').value;
    const userDegreeSpeEdit =  document.querySelector('#degree-specialization-name').value
    const userDegreeCityEdit = document.querySelector('#degree-education-city').value;
    const userDegreeStateEdit = document.querySelector('#degree-education-state').value;
    const userDegreeStartDateEdit = document.querySelector('#degree-education-sDate').value;
    const userDegreeEndDateEdit = document.querySelector('#degree-education-eDate').value;
    const userDegreePercentageEdit = document.querySelector('#degree-education-percentage').value;
    const userDegreeCertificateEdit = document.querySelector('#degree-education-cert')
    const userDegreeCertificateImageFileEdit = userDegreeCertificateEdit.files[0];
    const fileLink = document.getElementById('degree-cert-file-link');
    const fileLinkContainer = document.getElementById('file-link-container');

    if (userDegreeCertificateEdit.files.length > 0) {
        fileLink.href = URL.createObjectURL(userDegreeCertificateImageFileEdit);
        fileLink.textContent = `Selected File: ${userDegreeCertificateImageFileEdit.name}`;
        fileLink.style.display = 'inline-block'; // Display the link
        fileLinkContainer.style.display = 'block';
    } else {
        fileLink.style.display = 'none'; // Hide the link if there is no file
        fileLinkContainer.style.display = 'none';
    }

    if (userDegreeBoardEdit && userDegreeEducationNameEdit && userDegreeCityEdit && userDegreeStartDateEdit
        && userDegreeEndDateEdit && userDegreePercentageEdit) {

        if (!userId) {
            console.log('User is not authenticated');
            displayMessage('User is not authenticated', 'danger')
            return;
        }
        const userDegreeCollectionRef = collection(firestore, 'learners', userId, 'userdegree');
        const userDegreeSnapshot = await getDocs(userDegreeCollectionRef);

        if (!userDegreeSnapshot.empty) {
            userDegreeSnapshot.forEach(async (document) => {
                const userDegreeData = document.data();
                if (userDegreeCertificateEdit.files.length > 0) {

                    console.log("if")
                    if (userDegreeData.degreeCertificateImageUrl) {
                        const fileName = getFileNameFromUrl(userDegreeData.degreeCertificateImageUrl);
                        if (fileName) {
                            const storageRef = ref(storage, 'degree_certificate_images/' + fileName);
                            await deleteObject(storageRef);
                        }
                    }

                    const storageRef = ref(storage, 'degree_certificate_images/' + userDegreeCertificateImageFileEdit.name);
                    await uploadBytes(storageRef, userDegreeCertificateImageFileEdit);
                    const certificateImageUrl = await getDownloadURL(storageRef);

                    const userDegreeDocRef = doc(firestore, 'learners', userId, 'userdegree', document.id)
                    await updateDoc(userDegreeDocRef,
                        {
                            userDegreeBoard: userDegreeBoardEdit,
                            userDegreeEducationName: userDegreeEducationNameEdit,
                            userDegreeSpecialization : userDegreeSpeEdit,
                            userDegreeEducationCity: userDegreeCityEdit,
                            userDegreeEducationState: userDegreeStateEdit,
                            userDegreeStart: userDegreeStartDateEdit,
                            userDegreeEnd: userDegreeEndDateEdit,
                            userDegreePercentage: userDegreePercentageEdit,
                            degreeCertificateImageUrl: certificateImageUrl
                        });
                    console.log('User Graduation/Degree details saved successfully');
                    displayMessage('User Graduation/Degree details saved successfully', 'success');
                    openUserDegreeModel(userId)
                    await userDegreeDisplayMsg();
                }
                else {
                    console.log("else")
                    const userDegreeDocRef = doc(firestore, 'learners', userId, 'userdegree', document.id)
                    await updateDoc(userDegreeDocRef,
                        {
                            userDegreeBoard: userDegreeBoardEdit,
                            userDegreeEducationName: userDegreeEducationNameEdit,
                            userDegreeSpecialization : userDegreeSpeEdit,
                            userDegreeEducationCity: userDegreeCityEdit,
                            userDegreeEducationState: userDegreeStateEdit,
                            userDegreeStart: userDegreeStartDateEdit,
                            userDegreeEnd: userDegreeEndDateEdit,
                            userDegreePercentage: userDegreePercentageEdit,
                        });
                    console.log('User Graduation/Degree details saved successfully');
                    displayMessage('User Graduation/Degree details saved successfully', 'success');
                    openUserDegreeModel(userId)
                    await userDegreeDisplayMsg();
                }
            })

        }
        else {
            if(userDegreeCertificateEdit.files.length > 0){
                const storageRef = ref(storage, 'degree_certificate_images/' + userDegreeCertificateEdit.name);
                await uploadBytes(storageRef, userDegreeCertificateImageFileEdit);
                const certificateImageUrl = await getDownloadURL(storageRef);
    
                const userDegreeDocRef = await addDoc(userDegreeCollectionRef,{
                    userDegreeBoard: userDegreeBoardEdit,
                    userDegreeEducationName: userDegreeEducationNameEdit,
                    userDegreeSpecialization : userDegreeSpeEdit,
                    userDegreeEducationCity: userDegreeCityEdit,
                    userDegreeEducationState: userDegreeStateEdit,
                    userDegreeStart: userDegreeStartDateEdit,
                    userDegreeEnd: userDegreeEndDateEdit,
                    userDegreePercentage: userDegreePercentageEdit,
                    degreeCertificateImageUrl: certificateImageUrl
                })
                console.log('user graduation education details saved successfully');
                displayMessage('user graduation education details saved successfully', 'success');
                
                await updateDoc(userDegreeDocRef,{userDegreeId : userDegreeDocRef.id});
                openUserDegreeModel(userId);
                await userDegreeDisplayMsg();
            }
            else{
                console.log('Please fill the all fields');
                displayMessage('Please fill the all fields', 'danger');
            }  
            
        }
    }
    else {
        console.log('Please fill all the details');
        displayMessage('Please fill all the details', 'danger');
    }
});
//-------------------------------------------------------------------------------------------------


// ---------------------------------- Post Graduation Details  ------------------------------------
/**
 * it checking the user inter/12th class doc exists or not 
 * @param {*} userId 
 * @returns 
 */
async function checkMastersDocumentExists(userId) {
    const userMastersCollectionRef = collection(firestore, 'learners', userId, 'usermasters');
    const userMastersSnapshot = await getDocs(userMastersCollectionRef);
    return !userMastersSnapshot.empty;
}

/**
 * 
 * to display inter/12th class edu details message
 */
async function userMastersDisplayMsg(){
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const userMastersDataExist = await checkMastersDocumentExists(userId);

    if(!userMastersDataExist){
        document.querySelector('.user-masters-display-message').classList.remove('d-none');
        document.querySelector('.user-masters-display-message').textContent = "Please fill your post-graduation details"
    }
    else{
        document.querySelector('.user-masters-display-message').classList.add('d-none'); 
    }
}

/**
 * 
 * 
 */
const accordionMastersBtn = document.querySelector("#user-masters-accordion-btn");
accordionMastersBtn.addEventListener('click', async () => {
    console.log('1')
    // Check if the accordion is currently collapsing (closing)
    if (!accordionMastersBtn.classList.contains('collapsed')) {
        const userId = auth.currentUser.uid;
        openMastersModel(userId);
    }
});

var userMastersDocId = null;
async function openMastersModel(userId) {
    console.log("3")
    const userMastersBoardEdit = document.querySelector("#masters-board");
    const userMastersEducationNameEdit = document.querySelector("#masters-education-name");
    const userMastersEduSpeNameEdit = document.querySelector('#masters-education-spec-name')
    const userMastersEducationCityEdit = document.querySelector("#masters-education-city");
    const userMastersEducationStateEdit = document.querySelector("#masters-education-state");
    const userMastersStartEdit = document.querySelector("#masters-education-sDate");
    const userMastersEndEdit = document.querySelector("#masters-education-eDate");
    const userMastersPercentageEdit = document.querySelector("#masters-education-percentage");


    if (userId) {
        const userMastersCollectionRef = collection(firestore, 'learners', userId, 'usermasters');
        const userMastersSnapshot = await getDocs(userMastersCollectionRef);

        if (!userMastersSnapshot.empty) {
            userMastersDocId = userMastersSnapshot.docs[0].id
            console.log(userMastersDocId);
            const userMastersData = userMastersSnapshot.docs[0].data();
            const fileName = getFileNameFromUrl(userMastersData.mastersCertificateImageUrl);
            console.log(userMastersData)
            userMastersBoardEdit.value = userMastersData.userMastersBoard || '';
            userMastersEducationNameEdit.value = userMastersData.userMastersEducationName || '';
            userMastersEduSpeNameEdit.value = userMastersData.userMastersSpecialization || '';
            userMastersEducationCityEdit.value = userMastersData.userMastersEducationCity || '';
            userMastersEducationStateEdit.value = userMastersData.userMastersEducationState || '';
            userMastersStartEdit.value = userMastersData.userMastersStart || '';
            userMastersEndEdit.value = userMastersData.userMastersEnd || '';
            userMastersPercentageEdit.value = userMastersData.userMastersPercentage || '';
            // document.getElementById('masters-cert-file-display').textContent = `Selected File: ${fileName}`;
            const fileLink = document.getElementById('masters-cert-file-link');

            if (fileName) {
                fileLink.href = userMastersData.mastersCertificateImageUrl;
                fileLink.textContent = `Selected File: ${fileName}`;
                fileLink.style.display = 'inline-block'; // Display the link
            } else {
                fileLink.style.display = 'none'; // Hide the link if there is no file
            }
        }
        else {
            console.log('No Post-Graduation/Masters details found for the user, please fill the details');
            displayMessage('No Post-Graduation/Masters details found for the user, please fill the details', 'danger');
        }
    }
    else {
        console.log('User ID is required');
        displayMessage('User ID is required', 'danger')
    }
}
/**
* save the user post-graduation/masters details 
* @author mydev 
*/
document.querySelector('#save-masters-edu-button').addEventListener('click', async (e) => {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const userMastersBoard = document.querySelector("#masters-board").value;
    const userMastersEducationName = document.querySelector("#masters-education-name").value;
    const userMastersEduSpeName = document.querySelector('#masters-education-spec-name').value
    const userMastersEducationCity = document.querySelector("#masters-education-city").value;
    const userMastersEducationState = document.querySelector("#masters-education-state").value;
    const userMastersStart = document.querySelector("#masters-education-sDate").value;
    const userMastersEnd = document.querySelector("#masters-education-eDate").value;
    const userMastersPercentage = document.querySelector("#masters-education-percentage").value;
    const userMastersCertificate = document.querySelector('#masters-education-cert');
    const userMastersCertificateImageFile = userMastersCertificate.files[0];
    const fileLink = document.getElementById('masters-cert-file-link');
    const fileLinkContainer = document.getElementById('file-link-container');

    if (userMastersCertificate.files.length > 0) {
        fileLink.href = URL.createObjectURL(userMastersCertificateImageFile);
        fileLink.textContent = `Selected File: ${userMastersCertificateImageFile.name}`;
        fileLink.style.display = 'inline-block'; // Display the link
        fileLinkContainer.style.display = 'block';
    } else {
        fileLink.style.display = 'none'; // Hide the link if there is no file
        fileLinkContainer.style.display = 'none';
    }

    if (userMastersBoard && userMastersEducationName && userMastersEduSpeName && userMastersEducationCity && userMastersEducationState
        && userMastersStart && userMastersEnd && userMastersPercentage) {

        if (!userId) {
            console.log('User is not authenticated');
            displayMessage('User is not authenticated', 'danger')
            return;
        }

        // const userDegreeCollectionRef = collection(firestore, 'learners',userId,'userdegree');
        // const userDegreeSnapshot = await getDocs(userDegreeCollectionRef);
        // if(userDegreeSnapshot.empty){
        //     console.log('Please fill the your graduation education details');
        //     displayMessage('Please fill the your  graduation education  details','success');
        //     return;
        // }

        const userMastersCollectionRef = collection(firestore, 'learners', userId, 'usermasters');
        const userMastersSnapshot = await getDocs(userMastersCollectionRef);
        if (!userMastersSnapshot.empty) {
            console.log("if")
            userMastersSnapshot.forEach(async (document) => {
                const userMastersData = document.data();
                console.log(userMastersData.mastersCertificateImageUrl)

                if (userMastersCertificate.files.length > 0) {

                    if (userMastersData.mastersCertificateImageUrl) {
                        const fileName = getFileNameFromUrl(userMastersData.mastersCertificateImageUrl);
                        console.log(fileName)
                        if (fileName) {
                            const storageRef = ref(storage, 'masters_certificate_images/' + fileName);
                            await deleteObject(storageRef);
                        }
                    }
                    console.log("1")

                    const storageRef = ref(storage, 'masters_certificate_images/' + userMastersCertificateImageFile.name);
                    await uploadBytes(storageRef, userMastersCertificateImageFile);
                    const certificateImageUrl = await getDownloadURL(storageRef);

                    const userMastersDocRef = doc(firestore, 'learners', userId, 'usermasters', document.id)
                    await updateDoc(userMastersDocRef,
                        {
                            userMastersBoard: userMastersBoard,
                            userMastersEducationName: userMastersEducationName,
                            userMastersSpecialization: userMastersEduSpeName,
                            userMastersEducationCity: userMastersEducationCity,
                            userMastersEducationState: userMastersEducationState,
                            userMastersStart: userMastersStart,
                            userMastersEnd: userMastersEnd,
                            userMastersPercentage: userMastersPercentage,
                            mastersCertificateImageUrl: certificateImageUrl
                        });
                    console.log('User Post-Graduation/Masters details updated successfully');
                    displayMessage('User Post-Graduation/Masters details updated successfully', 'success');
                    // document.getElementById('masters-edu-details-form').reset();
                    openMastersModel(userId)
                    await userMastersDisplayMsg();
                }
                else {
                    console.log("else")
                    const userMastersDocRef = doc(firestore, 'learners', userId, 'usermasters', document.id)
                    await updateDoc(userMastersDocRef,
                        {
                            userMastersBoard: userMastersBoard,
                            userMastersEducationName: userMastersEducationName,
                            userMastersSpecialization: userMastersEduSpeName,
                            userMastersEducationCity: userMastersEducationCity,
                            userMastersEducationState: userMastersEducationState,
                            userMastersStart: userMastersStart,
                            userMastersEnd: userMastersEnd,
                            userMastersPercentage: userMastersPercentage,
                        });
                    console.log('User Post-Graduation/Masters details updated successfully');
                    displayMessage('User Post-Graduation/Masters details updated successfully', 'success');
                    openMastersModel(userId)
                    await userMastersDisplayMsg();
                }
            })
        }
        else {
            if(userMastersCertificate.files.length > 0){
                const storageRef = ref(storage, 'masters_certificate_images/' + userMastersCertificate.name);
                await uploadBytes(storageRef, userMastersCertificateImageFile);
                const certificateImageUrl = await getDownloadURL(storageRef);
    
                const userMastersDocRef = await addDoc(userMastersCollectionRef,{
                    userMastersBoard: userMastersBoard,
                    userMastersEducationName: userMastersEducationName,
                    userMastersSpecialization: userMastersEduSpeName,
                    userMastersEducationCity: userMastersEducationCity,
                    userMastersEducationState: userMastersEducationState,
                    userMastersStart: userMastersStart,
                    userMastersEnd: userMastersEnd,
                    userMastersPercentage: userMastersPercentage,
                    mastersCertificateImageUrl: certificateImageUrl
                })
                console.log('user post graduation education details saved successfully');
                displayMessage('user post graduation education details saved successfully', 'success');
                
                await updateDoc(userMastersDocRef,{userMastersId : userMastersDocRef.id});
                openMastersModel(userId);
                await userMastersDisplayMsg();
            }
            else{
                console.log('Please fill the all fields');
                displayMessage('Please fill the all fields', 'danger');
            }
        }
    }
    else {
        console.log("Please fill all the details");
        displayMessage('Please fill all the details', 'danger');
    }
})

//------------------------------------------------------------------------------------------------------------


// ---------------------------------- Internship/Academic Project Details  ------------------------------------
/**
 * it checking the user inter/12th class doc exists or not 
 * @param {*} userId 
 * @returns 
 */
async function checkInternshipDocumentExists(userId) {
    const userInternshipCollectionRef = collection(firestore, 'learners', userId, 'userinternship');
    const userInternshipSnapshot = await getDocs(userInternshipCollectionRef);
    return !userInternshipSnapshot.empty;
}

/**
 * 
 * to display inter/12th class edu details message
 */
async function userInternshipDisplayMsg(){
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const userMastersDataExist = await checkInternshipDocumentExists(userId);

    if(!userMastersDataExist){
        document.querySelector('.user-internship-display-message').classList.remove('d-none');
        document.querySelector('.user-internship-display-message').textContent = "Please fill your internship details"
    }
    else{
        document.querySelector('.user-internship-display-message').classList.add('d-none'); 
    }
}

/**
 * edit or update the internship details;
 * @author mydev
 */
const accordionInternshipBtn = document.querySelector("#user-internship-accordion-btn");
accordionInternshipBtn.addEventListener('click', async () => {
    console.log('1')
    // Check if the accordion is currently collapsing (closing)
    if (!accordionInternshipBtn.classList.contains('collapsed')) {
        const userId = auth.currentUser.uid;
        openUserInternshipModel(userId);
    }
});

var userInternshipDocId = null;
async function openUserInternshipModel(userId) {
    console.log("3")
    const userProjectNameEdit = document.querySelector("#internship-project-name");
    const userProjectTechnologiesEdit = document.querySelector("#internship-technologies");
    const userInternshipCityEdit = document.querySelector("#internship-city");
    const userInternshipStartEdit = document.querySelector("#internship-sDate");
    const userInternshipEndEnit = document.querySelector("#internship-eDate");
    const userProjectDescriptionEdit = document.querySelector("#internship-project-description");


    if (userId) {
        const userInternshipCollectionRef = collection(firestore, 'learners', userId, 'userinternship');
        const userInternshipSnapshot = await getDocs(userInternshipCollectionRef);

        if (!userInternshipSnapshot.empty) {
            userInternshipDocId = userInternshipSnapshot.docs[0].id
            console.log(userInternshipDocId);
            const userInternshipData = userInternshipSnapshot.docs[0].data();
            const fileName = getFileNameFromUrl(userInternshipData.internshipCertificateImageUrl);
            console.log(userInternshipData)
            userProjectNameEdit.value = userInternshipData.userProjectName || '';
            userProjectTechnologiesEdit.value = userInternshipData.userProjectTechnologies || '';
            userInternshipCityEdit.value = userInternshipData.userInternshipCity || '';
            userInternshipStartEdit.value = userInternshipData.userInternshipStart || '';
            userInternshipEndEnit.value = userInternshipData.userInternshipEnd || '';
            userProjectDescriptionEdit.value = userInternshipData.userProjectDescription || '';
            // document.getElementById('internship-cert-file-display').textContent = `Selected File: ${fileName}`;
            const fileLink = document.getElementById('internship-cert-file-link');

            if (fileName) {
                fileLink.href = userInternshipData.internshipCertificateImageUrl;
                fileLink.textContent = `Selected File: ${fileName}`;
                fileLink.style.display = 'inline-block'; // Display the link
            } else {
                fileLink.style.display = 'none'; // Hide the link if there is no file
            }
        }
        else {
            console.log('No Internship/Academic Project details found for the user, please fill the details');
            displayMessage('No Internship/Academic Project details found for the user, please fill the details', 'danger');
        }
    }
    else {
        console.log('User ID is required');
        displayMessage('User ID is required', 'danger')
    }
}

document.getElementById('save-internship-button').addEventListener('click', async function () {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const userProjectNameEdit = document.querySelector("#internship-project-name").value;
    const userProjectTechnologiesEdit = document.querySelector("#internship-technologies").value;
    const userInternshipCityEdit = document.querySelector("#internship-city").value;
    const userInternshipStartEdit = document.querySelector("#internship-sDate").value;
    const userInternshipEndEdit = document.querySelector("#internship-eDate").value;
    const userProjectDescriptionEdit = document.querySelector("#internship-project-description").value;
    const userInternshipCertificateEdit = document.querySelector('#internship-cert')
    const userInternshipCertificateImageFileEdit = userInternshipCertificateEdit.files[0];
    const fileLink = document.getElementById('internship-cert-file-link');
    const fileLinkContainer = document.getElementById('file-link-container');

    if (userInternshipCertificateEdit.files.length > 0) {
        fileLink.href = URL.createObjectURL(userInternshipCertificateImageFileEdit);
        fileLink.textContent = `Selected File: ${userInternshipCertificateImageFileEdit.name}`;
        fileLink.style.display = 'inline-block'; // Display the link
        fileLinkContainer.style.display = 'block'; // Display the container
    } else {
        fileLink.style.display = 'none'; // Hide the link if there is no file
        fileLinkContainer.style.display = 'none'; // Hide the container
    }


    if (userProjectNameEdit && userProjectTechnologiesEdit && userInternshipCityEdit && userInternshipStartEdit
        && userInternshipEndEdit && userProjectDescriptionEdit) {

        if (!userId) {
            console.log('User is not authenticated');
            displayMessage('User is not authenticated', 'danger')
            return;
        }
        const userInternshipCollectionRef = collection(firestore, 'learners', userId, 'userinternship');
        const userInternshipSnapshot = await getDocs(userInternshipCollectionRef);

        if (!userInternshipSnapshot.empty) {
            userInternshipSnapshot.forEach(async (document) => {
                const userInternshipData = document.data();
                if (userInternshipCertificateEdit.files.length > 0) {

                    console.log("if")
                    if (userInternshipData.internshipCertificateImageUrl) {
                        const fileName = getFileNameFromUrl(userInternshipData.internshipCertificateImageUrl);
                        if (fileName) {
                            const storageRef = ref(storage, 'internship_certificate_images/' + fileName);
                            await deleteObject(storageRef);
                        }
                    }

                    const storageRef = ref(storage, 'internship_certificate_images/' + userInternshipCertificateImageFileEdit.name);
                    await uploadBytes(storageRef, userInternshipCertificateImageFileEdit);
                    const certificateImageUrl = await getDownloadURL(storageRef);

                    const userInternshipDocRef = doc(firestore, 'learners', userId, 'userinternship', document.id)
                    await updateDoc(userInternshipDocRef,
                        {
                            userProjectName: userProjectNameEdit,
                            userProjectTechnologies: userProjectTechnologiesEdit,
                            userInternshipCity: userInternshipCityEdit,
                            userInternshipStart: userInternshipStartEdit,
                            userInternshipEnd: userInternshipEndEdit,
                            userProjectDescription: userProjectDescriptionEdit,
                            internshipCertificateImageUrl: certificateImageUrl
                        });
                    console.log('User Internship/Academic Project details updated successfully');
                    displayMessage('User Internship/Academic Project details updated successfully', 'success');
                    openUserInternshipModel(userId)
                    await userInternshipDisplayMsg();
                }
                else {
                    console.log("else")
                    const userInternshipDocRef = doc(firestore, 'learners', userId, 'userInternship', document.id)
                    await updateDoc(userInternshipDocRef,
                        {
                            userProjectName: userProjectNameEdit,
                            userProjectTechnologies: userProjectTechnologiesEdit,
                            userInternshipCity: userInternshipCityEdit,
                            userInternshipStart: userInternshipStartEdit,
                            userInternshipEnd: userInternshipEndEdit,
                            userProjectDescription: userInternshipEndEdit,
                        });
                    console.log('User Internship/Academic Project details updated successfully');
                    displayMessage('User Internship/Academic Project details updated successfully', 'success');
                    openUserInternshipModel(userId)
                    await userInternshipDisplayMsg();
                }
            })

        }
        else {
            if(userInternshipCertificateEdit.files.length > 0){
                const storageRef = ref(storage, 'internship_certificate_images/' + userInternshipCertificateEdit.name);
                await uploadBytes(storageRef, userInternshipCertificateImageFileEdit);
                const certificateImageUrl = await getDownloadURL(storageRef);
    
                const userInternshipDocRef = await addDoc(userInternshipCollectionRef,{
                    userProjectName: userProjectNameEdit,
                    userProjectTechnologies: userProjectTechnologiesEdit,
                    userInternshipCity: userInternshipCityEdit,
                    userInternshipStart: userInternshipStartEdit,
                    userInternshipEnd: userInternshipEndEdit,
                    userProjectDescription: userProjectDescriptionEdit,
                    internshipCertificateImageUrl: certificateImageUrl
                })
                console.log('user academic project/internship details saved successfully');
                displayMessage('user academic project/internship details saved successfully', 'success');
                
                await updateDoc(userInternshipDocRef,{userinternshipId : userInternshipDocRef.id});
                openUserInternshipModel(userId);
                await userInternshipDisplayMsg();
            }
            else{
                console.log('Please fill the all fields');
                displayMessage('Please fill the all fields', 'danger');
            }
        }
    }
    else {
        console.log('Please fill all the details');
        displayMessage('Please fill all the details', 'danger');
    }
});
//--------------------------------------------------------------------------------------------------


//--------------------------------------- Other Details --------------------------------------------
/**
 * it checking the user inter/12th class doc exists or not 
 * @param {*} userId 
 * @returns 
 */
async function checkAdditionalDocumentExists(userId) {
    const userAdditionalCollectionRef = collection(firestore, 'learners', userId, 'useradditional');
    const userAdditionalSnapshot = await getDocs(userAdditionalCollectionRef);
    return !userAdditionalSnapshot.empty;
}

/**
 * 
 * to display inter/12th class edu details message
 */
async function userAdditionalDisplayMsg(){
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const userAdditionalDataExist = await checkAdditionalDocumentExists(userId);

    if(!userAdditionalDataExist){
        document.querySelector('.user-additional-details-display-message').classList.remove('d-none');
        document.querySelector('.user-additional-details-display-message').textContent = "Please fill your internship details"
    }
    else{
        document.querySelector('.user-additional-details-display-message').classList.add('d-none'); 
    }
}

/**
 * edit the additional details
 * @author mydev
 */
const accordionAdditionalBtn = document.querySelector("#user-additional-accordion-btn");
accordionAdditionalBtn.addEventListener('click', async () => {
    console.log("1")
    // Check if the accordion is currently collapsing (closing)
    if (!accordionAdditionalBtn.classList.contains('collapsed')) {
        const userId = auth.currentUser.uid;
        openUserAdditionalModel(userId);
    }
});

var userAdditionalDocId = null;
async function openUserAdditionalModel(userId) {
    const userAdditionalSkillsEdit = document.querySelector('#user-skills');
    const userAdditionalLanguagesEdit = document.querySelector('#user-languages');
    const userAdditionalHobbiesEdit = document.querySelector('#user-hobbies');

    if (userId) {
        const userAdditionalCollectionRef = collection(firestore, 'learners', userId, 'useradditional');
        const userAdditionalSnapshot = await getDocs(userAdditionalCollectionRef);

        if (!userAdditionalSnapshot.empty) {
            userAdditionalDocId = userAdditionalSnapshot.docs[0].id
            const userAdditionalData = userAdditionalSnapshot.docs[0].data();
            userAdditionalSkillsEdit.value = userAdditionalData.userAdditionalSkills || '';
            userAdditionalLanguagesEdit.value = userAdditionalData.userAdditionalLanguages || '';
            userAdditionalHobbiesEdit.value = userAdditionalData.userAdditionalHobbies || '';
        }
        else {
            console.log('No Additional Details found for the user, please fill the details');
            displayMessage('No Additional Details found for the user, please fill the details', 'danger');
        }
    }
    else {
        console.log('User ID is required');
        displayMessage('User ID is required', 'danger')
    }
}

document.getElementById('save-user-additional-button').addEventListener('click', async function () {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const userAdditionalSkillsEdit = document.querySelector('#user-skills').value;
    const userAdditionalLanguagesEdit = document.querySelector('#user-languages').value;
    const userAdditionalHobbiesEdit = document.querySelector('#user-hobbies').value;

    if (userId) {
        
        if (userAdditionalSkillsEdit && userAdditionalLanguagesEdit && userAdditionalHobbiesEdit) {
            const userAdditionalCollectionRef = collection(firestore, 'learners', userId, 'useradditional');
            const userAdditionalSnapshot = await getDocs(userAdditionalCollectionRef);
            
            if(!userAdditionalSnapshot.empty){
                const userAdditionalData = {
                    userAdditionalSkills: userAdditionalSkillsEdit,
                    userAdditionalLanguages: userAdditionalLanguagesEdit,
                    userAdditionalHobbies: userAdditionalHobbiesEdit
                }
                const userAdditionalDocRef = doc(userAdditionalCollectionRef, userAdditionalDocId)
                await updateDoc(userAdditionalDocRef, userAdditionalData, { merge: true });

                console.log('User additional details updated successfully');
                displayMessage('User additional details updated successfully', 'success');
                openUserAdditionalModel(userId);
                await userAdditionalDisplayMsg();
            }
            else{
                const usserAdditionalDocRef = await addDoc(userAdditionalCollectionRef,{
                    userAdditionalSkills: userAdditionalSkillsEdit,
                    userAdditionalLanguages: userAdditionalLanguagesEdit,
                    userAdditionalHobbies: userAdditionalHobbiesEdit
                })
                console.log('User additional details saved successfully');
                displayMessage('User additional details saved successfully', 'success');
                
                await updateDoc(usserAdditionalDocRef,{userAdditionalId : usserAdditionalDocRef.id});
                openUserAdditionalModel(userId);
                await userAdditionalDisplayMsg();
            }
        }
        else{
            console.log('Please fill the all fields');
            displayMessage('Please fill the all fields', 'danger');
        }
    }
    else {
        console.log('User is not authenticated');
        displayMessage('User is not authenticated', 'danger');
    }
});
//--------------------------------------------------------------------------------------------------

/**
 * Extract the file name from the image URL
 * @param {*} imageUrl 
 * @returns 
 */
function getFileNameFromUrl(imageUrl) {
    const url = new URL(imageUrl);
    return decodeURIComponent(url.pathname).replace(/^.*[\\\/]/, '');
}

//display message function
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

/**
 * function for real time user Data
 * @author mydev
 */
function getUserRealTime() {
    onSnapshot(doc(firestore, 'learners', auth.currentUser.uid), (doc) => {
        userData = doc.data();
        populateShownDetails();
    })
}


/**
 * get updated user data 
 * @returns 
 */
async function getUpdatedUserData() {
    return new Promise(async (resolve) => {
        const userDoc = await getDoc(doc(firestore, 'learners', auth.currentUser.uid))
        resolve(userDoc.data())
    })
}

/**
 * Validation for name 
 * @param {*} name 
 * @returns 
 */
function isValidName(name) {
    return name.length >= 3;
}

/**
 * Validation for phone number
 * @param {*} phone 
 * @returns 
 */
// function isValidPhoneNumber(phone) {
//     const phoneNumberRegex = /^\+91\d{10}$/;
//     return phoneNumberRegex.test(phone);
// }

/**
 * Validation for password
 * @param {*} password 
 * @returns 
 */
function isValidPassword(password) {
    return password.length >= 6;
}