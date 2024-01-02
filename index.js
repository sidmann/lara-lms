//------------------------Firebase Config-----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

//mywebapp for firebase
const firebaseConfig = {
    apiKey: "AIzaSyBPyEBGDaOFeWNI7HnYmRe1XMjTl39MEv0",
    authDomain: "mywebapp-a3d83.firebaseapp.com",
    databaseURL: "https://mywebapp-a3d83-default-rtdb.firebaseio.com",
    projectId: "mywebapp-a3d83",
    storageBucket: "mywebapp-a3d83.appspot.com",
    messagingSenderId: "575814516293",
    appId: "1:575814516293:web:65744a268567bbe7fced2c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app)
var loggedIn = false

//get user snapshot cart(dependency)
function getUserSnapshot(uid) {
    const userRef = doc(firestore, 'users', uid)
    console.log('3')
    return new Promise((resolve, reject) => {
        resolve(getDoc(userRef))
    })
}
//************************************************************************

onAuthStateChanged(auth, async (user) => {
    const adminAppbar = document.getElementById("adminAppbar");
    const tpoAppbar = document.getElementById("tpoAppbar");
    const learnerAppbar = document.getElementById("learnerAppbar");

    if (user) {
        // User is logged in
        const docRef = doc(firestore, "learners", user.uid);
        const docSnap = getDoc(docRef);
        var userData = null;
        loggedIn = true
        docSnap.then((docSnapshot) => {
            // console.log(docSnapshot)
            if (docSnapshot.exists()) {
                userData = docSnapshot.data();
                console.log(userData)
                roleAccess(userData.role);
                onLoggedIn();
                stopLoader();
            }
        });
    } else {
        // User is not logged in
        // Hide both appbars or handle the state as needed
        loggedIn = false
        onLoggedOut();
        stopLoader();
    }
});


//*****************************loading and role access************************************
function roleAccess(role) {
    // console.log('inside role')
    const roleMap = new Map([
        ["ROLE_ADMIN", "learnerAppbar"],
        ["ROLE_LEARNER", "learnerAppbar"],
        ["ROLE_TPO", "tpoAppbar"],
    ]);
    const appbarList = document.querySelectorAll(`#${roleMap.get(role)}`);
    appbarList.forEach((appbar) => {
        appbar.classList.remove("d-none");
    })
}

//to execut upon logging in
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

//to execute upon logging out
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

//stop the loader show the main body
function stopLoader() {
    document.querySelector("#overlay").classList.add("hidden");
    document.querySelector("#main").classList.remove("hidden");
}

// Add an event listener to the confirmation logout button
confirmLogoutBtn.addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            // Redirect to the login page or perform any other actions
            console.log("User logged out successfully");
            window.location.href = "login.html"; // Redirect to the login page
        })
        .catch((error) => {
            console.error("Error during logout:", error);
        });
});
