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
    writeBatch
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
const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
const uploadVideoContainerDisplay = document.querySelector('.uploadVideoContainerDisplay');
const myCumulativeQuestionUpload = document.querySelector('.my-cumulative-question-upload');
const topicDescriptionContainer = document.querySelector(".topicDescriptionContainer");
const myCoursesButton = document.querySelector(".myCourses");
const myCumulativeExams = document.querySelector('.my-cumulative-exams');

const changePasswordContainer = document.querySelector('.changepassword-container');
const CumulativeContainerOne = document.querySelector('.cumulative-container-one');
const CumulativeContainerTwo = document.querySelector('.cumulative-container-two');
const CumulativeContainerThree = document.querySelector('.cumulative-container-three');
const CumulativeContainerfour = document.querySelector('.cumulative-container-four');

var userData = null;
var loggedIn = null;

// Function to check if the user is logged in
function isUserLoggedIn() {
    return !!auth.currentUser;
}

//***********************************event listener**************************************
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


//***************************************************************************************

//get user snapshot cart(dependency)
function getUserSnapshot(uid) {
    const userRef = doc(firestore, 'users', uid)
    console.log('3')
    return new Promise((resolve, reject) => {
        resolve(getDoc(userRef))
    })
}

//---------------------------------loading and role access----------------------------------

var container = document.querySelector('.container');
// Use onAuthStateChanged to control access to admin dashboard
var userId = null;
var learnerRole = null;
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
                container.style.display = 'block';
                // console.log(auth.currentUser.uid);
                getUserRealTime();
                toggleVideoContainer();
                // stopLoader();
                // console.log(userData)
            }
        });
    } else {
        // User is not authenticated, redirect to login page
        window.location.href = "login.html";
    }
});


function roleAccess(role) {
    // console.log('inside role')
    // console.log(role);
    const roleMap = new Map([
        ["ROLE_ADMIN", "adminAppbar"],
        ["ROLE_LEARNER", "userAppbar"],
        ["ROLE_TPO", "tpoAppbar"],
    ]);
    const appbarList = document.querySelectorAll(`#${roleMap.get(role)}`);
    appbarList.forEach((appbar) => {
        appbar.classList.remove("d-none");
    })

    //Handle the visibility of the "Upload video" button
    if (role === "ROLE_ADMIN") {
        console.log("only for admin")
        // uploadVideoContainerDisplay.style.display = "block";
        // myCumulativeQuestionUpload.style.display = 'block';

    }
    else {
        console.log("only for learners")
        uploadVideoContainerDisplay.style.display = "block";
        myCumulativeQuestionUpload.style.display = 'block'
    }
}

//to execute upon logging in
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

//----------------------------- Question upload Ids and Classes------------------------------------
 
const questionUploadContainer = document.querySelector(".question-upload-container");
const questionFileSubmit = document.getElementById('question-file-submit');
const fileUploadForm = document.getElementById('file-upload-form');
const fileInput = document.getElementById('file-input')
const fileName = document.getElementById("file-name");

//****************************** Culumutive Exam ****************************

const cumQuestionDetailsForm = document.getElementById('cum-question-details-form')
const cumQuestionNumber = document.getElementById('cum-question-number');
const cumTopicDropdown = document.querySelector("#cumTopicDropdown");
const cumQuestionDisplayContainer = document.querySelector('.question-display-container')
const cumQuestionAnswerForm = document.querySelector('#cum-question-answer-form');
// const cumQuestionAnswerDetails = document.querySelector('#cum-question-answer-details');
const cumTotalQuestionAttend = document.querySelector('#cum-total-question-attend');
const cumTotalQuestionCorrect = document.querySelector('#cum-total-question-correct');
const cumExamPercentage = document.querySelector('#cum-exam-percentage');
const cumExamViewDetails = document.querySelector('#cum-exam-view-details');
const cumExamPreviewContainer = document.querySelector('#cum-exam-preview-container');
const backCumExamContainerOne = document.querySelector('.back-cum-exam-container-one');
const myCumulativeScoreRecords = document.querySelector('.my-cumulative-score-records');
const CumExamScoreContainer = document.querySelector('.cum-exam-score-container');
//****************************************************************************

//***************** video stream in the topic*************************
const mainVideoContainer = document.querySelector('.mainVideoContainer');
let videoPlayerContainer = document.querySelector(".videoPlayerContainer");
var videoSubCollection = document.querySelector('.videoSubTopic');
const videoPlaceholder = document.getElementById('videoPlaceholder');
const topicNameElement = document.querySelector('.topicName h4');

const videoContainer = document.getElementById("videoContainer");
// const backButton = document.getElementById("backButton");
const topicsContainer = document.getElementById("topicsContainer");
const backToTopics = document.querySelector('.backToTopics');
const topicDescriptionName = document.querySelector('.topicDescriptionName');
const subSubTopicDropdown = document.querySelector("#cumSubTopicDropdown");

// ******************************* Video upload and streaming**********************************************

const uploadForm = document.getElementById("uploadForm");
const videoInput = document.getElementById("videoInput");
const imageInput = document.getElementById("imageInput");
// var customVideo = document.getElementById("customVideo");
const uploadProgressBar = document.getElementById("uploadProgressBar");
const progressContainer = document.getElementById("progressContainer");
const videoNameDisplay = document.getElementById('videoName');
const imageNameDisplay = document.getElementById('imageName');
const uploadPercentageDisplay = document.getElementById('uploadPercentage');
const topicNameInput = document.getElementById('topicName')
const videoTopicDropdown = document.getElementById("videoTopicDropdown")
const subTopicNameInput = document.getElementById('subTopicName')
const videoSubTopicDropdown = document.getElementById("videoSubTopicDropdown");
var mainContainer = document.querySelector('#mainContainer');
var videoUploadContainer = document.getElementById('videoUploadContainer');
mainContainer.style.display = 'none';

// Event listener to display upload Video Container
uploadVideoContainerDisplay.addEventListener('click', () => {
    if (videoUploadContainer.style.display === 'none' || videoUploadContainer.style.display === '') {
        videoUploadContainer.style.display = 'block';
        mainContainer.style.display = 'block'
        videoContainer.style.display = 'none';
        questionUploadContainer.style.display = 'none';
        changePasswordContainer.style.display = 'none'
        CumulativeContainerOne.style.display = 'none'
        CumulativeContainerTwo.style.display = 'none'
        CumulativeContainerThree.style.display = 'none'
        CumExamScoreContainer.style.display = 'none'
    } else {
        videoUploadContainer.style.display = 'none';
        mainContainer.style.display = 'none'
        videoContainer.style.display = 'none';
        changePasswordContainer.style.display = 'none'
    }
});

// ******************************Crud Of Topic ****************************

// Add a click event listener to open the topic modal
const openTopicModalButton = document.getElementById('videoAddTopicButton');
openTopicModalButton.addEventListener('click', () => {
    // Clear the topic form
    document.getElementById('topicName').value = '';
    console.log("inside the topic model")
    populateTopicList();
});


// Add Topic
document.getElementById('saveTopicButton').addEventListener('click', async () => {
    console.log("save topicName inside")
    const topicName = document.getElementById('topicName').value;
    if (topicName) {
        try {
            //Calling the addTopic function here
            const topicId = await addTopic(topicName);
            console.log('Topic added successfully!');
            displayMessage('Topic added successfully!', 'success');
            populateTopicList();
            document.getElementById('topicName').value = '';
        } catch (error) {
            console.error('Error adding Topic:', error);
        }
    }
});

async function addTopic(topicName) {
    try {
        const topicRef = collection(firestore, 'courses');
        const docRef = await setDoc(doc(topicRef, `${topicName}`), { topicId: topicName });
        console.log("inside add topic")
        // document.querySelector('#videoTopicDropdown').addEventListener('click', loadTopics)
        return docRef;
    } catch (error) {
        console.error('Error adding Topic:', error);
        throw error;
    }
}

// Populate Topic List
function populateTopicList() {
    console.log("inside the populate topic list")
    const topicList = document.getElementById('topicList');
    getDocs(collection(firestore, 'courses')).
        then((courses) => {
            topicList.innerHTML = '';
            courses.forEach((course) => {
                const row = document.createElement('tr');
                row.innerHTML = `
            <td>${course.id}</td>
            <td>
                <button class="btn btn-sm btn-danger mb-2 delete">Delete</buttton>
            </td>
            `;
                topicList.appendChild(row);
                row.querySelector('.delete').addEventListener('click', () => deleteTopic(course.id));
            });
        })
        .catch((error) => {
            console.error('Error getting topics:', error);
        });
}

