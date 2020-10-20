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
      isNewAccount = false;
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
    //  add list of other users
    addOtherUsers();
  }
  else {
    signedOut.hidden = false;
    removeOtherUsers();
  }
});

      // listener for login 

let login = document.getElementById('loginBtn');
login.addEventListener('click', event => {
  event.preventDefault();
  let email_data = email.value;
  let pass_data = pass.value;
  //  login with auth
  auth.signInWithEmailAndPassword(email_data, pass_data)
  .catch( error => alert(error.message) );
  //  confirm that it's not a new user
  isNewAccount = false;
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
  //  details from reset
  detailsForm.reset();
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
  userName = displayUserName.innerText;
  //  upload to database
  dbRef.ref(`posts`).push().set({
    userId: id,
    content: postText,
    isPublic: isPublic,
    userName: userName
  })
  .then( postForm.reset() )
  .catch( error => alert(error));
});


      //  post wall
      
dbRef.ref().child('posts').orderByChild('isPublic').equalTo(true).on('child_added', snap => {
  let data = snap.val();
  let key = snap.key;
  //console.log(snap.val());
  createPost(key, data);
});


//  create post

let createPost = (classAlias, data) => {
  //  wrapper of posts
  let postWrapper = document.getElementById('postWrapper');
  //  create tags
  let userPost = document.createElement('div');
  userPost.id = "userPost";
  userPost.classList.add(classAlias);
  let postImg = document.createElement('img');
  //  make Img random.
  let num = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
  postImg.src = `./avatar/b${num}.png`;
  postImg.id = 'postImg';
  let content = document.createElement('p');
  content.appendChild(document.createTextNode(data.content));
  let postWriter = document.createElement('h3');
  postWriter.id = 'postWriter';
  postWriter.appendChild(document.createTextNode(data.userName));
  //  make a post
  userPost.appendChild(postImg);
  userPost.appendChild(content);
  userPost.appendChild(postWriter);
  //  add post to wall
  postWrapper.appendChild(userPost);
};

//  add users to list.

function addOtherUsers() { 
  dbRef.ref().child('user').orderByChild('metadata').on('child_added', snap => {
    let data = snap.val();
    if(snap.key == auth.currentUser.uid)
      return;
    for(const [key, value] of Object.entries(data)) {
      createUserTile(value);
    }
  });
}

//  remove users from list 

function removeOtherUsers() {
  let expiredUsers = document.querySelectorAll('#user');
  //  if there are no other users
  if(!expiredUsers)
    return;
  //  else remove users
  expiredUsers.forEach(user => {
    user.remove();
  });
}


//  create user tile

let createUserTile = data => {
  //console.log(data);
  let userWrapper = document.querySelector('.userWrapper');
  let user = document.createElement('div');
  user.id = 'user';
  let name = document.createElement('p');
  name.appendChild(document.createTextNode(data.userName));
  let a = document.createElement('a');
  a.id = 'userAlias';
  // a.href = "";
  let img = document.createElement('img');
  img.src = 'https://img.icons8.com/metro/25/000000/gender-neutral-user.png';
  //  append to make user tile
  a.appendChild(img);
  user.appendChild(name);
  user.appendChild(a);
  //  add to list
  userWrapper.appendChild(user);
};
