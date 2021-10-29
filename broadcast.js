const firebaseConfig = {
 apiKey:   "AIzaSyCe0j65zDU0yv2q0jAiqQ3Eko9UiESmHkA",  
 authDomain:   "control-gaming.firebaseapp.com",  
 projectId:   "control-gaming",  
 storageBucket:   "control-gaming.appspot.com",  
 messagingSenderId:   "536084263350",  
 appId:   "1:536084263350:web:4a90e4d28baa60d7ffd117",  
 measurementId:   "G-4HTL5PGYGW"
};

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore()

const sourceDoc = firestore.collection('calls').doc('source');
const receiversDoc = sourceDoc.collection('calls')


const webcamVideo = document.getElementById('webcamVideo')
const audioInputSelect = document.querySelector("select#audioSource")
const videoSelect = document.querySelector("select#videoSource")
const btnStart = document.getElementById("btnStart")
const bitRate = document.querySelector("select#bandwidth")

const btnStop = document.getElementById("btnStop")
const btnLogin = document.getElementById("btnLogin")
const broadcast = document.getElementById("broadcast")
const loginCont = document.getElementById("loginCont")
const pass = document.getElementById("password")
const selectors = [audioInputSelect, videoSelect]

let localStream = new MediaStream;
var peer 

btnLogin.addEventListener('click', login)
btnStart.addEventListener('click', checkOffer)
btnStop.addEventListener('click', end)

bitRate.onchange = updateBandwidthRestriction

broadcast.style.display = "none"

function login(){
  const passwordDoc = firestore.collection('password').doc('password')
  console.log(passwordDoc)
  passwordDoc.get().then((doc) => {
    let password = doc.data().pword
    if(pass.value == password){
      loginCont.style.display = "none"
      broadcast.style.display = "block"
    }
  })
}

  async function gotDevices(deviceInfos) {
    // Handles being called several times to update labels. Preserve values.
    const values = selectors.map(select => select.value);
    selectors.forEach(select => {
      while (select.firstChild) {
        select.removeChild(select.firstChild);
      }
    });
    for (let i = 0; i !== deviceInfos.length; ++i) {
      const deviceInfo = deviceInfos[i];
      const option = document.createElement('option');
      option.value = deviceInfo.deviceId;
      if (deviceInfo.kind === 'audioinput') {
        option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
        audioInputSelect.appendChild(option);
      } else if (deviceInfo.kind === 'videoinput') {
        option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
        videoSelect.appendChild(option);
      } else {
        
      }
    }
    selectors.forEach((select, selectorIndex) => {
      if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
        select.value = values[selectorIndex];
      }
    });
  }
  
  navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
  
  async function gotStream(stream) {
    window.stream = stream; 
    webcamVideo.srcObject = stream;
    localStream = stream;
	  
    return navigator.mediaDevices.enumerateDevices();
  }
  
  function handleError(error) {
    console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
  }
  
  async function start() {
    if (window.stream) {
      window.stream.getTracks().forEach(track => {
        track.stop();
      });
    }
    const audioSource = audioInputSelect.value;
    const videoSource = videoSelect.value;
    const constraints = {
      audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
      video: {deviceId: videoSource ? {exact: videoSource} : undefined}
    };
    navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
  }
  
audioInputSelect.onchange = start
videoSelect.onchange = start
start()
//Changes url->urls 

function checkOffer() {
  peer = new Peer({
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
    sourceDoc.set({ sourceid: peer.id });
  });

	
  receiversDoc.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach(async change => {
      if (change.type === 'added') {
        id = change.doc.data().viewerid
        console.log(id)

        var conn = peer.connect(id);
		  
        conn.on('open', function(){
        });

        var call = peer.call(id, localStream);
        btnStart.disabled = true
        btnStop.disabled = false
        call.on('stream', function(remoteStream) {
        });
      }
    })
  })
}

async function end(){
  peer.disconnect()
  btnStart.disabled = false
  btnStop.disabled = true
  peer.destroy()
  location.reload();
}

function updateBandwidthRestriction() {
  sdp = peer.sdpTransform()
  console.log('sdp :', sdp)
  bandwidth = bitRate.value
  console.log('bandwidth :', bandwidth)
  let modifier = 'AS';
  if (adapter.browserDetails.browser === 'firefox') {
    bandwidth = (bandwidth >>> 0) * 10000; //1000 default
    modifier = 'TIAS'; // TIAS default
  }
  if (sdp.indexOf('b=' + modifier + ':') === -1) {
    // insert b= after c= line.
    sdp = sdp.replace(/c=IN (.*)\r\n/, 'c=IN $1\r\nb=' + modifier + ':' + bandwidth + '\r\n');
  } else {
    sdp = sdp.replace(new RegExp('b=' + modifier + ':.*\r\n'), 'b=' + modifier + ':' + bandwidth + '\r\n');
  }
  return;
}