// Function to delete a topic
async function deleteTopic(course) {
    const confirmation = confirm('Are you sure you want to delete this topic?');
    console.log(course)
    if (confirmation) {
        try {
            const newDocRef = doc(collection(firestore, 'courses'), 'java')
            const courseRef = doc(firestore, 'courses', course);
            const courseDoc = await getDoc(courseRef)
            if (courseDoc.exists()) {
                const oldSubCollections = courseDoc.data().subCollections
                console.log(oldSubCollections)
                if (oldSubCollections.length) {
                    const promises = oldSubCollections.map(async (subCollection) => {
                        //get the ols sub collection data
                        console.log(courseDoc.ref)
                        // console.log(collection(courseDoc, subCollection))
                        const oldSubCollectionSnapshot = await getDocs(collection(courseRef, subCollection))
                        //store in the new document subcollection
                        if (!oldSubCollectionSnapshot.empty) {
                            console.log('form if')
                            console.log(oldSubCollectionSnapshot.docs[0].data())
                            const promises = oldSubCollectionSnapshot.docs.map(async (subCollectionDoc) => {
                                console.log(subCollectionDoc.data())
                                await setDoc(doc(collection(newDocRef, subCollection), subCollectionDoc.id), subCollectionDoc.data())
                            })
                            await Promise.all(promises)
                        }
                    });
                    await Promise.all(promises)
                }
                await setDoc(newDocRef, courseDoc.data());

                await deleteDoc(courseRef);
            }
            console.log('Topic deleted successfully');
            displayMessage('Topic deleted successfully!', 'success');
            document.querySelector('#videoTopicDropdown').addEventListener('click', loadTopics);
            populateTopicList();
        } catch (error) {
            console.error('Error deleting topic:', error);
        }
    }
}

// Function to load topics from Firestore and populate the topic dropdown
async function loadTopics() {
    console.log("inside the load topic")
    const videoTopicDropdown = document.querySelector("#videoTopicDropdown");
    // Clear existing options
    videoTopicDropdown.innerHTML = `<option value="">
                    Loading ...
                </option>`;

    // Fetch topics from Firestore and add them to the dropdown
    const querySnapshot = await getDocs(collection(firestore, 'courses'))
    if (!querySnapshot.empty) {
        console.log(querySnapshot.docs)
        videoTopicDropdown.removeEventListener('click', loadTopics)
        videoTopicDropdown.innerHTML = ``;
        const option = document.createElement('option')
        option.innerHTML = `Please select`
        videoTopicDropdown.appendChild(option)
        querySnapshot.forEach(doc => {
            // console.log(doc)
            console.log(doc.id);
            // console.log(doc.data());
            const option = document.createElement("option");
            // option.setAttribute('value', doc.data().name);
            option.setAttribute('value', doc.id)
            option.innerHTML = `${doc.id}`;
            videoTopicDropdown.appendChild(option);
        });
    } else {
        videoTopicDropdown.innerHTML = `<option value="">Please select</option>`
        displayMessage('No topics loaded!', 'danger')
    }
}
document.querySelector('#videoTopicDropdown').addEventListener('click', loadTopics);

//*******************************************************************************


//****************************** Crud of Subtopic ******************************

// Open Sub Topic Modal
const openSubTopicModalButton = document.getElementById('videoAddSubTopiButton');
openSubTopicModalButton.addEventListener('click', () => {
    // Clear the color shade form
    document.getElementById('subTopicName').value = '';
    // Fetch and populate the manufacturers list in the modal
    populateTopicDropdown('topicSubTopic');
    // Fetch and populate the color shades list in the modal
    const selectedTopicId = document.getElementById('topicSubTopic').value;
});

// Function to populate the topic dropdown in the modal
function populateTopicDropdown(targetDropdownId) {
    console.log(targetDropdownId + ",,,,,,,,,,,,")
    const select = document.querySelector(`#${targetDropdownId}`);
    select.innerHTML = `<option value="">
                    Loading ...
                </option>`;

    // Fetch and populate the topics list
    getDocs(collection(firestore, 'courses'))
        .then((courses) => {
            select.innerHTML = '';
            const option = document.createElement('option');
            option.innerHTML = 'Please select';
            select.appendChild(option);
            console.log(courses);

            console.log("populateTopic dropdown")
            courses.forEach((course) => {
                // console.log(course)
                // console.log(course.id)
                const topic = course.data();
                // console.log(topic);
                const option = document.createElement('option');
                option.setAttribute('value', course.id);
                option.innerHTML = `${course.id}`;
                select.appendChild(option);
            });
        })
        .catch((error) => {
            console.error('Error getting topics:', error);
        });
}



// Add Subtopic
document.getElementById('saveSubTopicButton').addEventListener('click', async () => {
    console.log('under save')
    // const topicId = document.getElementById('topicName').value;
    // console.log(topicId);
    const subTopicName = document.getElementById('subTopicName').value;
    console.log(subTopicName);
    const selectedTopicId = document.getElementById('topicSubTopic').value;
    console.log(selectedTopicId);
    if (subTopicName && selectedTopicId) {
        console.log('under if')
        try {
            //call trhe function AddSubtopic
            const subTopicId = await addSubTopic(selectedTopicId, subTopicName);
            console.log('SubTopic added successfully!');
            displayMessage('SubTopic added successfully!', 'success');
            // populateTopicList();
            document.querySelector('#topicSubTopic').dispatchEvent(new Event('change'));
            // populateSubTopicList();
            document.getElementById('subTopicName').value = '';
        } catch (error) {
            console.error('Error adding SubTopic:', error);
        }
    }
});

async function addSubTopic(topicId, subTopicName) {
    try {
        const subTopicRef = collection(firestore, 'courses');
        const docRef = doc(subTopicRef, `${topicId}`);
        updateDoc(docRef, { subCollection: arrayUnion(subTopicName) })
        // const docRef = await setDoc(, );
        // document.querySelector('#videoSubTopicDropdown').addEventListener('click', loadSubtopics)
        return docRef;
    } catch (error) {
        console.error('Error adding subTopic:', error);
        throw error;
    }
}

// Function to populate Sub topics list in the modal
async function populateSubTopicList(event) {
    console.log(event.target)
    const subTopicList = document.getElementById('subTopicList');
    if (!event) {
        subTopicList.innerHTML = `<tr><td>Please select a topic.</td><td></td></tr>`;
        return
    }
    const course = event.target.options[event.target.selectedIndex].value
    // console.log(course)
    subTopicList.innerHTML = `<tr><td>Loading...</td><td></td></tr>`;

    try {
        const courseDoc = await getDoc(doc(firestore, 'courses', `${course}`));
        subTopicList.innerHTML = ''; // Clear the list

        if (courseDoc.exists()) {
            // console.log(courseDoc.data())
            const topics = courseDoc.data().subCollection
            // console.log(topics);
            if (topics && topics.length > 0) {
                console.log(topics)
                topics.forEach(topic => {
                    // console.log(topic);
                    const row = document.createElement('tr');
                    row.innerHTML = `
                    <td>${topic}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit" data-topic="${topic}">Edit</button>
                        <button class="btn btn-sm btn-danger delete" data-topic="${topic}">Delete</button>
                    </td>
                `;
                    // console.log(row);
                    subTopicList.appendChild(row);

                    // Add event listeners for edit and delete buttons
                    row.querySelector('.delete').addEventListener('click', function () {

                        const subTopicName = this.getAttribute('data-topic');
                        deleteSubtopic(course, subTopicName);
                    });

                    //Edit event listener
                    row.querySelector('.edit').addEventListener('click', function () {

                        const subTopicName = this.getAttribute('data-topic');
                        console.log(subTopicName);
                        const updatedSubTopicName = prompt('Edit Subtopic : ', subTopicName);
                        if (updatedSubTopicName !== null) {
                            console.log("inside")
                            editSubtopicName(course, subTopicName, updatedSubTopicName);
                        }
                    })

                });
            }
            else {
                console.log("No subtopics added yet.");
                subTopicList.innerHTML = `<tr><td>No subtopics added yet.</td><td></td></tr>`;
            }

        } else {
            subTopicList.innerHTML = `<tr><td>No subtopics added yet.</td><td></td></tr>`;
        }
    } catch (error) {
        console.error('Error getting subtopics:', error);
        subTopicList.innerHTML = `<tr><td>Error loading subtopics.</td><td></td></tr>`;
    }
}

