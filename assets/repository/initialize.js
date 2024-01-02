import {
     initializeApp 
     } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";

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
    updateDoc,
    onSnapshot,
    addDoc,
    deleteDoc,
    or,
    and,
    limit,
    startAfter,
    endAt,
    orderBy,
    getCountFromServer,
    deleteField
    } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

import {
    getAuth,
    signOut,
    onAuthStateChanged,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    createUserWithEmailAndPassword
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

// const firebaseConfig = {
//     apiKey: "AIzaSyDtX4OWk4DBn5f_APfGcwiwI6qMXBCKfhk",
//     authDomain: "myfireapp-8d543.firebaseapp.com",
//     databaseURL: "https://myfireapp-8d543-default-rtdb.firebaseio.com",
//     projectId: "myfireapp-8d543",
//     storageBucket: "myfireapp-8d543.appspot.com",
//     messagingSenderId: "484285304427",
//     appId: "1:484285304427:web:54c53464c02f04a4646b2e"
// };

//global
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

//auth
export {
    signOut,
    onAuthStateChanged,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    createUserWithEmailAndPassword
}

//firstore
export {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot,
    addDoc,
    deleteDoc,
    or,
    and,
    limit,
    startAfter,
    endAt,
    orderBy,
    getCountFromServer,
    deleteField
}

//storage
export {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
}
