//------------------------Firebase Config-----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { ref, uploadBytesResumable, getDownloadURL, getStorage, listAll, deleteObject } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js";
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
    updateDoc,
    deleteDoc,
    arrayUnion,
    arrayRemove,
    writeBatch,
    orderBy,
    limit,
    startAfter
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
const storageRef = ref(storage);

// ------------------------ global variables ----------------------------------------------
const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
const myCumulativeQuestionUpload = document.querySelector('.my-cumulative-question-upload');

var userData = null;
var loggedIn = null;
var userId = null;
var learnerRole = null;

// Function to check if the user is logged in
function isUserLoggedIn() {
    return !!auth.currentUser;
}

/**
 * Add an event listener to the confirmation logout button
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
 * get user snapshot cart(dependency)
 * @param {*} uid 
 * @returns 
 */
function getUserSnapshot(uid) {
    const userRef = doc(firestore, 'users', uid)
    console.log('3')
    return new Promise((resolve, reject) => {
        resolve(getDoc(userRef))
    })
}

/**
 * Use onAuthStateChanged to control access to admin dashboard
 * 
 */
onAuthStateChanged(auth, (user) => {
    if (user) {
        loggedIn = true
        onLoggedIn();
        // User is authenticated
        userId = user.uid;
        const docRef = doc(firestore, "learners", user.uid);
        const docSnap = getDoc(docRef);
        docSnap.then((docSnapshot) => {
            console.log(docSnapshot)
            if (docSnapshot.exists()) {
                userData = docSnapshot.data();
                learnerRole = userData.role;
                console.log(userData.role)
                roleAccess(userData.role);
                fetchAndDisplayLearnersDetails();
                // console.log(auth.currentUser.uid);
                // getUserRealTime();
                // toggleVideoContainer();
                stopLoader();
            }
        });
    } else {
        window.location.href = "login.html";
    }
});

/**
 * access the dashboard based on the role
 * @param {*} role 
 */
function roleAccess(role) {
    const roleMap = new Map([
        ["ROLE_ADMIN", "adminAppbar"],
        ["ROLE_LEARNER", "learnerAppbar"],
        ["ROLE_TPO", "tpoAppbar"],
    ]);
    const appbarList = document.querySelectorAll(`#${roleMap.get(role)}`);
    appbarList.forEach((appbar) => {
        appbar.classList.remove("d-none");
    })
}

/**
 * to execute upon logging in
 * 
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
 * 
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
 * 
 */
function stopLoader() {
    document.querySelector("#overlay").classList.add("hidden");
    document.querySelector("#main").classList.remove("hidden");
}


//--------------------------------------------------------------------------------------------


//-------------------------------------- display message function ----------------------------

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

// ------------------------------------------------------------------------------------
let learnersDocs = null
let learnersPerPage = 10
let currentPage = 0
let pageNotebook = []
let noOfRecords = null;
let sortOrderChange = true
let nextPageFlag = false
let prevPageFlag = false


/**
 * 
 * search learner-details
 */
let searchByName = null;
let searchByEmail = null;
document.querySelector('.search-learner-details').addEventListener('click', async (e) => {
    e.preventDefault();
    searchByName = document.querySelector('#searchby-learner-name').value;
    searchByEmail = document.querySelector('#searchby-learner-email').value;
    // const searchByRole = document.querySelector('#searchby-learner-role').value;
    document.querySelector('.prev-page').classList.add('d-none');
    document.querySelector('.next-page').classList.add('d-none');
    let queryRef = null;

    if (searchByEmail || searchByName) {
        if (searchByName) {
            queryRef = query(collection(firestore, 'learners'), where('name', '==', searchByName), where('role', '==', 'ROLE_LEARNER'));
        }
        if (searchByEmail) {
            queryRef = query(collection(firestore, 'learners'), where('email', '==', searchByEmail), where('role', '==', 'ROLE_LEARNER'));
        }
        // if(searchByRole){
        //     queryRef = query(collection(firestore,'learners'),where('role','==',searchByRole));
        // }
        fetchAndDisplayLearnersDetails(queryRef)
    }
    else {
        console.log("Please search users details by filling atleast one field")
        displayMessage('Please search users details by filling atleast one field', 'danger')
    }
})

document.querySelector('.clear-learner-details').addEventListener('click', () => {
    // Clear the search input value
    document.querySelector('.prev-page').classList.remove('d-none');
    document.querySelector('.next-page').classList.remove('d-none');
    document.querySelector('#searchby-learner-name').value = '';
    document.querySelector('#searchby-learner-email').value = '';
    fetchAndDisplayLearnersDetails();
});


document.querySelector('.prev-page').addEventListener('click', prevPage)
document.querySelector('.next-page').addEventListener('click', nextPage)