//edit subTopic name or subcollection
async function editSubtopicName(course, oldSubTopicName, updatedSubTopicName) {
    if (!updatedSubTopicName) {
        displayMessage('Please provide the update subcollection name', 'danger');
        return;
    }
    console.log("inside edit");
    const courseDocRef = doc(firestore, 'courses', `${course}`);
    const courseDoc = await getDoc(courseDocRef);
    const oldSubcollectionRef = collection(firestore, 'courses', `${course}`, `${oldSubTopicName}`);

    if (courseDoc.exists()) {
        //Update the subCollection Array;
        const subCollection = courseDoc.data().subCollection;
        const index = subCollection.indexOf(oldSubTopicName);
        if (index !== -1) {
            subCollection[index] = updatedSubTopicName;
            console.log(subCollection)
        }
        await updateDoc(courseDocRef, { subCollection: subCollection });
    }
    const newSubcollectionRef = collection(firestore, 'courses', `${course}`, `${updatedSubTopicName}`);

    try {
        const querySnapshot = await getDocs(oldSubcollectionRef);
        const batch = writeBatch(firestore);
        // console.log(course)
        // console.log(oldSubTopicName)

        // Copy documents from old subcollection to new subcollection
        const writePromises = querySnapshot.docs.map(async (document) => {
            console.log(document.id);
            const data = document.data();
            const docId = document.id;
            const newDocRef = doc(newSubcollectionRef, docId);
            batch.set(newDocRef, data);

            // Delete old subcollection documents
            batch.delete(document.ref);
            // await setDoc(doc(collection(firestore, 'courses', `${course}`, `${updatedSubTopicName}`), `${doc.id}`), {
            //     videoUrl: data.videoUrl,
            // });
        });

        await batch.commit();

        // const oldSubTopicStorageRef = ref(storage, 'Anguler/ReactiveForms')
        // const videoFiles = await listAll(oldSubTopicStorageRef)

        // console.log(videoFiles.items);
        // videoFiles.items.forEach(async (videoFile) => {
        //     console.log(videoFile.name)// Extract video file name
        //     const newSubTopicStorageRef = ref(storage, 'Anguler/ReactiveForm' + videoFile.name)
        //     console.log(newSubTopicStorageRef);

        //     const uploadTask = uploadBytesResumable(newSubTopicStorageRef, videoFile);
        //     uploadTask.on('state_changed', (snapshot) => {
        //         const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        //         console.log(`Upload is ${progress}% done`);
        //     }, (error) => {
        //         console.error('Error uploading video:', error);
        //     }, async () => {
        //         console.log('Video uploaded successfully!');
        //         await deleteObject(oldSubTopicStorageRef);
        //     });

        //     // Wait for the upload to complete
        //     await uploadTask;
        // });

        console.log('Subcollection name updated successfully!');
        displayMessage('update the subcollection successfully!', 'success')
        document.querySelector('#topicSubTopic').dispatchEvent(new Event('change'));
    } catch (error) {
        console.error('Error updating subcollection name:', error);
        displayMessage('Error updating subcollection name!', 'danger')
    }
}

//Delete the subcolection along documents
async function deleteSubtopic(course, subTopicName) {
    console.log(course)
    console.log(subTopicName);
    const confirmation = confirm('Are you sure you want to delete this subTopic?');
    if (confirmation) {
        const courseDocRef = doc(firestore, 'courses', `${course}`);
        const subCollectionRef = collection(firestore, 'courses', `${course}`, `${subTopicName}`);

        try {
            const courseDoc = await getDoc(courseDocRef);
            if (courseDoc.exists()) {
                const subCollection = courseDoc.data().subCollection;
                const updatedSubCollection = subCollection.filter(sub => sub !== subTopicName);
                await updateDoc(courseDocRef, { subCollection: updatedSubCollection });
            }

            const querySnapshot = await getDocs(subCollectionRef);
            const batch = writeBatch(firestore);
            querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            console.log('Subcollection and associated documents deleted successfully!');
            displayMessage('Subcollection deleted successfully', 'success');
            document.querySelector('#topicSubTopic').dispatchEvent(new Event('change'));
        } catch (error) {
            console.error('Error deleting subcollection:', error);
            displayMessage('Error deleting subcollection', 'danger');
        }
    }
}

// Function to load subtopics based on the selected topic
async function loadSubtopics() {
    // console.log("inside the subTopics")
    const course = document.querySelector('#videoTopicDropdown').options[document.querySelector('#videoTopicDropdown').selectedIndex].value;
    console.log("inside load subTopic");
    console.log(course);
    if (!course) {
        displayMessage('Please select a topic!', 'danger')
        return
    }
    // console.log(course);
    const videoSubTopicDropdown = document.querySelector("#videoSubTopicDropdown");
    // console.log(videoSubTopicDropdown);
    // Clear existing options
    videoSubTopicDropdown.innerHTML = `<option value="">
        Loading ...
    </option>`;
    const courseDoc = await getDoc(doc(firestore, 'courses', `${course}`));
    if (courseDoc.exists()) {
        const topics = courseDoc.data().subCollection
        // console.log(topics)
        videoSubTopicDropdown.removeEventListener('click', loadSubtopics);
        videoSubTopicDropdown.innerHTML = '';
        const option = document.createElement('option');
        option.innerHTML = 'Please select';
        videoSubTopicDropdown.appendChild(option);
        topics.forEach(topic => {
            console.log(topic);
            const option = document.createElement("option");
            option.setAttribute('value', topic);
            option.innerHTML = `${topic}`;
            videoSubTopicDropdown.appendChild(option);
            console.log("end of the dropdown sub topic")
        });
    } else {
        videoSubTopicDropdown.innerHTML = `<option value="">Please select</option>`;
        displayMessage('No subtopic added to this topic!', 'danger');
    }
}

document.querySelector('#videoTopicDropdown').addEventListener('change', () => {
    console.log("inside topic and subtopic eventlistenser");
    document.querySelector('#videoSubTopicDropdown').addEventListener('click', loadSubtopics);
    console.log("end topic and subtopic eventlistenser")
});
document.querySelector('#videoSubTopicDropdown').addEventListener('click', loadSubtopics);
document.querySelector('#topicSubTopic').addEventListener('change', populateSubTopicList);


// Event listener for the file input change
imageInput.addEventListener("change", () => {
    const selectedImage = imageInput.files[0];
    // console.log(selectedImage.name);
    if (selectedImage) {
        imageInput.disabled = false;
        displaySelectedImageName(selectedImage.name);
    } else {
        imageInput.disabled = false;
        resetSelectedImageName();
    }
});

function displaySelectedImageName(imageName) {
    imageNameDisplay.textContent = `Selected Image: ${imageName}`;
}

function resetSelectedImageName() {
    imageNameDisplay.textContent = "No image selected";
}

videoInput.addEventListener("change", () => {
    const selectedVideo = videoInput.files[0];
    console.log(selectedVideo.name);
    if (selectedVideo) {
        videoInput.disabled = false;
        displaySelectedVideoName(selectedVideo.name);
    } else {
        videoInput.disabled = false;
        resetSelectedVideoName();
    }
});

function displaySelectedVideoName(videoName) {
    videoNameDisplay.textContent = `Selected Video: ${videoName}`;
}

function resetSelectedVideoName() {
    videoNameDisplay.textContent = "No video selected";
}

// Video upload Event Listener
uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const videoFile = videoInput.files[0];
    const imageFile = imageInput.files[0];
    let topicName = topicNameInput.value;
    let subTopicName = subTopicNameInput.value;

    if (videoTopicDropdown.value) {
        topicName = videoTopicDropdown.value;
    }

    if (videoSubTopicDropdown.value) {
        subTopicName = videoSubTopicDropdown.value;
    } else if (videoSubTopicDropdown.value === "custom" && subTopicNameInput.value) {
        subTopicName = subTopicNameInput.value;
    }
    console.log(videoFile)
    console.log(imageFile)
    console.log(topicName)
    console.log(subTopicName)
    if (videoFile && topicName && subTopicName) {
        if (imageFile) {
            // Data with image
            console.log("Data with image");
            const progressContainer = document.getElementById("progressContainer");
            progressContainer.style.display = "block";
            await uploadVideos(imageFile, topicName, videoFile, subTopicName);
        } else {
            // Data without image
            console.log("Data without image");
            const progressContainer = document.getElementById("progressContainer");
            progressContainer.style.display = "block";
            await uploadVideosWithoutImage(topicName, videoFile, subTopicName);
            // uploadVideosWithoutimage()
        }
    } else {
        // Error case
        console.log("Please enter topic, subtopic name, and select a video");
        displayMessage('Please enter topic, subtopic name, and select a video', 'danger');
    }
});


