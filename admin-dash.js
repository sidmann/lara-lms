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

// ------------------------ global variables ----------------------------------------------

const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
const myCumulativeQuestionUpload = document.querySelector('.my-cumulative-question-upload');
const topicDescriptionContainer = document.querySelector(".topicDescriptionContainer");

const CumulativeContainerOne = document.querySelector('.cumulative-container-one');
const CumulativeContainerTwo = document.querySelector('.cumulative-container-two');
const CumulativeContainerThree = document.querySelector('.cumulative-container-three');
const CumulativeContainerfour = document.querySelector('.cumulative-container-four');

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
                // console.log(auth.currentUser.uid);
                // getUserRealTime();
                // toggleVideoContainer();
                // stopLoader();
            }
        });
    } else {
        // User is not authenticated, redirect to login page
        window.location.href = "login.html";
    }
});

/**
 * access the dashboard based on the role
 * @param {*} role 
 */
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

/**
 * upload video subtopic wise 
 * 
 */
const uploadVideoContainerDisplay = document.querySelector('.upload-video-container-display');
var mainContainer = document.querySelector('#mainContainer');
mainContainer.style.display = 'none';


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
var videoUploadContainer = document.getElementById('videoUploadContainer');

// Event listener to display upload Video Container
uploadVideoContainerDisplay.addEventListener('click', () => {
    if (videoUploadContainer.style.display === 'none' || videoUploadContainer.style.display === '') {
        videoUploadContainer.style.display = 'block';
        mainContainer.style.display = 'block'
        videoContainer.style.display = 'none';
        questionUploadContainer.style.display = 'none';
    } else {
        videoUploadContainer.style.display = 'none';
        mainContainer.style.display = 'none'
        videoContainer.style.display = 'none';
        changePasswordContainer.style.display = 'none'
    }
});

// -------------------------------Crud Of Topic ---------------------------------

/**
 * 
 * Add a click event listener to open the topic modal
 */
const openTopicModalButton = document.getElementById('videoAddTopicButton');
openTopicModalButton.addEventListener('click', () => {
    document.getElementById('topicName').value = '';
    console.log("inside the topic model")
    populateTopicList();
});


/**
 *  Add Topic
 */
