const firebaseConfig = {
  apiKey:   "AIzaSyCe0j65zDU0yv2q0jAiqQ3Eko9UiESmHkA",  
  authDomain:   "control-gaming.firebaseapp.com",  
  projectId:   "control-gaming",  
  storageBucket:   "control-gaming.appspot.com",  
  messagingSenderId:   "536084263350",  
  appId:   "1:536084263350:web:4a90e4d28baa60d7ffd117",  
  measurementId:   "G-4HTL5PGYGW"
 };
 
 // Initialize Firebase
 firebase.initializeApp(firebaseConfig);
 const firestore = firebase.firestore()
 
 const webcamVideo = document.getElementById('remoteVideo')
 
 // Reference Firestore collections for signaling
 const sourceDoc = firestore.collection('calls').doc('source');
 const receiversDoc = sourceDoc.collection('calls');
 //Changes url->urls  
 var peer = new Peer({
   config: {'iceServers': [
     { urls: 'stun:stun.control-gaming.eu:5349'},
     { urls: 'stun:stun.l.google.com:19302' },
     { urls: 'stun:iphone-stun.strato-iphone.de:3478'},
       {
         urls: 'turn:turn1.control-gaming.eu:5349',
         credential: '2875',
         username: 's1ckz'
       },
     {
         urls: 'turn:turn2.control-gaming.eu:5349',
         credential: '2875',
         username: 's1ckz'
       }
     ]}
   });
 
 peer.on('open', function (id) {
   console.log('ID: ' + peer.id);
   receiversDoc.add({ viewerid: peer.id });
 });
 
 sourceDoc.get().then((doc) => {
   let source = doc.data().sourceid
   console.log('ID: ' + source);
 
   peer.on('connection', function(conn) {
     conn.on('data', function(data){
     
     });
   });
 
   peer.on('call', function(call) {
   let localStream = new MediaStream()
   
   call.answer(localStream);
   call.on('stream', function(remoteStream) {
     webcamVideo.srcObject = remoteStream
   }, function(err) {
       console.log('Failed to get local stream' ,err);
     });
   });
 
 })