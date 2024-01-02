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
console.log(userId);


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
    console.log("auth")
    if (user) {
        console.log("if")
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
        console.log("else")
        // window.location.href = "login.html";
        onLoggedOut()
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

/**
 * save the user address 
 * @author mydev
 */
document.querySelector('#save-user-address-button').addEventListener('click', async (e) => {
    e.preventDefault()
    console.log("1")
    const userAddress = document.querySelector('#user-address').value;
    const userPostcode = document.querySelector('#user-postcode').value;
    const userCity = document.querySelector('#user-city').value;
    const userState = document.querySelector('#user-state').value;
    const userCountry = document.querySelector('#user-country').value;
    console.log(userId)
    if (userAddress && userPostcode && userCity && userState && userCountry) {
        console.log("2")
        const userAddressCollectionRef = collection(firestore, 'learners', userId, 'address')
        const userAddressSnapshot = await getDocs(userAddressCollectionRef);
        if (!userAddressSnapshot.empty) {
            console.log('if');
            userAddressSnapshot.forEach(async (document) => {
                const AddressDocRef = doc(firestore, 'learners', userId, 'address', document.id);

                await updateDoc(AddressDocRef, {
                    address: userAddress,
                    postcode: userPostcode,
                    city: userCity,
                    state: userState,
                    country: userCountry
                });
                console.log('Address details saved successfully');
                displayMessage('Address details saved successfully', 'success');
                document.getElementById('user-address-form').reset();
            })
        }
        else {
            console.log("else")
            const userAddressData = {
                address: userAddress,
                postcode: userPostcode,
                city: userCity,
                state: userState,
                country: userCountry
            }
            const docRef = await addDoc(userAddressCollectionRef, userAddressData)
            console.log(docRef.id)
            await updateDoc(docRef, { addressId: docRef.id })
            console.log('Address details saved successfully')
            displayMessage('Address details saved successfully','success')
            document.getElementById('user-address-form').reset();
        }
    }
    else {
        console.log("Please enter all fields")
        displayMessage('Please enter all fields', 'danger')
    }
})

/**
 * save the user school education details 
 * @author mydev 
 */
document.querySelector('#save-school-edu-button').addEventListener('click',async(e)=>{
    const userSchoolBoard = document.querySelector("#school-board").value;
    const userSchoolName = document.querySelector("#school-name").value;
    const userSchoolEducationCity = document.querySelector("#school-education-city").value;
    const userSchoolEducationState = document.querySelector('#school-education-state').value
    const userSchoolStart = document.querySelector("#school-education-sDate").value;
    const userSchoolEnd = document.querySelector("#school-education-eDate").value;
    const userSchoolPercentage = document.querySelector("#school-education-percentage").value;
    const userSchoolCertificate = document.querySelector('#school-education-cert');
    const userCertificateImageFile = userSchoolCertificate.files[0];
 
    if(userSchoolBoard && userSchoolName && userSchoolEducationCity && userSchoolEducationState
      && userSchoolStart && userSchoolEnd && userSchoolCertificate.files.length>0){
         try {
             const userSchoolCollectionRef = collection(firestore, 'learners', userId, 'userschool');
             const userSchoolSnapshot = await getDocs(userSchoolCollectionRef);
             if (!userSchoolSnapshot.empty) {
                 console.log("if")
                 userSchoolSnapshot.forEach(async (document) => {
                     const userDocId = document.data().userSchoolDocId;
                     const userData = document.data();
                     if (userData.certificateImageUrl) {
                         const fileName = getFileNameFromUrl(userData.certificateImageUrl);
                         console.log(fileName)
                         if (fileName) {
                             const storageRef = ref(storage, 'certificate_images/' + fileName);
                             await deleteObject(storageRef);
                         }
                     }
 
                     const storageRef = ref(storage, 'certificate_images/' + userCertificateImageFile.name);
                     await uploadBytes(storageRef, userCertificateImageFile);
                     const certificateImageUrl = await getDownloadURL(storageRef);
 
                     const userSchoolDocRef = doc(firestore, 'learners', userId, 'userschool', document.id)
                     await updateDoc(userSchoolDocRef,
                     {
                         userSchoolBoard : userSchoolBoard,
                         userSchoolName :userSchoolName,
                         userSchoolEducationCity : userSchoolEducationCity,
                         userSchoolEducationState : userSchoolEducationState,
                         userSchoolStart : userSchoolStart,
                         userSchoolEnd : userSchoolEnd,
                         userSchoolPercentage :userSchoolPercentage,
                         schoolCertificateImageUrl: certificateImageUrl
                     });
                     console.log('school details saved successfully');
                     displayMessage('school details saved successfully', 'success');
                     document.getElementById('school-edu-details-form').reset();
                 })
             }
             else {
                 console.log("else");
                 const storageRef = ref(storage, 'certificate_images/' + userCertificateImageFile.name);
                 await uploadBytes(storageRef, userCertificateImageFile);
                 const certificateImageUrl = await getDownloadURL(storageRef);
 
                 const docRef = await addDoc(userSchoolCollectionRef,
                     {
                         userSchoolBoard : userSchoolBoard,
                         userSchoolName :userSchoolName,
                         userSchoolEducationCity : userSchoolEducationCity,
                         userSchoolEducationState : userSchoolEducationState,
                         userSchoolStart : userSchoolStart,
                         userSchoolEnd : userSchoolEnd,
                         userSchoolPercentage :userSchoolPercentage,
                         schoolCertificateImageUrl: certificateImageUrl
                     });
                 console.log(docRef.id)
                 await updateDoc(docRef, { userSchoolId: docRef.id })
                 console.log('school details saved successfully')
                 displayMessage('school details saved successfully','success')  
                 document.getElementById('school-edu-details-form').reset();
             }  
         }
         catch (error) {
             console.error('Error updating certificate image:', error);
             displayMessage('Something went wrong', 'danger');
         }
     }
     else {
         console.log("please the fill the details");
         displayMessage('please the fill the details', 'danger');
     }
 })

/**
 * save the user inter education details 
 * @author mydev 
 */
document.querySelector('#save-inter-edu-button').addEventListener('click',async(e)=>{
    const userInterBoard = document.querySelector("#inter-board").value;
    const userInterEducationName = document.querySelector("#inter-education-name").value;
    const userInterEducationCity = document.querySelector("#inter-education-city").value;
    const userInterEducationState = document.querySelector("#inter-education-state").value;
    const userInterStart = document.querySelector("#inter-education-sDate").value;
    const userInterEnd = document.querySelector("#inter-education-eDate").value;
    const userInterPercentage = document.querySelector("#inter-education-percentage").value;
    const userInterCertificate = document.querySelector('#inter-education-cert');
    const userInterCertificateImageFile = userInterCertificate.files[0];
 
    if(userInterBoard && userInterEducationName && userInterEducationCity && userInterEducationState && userInterStart 
     && userInterEnd && userInterPercentage && userInterCertificate.files.length>0){
         try {
             const userInterCollectionRef = collection(firestore, 'learners',userId,'userInter');
             const userInterSnapshot = await getDocs(userInterCollectionRef);
             if(!userInterSnapshot.empty){
                 console.log("if")
                 userInterSnapshot.forEach(async(document)=>{
                     const userInterData = document.data();
                     if(userInterData.certificateImageUrl){
                         const fileName = getFileNameFromUrl(userInterData.certificateImageUrl);
                         console.log(fileName)
                         if (fileName) {
                             const storageRef = ref(storage, 'inter_certificate_images/' + fileName);
                             await deleteObject(storageRef);
                         }
                     }
 
                     const storageRef = ref(storage, 'inter_certificate_images/' + userInterCertificateImageFile.name);
                     await uploadBytes(storageRef, userInterCertificateImageFile);
                     const certificateImageUrl = await getDownloadURL(storageRef);
 
                     const userInterDocRef = doc(firestore, 'learners',userId,'userInter',document.id)
                     await updateDoc(userInterDocRef,
                     {
                        userInterBoard : userInterBoard,
                        userInterEducationName :userInterEducationName,
                        userInterEducationCity : userInterEducationCity,
                        userInterEducationState : userInterEducationState,
                        userInterStart : userInterStart,
                        userInterEnd : userInterEnd,
                        userInterPercentage :userInterPercentage,
                        interCertificateImageUrl: certificateImageUrl
                     });
                     console.log('school details saved successfully');
                     displayMessage('school details saved successfully', 'success');
                     document.getElementById('inter-edu-details-form').reset();
                 })
             }
             else{
                 console.log("else");
                 const storageRef = ref(storage, 'inter_certificate_images/' + userInterCertificateImageFile.name);
                 await uploadBytes(storageRef, userInterCertificateImageFile);
                 const certificateImageUrl = await getDownloadURL(storageRef);
                 
                 const docRef =await addDoc(userInterCollectionRef,
                     {
                        userInterBoard : userInterBoard,
                        userInterEducationName :userInterEducationName,
                        userInterEducationCity : userInterEducationCity,
                        userInterEducationState : userInterEducationState,
                        userInterStart : userInterStart,
                        userInterEnd : userInterEnd,
                        userInterPercentage :userInterPercentage,
                        interCertificateImageUrl: certificateImageUrl
                     });
                 console.log(docRef.id)
                 await updateDoc(docRef,{userInterId:docRef.id})
                 console.log('Address details saved successfully')
                 displayMessage('Address details saved successfully','success')  
                 document.getElementById('inter-edu-details-form').reset();
             }  
         }
         catch (error){
             console.error('Error updating certificate image:', error);
             displayMessage('Something went wrong','danger');
         }
    }
    else{
       console.log("please the fill the details");
       displayMessage('please the fill the details','danger');
    }
 })


 /**
 * save the user graduation details 
 * @author mydev 
 */
document.querySelector('#save-degree-edu-button').addEventListener('click',async(e)=>{
    const userDegreeBoard = document.querySelector("#degree-board").value;
    const userDegreeEducationName = document.querySelector("#degree-education-name").value;
    const userDegreeEducationCity = document.querySelector("#degree-education-city").value;
    const userDegreeEducationState = document.querySelector("#degree-education-state").value;
    const userDegreeStart = document.querySelector("#degree-education-sDate").value;
    const userDegreeEnd = document.querySelector("#degree-education-eDate").value;
    const userDegreePercentage = document.querySelector("#degree-education-percentage").value;
    const userDegreeCertificate = document.querySelector('#degree-education-cert');
    const userDegreeCertificateImageFile = userDegreeCertificate.files[0];
 
    if(userDegreeBoard && userDegreeEducationName && userDegreeEducationCity && userDegreeEducationState && userDegreeStart 
     && userDegreeStart && userDegreePercentage && userDegreeCertificate.files.length>0){
         try {
             const userDegreeCollectionRef = collection(firestore, 'learners',userId,'userdegree');
             const userDegreeSnapshot = await getDocs(userDegreeCollectionRef);
             if(!userDegreeSnapshot.empty){
                 console.log("if")
                 userDegreeSnapshot.forEach(async(document)=>{
                     const userDegreeData = document.data();
                     console.log(userDegreeData.certificateImageUrl)
                     if(userDegreeData.interCertificateImageUrl){
                         const fileName = getFileNameFromUrl(userDegreeData.interCertificateImageUrl);
                         console.log(fileName)
                         if (fileName) {
                             const storageRef = ref(storage, 'degree_certificate_images/' + fileName);
                             await deleteObject(storageRef);
                         }
                     }
 
                     const storageRef = ref(storage, 'degree_certificate_images/' + userDegreeCertificateImageFile.name);
                     await uploadBytes(storageRef, userDegreeCertificateImageFile);
                     const certificateImageUrl = await getDownloadURL(storageRef);
 
                     const userDegreeDocRef = doc(firestore, 'learners',userId,'userdegree',document.id)
                     await updateDoc(userDegreeDocRef,
                     {
                        userDegreeBoard : userDegreeBoard,
                        userDegreeEducationName :userDegreeEducationName,
                        userDegreeEducationCity : userDegreeEducationCity,
                        userDegreeEducationState : userDegreeEducationState,
                        userDegreeStart : userDegreeStart,
                        userDegreeEnd : userDegreeEnd,
                        userDegreePercentage :userDegreePercentage,
                        degreeCertificateImageUrl: certificateImageUrl
                     });
                     console.log('user graduation details saved successfully');
                     displayMessage('user graduation details saved successfully', 'success');
                     document.getElementById('degree-edu-details-form').reset();
                 })
             }
             else{
                 console.log("else");
                 const storageRef = ref(storage, 'degree_certificate_images/' + userDegreeCertificateImageFile.name);
                 await uploadBytes(storageRef, userDegreeCertificateImageFile);
                 const certificateImageUrl = await getDownloadURL(storageRef);
                 
                 const docRef =await addDoc(userDegreeCollectionRef,
                     {
                        userDegreeBoard : userDegreeBoard,
                        userDegreeEducationName :userDegreeEducationName,
                        userDegreeEducationCity : userDegreeEducationCity,
                        userDegreeEducationState : userDegreeEducationState,
                        userDegreeStart : userDegreeStart,
                        userDegreeEnd : userDegreeEnd,
                        userDegreePercentage :userDegreePercentage,
                        degreeCertificateImageUrl: certificateImageUrl
                     });
                 console.log(docRef.id)
                 await updateDoc(docRef,{userInterId:docRef.id})
                 console.log('user graduation details saved successfully')
                 displayMessage('user graduation details saved successfully','success')  
                 document.getElementById('degree-edu-details-form').reset();
             }  
         }
         catch (error){
             console.error('Error updating certificate image:', error);
             displayMessage('Something went wrong','danger');
         }
    }
    else{
       console.log("please the fill the details");
       displayMessage('please the fill the details','danger');
    }
 })

/**
 * save the user internship/academic project details 
 * @author mydev 
 */
document.querySelector('#save-internship-button').addEventListener('click',async(e)=>{
    const userProjectName = document.querySelector("#internship-project-name").value;
    const userProjectTechnologies = document.querySelector("#internship-technologies").value;
    const userInternshipCity = document.querySelector("#internship-city").value;
    const userInternshipStart = document.querySelector("#internship-sDate").value;
    const userInternshipEnd = document.querySelector("#internship-eDate").value;
    const userProjectDescription = document.querySelector("#internship-project-description").value;
    const userInternshipCertificate = document.querySelector('#internship-cert');
    const userInternshipCertificateImageFile = userInternshipCertificate.files[0];
 
    if(userProjectName && userProjectTechnologies && userInternshipCity && userInternshipStart 
     && userInternshipEnd && userProjectDescription && userInternshipCertificate.files.length>0){
         try {
             const userInternshipCollectionRef = collection(firestore, 'learners',userId,'userInternship');
             const userInternshipSnapshot = await getDocs(userInternshipCollectionRef);
             if(!userInternshipSnapshot.empty){
                 console.log("if")
                 userInternshipSnapshot.forEach(async(document)=>{
                     const userInternshipData = document.data();
                     console.log(userInternshipData.internshipCertificateImageUrl)
                     if(userInternshipData.internshipCertificateImageUrl){
                         const fileName = getFileNameFromUrl(userInternshipData.userInternshipCertificateImageFile);
                         console.log(fileName)
                         if (fileName) {
                             const storageRef = ref(storage, 'internship_certificate_images/' + fileName);
                             await deleteObject(storageRef);
                         }
                     }
 
                     const storageRef = ref(storage, 'internship_certificate_images/' + userInternshipCertificateImageFile.name);
                     await uploadBytes(storageRef, userInternshipCertificateImageFile);
                     const certificateImageUrl = await getDownloadURL(storageRef);
 
                     const userInternshipDocRef = doc(firestore, 'learners',userId,'userInternship',document.id)
                     await updateDoc(userInternshipDocRef,
                     {
                        userProjectName :userProjectName ,
                        userProjectTechnologies :userProjectTechnologies,
                        userInternshipCity : userInternshipCity,
                        userInternshipStart : userInternshipStart,
                        userInternshipEnd : userInternshipEnd,
                        userProjectDescription :userProjectDescription,
                        internshipCertificateImageUrl: certificateImageUrl
                     });
                     console.log('user internship/academic project details saved successfully');
                     displayMessage('user internship/academic project saved successfully', 'success');
                     document.getElementById('internship-project-details-form').reset();
                 })
             }
             else{
                 console.log("else");
                 const storageRef = ref(storage, 'internship_certificate_images/' + userInternshipCertificateImageFile.name);
                 await uploadBytes(storageRef, userInternshipCertificateImageFile);
                 const certificateImageUrl = await getDownloadURL(storageRef);
                 
                 const docRef =await addDoc(userInternshipCollectionRef,
                     {
                        userProjectName :userProjectName ,
                        userProjectTechnologies :userProjectTechnologies,
                        userInternshipCity : userInternshipCity,
                        userInternshipStart : userInternshipStart,
                        userInternshipEnd : userInternshipEnd,
                        userProjectDescription :userProjectDescription,
                        internshipCertificateImageUrl: certificateImageUrl
                     });
                 console.log(docRef.id)
                 await updateDoc(docRef,{userIntershipId:docRef.id})
                 console.log('user internship/academic project saved successfully')
                 displayMessage('user internship/academic project saved successfully','success') 
                 document.getElementById('internship-project-details-form').reset(); 
             }  
         }
         catch (error){
             console.error('Error updating certificate image:', error);
             displayMessage('Something went wrong','danger');
         }
    }
    else{
       console.log("please the fill the details");
       displayMessage('please the fill the details','danger');
    }
 }) 

 /**
 * save the user address 
 * @author mydev
 */
document.querySelector('#save-user-additional-button').addEventListener('click',async(e)=>{
    e.preventDefault()
    console.log("1")
    const userAdditionalSkills = document.querySelector('#user-skills').value;
    const userAdditionalLanguages = document.querySelector('#user-languages').value;
    const userAdditionalHobbies = document.querySelector('#user-hobbies').value;
    if(userAdditionalSkills && userAdditionalLanguages && userAdditionalHobbies){
      console.log("2")
      const userAdditionalCollectionRef = collection(firestore,'learners',userId,'userAdditional')
      const userAdditionalSnapshot =await getDocs(userAdditionalCollectionRef);
        if(!userAdditionalSnapshot.empty){
            console.log('if');
            userAdditionalSnapshot.forEach(async(document)=>{
                const userAdditionalDocRef  = doc(firestore,'learners',userId,'userAdditional',document.id);

                await updateDoc(userAdditionalDocRef,{
                    userAdditionalSkills:userAdditionalSkills,
                    userAdditionalLanguages:userAdditionalLanguages,
                    userAdditionalHobbies:userAdditionalHobbies
                });
                console.log('user Additional details saved successfully');
                displayMessage('user Additional details saved successfully', 'success');
                document.getElementById('user-additional-details-form').reset();
                window.location.href ='login.html'; 
            })
        }
        else{
            console.log("else")
            const userAdditionalData = {
                userAdditionalSkills:userAdditionalSkills,
                userAdditionalLanguages:userAdditionalLanguages,
                userAdditionalHobbies:userAdditionalHobbies
            }
            const docRef =await addDoc(userAdditionalCollectionRef,userAdditionalData)
            console.log(docRef.id)
            await updateDoc(docRef,{userAdditionalId:docRef.id})
            console.log('user Additional details saved successfully')
            displayMessage('user Additional details saved successfully','success')
            document.getElementById('user-additional-details-form').reset();
            window.location.href ='login.html';
        }
    }
    else{
        console.log("Please enter all fields")
        displayMessage('Please enter all fields','danger')
    }
})