//upload video with
async function uploadVideos(image, topicName, video, subTopicName) {
    console.log("inside the upload video with image ")
    const uploadForm = document.getElementById("uploadForm");
    const storageRef = ref(storage, `${topicName}/${image.name}`);
    try {
        // Upload the selected image to storage
        const imageUploadTask = uploadBytesResumable(storageRef, image);

        imageUploadTask.on("state_changed", (snapshot) => {
            const progress = Math.trunc((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            uploadProgressBar.style.width = `${progress}%`;
            uploadPercentageDisplay.textContent = `Image Upload Progress: ${progress}%`;
        });

        await imageUploadTask;

        // Get the download URL of the uploaded image
        const imageUrl = await getDownloadURL(imageUploadTask.snapshot.ref);

        // imageURLDisplay.textContent = `Image URL: ${imageUrl}`;
        // console.log(video.name);
        // console.log(video);
        const videoStorageRef = ref(storage, `${topicName}/${subTopicName}/${video.name}`);
        const videoUploadTask = uploadBytesResumable(videoStorageRef, video);

        videoUploadTask.on("state_changed", (snapshot) => {
            const progress = Math.trunc((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            uploadProgressBar.style.width = `${progress}%`;
            uploadPercentageDisplay.textContent = `Video Upload Progress: ${progress}%`;
        });

        await videoUploadTask;

        const videoUrl = await getDownloadURL(videoUploadTask.snapshot.ref);
        // videoURLDisplay.textContent = `Video URL: ${videoUrl}`;
        const docRef = doc(collection(firestore, 'courses'), `${topicName}`);
        await updateDoc(docRef, {
            imageUrl: imageUrl,
        });


        // Send data to Firestore
        console.log("middle");
        const videoNameWithoutExtension = video.name.split('.').slice(0, -1).join('.')
        const videoDocRef = doc(collection(firestore, 'courses', `${topicName}`, `${subTopicName}`), 'Learningvideos');
        const videoDocSnapshot = await getDoc(videoDocRef);

        console.log(videoDocRef);
        // await setDoc(videoDocRef, { videoGroup: arrayUnion({ videoUrl: videoUrl }) })

        if (videoDocSnapshot.exists()) {
            // console.log("2");
            await updateDoc(videoDocRef, {
                videoArrayGroup: arrayUnion({ videoName: videoNameWithoutExtension, videoUrl: videoUrl })
            });
        } else {
            // console.log("3");
            await setDoc(videoDocRef, {
                videoArrayGroup: [{ videoName: videoNameWithoutExtension, videoUrl: videoUrl }]
            });
        }
        // await setDoc(doc(collection(firestore, 'courses', `${topicName}`, `${subTopicName}`), `${video.name}`), {
        //     videoUrl: videoUrl,
        // });


        // Reset the progress display
        uploadProgressBar.style.width = "100%";
        uploadPercentageDisplay.textContent = "Upload Completed";
        displayMessage('Upload Completed', 'success')

        // Hide the progress bar and message after a short delay (you can adjust the delay as needed)
        setTimeout(() => {
            progressContainer.style.display = "none";
        }, 2000);

        // Reset the form
        uploadForm.reset();

        resetSelectedImageName();
        resetSelectedVideoName();

    } catch (error) {
        console.error("Error uploading: ", error);
        alert("Error uploading files. Please try again.");
    }
}

async function uploadVideosWithoutImage(topicName, videoFile, subTopicName) {
    console.log("inside the upload video without image ")
    const uploadForm = document.getElementById("uploadForm");
    // const storageRef = ref(storage, `${topicName}/${image.name}`);
    try {
        console.log(videoFile.name);
        console.log(videoFile);
        // Now you can upload the selected videos using the same image URL and topic name
        const videoStorageRef = ref(storage, `${topicName}/${subTopicName}/${videoFile.name}`);
        const videoUploadTask = uploadBytesResumable(videoStorageRef, videoFile);

        videoUploadTask.on("state_changed", (snapshot) => {
            const progress = Math.trunc((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            uploadProgressBar.style.width = `${progress}%`;
            uploadPercentageDisplay.textContent = `Video Upload Progress: ${progress}%`;
        });

        await videoUploadTask;

        const videoUrl = await getDownloadURL(videoUploadTask.snapshot.ref);
        const videoNameWithoutExtension = videoFile.name.split('.').slice(0, -1).join('.')
        const videoDocRef = doc(collection(firestore, 'courses', `${topicName}`, `${subTopicName}`), 'Learningvideos');
        const videoDocSnapshot = await getDoc(videoDocRef);

        console.log(videoDocRef);
        // await setDoc(videoDocRef, { videoGroup: arrayUnion({ videoUrl: videoUrl }) })

        if (videoDocSnapshot.exists()) {
            // console.log("2");
            await updateDoc(videoDocRef, {
                videoArrayGroup: arrayUnion({ videoName: videoNameWithoutExtension, videoUrl: videoUrl })
            });
        } else {
            // console.log("3");
            await setDoc(videoDocRef, {
                videoArrayGroup: [{ videoName: videoNameWithoutExtension, videoUrl: videoUrl }]
            });
        }

        // Send data to Firestore
        // await setDoc(doc(collection(firestore, 'courses', `${topicName}`, `${subTopicName}`), `${videoFile.name}`), {
        //     videoUrl: videoUrl,
        // });


        // Reset the progress display
        uploadProgressBar.style.width = "100%";
        uploadPercentageDisplay.textContent = "Upload Completed";
        displayMessage('Upload Completed', 'success')

        // Hide the progress bar and message after a short delay (you can adjust the delay as needed)
        setTimeout(() => {
            progressContainer.style.display = "none";
        }, 2000);

        // Reset the form
        uploadForm.reset();

        // resetSelectedImageName();
        resetSelectedVideoName();

    } catch (error) {
        console.error("Error uploading: ", error);
        alert("Error uploading files. Please try again.");
    }
}
//****************************************************************************************** 

//*********************************** video Dislpay and Display Courses *********************
// Event listener for My Courses button
myCoursesButton.addEventListener("click", () => {
    console.log("123")
    // Toggle the display property of videoPlayContainer
    toggleVideoContainer();
});

// Function to toggle the visibility of the videoContainer and its content
function toggleVideoContainer() {
    myCoursesButton.style.display = 'active';
    topicsContainer.style.display = 'block';
    videoContainer.style.display = videoContainer.style.display === "none" ? "block" : "none";
    mainContainer.style.display = videoContainer.style.display === "none" ? "none" : "block";
    // videoPlayerContainer.style.display = videoContainer.style.display === "none" ? "none" : "block";
    videoUploadContainer.style.display = 'none';

    // If the videoContainer is being displayed, list topics
    if (videoContainer.style.display === "block") {
        videoUploadContainer.style.display = 'none';
        questionUploadContainer.style.display = 'none';
        changePasswordContainer.style.display = 'none';
        CumulativeContainerOne.style.display = 'none';
        CumulativeContainerThree.style.display = 'none';
        CumulativeContainerTwo.style.display = 'none';
        CumExamScoreContainer.style.display = 'none'
        listAllTopics();
    }
}

function listAllTopics() {
    backToTopics.style.display = "none"
    // Clear existing content in the topics and video list container
    topicsContainer.innerHTML = "";

    // List all items (including topics)
    const fireStoreRef = collection(firestore, "courses");
    getDocs(fireStoreRef)
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const topicData = doc.data();
                // console.log(topicData);
                const topicImageUrl = topicData.imageUrl
                // console.log(topicImageUrl);

                const topicCard = document.createElement('div');
                // topicCard.classList.add('col-md-3', 'col-lg-3', 'mb-1');
                topicCard.innerHTML = `
                <div class="card" style="width: 18rem; mb-2 ">
                    <img src="${topicImageUrl}" class="card-img-top" alt="topic Image">
                    <div class="card-body">
                        <h5 class="card-title text-center">${doc.id}</h5>
                        <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                        <div class="text-center">
                            <button class="btn btn-primary coursesButton" data-docid="${doc.id}">Goto Courses</button>
                            </div>
                     </div>
                </div>
                `;

                // Append the topic card to the container
                topicsContainer.appendChild(topicCard);
            })
        })
        .catch((error) => {
            console.error("Error listing topics: ", error);
        });
}

// Event delegation for dynamically created buttons inside topicsContainer
topicsContainer.addEventListener('click', function (event) {
    container.style.display = 'none';
    mainVideoContainer.style.display = 'block';
    topicDescriptionContainer.style.display = 'block';
    videoSubCollection.innerHTML = ""; // Clear previous content
    backToTopics.style.display = 'block';

    if (event.target.classList.contains('coursesButton')) {
        const topicName = event.target.closest('.card-body').querySelector('.card-title').textContent;
        topicNameElement.textContent = topicName;
        topicDescriptionName.textContent = topicName;
        const docId = event.target.dataset.docid;

        // Fetch subcollections for the selected topic
        const topicRef = doc(firestore, 'courses', `${docId}`);
        getDoc(topicRef)
            .then((topicDoc) => {
                if (topicDoc.exists()) {
                    const topicArray = topicDoc.data().subCollection;

                    // Iterate through the topicArray and create promises for each subcollection
                    const promises = topicArray.map((subCollectionName) => {
                        // console.log(subCollectionName);
                        const subCollectionRef = collection(firestore, "courses", docId, subCollectionName);
                        return getDocs(subCollectionRef)
                            .then((subCollectionSnapshot) => {
                                console.log("1")
                                let totalDurationInSeconds = 0;

                                return Promise.all(subCollectionSnapshot.docs.map((videoDoc) => {
                                    console.log("2")
                                    if (videoDoc.id === 'Learningvideos') {
                                        const videoData = videoDoc.data();
                                        if (videoData && videoData.videoArrayGroup) {
                                            const videos = videoData.videoArrayGroup;

                                            return Promise.all(videos.map(async (videoItem) => {
                                                console.log("2.5")
                                                const videoName = videoItem.videoName;
                                                const videoUrl = videoItem.videoUrl;

                                                // Parse video duration and append to the video name
                                                const durationInSeconds = await parseVideoDuration(videoUrl);
                                                totalDurationInSeconds += durationInSeconds;

                                                // Create video item elements for videos
                                                const videoItemElement = document.createElement('div');
                                                videoItemElement.textContent = `${videoName}\n${formatDuration(durationInSeconds)}`;
                                                videoItemElement.dataset.url = videoUrl;
                                                videoItemElement.classList.add('videoItem');

                                                // Add click event listener to video items
                                                videoItemElement.addEventListener('click', function (event) {
                                                    if (event.target.classList.contains('videoItem')) {
                                                        loadVideo(videoUrl);
                                                    }
                                                });

                                                console.log("3")
                                                return videoItemElement;
                                            }));
                                        }
                                        displayMessage("No Videos for this SubTopic", "danger")
                                        return [];
                                    }
                                })).then((videos) => {
                                    console.log("4")
                                    const flattenedVideos = videos.flat();
                                    // console.log(flattenedVideos);
                                    // Return video elements and total duration for the subcollection
                                    return { videos: flattenedVideos, totalDurationInSeconds };
                                });
                            });
                    });

                    // Wait for all subcollection promises to resolve
                    Promise.all(promises)
                        .then((subCollectionData) => {
                            console.log(promises);
                            // console.log(subCollectionData);
                            subCollectionData.forEach(({ videos, totalDurationInSeconds }, index) => {
                                // Create accordion item for the subcollection
                                const accordionItem = document.createElement('div');
                                accordionItem.classList.add('accordion-item');

                                const accordionHeader = document.createElement('h2');
                                accordionHeader.classList.add('accordion-header', 'custom-header-class');

                                // Convert total duration to HH:MM:SS format
                                const formattedTotalDuration = formatDuration(totalDurationInSeconds);
                                accordionHeader.innerHTML = `
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${index}" aria-expanded="false" aria-controls="collapse-${index}">
                                        ${topicArray[index]}<br>${formattedTotalDuration}
                                    </button>
                                `;

                                const accordionCollapse = document.createElement('div');
                                accordionCollapse.id = `flush-collapse-${index}`;
                                accordionCollapse.classList.add('accordion-collapse', 'collapse');
                                accordionCollapse.setAttribute('data-bs-parent', '#accordionFlushExample');
                                accordionCollapse.innerHTML = '<div class="accordion-body"></div>';
                                accordionCollapse.querySelector('.accordion-body').append(...videos);

                                accordionItem.append(accordionHeader, accordionCollapse);
                                videoSubCollection.appendChild(accordionItem);
                                console.log("5")
                                // Event listener for accordion button click
                                accordionHeader.addEventListener('click', () => {
                                    const isCollapsed = accordionCollapse.classList.contains('collapse');
                                    if (isCollapsed) {
                                        console.log("show");
                                        accordionCollapse.classList.remove('collapse');
                                        accordionCollapse.classList.add('show');
                                        accordionHeader.querySelector('.accordion-button').classList.remove('collapsed');
                                        accordionHeader.querySelector('.accordion-button').setAttribute('aria-expanded', 'true');
                                    } else {
                                        console.log("hide");
                                        accordionCollapse.classList.remove('show');
                                        accordionCollapse.classList.add('collapse');
                                        accordionHeader.querySelector('.accordion-button').classList.add('collapsed');
                                        accordionHeader.querySelector('.accordion-button').setAttribute('aria-expanded', 'false');
                                    }
                                });
                            });
                        })
                        .catch((error) => {
                            console.error('Error processing subcollections: ' + error);
                        });
                } else {
                    console.log('Document does not exist.');
                }
            })
            .catch((error) => {
                console.error('Error getting document: ', error);
            });
    }
});

const videoElement = document.getElementById('video');
function loadVideo(videoUrl) {
    console.log(videoUrl)

    // Hide the placeholder image and display the video player
    videoPlaceholder.style.display = 'none';
    videoElement.style.display = 'block';

    videoElement.controls = true;

    // Clear previous video player content
    // videoPlayerContainer.innerHTML = "";
    videoElement.src = ""
    console.log(videoUrl);
    videoElement.src = videoUrl;

    // Create a source element for the video
    videoPlayerContainer.appendChild(videoElement);
}

// Function to format duration from seconds to HH:MM:SS format
function formatDuration(durationInSeconds) {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Function to parse video duration from video URL
function parseVideoDuration(videoUrl) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = videoUrl;

        video.addEventListener('loadedmetadata', function () {
            const durationInSeconds = Math.round(video.duration);
            resolve(durationInSeconds);
        });

        video.addEventListener('error', function (event) {
            console.error('Error loading video metadata:', event);
            reject('Error loading video metadata');
        });
        video.load();
    });
}
//******************************************************************************** 