async function fetchAndDisplayLearnersDetails(queryRef = null) {
    const learnersDetail = document.querySelector('.learners-details');
    learnersDetail.innerHTML = '';
    const learnersDetailsRef = collection(firestore, 'learners');
    let searchDataFound = false;

    if (currentPage > 0) {
        console.log("if")
        const lastVisible = pageNotebook[currentPage - 1];
        const snapshot = await getDocs(query(
            queryRef || learnersDetailsRef, orderBy('name'), startAfter(lastVisible), where('role', '==', 'ROLE_LEARNER'), limit(learnersPerPage)
        ));
        learnersDocs = snapshot.docs;
    } else {
        console.log("esle")
        const snapshot = await getDocs(
            query(queryRef || learnersDetailsRef, orderBy('name'), where('role', '==', 'ROLE_LEARNER'), limit(learnersPerPage)
            ));
        learnersDocs = snapshot.docs;
    }

    pageNotebook[currentPage] = learnersDocs[learnersDocs.length - 1];
    console.log(currentPage)
    // console.log(learnersDocs)
    if (!learnersDocs.empty) {
        console.log("if")
        learnersDocs.forEach((doc) => {
            const learnerData = doc.data();
            console.log(learnerData.role)
            const tableRow = document.createElement('tr');
            tableRow.innerHTML = `
                <td>${learnerData.name}</td>
                <td>${learnerData.email}</td>
                <td>${learnerData.role}</td>
                <td>
                    <button class="btn btn-primary" id="update-role-btn" role="button" data-email="${learnerData.email}" 
                    data-role="${learnerData.role}" data-bs-toggle="modal" data-bs-target="#exampleModal">Update Role</button>
                </td>
                `
            learnersDetail.appendChild(tableRow);

            tableRow.querySelector('#update-role-btn').addEventListener('click', async (event) => {
                console.log("1")
                event.preventDefault();
                if (event) {
                    const email = event.target.getAttribute('data-email');
                    updateUserRole(email);
                }
            })


        })
    }

    // If search data is not found, display a message
    if ((searchByName || searchByEmail) && learnersDocs.length === 0) {
        const messageRow = document.createElement('tr');
        const messageCell = document.createElement('td');
        messageCell.colSpan = 3;
        messageCell.textContent = 'User with the given name or email does not exist in this page.';
        messageRow.appendChild(messageCell);
        learnersDetail.appendChild(messageRow);
    }
}


/**
 * Move to next page
 * @author dev
 */
async function nextPage() {
    document.querySelector('#searchby-learner-name').value = '';
    document.querySelector('#searchby-learner-email').value = '';
    console.log(await totalNopages());
    if (currentPage < await totalNopages() - 1) {
        console.log("nextpage")
        currentPage++;
        fetchAndDisplayLearnersDetails();
    } else {
        displayMessage('This is the last page.', 'danger');
    }
}


/**
 * Move to prev page
 * @author dev
 */
function prevPage() {
    document.querySelector('#searchby-learner-name').value = '';
    document.querySelector('#searchby-learner-email').value = '';
    if (currentPage > 0) {
        console.log("previouspage")
        currentPage--;
        fetchAndDisplayLearnersDetails();
    } else {
        displayMessage('This is the first page.', 'danger');
    }
}

/**
 * total numberpages
 * @returns 
 */
async function totalNopages() {
    return Math.ceil(await totalNoLearnersDocs() / learnersPerPage);
}

async function totalNoLearnersDocs() {
    const learnersCollectionRef = collection(firestore, 'learners');
    const learnersDocs = await getDocs(query(learnersCollectionRef, where('role', '==', 'ROLE_LEARNER')))
    return learnersDocs.docs.length;
}

/**
 * update role based on the email
 * @param {*} email 
 */
async function updateUserRole(email) {
    const userEmail = document.querySelector('#user-email');
    userEmail.value = email;

    const submitButton = document.querySelector('#form-submit-btn');
    submitButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const userRoleDropdown = document.querySelector('#newRole');
        const selectedRole = userRoleDropdown.options[userRoleDropdown.selectedIndex].value;

        if (!selectedRole || selectedRole === 'Select a Role') {
            displayMessage('Please select a role.', 'error');
            return;
        }

        if (userEmail.value && selectedRole) {
            const learnerCollectionRef = collection(firestore, 'learners');
            const querySnapshot = await getDocs(query(learnerCollectionRef, where('email', '==', userEmail.value)));

            if (!querySnapshot.empty) {
                const docId = querySnapshot.docs[0].id;
                await updateDoc(doc(learnerCollectionRef, docId), {
                    role: selectedRole
                });
                console.log('Role updated successfully!');
                displayMessage('Role updated successfully!', 'success')
                await fetchAndDisplayLearnersDetails();
            }
            else {
                console.log('User not found!');
            }
        }
        else {
            displayMessage('Please fill all fields');
        }
    });
}


function resetPageNotebook() {
    pageNotebook = []
    currentPage = 0
}
