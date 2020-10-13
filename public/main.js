var firebaseConfig = {
  apiKey: "AIzaSyDu_-C_KPUM7Dykwhodkzz64XpzVWhpXB0",
  authDomain: "connect-491.firebaseapp.com",
  databaseURL: "https://connect-491.firebaseio.com",
  projectId: "connect-491",
  storageBucket: "connect-491.appspot.com",
  messagingSenderId: "81938691198",
  appId: "1:81938691198:web:1e501702444763e3ae142f",
  measurementId: "G-KFW850R2XC"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

      // stupid declerations
var isNewAccount = false;

let auth = firebase.auth();
let dbRef = firebase.database();
      //  auth Frames
let signedOut = document.getElementById('signedOut');
let details = document.getElementById('details');
let profile = document.getElementById('profile');
      // email and pass
let email = document.getElementById('email');
let pass = document.getElementById('pass');
      //  tags in profile frame
let displayUserName = document.getElementById('displayUserName');
let displayFullName = document.getElementById('displayFullName');
let displayAge = document.getElementById('displayAge');
let displayGender = document.getElementById('displayGender');
      //  tags in details frams
let inputUserName = document.getElementById('userName');
let inputFullName = document.getElementById('fullName');
let inputAge = document.getElementById('age');
let inputGender = document.getElementById('gender');
      //  post content
let postContent = document.querySelector('textarea');
let isPostPublic = document.getElementById('isPublic');
      //  live feed (post wall)
let postWall = document.querySelector('#post');


      // Auth status

auth.onAuthStateChanged(user => {
  if(user) {
    signedOut.hidden = true;
    //  is new account
    if(isNewAccount) {
      let userName = inputUserName.value;
      let fullName = inputFullName.value;
      let age = inputAge.value;
      let gender = inputGender.value;
      //  upload data to user;
      dbRef.ref('user').child(auth.currentUser.uid).set({
        metadata: {
          userName: userName,
          fullName: fullName,
          gender: gender,
          age: age
        }
      });
    }
    //  setup profile
    setupProfile();
  }
  else {
    signedOut.hidden = false;
  }
});

      // listener for login 

let login = document.getElementById('loginBtn');
login.addEventListener('click', event => {
  event.preventDefault();
  let email_data = email.value;
  let pass_data = pass.value;
  if(email_data == "" || pass_data == "") {
    alert('fill the form first');
    return false;
  }
  //  login with auth
  auth.signInWithEmailAndPassword(email_data, pass_data)
  .catch( error => alert(error.message) );
  //  reset form;
  pass.value = email.value = "";
});


// setup profile Frame
let setupProfile = () => {
  //  manage frames
  signedOut.hidden = true;
  profile.hidden = false;
  details.hidden = true;
  //  fetch data
  let id = auth.currentUser.uid;
  dbRef.ref(`user/${id}/metadata`).on('value', snap => {
    let data = snap.val();
    displayUserName.innerText = data.userName;
    displayFullName.innerText = data.fullName;
    displayAge.innerText = data.age;
    displayGender.innerText = data.gender; 
  });
}

      // listener for signup

let signup = document.getElementById('signupBtn');
signup.addEventListener('click', event => {
  event.preventDefault();
  var email_data = email.value;
  var pass_data = pass.value;
  if(email_data == "" || pass_data == "") {
    alert('fill the form first');
    return false;
  }
  //  reset form;
  pass.value = email.value = "";
  //  signup with auth
  redirectToDetails();

      //  listener for details

  let detailsForm = document.querySelector('form[id="detailsForm"]');
  detailsForm.addEventListener('submit', event => {
    event.preventDefault();
    //  create account
    auth.createUserWithEmailAndPassword(email_data, pass_data)
    .then( () => isNewAccount = true )
    .catch( error => alert(error.message) );
  });
});


// setup Details Frame
let redirectToDetails = () => {
  //  manage frames
  signedOut.hidden = true;
  profile.hidden = true;
  details.hidden = false;
}


let redirectToProfile = () => {
  //  manage frames
  signedOut.hidden = true;
  profile.hidden = false;
  details.hidden = true;
  setupProfile();
}

      //  listener for logout

let logout = document.getElementById('logoutBtn');
logout.addEventListener('click', event => {
  event.preventDefault();
  auth.signOut();
  //  manage frames
  signedOut.hidden = false;
  profile.hidden = true;
  details.hidden = true;
});


          // login signup completed


      // write post 

let postForm = document.querySelector('form[id="postForm"]');
postForm.addEventListener('submit', event => {
  event.preventDefault();
  if(auth.currentUser === null) {
    alert('login first!');
    return false;
  }
  id = auth.currentUser.uid;
  postText = postContent.value;
  isPublic = isPostPublic.checked;
  //  upload to database
  dbRef.ref(`posts`).push().set({
    userId: id,
    content: postText,
    isPublic: isPublic
  })
  .then( postContent.value = "" )
  .catch( error => alert(error));
});


      //  post wall

dbRef.ref().child('posts').on('value', snap => {
  console.log(snap.val());
});