// *****************************Back to Topics*******************************
// Event listener for Back button click
backToTopics.addEventListener("click", () => {
    console.log("back")
    // Clear previous video player content
    // Pause the video if it is playing
    if (!videoElement.paused) {
        videoElement.pause();
    }

    // Clear the video source and hide the video player
    videoElement.src = "";
    videoElement.style.display = "none";
    topicDescriptionContainer.style.display = "none";

    // Show the placeholder image (thumbnail) without changing its source
    videoPlaceholder.style.display = 'block';
    videoPlaceholder.src = "images/corporate.jpg";

    mainVideoContainer.style.display = "none";
    container.style.display = 'block'

    // Show the topic list
    listAllTopics();
});
//********************************************************************************

//******************* Question File Upload*********************************************
document.querySelector('#fileTopicDropdown').addEventListener('click', loadTopicsForFile);
document.querySelector('#fileTopicDropdown').addEventListener('change', () => {
    console.log("inside topic and subtopic eventlistenser");
    document.querySelector('#fileSubTopicDropdown').addEventListener('click', loadSubtopicsForFile);
    console.log("end topic and subtopic eventlistenser")
});
document.querySelector('#fileSubTopicDropdown').addEventListener('click', loadSubtopicsForFile);
//After submit the subtopic it call 
document.querySelector('#topicSubTopic').addEventListener('change', populateSubTopicList);

myCumulativeQuestionUpload.addEventListener('click', function (event) {
    if (questionUploadContainer) {
        questionUploadContainer.style.display = 'block';
        CumulativeContainerOne.style.display = 'none';
        videoUploadContainer.style.display = 'none';
        videoContainer.style.display = 'none';
        changePasswordContainer.style.display = 'none';
        CumulativeContainerTwo.style.display = 'none'
        CumulativeContainerThree.style.display = 'none'
        CumExamScoreContainer.style.display = 'none'
    }
    else {
        questionUploadContainer.style.display = 'none';
        CumulativeContainerOne.style.display = 'none';
        videoUploadContainer.style.display = 'none';
        videoContainer.style.display = 'none';
        changePasswordContainer.style.display = 'none';
    }
})

// Function to load topics from Firestore and populate the topic dropdown
async function loadTopicsForFile() {
    console.log("inside the load topic")
    const fileTopicDropdown = document.querySelector("#fileTopicDropdown");
    // Clear existing options
    fileTopicDropdown.innerHTML = `<option value="">
                    Loading ...
                </option>`;

    // Fetch topics from Firestore and add them to the dropdown
    const querySnapshot = await getDocs(collection(firestore, 'courses'))
    if (!querySnapshot.empty) {
        // console.log(querySnapshot.docs)
        fileTopicDropdown.removeEventListener('click', loadTopicsForFile)
        fileTopicDropdown.innerHTML = ``;
        const option = document.createElement('option')
        option.innerHTML = `Please select`
        fileTopicDropdown.appendChild(option)
        querySnapshot.forEach(doc => {
            // console.log(doc.id);
            const option = document.createElement("option");
            // option.setAttribute('value', doc.data().name);
            option.setAttribute('value', doc.id)
            option.innerHTML = `${doc.id}`;
            fileTopicDropdown.appendChild(option);
        });
    } else {
        fileTopicDropdown.innerHTML = `<option value="">Please select</option>`
        displayMessage('No topics loaded!', 'danger')
    }
}

// Function to load subtopics based on the selected topic
async function loadSubtopicsForFile() {
    // console.log("inside the subTopics")
    const course = document.querySelector('#fileTopicDropdown').options[document.querySelector('#fileTopicDropdown').selectedIndex].value;
    console.log("inside load subTopic");
    console.log(course);
    if (!course) {
        displayMessage('Please select a topic!', 'danger')
        return
    }
    // console.log(course);
    const fileSubTopicDropdown = document.querySelector("#fileSubTopicDropdown");
    // console.log(videoSubTopicDropdown);
    // Clear existing options
    fileSubTopicDropdown.innerHTML = `<option value="">
        Loading ...
    </option>`;
    const courseDoc = await getDoc(doc(firestore, 'courses', `${course}`));
    if (courseDoc.exists()) {
        const topics = courseDoc.data().subCollection
        // console.log(topics)
        fileSubTopicDropdown.removeEventListener('click', loadSubtopicsForFile);
        fileSubTopicDropdown.innerHTML = '';
        const option = document.createElement('option');
        option.innerHTML = 'Please select';
        fileSubTopicDropdown.appendChild(option);
        topics.forEach(topic => {
            // console.log(topic);
            const option = document.createElement("option");
            option.setAttribute('value', topic);
            option.innerHTML = `${topic}`;
            fileSubTopicDropdown.appendChild(option);
            console.log("end of the dropdown sub topic")
        });
    } else {
        fileSubTopicDropdown.innerHTML = `<option value="">Please select</option>`;
        displayMessage('No subtopic added to this topic!', 'danger');
    }
}

