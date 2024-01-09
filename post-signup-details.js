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
 * fetch userId url params
 * @author mydev
 */
const userId = new URLSearchParams(window.location.search).get('userId');
// const userId = 'P2rHHyaocWVhsJBANMKYEBvfglp1';
if (userId) {
    await continueLoginBtnshowOrHide();
    displayMessage('Please continue with filling the remaining details', 'success');
}
// console.log(userId);


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
 * Use onAuthStateChanged to control access to admin dashboard
 * @author mydev
 */
onAuthStateChanged(auth, (user) => {
    // console.log("auth")
    if (user) {
        // console.log("if")
        loggedIn = true
        onLoggedIn();
        const docRef = doc(firestore, "learners", user.uid);
        const docSnap = getDoc(docRef);
        docSnap.then((docSnapshot) => {
            if (docSnapshot.exists()) {
                userData = docSnapshot.data();
                roleAccess(userData.role);
                getUserRealTime();
            }
        });
    }
    else {
        // console.log("else")
        onLoggedOut();
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
// function stopLoader() {
//     document.querySelector("#overlay").classList.add("hidden");
//     document.querySelector("#main").classList.remove("hidden");
// }

/**
 * function for real time user Data
 * @author mydev
 */
function getUserRealTime() {
    onSnapshot(doc(firestore, 'learners', auth.currentUser.uid), (doc) => {
        userData = doc.data();
        // populateShownDetails();
    })
}

/**
 * 
 * @param {*} message 
 * @param {*} type 
 * 
 * Toast message
 */
function displayMessage(message, type) {
    const toastContainer = document.querySelector(".toast-container");

    const toast = document.querySelector(".toast").cloneNode(true);
    // Set the success message
    toast.querySelector(".compare-note").innerHTML = message;

    if (type === "danger") {
        toast.classList.remove("bg-success");
        toast.classList.add("bg-danger");
    } else {
        toast.classList.add("bg-success");
        toast.classList.remove("bg-danger");
    }
    toastContainer.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    toast.addEventListener("hidden.bs.toast", function () {
        toast.remove();
    });
}

// document.querySelector('#address-accordion-btn').addEventListener('click',(event)=>{
//    event.preventDefault();
//    userSchoolEducationFormShowOrHide();

// })
/**
 * save the user address 
 * @author mydev
 */
document.querySelector('#save-user-address-button').addEventListener('click', async (e) => {
    e.preventDefault()
    document.querySelector('#save-user-address-button').disabled = true;
    document.querySelector('#save-user-address-button').textContent = 'Submitting...';
    // console.log("1")
    const userAddress = document.querySelector('#user-address').value;
    const userPostcode = document.querySelector('#user-postcode').value;
    const userCity = document.querySelector('#user-city').value;
    const userState = document.querySelector('#user-state').value;
    const userCountry = document.querySelector('#user-country').value;
    // console.log(userId)
    if (userAddress && userPostcode && userCity && userState && userCountry) {
        const userAddressCollectionRef = collection(firestore, 'learners', userId, 'useraddress')
        const userAddressSnapshot = await getDocs(userAddressCollectionRef);
        if (!userAddressSnapshot.empty) {
            // console.log('if');
            userAddressSnapshot.forEach(async (docu) => {
                const AddressDocRef = doc(firestore, 'learners', userId, 'useraddress', docu.id);

                await updateDoc(AddressDocRef, {
                    address: userAddress,
                    postcode: userPostcode,
                    city: userCity,
                    state: userState,
                    country: userCountry
                });
                console.log('User Address details updated successfully');
                displayMessage('User Address details updated successfully', 'success');
                document.querySelector('#save-user-address-button').disabled = false;
                document.querySelector('#save-user-address-button').textContent = 'Submit';
                document.getElementById('user-address-form').reset();
            })
        }
        else {
            // console.log("else")
            const userAddressData = {
                address: userAddress,
                postcode: userPostcode,
                city: userCity,
                state: userState,
                country: userCountry
            }
            const docRef = await addDoc(userAddressCollectionRef, userAddressData)
            // console.log(docRef.id)
            await updateDoc(docRef, { addressId: docRef.id })
            console.log('User Address details saved successfully')
            displayMessage('User Address details saved successfully', 'success')
            document.querySelector('#save-user-address-button').disabled = false;
            document.querySelector('#save-user-address-button').textContent = 'Submit';
            document.getElementById('user-address-form').reset();
        }
    }
    else {
        console.log("Please fill all the details")
        displayMessage('Please fill all the details', 'danger')
        document.querySelector('#save-user-address-button').disabled = false;
        document.querySelector('#save-user-address-button').textContent = 'Submit';
    }
})

//------------------ School Education Details Section -----------------------

/**
 * to check address details
 * @param {*} userId 
 * @returns 
 */
async function checkUserAddressDocumentExists(userId) {
    const userAddressCollectionRef = collection(firestore, 'learners', userId, 'useraddress');
    const userAddressSnapshot = await getDocs(userAddressCollectionRef);
    return !userAddressSnapshot.empty;
}


document.querySelector('#user-school-accordion-btn').addEventListener('click', async (event) => {
    // console.log("1")
    event.preventDefault();
    const userAddressExists = await checkUserAddressDocumentExists(userId);
    // console.log(userAddressExists);
    const schoolAccordionBtn = document.getElementById('user-school-accordion-btn');
    const schoolAccordionContent = document.querySelector('.accordion-collapse-two');

    if (!userAddressExists) {
        // console.log("if")
        schoolAccordionContent.classList.add('d-none');
        schoolAccordionBtn.classList.add('collapsed');
        displayMessage('Please fill the above address details', 'danger');
    }
    else {
        // console.log("else");
        schoolAccordionContent.classList.remove('d-none');
    }
})


/**
 * save the user school education details 
 * @author mydev 
 */
document.querySelector('#save-school-edu-button').addEventListener('click', async (e) => {
    document.querySelector('#save-school-edu-button').disabled = true;
    document.querySelector('#save-school-edu-button').textContent = 'Submitting...';
    const userSchoolBoard = document.querySelector("#school-board").value;
    const userSchoolName = document.querySelector("#school-name").value;
    const userSchoolEducationCity = document.querySelector("#school-education-city").value;
    const userSchoolEducationState = document.querySelector('#school-education-state').value
    const userSchoolStart = document.querySelector("#school-education-sDate").value;
    const userSchoolEnd = document.querySelector("#school-education-eDate").value;
    const userSchoolPercentage = document.querySelector("#school-education-percentage").value;
    const userSchoolCertificate = document.querySelector('#school-education-cert');
    const userCertificateImageFile = userSchoolCertificate.files[0];

    if (userSchoolBoard && userSchoolName && userSchoolEducationCity && userSchoolEducationState
        && userSchoolStart && userSchoolEnd && userSchoolCertificate.files.length > 0) {
        try {
            // const userAddressCollectionRef = collection(firestore, 'learners', userId, 'useraddress')
            // const userAddressSnapshot = await getDocs(userAddressCollectionRef);
            // if (userAddressSnapshot.empty) {
            //     console.log('Please fill the address details first')
            //     displayMessage('Please fill the address details first', 'danger');
            //     return;
            // }

            const userSchoolCollectionRef = collection(firestore, 'learners', userId, 'userschool');
            const userSchoolSnapshot = await getDocs(userSchoolCollectionRef);
            if (!userSchoolSnapshot.empty) {
                // console.log("if")
                userSchoolSnapshot.forEach(async (docu) => {
                    // const userDocId = docu.data().userSchoolDocId;
                    const userData = docu.data();
                    if (userData.certificateImageUrl) {
                        const fileName = getFileNameFromUrl(userData.certificateImageUrl);
                        // console.log(fileName)
                        if (fileName) {
                            const storageRef = ref(storage, 'certificate_images/' + fileName);
                            await deleteObject(storageRef);
                        }
                    }

                    const storageRef = ref(storage, 'certificate_images/' + userCertificateImageFile.name);
                    await uploadBytes(storageRef, userCertificateImageFile);
                    const certificateImageUrl = await getDownloadURL(storageRef);

                    const userSchoolDocRef = doc(firestore, 'learners', userId, 'userschool', docu.id)
                    await updateDoc(userSchoolDocRef,
                        {
                            userSchoolBoard: userSchoolBoard,
                            userSchoolName: userSchoolName,
                            userSchoolEducationCity: userSchoolEducationCity,
                            userSchoolEducationState: userSchoolEducationState,
                            userSchoolStart: userSchoolStart,
                            userSchoolEnd: userSchoolEnd,
                            userSchoolPercentage: userSchoolPercentage,
                            schoolCertificateImageUrl: certificateImageUrl
                        });
                    console.log('User 10th Class details updated successfully');
                    displayMessage('User 10th Class details updated successfully', 'success');
                    document.querySelector('#save-school-edu-button').disabled = false;
                    document.querySelector('#save-school-edu-button').textContent = 'Submit';
                    document.getElementById('school-edu-details-form').reset();
                })
            }
            else {
                // console.log("else");
                const storageRef = ref(storage, 'certificate_images/' + userCertificateImageFile.name);
                await uploadBytes(storageRef, userCertificateImageFile);
                const certificateImageUrl = await getDownloadURL(storageRef);

                const docRef = await addDoc(userSchoolCollectionRef,
                    {
                        userSchoolBoard: userSchoolBoard,
                        userSchoolName: userSchoolName,
                        userSchoolEducationCity: userSchoolEducationCity,
                        userSchoolEducationState: userSchoolEducationState,
                        userSchoolStart: userSchoolStart,
                        userSchoolEnd: userSchoolEnd,
                        userSchoolPercentage: userSchoolPercentage,
                        schoolCertificateImageUrl: certificateImageUrl
                    });
                // console.log(docRef.id)
                await updateDoc(docRef, { userSchoolId: docRef.id })
                console.log('User 10th Class details saved successfully')
                displayMessage('User 10th Class details saved successfully', 'success')
                document.querySelector('#save-school-edu-button').disabled = false;
                document.querySelector('#save-school-edu-button').textContent = 'Submit';
                document.getElementById('school-edu-details-form').reset();
            }
        }
        catch (error) {
            console.error('Error updating certificate image:', error);
            displayMessage('Something went wrong', 'danger');
            document.querySelector('#save-school-edu-button').disabled = false;
            document.querySelector('#save-school-edu-button').textContent = 'Submit';
        }
    }
    else {
        console.log("Please fill all the details");
        displayMessage('Please fill all the detailss', 'danger');
        document.querySelector('#save-school-edu-button').disabled = false;
        document.querySelector('#save-school-edu-button').textContent = 'Submit';
    }
})

//  -------------------- Inter Education Details Section ---------------------------------
/**
* to check school education details
* @param {*} userId 
* @returns 
*/
async function checkUserSchoolDocumentExists(userId) {
    const userSchoolCollectionRef = collection(firestore, 'learners', userId, 'userschool');
    const userSchoolSnapshot = await getDocs(userSchoolCollectionRef);
    return !userSchoolSnapshot.empty;
}


document.querySelector('#user-inter-accordion-btn').addEventListener('click', async (event) => {
    event.preventDefault();
    const userSchoolExists = await checkUserSchoolDocumentExists(userId);
    // console.log(userSchoolExists);
    const schoolAccordionBtn = document.getElementById('user-inter-accordion-btn');
    const schoolAccordionContent = document.querySelector('.accordion-collapse-three');

    if (!userSchoolExists) {
        // console.log("if")
        schoolAccordionContent.classList.add('d-none');
        schoolAccordionBtn.classList.add('collapsed');
        displayMessage('Please fill the above 10th education details', 'danger');
    }
    else {
        // console.log("else");
        schoolAccordionContent.classList.remove('d-none');
    }
})

/**
 * save the user inter education details 
 * @author mydev 
 */
document.querySelector('#save-inter-edu-button').addEventListener('click', async (e) => {
    document.querySelector('#save-inter-edu-button').disabled = true;
    document.querySelector('#save-inter-edu-button').textContent = 'Submitting...';
    const userInterBoard = document.querySelector("#inter-board").value;
    const userInterEducationName = document.querySelector("#inter-education-name").value;
    const userInterEducationCity = document.querySelector("#inter-education-city").value;
    const userInterEducationState = document.querySelector("#inter-education-state").value;
    const userInterStart = document.querySelector("#inter-education-sDate").value;
    const userInterEnd = document.querySelector("#inter-education-eDate").value;
    const userInterPercentage = document.querySelector("#inter-education-percentage").value;
    const userInterCertificate = document.querySelector('#inter-education-cert');
    const userInterCertificateImageFile = userInterCertificate.files[0];

    if (userInterBoard && userInterEducationName && userInterEducationCity && userInterEducationState && userInterStart
        && userInterEnd && userInterPercentage && userInterCertificate.files.length > 0) {
        try {
            // const userSchoolCollectionRef = collection(firestore, 'learners', userId, 'userschool');
            //  const userSchoolSnapshot = await getDocs(userSchoolCollectionRef);
            //  if(userSchoolSnapshot.empty){
            //     console.log('Please fill the your school details');
            //     displayMessage('Please fill the your school details','success');
            //     return;
            //  }
            const userInterCollectionRef = collection(firestore, 'learners', userId, 'userinter');
            const userInterSnapshot = await getDocs(userInterCollectionRef);
            if (!userInterSnapshot.empty) {
                // console.log("if")
                userInterSnapshot.forEach(async (docu) => {
                    const userInterData = docu.data();
                    if (userInterData.certificateImageUrl) {
                        const fileName = getFileNameFromUrl(userInterData.certificateImageUrl);
                        // console.log(fileName)
                        if (fileName) {
                            const storageRef = ref(storage, 'inter_certificate_images/' + fileName);
                            await deleteObject(storageRef);
                        }
                    }

                    const storageRef = ref(storage, 'inter_certificate_images/' + userInterCertificateImageFile.name);
                    await uploadBytes(storageRef, userInterCertificateImageFile);
                    const certificateImageUrl = await getDownloadURL(storageRef);

                    const userInterDocRef = doc(firestore, 'learners', userId, 'userinter', docu.id)
                    await updateDoc(userInterDocRef,
                        {
                            userInterBoard: userInterBoard,
                            userInterEducationName: userInterEducationName,
                            userInterEducationCity: userInterEducationCity,
                            userInterEducationState: userInterEducationState,
                            userInterStart: userInterStart,
                            userInterEnd: userInterEnd,
                            userInterPercentage: userInterPercentage,
                            interCertificateImageUrl: certificateImageUrl
                        });
                    console.log('User Intermediate/12th details updated successfully');
                    displayMessage('User Intermediate/12th details updated successfully', 'success');
                    document.querySelector('#save-inter-edu-button').disabled = false;
                    document.querySelector('#save-inter-edu-button').textContent = 'Submit';
                    document.getElementById('inter-edu-details-form').reset();
                })
            }
            else {
                // console.log("else");
                const storageRef = ref(storage, 'inter_certificate_images/' + userInterCertificateImageFile.name);
                await uploadBytes(storageRef, userInterCertificateImageFile);
                const certificateImageUrl = await getDownloadURL(storageRef);

                const docRef = await addDoc(userInterCollectionRef,
                    {
                        userInterBoard: userInterBoard,
                        userInterEducationName: userInterEducationName,
                        userInterEducationCity: userInterEducationCity,
                        userInterEducationState: userInterEducationState,
                        userInterStart: userInterStart,
                        userInterEnd: userInterEnd,
                        userInterPercentage: userInterPercentage,
                        interCertificateImageUrl: certificateImageUrl
                    });
                // console.log(docRef.id)
                await updateDoc(docRef, { userInterId: docRef.id })
                console.log('User Intermediate/12th details saved successfully')
                displayMessage('User Intermediate/12th details saved successfully', 'success')
                document.querySelector('#save-inter-edu-button').disabled = false;
                document.querySelector('#save-inter-edu-button').textContent = 'Submit';
                document.getElementById('inter-edu-details-form').reset();
            }
        }
        catch (error) {
            console.error('Error updating certificate image:', error);
            displayMessage('Something went wrong', 'danger');
            document.querySelector('#save-inter-edu-button').disabled = false;
            document.querySelector('#save-inter-edu-button').textContent = 'Submit';
        }
    }
    else {
        console.log("Please fill all the details");
        displayMessage('Please fill all the details', 'danger');
        document.querySelector('#save-inter-edu-button').disabled = false;
        document.querySelector('#save-inter-edu-button').textContent = 'Submit';
    }
})


//---------------------- Graduation Education Details Section -------------------------------------- 
/**
 * to check the inter/12th class education details
 * @param {*} userId 
 * @returns 
 */
async function checkUserInterDocumentExists(userId) {
    const userInterCollectionRef = collection(firestore, 'learners', userId, 'userinter');
    const userInterSnapshot = await getDocs(userInterCollectionRef);
    return !userInterSnapshot.empty;
}


document.querySelector('#user-degree-accordion-btn').addEventListener('click', async (event) => {
    event.preventDefault();
    const userInterExists = await checkUserInterDocumentExists(userId);
    // console.log(userInterExists);
    const schoolAccordionBtn = document.getElementById('user-degree-accordion-btn');
    const schoolAccordionContent = document.querySelector('.accordion-collapse-four');

    if (!userInterExists) {
        // console.log("if")
        schoolAccordionContent.classList.add('d-none');
        schoolAccordionBtn.classList.add('collapsed');
        displayMessage('Please fill the above Intermediate/12th education details', 'danger');
    }
    else {
        // console.log("else");
        schoolAccordionContent.classList.remove('d-none');
    }
})

/**
* save the user graduation details 
* @author mydev 
*/
document.querySelector('#save-degree-edu-button').addEventListener('click', async (e) => {
    document.querySelector('#save-degree-edu-button').disabled = true;
    document.querySelector('#save-degree-edu-button').textContent = 'Submitting...';
    const userDegreeBoard = document.querySelector("#degree-board").value;
    const userDegreeEducationName = document.querySelector("#degree-education-name").value;
    const userDegreeEduSpeName = document.querySelector('#degree-education-spec-name').value
    const userDegreeEducationCity = document.querySelector("#degree-education-city").value;
    const userDegreeEducationState = document.querySelector("#degree-education-state").value;
    const userDegreeStart = document.querySelector("#degree-education-sDate").value;
    const userDegreeEnd = document.querySelector("#degree-education-eDate").value;
    const userDegreePercentage = document.querySelector("#degree-education-percentage").value;
    const userDegreeCertificate = document.querySelector('#degree-education-cert');
    const userDegreeCertificateImageFile = userDegreeCertificate.files[0];

    if (userDegreeBoard && userDegreeEducationName && userDegreeEducationCity && userDegreeEducationState && userDegreeStart
        && userDegreeStart && userDegreePercentage && userDegreeEduSpeName && userDegreeCertificate.files.length > 0) {
        try {

            // const userInterCollectionRef = collection(firestore, 'learners',userId,'userInter');
            // const userInterSnapshot = await getDocs(userInterCollectionRef);
            // if(userInterSnapshot.empty){
            //     console.log('Please fill the your inter/12th class details');
            //     displayMessage('Please fill the your inter/12th class details','success');
            //     return;
            //  }

            const userDegreeCollectionRef = collection(firestore, 'learners', userId, 'userdegree');
            const userDegreeSnapshot = await getDocs(userDegreeCollectionRef);
            if (!userDegreeSnapshot.empty) {
                // console.log("if")
                userDegreeSnapshot.forEach(async (docu) => {
                    const userDegreeData = docu.data();
                    // console.log(userDegreeData.certificateImageUrl)
                    if (userDegreeData.interCertificateImageUrl) {
                        const fileName = getFileNameFromUrl(userDegreeData.interCertificateImageUrl);
                        // console.log(fileName)
                        if (fileName) {
                            const storageRef = ref(storage, 'degree_certificate_images/' + fileName);
                            await deleteObject(storageRef);
                        }
                    }

                    const storageRef = ref(storage, 'degree_certificate_images/' + userDegreeCertificateImageFile.name);
                    await uploadBytes(storageRef, userDegreeCertificateImageFile);
                    const certificateImageUrl = await getDownloadURL(storageRef);

                    const userDegreeDocRef = doc(firestore, 'learners', userId, 'userdegree', docu.id)
                    await updateDoc(userDegreeDocRef,
                        {
                            userDegreeBoard: userDegreeBoard,
                            userDegreeEducationName: userDegreeEducationName,
                            userDegreeSpecialization: userDegreeEduSpeName,
                            userDegreeEducationCity: userDegreeEducationCity,
                            userDegreeEducationState: userDegreeEducationState,
                            userDegreeStart: userDegreeStart,
                            userDegreeEnd: userDegreeEnd,
                            userDegreePercentage: userDegreePercentage,
                            degreeCertificateImageUrl: certificateImageUrl
                        });
                    console.log('User Graduation/Degree details updated successfully');
                    displayMessage('User Graduation/Degree details updated successfully', 'success');
                    document.querySelector('#save-degree-edu-button').disabled = false;
                    document.querySelector('#save-degree-edu-button').textContent = 'Submit';
                    document.getElementById('degree-edu-details-form').reset();
                    await continueLoginBtnshowOrHide()

                })
            }
            else {
                // console.log("else");
                const storageRef = ref(storage, 'degree_certificate_images/' + userDegreeCertificateImageFile.name);
                await uploadBytes(storageRef, userDegreeCertificateImageFile);
                const certificateImageUrl = await getDownloadURL(storageRef);

                const docRef = await addDoc(userDegreeCollectionRef,
                    {
                        userDegreeBoard: userDegreeBoard,
                        userDegreeEducationName: userDegreeEducationName,
                        userDegreeSpecialization: userDegreeEduSpeName,
                        userDegreeEducationCity: userDegreeEducationCity,
                        userDegreeEducationState: userDegreeEducationState,
                        userDegreeStart: userDegreeStart,
                        userDegreeEnd: userDegreeEnd,
                        userDegreePercentage: userDegreePercentage,
                        degreeCertificateImageUrl: certificateImageUrl
                    });
                // console.log(docRef.id)
                await updateDoc(docRef, { userDegreeId: docRef.id })
                console.log('User Graduation/Degree details saved successfully')
                displayMessage('User Graduation/Degree details saved successfully', 'success')
                document.querySelector('#save-degree-edu-button').disabled = false;
                document.querySelector('#save-degree-edu-button').textContent = 'Submit';
                document.getElementById('degree-edu-details-form').reset();
                await continueLoginBtnshowOrHide();
            }
        }
        catch (error) {
            console.error('Error updating certificate image:', error);
            displayMessage('Something went wrong', 'danger');
            document.querySelector('#save-degree-edu-button').disabled = false;
            document.querySelector('#save-degree-edu-button').textContent = 'Submit';
        }
    }
    else {
        console.log("Please fill all the details");
        displayMessage('Please fill all the details', 'danger');
        document.querySelector('#save-degree-edu-button').disabled = false;
        document.querySelector('#save-degree-edu-button').textContent = 'Submit';
    }
})

// --------------- Post -graduation/Masters Education Details --------------------------

/**
 * to check the inter/12th class education details
 * @param {*} userId 
 * @returns 
 */
async function checkUserDegreeDocumentExists(userId) {
    const userDegreeCollectionRef = collection(firestore, 'learners', userId, 'userdegree');
    const userDegreeSnapshot = await getDocs(userDegreeCollectionRef);
    return !userDegreeSnapshot.empty;
}

/**
 * 
 * to show or hide the continue login button
 */
async function continueLoginBtnshowOrHide() {
    // console.log("showorhidethe login button")
    const userDetailsExist = await checkUserDegreeDocumentExists(userId);
    if (userDetailsExist) {
        // console.log("if")
        document.querySelector('.user-login-continue-btn').classList.remove('d-none');
    }
    else {
        // console.log("else");
        document.querySelector('.user-login-continue-btn').classList.add('d-none');
    }
}


document.querySelector('#user-masters-accordion-btn').addEventListener('click', async (event) => {
    event.preventDefault();
    const userDegreeExists = await checkUserDegreeDocumentExists(userId);
    // console.log(userDegreeExists);
    const mastersAccordionBtn = document.getElementById('user-masters-accordion-btn');
    const mastersAccordionContent = document.querySelector('.accordion-collapse-seven');

    if (!userDegreeExists) {
        // console.log("if")
        mastersAccordionContent.classList.add('d-none');
        mastersAccordionBtn.classList.add('collapsed');
        displayMessage('Please fill the above graduation education details', 'danger');
    }
    else {

        // console.log("else");
        mastersAccordionContent.classList.remove('d-none');
    }
})


/**
 * save the user post-graduation/masters details 
 * @author mydev 
 */
document.querySelector('#save-masters-edu-button').addEventListener('click', async (e) => {
    document.querySelector('#save-masters-edu-button').disabled = true;
    document.querySelector('#save-masters-edu-button').textContent = 'Submitting...';
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

    if (userMastersBoard && userMastersEducationName && userMastersEduSpeName && userMastersEducationCity && userMastersEducationState
        && userMastersStart && userMastersEnd && userMastersPercentage && userMastersCertificate.files.length > 0) {
        try {
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
                // console.log("if")
                userMastersSnapshot.forEach(async (docu) => {
                    const userMastersData = docu.data();
                    // console.log(userMastersData.mastersCertificateImageUrl)
                    if (userMastersData.mastersCertificateImageUrl) {
                        const fileName = getFileNameFromUrl(userMastersData.mastersCertificateImageUrl);
                        // console.log(fileName)
                        if (fileName) {
                            const storageRef = ref(storage, 'masters_certificate_images/' + fileName);
                            await deleteObject(storageRef);
                        }
                    }

                    const storageRef = ref(storage, 'masters_certificate_images/' + userMastersCertificateImageFile.name);
                    await uploadBytes(storageRef, userMastersCertificateImageFile);
                    const certificateImageUrl = await getDownloadURL(storageRef);

                    const userMastersDocRef = doc(firestore, 'learners', userId, 'usermasters', docu.id)
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
                    document.querySelector('#save-masters-edu-button').disabled = false;
                    document.querySelector('#save-masters-edu-button').textContent = 'Submit';
                    document.getElementById('masters-edu-details-form').reset();
                })
            }
            else {
                // console.log("else");
                const storageRef = ref(storage, 'masters_certificate_images/' + userMastersCertificateImageFile.name);
                await uploadBytes(storageRef, userMastersCertificateImageFile);
                const certificateImageUrl = await getDownloadURL(storageRef);

                const docRef = await addDoc(userMastersCollectionRef,
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
                // console.log(docRef.id)
                await updateDoc(docRef, { userMastersId: docRef.id })
                console.log('User Post-Graduation/Masters details saved successfully')
                displayMessage('User Post-Graduation/Masters details saved successfully', 'success')
                document.querySelector('#save-masters-edu-button').disabled = false;
                document.querySelector('#save-masters-edu-button').textContent = 'Submit';
                document.getElementById('masters-edu-details-form').reset();
            }
        }
        catch (error) {
            console.error('Error updating certificate image:', error);
            displayMessage('Something went wrong', 'danger');
            document.querySelector('#save-masters-edu-button').disabled = false;
            document.querySelector('#save-masters-edu-button').textContent = 'Submit';
        }
    }
    else {
        console.log("Please fill all the details");
        displayMessage('Please fill all the details', 'danger');
        document.querySelector('#save-masters-edu-button').disabled = false;
        document.querySelector('#save-masters-edu-button').textContent = 'Submit';
    }
})


// --------------------------- internship/project details --------------------------
// document.querySelector('#user-internship-accordion-btn').addEventListener('click', async (event) => {
//     event.preventDefault();

//     const userAddressExists = await checkUserAddressDocumentExists(userId);
//     const userSchoolExists = await checkUserSchoolDocumentExists(userId);
//     const userInterExists = await checkUserInterDocumentExists(userId);
//     const userDegreeExists = await checkUserDegreeDocumentExists(userId);
//     console.log(userDegreeExists);
//     const internshipAccordionBtn = document.getElementById('user-internship-accordion-btn');
//     const internsAccordionContent = document.querySelector('.accordion-collapse-five');

//     if(!userAddressExists){
//         console.log("if")
//         internshipAccordionBtn.classList.add('d-none');
//         internsAccordionContent.classList.add('collapsed');
//         displayMessage('Please fill the above graduation education details', 'danger');
//     }

//     if(!userSchoolExists){
//         console.log("if")
//         internshipAccordionBtn.classList.add('d-none');
//         internsAccordionContent.classList.add('collapsed');
//         displayMessage('Please fill the above graduation education details', 'danger');
//     }

//     if(!userInterExists){
//         console.log("if")
//         internshipAccordionBtn.classList.add('d-none');
//         internsAccordionContent.classList.add('collapsed');
//         displayMessage('Please fill the above graduation education details', 'danger');
//     }

//     if(!userDegreeExists){
//         console.log("if")
//         internshipAccordionBtn.classList.add('d-none');
//         internsAccordionContent.classList.add('collapsed');
//         displayMessage('Please fill the above graduation education details', 'danger');
//     }
//     else {

//         console.log("else");
//         internsAccordionContent.classList.remove('d-none');
//     }
// })

/**
 * save the user internship/academic project details 
 * @author mydev 
 */
document.querySelector('#save-internship-button').addEventListener('click', async (e) => {
    document.querySelector('#save-internship-button').disabled = true;
    document.querySelector('#save-internship-button').textContent = 'Submitting...';
    const userProjectName = document.querySelector("#internship-project-name").value;
    const userProjectTechnologies = document.querySelector("#internship-technologies").value;
    const userInternshipCity = document.querySelector("#internship-city").value;
    const userInternshipStart = document.querySelector("#internship-sDate").value;
    const userInternshipEnd = document.querySelector("#internship-eDate").value;
    const userProjectDescription = document.querySelector("#internship-project-description").value;
    const userInternshipCertificate = document.querySelector('#internship-cert');
    const userInternshipCertificateImageFile = userInternshipCertificate.files[0];

    if (userProjectName && userProjectTechnologies && userInternshipCity && userInternshipStart
        && userInternshipEnd && userProjectDescription && userInternshipCertificate.files.length > 0) {
        const userAddressCollectionRef = collection(firestore, 'learners', userId, 'useraddress')
        const userAddressSnapshot = await getDocs(userAddressCollectionRef);
        if (userAddressSnapshot.empty) {
            displayMessage('Please fill your address Details', 'danger')
            return;
        }

        const userSchoolCollectionRef = collection(firestore, 'learners', userId, 'userschool');
        const userSchoolSnapshot = await getDocs(userSchoolCollectionRef);
        if (userSchoolSnapshot.empty) {
            displayMessage('Please fill your 10th education Details', 'danger')
            return;
        }

        const userInterCollectionRef = collection(firestore, 'learners', userId, 'userinter');
        const userInterSnapshot = await getDocs(userInterCollectionRef);
        if (userInterSnapshot.empty) {
            displayMessage('Please fill your intermediate/12th education Details', 'danger')
            return;
        }

        const userDegreeCollectionRef = collection(firestore, 'learners', userId, 'userdegree');
        const userDegreeSnapshot = await getDocs(userDegreeCollectionRef);
        if (userDegreeSnapshot.empty) {
            displayMessage('Please fill your graduation education Details', 'danger')
            return;
        }

        try {
            const userInternshipCollectionRef = collection(firestore, 'learners', userId, 'userinternship');
            const userInternshipSnapshot = await getDocs(userInternshipCollectionRef);
            if (!userInternshipSnapshot.empty) {
                // console.log("if")
                userInternshipSnapshot.forEach(async (docu) => {
                    const userInternshipData = docu.data();
                    // console.log(userInternshipData.internshipCertificateImageUrl)
                    if (userInternshipData.internshipCertificateImageUrl) {
                        const fileName = getFileNameFromUrl(userInternshipData.userInternshipCertificateImageFile);
                        // console.log(fileName)
                        if (fileName) {
                            const storageRef = ref(storage, 'internship_certificate_images/' + fileName);
                            await deleteObject(storageRef);
                        }
                    }

                    const storageRef = ref(storage, 'internship_certificate_images/' + userInternshipCertificateImageFile.name);
                    await uploadBytes(storageRef, userInternshipCertificateImageFile);
                    const certificateImageUrl = await getDownloadURL(storageRef);

                    const userInternshipDocRef = doc(firestore, 'learners', userId, 'userinternship', docu.id)
                    await updateDoc(userInternshipDocRef,
                        {
                            userProjectName: userProjectName,
                            userProjectTechnologies: userProjectTechnologies,
                            userInternshipCity: userInternshipCity,
                            userInternshipStart: userInternshipStart,
                            userInternshipEnd: userInternshipEnd,
                            userProjectDescription: userProjectDescription,
                            internshipCertificateImageUrl: certificateImageUrl
                        });
                    console.log('User Internship/Academic Project details updated successfully');
                    displayMessage('User Internship/Academic Project details updated successfully', 'success');
                    document.querySelector('#save-internship-button').disabled = false;
                    document.querySelector('#save-internship-button').textContent = 'Submit';
                    document.getElementById('internship-project-details-form').reset();
                })
            }
            else {
                // console.log("else");
                const storageRef = ref(storage, 'internship_certificate_images/' + userInternshipCertificateImageFile.name);
                await uploadBytes(storageRef, userInternshipCertificateImageFile);
                const certificateImageUrl = await getDownloadURL(storageRef);

                const docRef = await addDoc(userInternshipCollectionRef,
                    {
                        userProjectName: userProjectName,
                        userProjectTechnologies: userProjectTechnologies,
                        userInternshipCity: userInternshipCity,
                        userInternshipStart: userInternshipStart,
                        userInternshipEnd: userInternshipEnd,
                        userProjectDescription: userProjectDescription,
                        internshipCertificateImageUrl: certificateImageUrl
                    });
                // console.log(docRef.id)
                await updateDoc(docRef, { userInternshipId: docRef.id })
                console.log('User Internship/Academic Project details saved successfully')
                displayMessage('User Internship/Academic Project details saved successfully', 'success')
                document.querySelector('#save-internship-button').disabled = false;
                document.querySelector('#save-internship-button').textContent = 'Submit';
                document.getElementById('internship-project-details-form').reset();
            }
        }
        catch (error) {
            console.error('Error updating certificate image:', error);
            displayMessage('Something went wrong', 'danger');
            document.querySelector('#save-internship-button').disabled = false;
            document.querySelector('#save-internship-button').textContent = 'Submit';
        }
    }
    else {
        console.log("Please fill all the details");
        displayMessage('Please fill all the details', 'danger');
        document.querySelector('#save-internship-button').disabled = false;
        document.querySelector('#save-internship-button').textContent = 'Submit';
    }
})


/**
* save the user address 
* @author mydev
*/
document.querySelector('#save-user-additional-button').addEventListener('click', async (e) => {
    e.preventDefault()
    document.querySelector('#save-user-additional-button').disabled = true;
    document.querySelector('#save-user-additional-button').textContent = 'Submitting...';
    // console.log("1")
    const userAdditionalSkills = document.querySelector('#user-skills').value;
    const userAdditionalLanguages = document.querySelector('#user-languages').value;
    const userAdditionalHobbies = document.querySelector('#user-hobbies').value;
    if (userAdditionalSkills && userAdditionalLanguages && userAdditionalHobbies) {
        // console.log("2")
        const userAddressCollectionRef = collection(firestore, 'learners', userId, 'useraddress')
        const userAddressSnapshot = await getDocs(userAddressCollectionRef);
        if (userAddressSnapshot.empty) {
            displayMessage('Please fill your address Details', 'danger')
            return;
        }

        const userSchoolCollectionRef = collection(firestore, 'learners', userId, 'userschool');
        const userSchoolSnapshot = await getDocs(userSchoolCollectionRef);
        if (userSchoolSnapshot.empty) {
            displayMessage('Please fill your 10th education Details', 'danger')
            return;
        }

        const userInterCollectionRef = collection(firestore, 'learners', userId, 'userinter');
        const userInterSnapshot = await getDocs(userInterCollectionRef);
        if (userInterSnapshot.empty) {
            displayMessage('Please fill your intermediate/12th education Details', 'danger')
            return;
        }

        const userDegreeCollectionRef = collection(firestore, 'learners', userId, 'userdegree');
        const userDegreeSnapshot = await getDocs(userDegreeCollectionRef);
        if (userDegreeSnapshot.empty) {
            displayMessage('Please fill your graduation education Details', 'danger')
            return;
        }


        const userAdditionalCollectionRef = collection(firestore, 'learners', userId, 'useradditional')
        const userAdditionalSnapshot = await getDocs(userAdditionalCollectionRef);
        if (!userAdditionalSnapshot.empty) {
            // console.log('if');
            userAdditionalSnapshot.forEach(async (docu) => {
                const userAdditionalDocRef = doc(firestore, 'learners', userId, 'useradditional', docu.id);

                await updateDoc(userAdditionalDocRef, {
                    userAdditionalSkills: userAdditionalSkills,
                    userAdditionalLanguages: userAdditionalLanguages,
                    userAdditionalHobbies: userAdditionalHobbies
                });
                console.log('User Additional Details updated successfully');
                displayMessage('User Additional Details updated successfully', 'success');
                document.querySelector('#save-user-additional-button').disabled = false;
                document.querySelector('#save-user-additional-button').textContent = 'Submit';
                document.getElementById('user-additional-details-form').reset();
            })
        }
        else {
            // console.log("else")
            const userAdditionalData = {
                userAdditionalSkills: userAdditionalSkills,
                userAdditionalLanguages: userAdditionalLanguages,
                userAdditionalHobbies: userAdditionalHobbies
            }
            const docRef = await addDoc(userAdditionalCollectionRef, userAdditionalData)
            // console.log(docRef.id)
            await updateDoc(docRef, { userAdditionalId: docRef.id })
            console.log('User Additional Details saved successfully')
            displayMessage('User Additional Details saved successfully', 'success')
            document.querySelector('#save-user-additional-button').disabled = false;
            document.querySelector('#save-user-additional-button').textContent = 'Submit';
            document.getElementById('user-additional-details-form').reset();
        }
    }
    else {
        console.log("Please fill all the details")
        displayMessage('Please fill all the details', 'danger')
        document.querySelector('#save-user-additional-button').disabled = false;
        document.querySelector('#save-user-additional-button').textContent = 'Submit';
    }

})

document.getElementById('user-referral-btn').addEventListener('click', async function () {

    document.querySelector('#user-referral-btn').disabled = true;
    document.querySelector('#user-referral-btn').textContent = 'Submitting...';

    // Get the entered referral email
    const referralEmail = document.getElementById('referral-email').value.trim();

    // Validate the email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(referralEmail);

    // Display an error if the email is not valid
    if (!isValidEmail) {
        // document.getElementById('referral-email-error').textContent = 'Invalid email format';
        displayMessage('Invalid email format', 'danger');
        return;
    }

    // Check if the current user is a student (learner)
    const userQuery = await getDocs(collection(firestore, 'learners'), where('userId', '==', userId));
    const userDocs = userQuery.docs;

    if (userDocs.length > 0) {
        const userDoc = userDocs[0];
        const userRole = userDoc.data().role;

        // Check if the user is a learner
        if (userRole === 'ROLE_LEARNER') {
            // Query Firestore for the TPO with the specified email
            const tpoQuery = await getDocs(query(collection(firestore, 'learners'), where('role', '==', 'ROLE_TPO'), where('email', '==', referralEmail)));
            const tpoDocs = tpoQuery.docs;

            // Check if a TPO with the provided email exists
            if (tpoDocs.length > 0) {
                const tpoDoc = tpoDocs[0];
                const tpoId = tpoDoc.id;

                // Update the learner's document with the TPO's information
                const learnerDocRef = doc(collection(firestore, 'learners'), userId);

                await updateDoc(learnerDocRef, {
                    tpoEmail: referralEmail,
                });

                // Reset the error message
                // document.getElementById('referral-email-error').textContent = '';

                // Optional: Display a success message or perform other actions
                displayMessage('Student associated with TPO successfully', 'success');

                document.querySelector('#user-referral-btn').disabled = false;
                document.querySelector('#user-referral-btn').textContent = 'Submit';
            } else {
                // Display an error if no TPO with the provided email is found
                // document.getElementById('referral-email-error').textContent = 'No TPO found with the provided email';
                displayMessage('No TPO found with the provided email', 'danger');
                document.querySelector('#user-referral-btn').disabled = false;
                document.querySelector('#user-referral-btn').textContent = 'Submit';
            }
        } else {
            // Display an error if the current user is not a learner
            // document.getElementById('referral-email-error').textContent = 'Invalid user role';
            displayMessage('Invalid student role', 'danger');
            document.querySelector('#user-referral-btn').disabled = false;
            document.querySelector('#user-referral-btn').textContent = 'Submit';
        }
    } else {
        // Display an error if the user is not found
        // document.getElementById('referral-email-error').textContent = 'User not found';
        displayMessage('Student not found', 'danger');
        document.querySelector('#user-referral-btn').disabled = false;
        document.querySelector('#user-referral-btn').textContent = 'Submit';
    }
});

/**
 * continue to login button 
 * 
 */
document.querySelector('.user-login-continue-btn').addEventListener('click', (event) => {
    // console.log("1")
    if (event) {
        const confirmation = confirm('Do you want enter post-graduation, internship and other additional details?')
        if (!confirmation) {
            // console.log("if")
            window.location.href = 'login.html'
            window.history.replaceState({}, "", "login.html");
        }
    }
})