document.getElementById('saveTopicButton').addEventListener('click', async () => {
    console.log("save topicName inside")
    const topicName = document.getElementById('topicName').value;
    if (topicName) {
        try {
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

/**
 * add topic 
 * @param {*} topicName 
 * @returns 
 */
async function addTopic(topicName) {
    try {
        const topicRef = collection(firestore, 'courses');
        const docRef = await setDoc(doc(topicRef, `${topicName}`), { topicId: topicName });
        console.log("inside add topic")
        document.querySelector('#videoTopicDropdown').addEventListener('click', loadTopics)
        return docRef;
    } catch (error) {
        console.error('Error adding Topic:', error);
        throw error;
    }
}

/**
 * Populate Topic List
 */
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

/**
 * Function to delete a topic
 * @param {*} course 
 */
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
                        console.log(courseDoc.ref)
                        // console.log(collection(courseDoc, subCollection))
                        const oldSubCollectionSnapshot = await getDocs(collection(courseRef, subCollection))
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

/**
 *  Function to load topics from Firestore and populate the topic dropdown
 */
async function loadTopics() {
    console.log("inside the load topic")
    const videoTopicDropdown = document.querySelector("#videoTopicDropdown");
    videoTopicDropdown.innerHTML = `<option value="">
                    Loading ...
                </option>`;


    const querySnapshot = await getDocs(collection(firestore, 'courses'))
    if (!querySnapshot.empty) {
        console.log(querySnapshot.docs)
        videoTopicDropdown.removeEventListener('click', loadTopics)
        videoTopicDropdown.innerHTML = ``;
        const option = document.createElement('option')
        option.innerHTML = `Please select`
        videoTopicDropdown.appendChild(option)
        querySnapshot.forEach(doc => {
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
//---------------------------------------------------------------------------------


//-------------------------------- Crud of Subtopic--------------------------------

/**
 * Open Sub Topic Modal
 */
const openSubTopicModalButton = document.getElementById('videoAddSubTopiButton');
openSubTopicModalButton.addEventListener('click', () => {
    document.getElementById('subTopicName').value = '';
    populateTopicDropdown('topicSubTopic');
    const selectedTopicId = document.getElementById('topicSubTopic').value;
});

/**
 * Function to populate the topic dropdown in the modal
 * @param {*} targetDropdownId 
 */
function populateTopicDropdown(targetDropdownId) {
    console.log(targetDropdownId + ",,,,,,,,,,,,")
    const select = document.querySelector(`#${targetDropdownId}`);
    select.innerHTML = `<option value="">
                    Loading ...
                </option>`;

    getDocs(collection(firestore, 'courses'))
        .then((courses) => {
            select.innerHTML = '';
            const option = document.createElement('option');
            option.innerHTML = 'Please select';
            select.appendChild(option);
            console.log(courses);

            console.log("populateTopic dropdown")
            courses.forEach((course) => {
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


/**
 * Add Subtopic
 */
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
            const subTopicId = await addSubTopic(selectedTopicId, subTopicName);
            console.log('SubTopic added successfully!');
            displayMessage('SubTopic added successfully!', 'success');
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
        document.querySelector('#videoSubTopicDropdown').addEventListener('click', loadSubtopics)
        return docRef;
    } catch (error) {
        console.error('Error adding subTopic:', error);
        throw error;
    }
}

/**
 *  Function to populate Sub topics list in the modal
 * @param {*} event 
 * @returns 
 */
async function populateSubTopicList(event) {
    console.log(event.target)
    const subTopicList = document.getElementById('subTopicList');
    if (!event) {
        subTopicList.innerHTML = `<tr><td>Please select a topic.</td><td></td></tr>`;
        return
    }
    const course = event.target.options[event.target.selectedIndex].value
    subTopicList.innerHTML = `<tr><td>Loading...</td><td></td></tr>`;

    try {
        const courseDoc = await getDoc(doc(firestore, 'courses', `${course}`));
        subTopicList.innerHTML = ''; // Clear the list

        if (courseDoc.exists()) {
            const topics = courseDoc.data().subCollection
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

/**
 * edit subTopic name or subcollection
 * @param {*} course 
 * @param {*} oldSubTopicName 
 * @param {*} updatedSubTopicName 
 * @returns 
 */
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

/**
 * Delete the subcolection along documents
 * @param {*} course 
 * @param {*} subTopicName 
 */
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

/**
 * Function to load subtopics based on the selected topic
 * @returns 
 */
async function loadSubtopics() {
    const course = document.querySelector('#videoTopicDropdown').options[document.querySelector('#videoTopicDropdown').selectedIndex].value;
    console.log("inside load subTopic");
    console.log(course);
    if (!course) {
        displayMessage('Please select a topic!', 'danger')
        return
    }

    const videoSubTopicDropdown = document.querySelector("#videoSubTopicDropdown");
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


        uploadProgressBar.style.width = "100%";
        uploadPercentageDisplay.textContent = "Upload Completed";
        displayMessage('Upload Completed', 'success')

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

        uploadProgressBar.style.width = "100%";
        uploadPercentageDisplay.textContent = "Upload Completed";
        displayMessage('Upload Completed', 'success')

        setTimeout(() => {
            progressContainer.style.display = "none";
        }, 2000);
        uploadForm.reset();

        // resetSelectedImageName();
        resetSelectedVideoName();

    } catch (error) {
        console.error("Error uploading: ", error);
        alert("Error uploading files. Please try again.");
    }
}
//------------------------------------------------------------------------------------------------------

// ----------------------------- Question Upload ---------------------------------------------

const questionUploadContainer = document.querySelector(".question-upload-container");
const questionFileSubmit = document.getElementById('question-file-submit');
const fileUploadForm = document.getElementById('file-upload-form');
const fileInput = document.getElementById('file-input')
const fileName = document.getElementById("file-name");


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
        videoUploadContainer.style.display = 'none';
        videoContainer.style.display = 'none';
    }
    else {
        questionUploadContainer.style.display = 'none';
        videoUploadContainer.style.display = 'none';
        videoContainer.style.display = 'none';
    }
})

/**
 * Function to load topics from Firestore and populate the topic dropdown
 */
async function loadTopicsForFile() {
    console.log("inside the load topic")
    const fileTopicDropdown = document.querySelector("#fileTopicDropdown");
    // Clear existing options
    fileTopicDropdown.innerHTML = `<option value="">
                    Loading ...
                </option>`;


    const querySnapshot = await getDocs(collection(firestore, 'courses'))
    if (!querySnapshot.empty) {
        // console.log(querySnapshot.docs)
        fileTopicDropdown.removeEventListener('click', loadTopicsForFile)
        fileTopicDropdown.innerHTML = ``;
        const option = document.createElement('option')
        option.innerHTML = `Please select`
        fileTopicDropdown.appendChild(option)
        querySnapshot.forEach(doc => {
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

/**
 * Function to load subtopics based on the selected topic
 * @returns 
 */
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

/**
 * questions file upload 
 * 
 */
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
        // displayMessage("Please selected the questionFile", "danger")
        return;
    } else {
        // Error case
        console.log("Please enter topic, subtopic name, and select a video");
        displayMessage('Please enter topic, subtopic name, and select a video', 'danger');
    }
});


/**
 * upload question file 
 * @param {*} file 
 * @param {*} topicName 
 * @param {*} subTopicName 
 */
async function uploadQuestionFile(file, topicName, subTopicName) {
    console.log(file);
    console.log("inside the upload question file ")

    try {
        if (file) {
            const reader = new FileReader();
            const questionsArray = [];
            const batch = writeBatch(firestore);

            reader.onload = function (event) {
                const data = event.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });

                // const sheetName = workbook.SheetNames[0];
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
//--------------------------------------------------------------------------------------------


//-------------------------------------- display message function ------------------------------

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