// Event listener for the file input change
fileInput.addEventListener("change", () => {
    const selectedFile = fileInput.files[0];
    // console.log(selectedFile.name);
    if (selectedFile) {
        fileInput.disabled = false;
        displaySelectedFileName(selectedFile.name);
    } else {
        fileInput.disabled = false;
        resetSelectedFileName();
    }
});

function displaySelectedFileName(selectedFile) {
    fileName.textContent = `Selected File: ${selectedFile}`;
}

function resetSelectedFileName() {
    fileName.textContent = "No File selected";
}


// Video upload Event Listener
fileUploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    let topicName = null;
    let subTopicName = null;
    if (fileTopicDropdown.value) {
        topicName = fileTopicDropdown.value;
    }

    if (fileSubTopicDropdown.value) {
        subTopicName = fileSubTopicDropdown.value;
    } else if (fileSubTopicDropdown.value === "custom" && fileTopicNameInput.value) {
        subTopicName = subTopicNameInput.value;
    }

    console.log(fileName)
    console.log(topicName)
    console.log(subTopicName)
    if (topicName && subTopicName) {
        if (file) {
            // Data with image
            console.log("Data with image");
            await uploadQuestionFile(file, topicName, subTopicName);
        }
        displayMessage("Please selected the questionFile", "danger")
        return;
    } else {
        // Error case
        console.log("Please enter topic, subtopic name, and select a video");
        displayMessage('Please enter topic, subtopic name, and select a video', 'danger');
    }
});


//upload video with
async function uploadQuestionFile(file, topicName, subTopicName) {
    console.log(file);
    console.log("inside the upload question file ")

    try {
        if (file) {
            const reader = new FileReader();
            console.log(file);
            // console.log(reader);
            const questionsArray = [];

            // Now you can upload the 'questions' array to Firebase Firestore
            const batch = writeBatch(firestore);

            reader.onload = function (event) {
                const data = event.target.result;
                // console.log(data);
                const workbook = XLSX.read(data, { type: 'binary' });

                const sheetName = workbook.SheetNames[0]; // Assuming the sheet you want to read is the first one
                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const questions = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    // 'questions' is an array of arrays where each inner array represents a row from the Excel file
                    questions.forEach(questionData => {
                        const [serialNumber, question, option1, option2, option3, option4, option5, correctAnswers] = questionData;
                        if (!serialNumber && !question || !correctAnswers) {
                            console.log('Invalid data found in the Excel sheet. Skipping this row.');
                            return true; // Stop processing further rows
                        }

                        const options = [option1, option2, option3, option4].filter(option => option);
                        // Conditionally add option5 if it exists
                        if (option5) {
                            options.push(option5);
                        }

                        let correctAnswersArray = [];
                        if (correctAnswers !== undefined) {
                            if (correctAnswers.includes(',')) {
                                correctAnswersArray = correctAnswers.split(',').map(answer => answer.trim());
                            } else {
                                correctAnswersArray = [correctAnswers.trim()];
                            }
                        }

                        console.log(questionData)
                        questionsArray.push({
                            questionText: question,
                            options: [option1, option2, option3, option4, option5],
                            correctAnswers: correctAnswersArray // Split correct answers into an array   
                        });
                        return false;
                    });

                    console.log(questionsArray)
                    const questionRef = doc(collection(firestore, 'courses', `${topicName}`, `${subTopicName}`), 'LearningCumQuestions');
                    batch.set(questionRef, {
                        questionArrayGroup: questionsArray
                    });
                })

                // Commit the batch operation to Firestore
                batch.commit().then(() => {
                    console.log('Questions uploaded successfully.');
                    displayMessage("questionFile Uploaded successfully", "success")
                }).catch(error => {
                    console.error('Error uploading questions: ', error);
                    displayMessage("Error uploading questionFile", "danger")
                });
            };
            reader.readAsBinaryString(file)
        }
    } catch (error) {
        console.error("Error uploading: ", error);
        alert("Error uploading files. Please try again.");
    }
}

//********************************************************************************

// function generateRandomId() {
//     // Implement your logic to generate a random ID here
//     // For example, you can use Date.now() along with Math.random() to generate a unique ID
//     const timestamp = Date.now();
//     const randomSuffix = Math.floor(Math.random() * 1000);
//     return `${timestamp}_${randomSuffix}`;
// }

//*********************** Cumulative Exam *******************************************
myCumulativeExams.addEventListener('click', function (event) {
    if (CumulativeContainerOne) {
        console.log("1")
        CumulativeContainerOne.style.display = 'block';
        videoUploadContainer.style.display = 'none';
        videoContainer.style.display = 'none';
        changePasswordContainer.style.display = 'none';
        CumulativeContainerTwo.style.display = 'none'
        CumulativeContainerThree.style.display = 'none'
        CumExamScoreContainer.style.display = 'none'
    }
    else {
        CumulativeContainerOne.style.display = 'none';
        videoUploadContainer.style.display = 'block';
        videoContainer.style.display = 'block';
        changePasswordContainer.style.display = 'block';
    }
})

document.querySelector('#cumTopicDropdown').addEventListener('click', loadTopicsForExam);
document.querySelector('#cumTopicDropdown').addEventListener('change', async () => {
    console.log("inside topic and subtopic eventlistenser");
    await loadSubtopicsForExam();
});


// Function to load topics from Firestore and populate the topic dropdown
async function loadTopicsForExam() {
    console.log("inside the load topic")
    // Clear existing options
    cumTopicDropdown.innerHTML = `<option value="">
                    Loading ...
                </option>`;

    // Fetch topics from Firestore and add them to the dropdown
    const querySnapshot = await getDocs(collection(firestore, 'courses'))
    if (!querySnapshot.empty) {
        // console.log(querySnapshot.docs)
        cumTopicDropdown.removeEventListener('click', loadTopicsForExam)
        cumTopicDropdown.innerHTML = ``;
        const option = document.createElement('option')
        option.innerHTML = `Please select`
        cumTopicDropdown.appendChild(option)
        querySnapshot.forEach(doc => {
            // console.log(doc)
            const option = document.createElement("option");
            // option.setAttribute('value', doc.data().name);
            option.setAttribute('value', doc.id)
            option.innerHTML = `${doc.id}`;
            cumTopicDropdown.appendChild(option);
        });
    } else {
        cumTopicDropdown.innerHTML = `<option value="">Please select</option>`
        displayMessage('No topics loaded!', 'danger')
    }
}

// Function to load subtopics based on the selected topic
const subTopicCheckboxesContainer = document.getElementById('subtopicCheckboxes');
async function loadSubtopicsForExam() {
    console.log("inside the subTopics");
    subTopicCheckboxesContainer.innerHTML = '';
    const course = document.querySelector('#cumTopicDropdown').options[document.querySelector('#cumTopicDropdown').selectedIndex].value;
    console.log(course);
    if (!course) {
        displayMessage('Please select a topic!', 'danger')
        return
    }

    const courseDoc = await getDoc(doc(firestore, 'courses', `${course}`));
    // Clear existing options
    if (courseDoc.exists()) {
        const subTopics = courseDoc.data().subCollection
        // cumSubTopicDropdown.removeEventListener('click', loadSubtopicsForExam);

        subTopics.forEach(async (subtopic) => {
            // console.log(subtopic);
            const subtopicRef = collection(firestore, 'courses', `${course}`, `${subtopic}`);
            const subcollectionSnapshot = await getDocs(subtopicRef);
            const numberQuestionsSubTopic = [];
            subcollectionSnapshot.forEach(doc => {
                if (doc.id === 'LearningCumQuestions' && doc.data().questionArrayGroup) {
                    const numberQuestionDoc = doc.data().questionArrayGroup;
                    numberQuestionDoc.forEach(question => {
                        numberQuestionsSubTopic.push(question);
                    });
                }
            });
            console.log(subtopic)
            // Create checkbox element
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'form-check';

            const checkboxInput = document.createElement('input');
            checkboxInput.className = 'form-check-input';
            checkboxInput.type = 'checkbox';
            checkboxInput.value = subtopic;
            checkboxInput.id = subtopic;

            const checkboxLabel = document.createElement('label');
            checkboxLabel.className = 'form-check-label';
            checkboxLabel.htmlFor = subtopic;
            // console.log(numberQuestionsSubTopic.length);
            checkboxLabel.textContent = `${subtopic} (Total Number of Questions : ${numberQuestionsSubTopic.length})`;


            // Append checkbox to the container
            checkboxDiv.appendChild(checkboxInput);
            checkboxDiv.appendChild(checkboxLabel);
            subTopicCheckboxesContainer.appendChild(checkboxDiv);
            console.log("end of the dropdown sub topic")
        });
    } else {
        cumSubTopicDropdown.innerHTML = `<option value="">Please select</option>`;
        displayMessage('No subtopic added to this topic!', 'danger');
    }
}

// Video upload Event Listener
let cumExamRandomQuestions = [];

cumQuestionDetailsForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    let topicName = null;
    if (cumTopicDropdown.value) {
        topicName = cumTopicDropdown.value;
    }
    console.log(topicName)
    // console.log(subTopicName)
    if (topicName) {
        console.log("Data with topicName");
        cumExamRandomQuestions = await handleCheckboxChange(topicName)
        // cumQuestionDetailsForm.removeEventListener("submit", handleCumQuestionFormSubmit);
    } else {
        // Error case
        console.log("Please select topic to take exam");
        displayMessage('Please select topic to take exam', 'danger');
    }
});

async function handleCheckboxChange(topicName) {
    return new Promise(async (resolve, reject) => {
        const numberCumQuestion = cumQuestionNumber.value;
        const selectedCheckboxes = document.querySelectorAll('#subtopicCheckboxes input[type="checkbox"]:checked');
        const selectedSubtopics = Array.from(selectedCheckboxes).map(checkbox => checkbox.value);
        console.log(selectedSubtopics);
        if (selectedSubtopics.length === 0) {
            console.log("Please select at least one subtopic.");
            displayMessage('Please select at least one subtopic', 'danger');
            return;
        }

        if (numberCumQuestion.length === 0) {
            console.log("Please Enter Number of Question")
            displayMessage('Please Enter Number of Questions', 'danger')
            return;
        }

        const promises = selectedSubtopics.map(async (subTopicName) => {
            console.log(subTopicName)
            const subtopicRef = collection(firestore, 'courses', `${topicName}`, `${subTopicName}`);
            const subcollectionSnapshot = await getDocs(subtopicRef);
            let subcollectionData = [];
            subcollectionSnapshot.forEach(doc => {
                if (doc.id === 'LearningCumQuestions' && doc.data().questionArrayGroup) {
                    subcollectionData = subcollectionData.concat(doc.data().questionArrayGroup);
                }
            });
            return subcollectionData;
        })
        const results = await Promise.all(promises);
        const cumExamQuestionsArray = results.flat();

        const cumExamRandomQuestions = getRandomCumQuestions(cumExamQuestionsArray, numberCumQuestion);
        console.log(cumExamRandomQuestions);

        if (cumExamRandomQuestions.length >= 0) {

            CumulativeContainerOne.style.display = 'none'
            CumulativeContainerTwo.style.display = 'block';
            CumulativeContainerThree.style.display = 'none'
            CumExamScoreContainer.style.display = 'none'
        }

        // Display questions and options in the same HTML container
        cumQuestionDisplayContainer.innerHTML = '';
        cumExamRandomQuestions.forEach((question, index) => {
            console.log(question);
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';

            // Display question text
            const questionText = document.createElement('p');
            questionText.innerText = `${index + 1}. ${question.questionText}`;
            questionDiv.appendChild(questionText);

            // Display options with checkboxes
            question.options.forEach((option, optionIndex) => {
                const checkboxDiv = document.createElement('div');
                checkboxDiv.className = 'form-check';

                const optionLabel = String.fromCharCode(65 + optionIndex);
                const optionCheckbox = document.createElement('input');
                optionCheckbox.className = 'form-check-input';
                optionCheckbox.type = 'checkbox';
                optionCheckbox.name = `question${index}`;
                optionCheckbox.id = `option${index}-${optionIndex}`;
                optionCheckbox.value = option;

                const optionText = document.createElement('label');
                optionText.className = 'form-check-label';
                optionText.htmlFor = `option${index}-${optionIndex}`;
                optionText.innerText = `${optionLabel}. ${option}`;

                // Append checkbox and label to the container
                checkboxDiv.appendChild(optionCheckbox);
                checkboxDiv.appendChild(optionText);
                checkboxDiv.appendChild(document.createElement('br'));
                questionDiv.appendChild(checkboxDiv);
            });
            cumQuestionDisplayContainer.appendChild(questionDiv);
        });
        subTopicCheckboxesContainer.innerHTML = ''
        cumQuestionDetailsForm.reset();
        resolve(cumExamRandomQuestions);
    })
}

function getRandomCumQuestions(cumExamQuestions, numberCumQuestion) {
    // Check if the numberCumQuestion is valid
    if (numberCumQuestion <= 0 || numberCumQuestion > cumExamQuestions.length) {
        console.error('Invalid number of questions requested.');
        displayMessage('Invalid number of questions requested', 'danger')
        return [];
    }
    const shuffledQuestions = cumExamQuestions.sort(() => Math.random() - 0.5);
    const randomQuestions = shuffledQuestions.slice(0, numberCumQuestion);
    return randomQuestions;
}

var userReponses = [];
cumQuestionAnswerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log(cumExamRandomQuestions)

    cumExamRandomQuestions.forEach((question, index) => {
        const selectedOptions = Array.from(document.querySelectorAll(`input[name="question${index}"]:checked`)).map(checkbox => checkbox.value);
        // console.log(selectedOptions);
        const isCorrect = compareOptions(selectedOptions, question.correctAnswers)
        userReponses.push({ questionIndex: index, isCorrect, selectedOptions });
    })

    const cumCorrectQuestions = userReponses.filter(response => response.isCorrect).length;
    const cumTotalQuestions = cumExamRandomQuestions.length;
    const score = (cumCorrectQuestions / cumTotalQuestions) * 100;
    if (cumExamRandomQuestions.length >= 0) {
        console.log("1")
        CumulativeContainerOne.style.display = 'none';
        videoUploadContainer.style.display = 'none';
        videoContainer.style.display = 'none';
        changePasswordContainer.style.display = 'none';
        CumulativeContainerTwo.style.display = 'none';
        CumulativeContainerThree.style.display = 'block';
        CumulativeContainerfour.style.display = 'none';
        CumExamScoreContainer.style.display = 'none'
    }

    cumTotalQuestionAttend.textContent = `Total Questions Attended : ${cumTotalQuestions}`;
    cumTotalQuestionCorrect.textContent = `Total Correct Questions : ${cumCorrectQuestions}`;
    cumExamPercentage.textContent = `Total Percentage Obtained : ${score.toFixed(2)}%`;

    console.log(userId)
    const learnerCollectionRef = doc(collection(firestore, 'learners'), userId);
    const now = new Date();
    // const examDate = serverTimestamp(); // Use serverTimestamp to store the current server time in Firestore
    const currentTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

    const cumExamDetails = {
        cumExamDate: now,
        cumTime: currentTime,
        totalQuestionsAttended: cumTotalQuestions,
        totalCorrectQuestions: cumCorrectQuestions,
        percentage: score.toFixed(2)
    }

    try {
        const learnerDocSnapshot = await getDoc(learnerCollectionRef);
        // console.log(learnerDocSnapshot);
        // console.log(cumExamDetails);

        if (learnerDocSnapshot.exists()) {
            console.log("if")
            await updateDoc(learnerCollectionRef, {
                examRecordsArray: arrayUnion(cumExamDetails)
            })
        }
        else {
            console.log("else")
            await setDoc(learnerCollectionRef, {
                examRecordsArray: [cumExamDetails]
            });
        }
    } catch (error) {
        console.error("Error adding exam record: ", error);
    }

    console.log(`User's Score: ${score.toFixed(2)}%`);
    console.log(`Number of Correct Answers: ${cumCorrectQuestions}`);
    console.log(`Total Questions Attempted: ${cumTotalQuestions}`);
    console.log(`User's Responses:`, userReponses);

    // Display user's score to the user (you can modify this part as per your UI design)
    displayMessage(`Your Score: ${score.toFixed(2)}%`, 'success');
});

function compareOptions(userOptions, correctAnswers) {
    console.log(userOptions)
    console.log(correctAnswers);
    if (userOptions.length !== correctAnswers.length) {
        return false;
    }

    for (let i = 0; i < correctAnswers.length; i++) {
        if (!userOptions.includes(correctAnswers[i])) {
            return false;
        }
    }
    return true;
}

cumExamViewDetails.addEventListener('click', () => {
    if (cumExamRandomQuestions.length > 0) {
        CumulativeContainerOne.style.display = 'none';
        videoUploadContainer.style.display = 'none';
        videoContainer.style.display = 'none';
        changePasswordContainer.style.display = 'none';
        CumulativeContainerTwo.style.display = 'none';
        CumulativeContainerThree.style.display = 'none';
        CumulativeContainerfour.style.display = 'block';
        CumExamScoreContainer.style.display = 'none'
    }

    console.log(userReponses);
    cumExamPreviewContainer.innerHTML = '';
    cumExamRandomQuestions.forEach((question, index) => {
        const questionDiv = document.createElement('div')
        questionDiv.className = 'question';

        const questionText = document.createElement('p');
        questionText.innerText = `${index + 1}. ${question.questionText}`
        questionDiv.appendChild(questionText);

        question.options.forEach((option, optionIndex) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'form-check';

            const optionLabel = String.fromCharCode(65 + optionIndex);
            const optionCheckbox = document.createElement('input');
            optionCheckbox.className = 'form-check-input';
            optionCheckbox.type = 'checkbox';
            optionCheckbox.disabled = true;//Disable the checkbox
            optionCheckbox.checked = userReponses[index].selectedOptions.includes(option);
            optionCheckbox.id = `previewOption${index}-${optionIndex}`;
            optionCheckbox.value = option;

            const optionText = document.createElement('label');
            optionText.className = 'form-check-label';
            optionText.htmlFor = `previewOption${index}-${optionIndex}`;
            optionText.innerText = `${optionLabel}. ${option}`;

            // Append checkbox and label to the container
            optionDiv.appendChild(optionCheckbox);
            optionDiv.appendChild(optionText);
            questionDiv.appendChild(optionDiv);
        });
        // Check if selected options match correct answers
        const isCorrect = compareOptions(userReponses[index].selectedOptions, question.correctAnswers);

        // Display right or wrong mark
        const markText = document.createElement('p');
        markText.innerText = isCorrect ? '✔️ Right' : '❌ Wrong';
        markText.style.color = isCorrect ? 'green' : 'red';
        questionDiv.appendChild(markText);

        // Display correct answers
        const correctAnswersText = document.createElement('p');
        correctAnswersText.style.color = 'blue';
        correctAnswersText.innerText = `Correct Answers: ${question.correctAnswers.join(', ')}`;
        questionDiv.appendChild(correctAnswersText);

        cumExamPreviewContainer.appendChild(questionDiv);
    })
})

// Back to Cum exam
backCumExamContainerOne.addEventListener('click', () => {
    cumExamPreviewContainer.innerHTML = ""
    CumulativeContainerfour.style.display = 'none';
    CumulativeContainerOne.style.display = 'block';
})

//**********************************************************************

//**********************Cumulative Exam Score Records**********************


myCumulativeScoreRecords.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log(userId)
    if (CumExamScoreContainer.style.display = 'none') {
        console.log("if")
        videoUploadContainer.style.display = 'none';
        // mainContainer.style.display = 'none'
        videoContainer.style.display = 'none';
        questionUploadContainer.style.display = 'none';
        changePasswordContainer.style.display = 'none'
        CumulativeContainerOne.style.display = 'none'
        CumulativeContainerTwo.style.display = 'none'
        CumulativeContainerThree.style.display = 'none'
        CumExamScoreContainer.style.display = 'block'
    }
    else {
        
        console.log("else")
        displayMessage('Please userId to display cum exam records', 'danger')
    }

    const learnerCollectionRef = doc(collection(firestore, 'learners'), userId);
    const learnerDocSnapshot = await getDoc(learnerCollectionRef);
    console.log(learnerDocSnapshot)


    try {
        if (learnerDocSnapshot.exists()) {
            const learnerData = learnerDocSnapshot.data();
            console.log(learnerData);

            if (learnerData && Array.isArray(learnerData.examRecordsArray)) {
                const examRecordsData = learnerData.examRecordsArray;
                console.log(examRecordsData);

                const cumExamScoreDisplay = document.getElementById('cum-exam-score-display');
                cumExamScoreDisplay.innerHTML = ''; // Clear previous content

                examRecordsData.forEach((record, index) => {
                    const timestamp = 1234567890; // Replace with your timestamp
                    const cumExamDate = new Date(timestamp * 1000); // Convert timestamp to milliseconds
                    const formattedDate = cumExamDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    console.log(formattedDate);

                    const recordCard = document.createElement('div');
                    recordCard.className = 'card';
                    recordCard.style = 'width: 18rem; margin-bottom: 2rem;';

                    recordCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title text-start">Exam Score</h5>
                    <div class="text-start">
                        <p class="card-text">Exam Date : ${formattedDate}</p>
                    </div>
                    <div class="text-start">
                        <p class="card-text">Exam Time : ${record.cumTime}</p>
                    </div>
                    <div class="text-start">
                        <p class="card-text">Total Questions Attended : ${record.totalQuestionsAttended}</p>
                    </div>
                    <div class="text-start">
                        <p class="card-text">Total Correct Questions : ${record.totalCorrectQuestions}</p>
                    </div>
                    <div class="text-start">
                        <p class="card-text">Total Percentage Obtained : ${record.percentage}%</p>
                    </div>
                </div>
            `;

                    cumExamScoreDisplay.appendChild(recordCard);
                });
            } else {
                console.log("No exam records found for the user");
                displayMessage('No exam records found for the user', 'danger');
            }
        } else {
            console.log("User not found");
            displayMessage('User not found', 'danger');
        }
    } catch (error) {
        console.error("Error Getting exam records: ", error);
    }
})

// ******************************** change password*********************

const changePasswordForm = document.getElementById('changePasswordForm');
document.querySelector('.accountSettings').addEventListener('click', () => {
    if (changePasswordContainer) {
        videoContainer.style.display = "none"
        questionUploadContainer.style.display = 'none';
        changePasswordContainer.style.display = "block";
        videoUploadContainer.style.display = "none";
        CumulativeContainerOne.style.display = "none"
        CumulativeContainerTwo.style.display = 'none'
        CumExamScoreContainer.style.display = 'none'
    }
    else {
        videoContainer.style.display = "block"
        changePasswordContainer.style.display = "none";
        videoUploadContainer.style.display = "none";
    }
});

document.getElementById('changePasswordBtn').addEventListener('click', () => {
    document.querySelector('#changePasswordBtn').disabled = true;
    document.querySelector('#changePasswordBtn').textContent = "Update password....."

    //Get the current user
    const user = auth.currentUser;
    if (user) {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (currentPassword === newPassword) {
            displayMessage("Current passsword and new passwword should not be same", "danger");
            document.querySelector("#changePasswordBtn").disabled = false;
            document.querySelector('#changePasswordBtn').textContent = 'Change Password';
            return;
        }

        if (newPassword !== confirmNewPassword) {
            displayMessage("New password and confirmPassword ddo not match", "danger");
            document.querySelector("#changePasswordBtn").disabled = false;
            document.querySelector('#changePasswordBtn').textContent = 'Change Password';
            return;
        }

        //Change the user's password
        updatePasswordFn(user, currentPassword, newPassword);
    }
})

function updatePasswordFn(user, currentPassword, newPassword) {
    //check new password validdity,else return
    if (!isValidPassword(document.querySelector('#newPassword').value)) return;

    const credentials = EmailAuthProvider.credential(
        user.email,
        currentPassword
    )

    //Reauthenticate the user with thier current password
    reauthenticateWithCredential(user, credentials)
        .then(() => {
            updatePassword(user, newPassword)
                .then(() => {
                    displayMessage("Password updated successful", "success")
                    document.querySelector('#changePasswordBtn').disabled = false;
                    document.querySelector('#changePasswordBtn').textContent = "Change Password";
                    changePasswordForm.reset();
                })
                .catch((error) => {
                    console.error("Error updating password: ", error)
                    displayMessage("Error updating password.please try again", "danger")
                    document.querySelector('#changePasswordBtn').disabled = false;
                    document.querySelector('#changePasswordBtn').textContent = "Change Password";
                    changePasswordForm.reset();
                })
        })
        .catch((error) => {
            console.error("Error updating password: ", error)
            displayMessage("Error reauthenticated user.please check  your current password", "danger")
            document.querySelector('#changePasswordBtn').disabled = false;
            document.querySelector('#changePasswordBtn').textContent = "Change Password";
            changePasswordForm.reset();
        })

}


togglePasswordVisibility("currentPassword", "currentPasswordToggle");
togglePasswordVisibility("newPassword", "newPasswordToggle");

// Function to toggle password visibility
function togglePasswordVisibility(inputId, toggleBtnId) {
    const passwordInput = document.getElementById(inputId);
    const toggleBtn = document.getElementById(toggleBtnId);

    toggleBtn.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>'
        }
        else {
            passwordInput.type = "password";
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    });
}

// **************************************************************************************

// ********************************** display message function ***************************
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

//*************************Real Time***************************
function getUserRealTime() {
    onSnapshot(doc(firestore, 'learners', auth.currentUser.uid), (doc) => {
        userData = doc.data()
        // populateShownDetails()
    })
}
//*************************************************************

//*************************Validation**************************
// Function to validate first name (minimum 3 characters)
function isValidFirstName(name) {
    return name.length >= 3;
}

// Function to validate phone number (must be exactly 10 digits)
function isValidPhoneNumber(phone) {
    const phoneNumberRegex = /^\d{10}$/;
    return phoneNumberRegex.test(phone);
}

function isValidPassword(password) {
    return password.length >= 6;
}

async function getUpdatedUserData() {
    return new Promise(async (resolve) => {
        const userDoc = await getDoc(doc(firestore, 'learners', auth.currentUser.uid))
        resolve(userDoc.data())
    })
}
//***************************************************************