//FIREBASE SETUP
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js"
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, getAdditionalUserInfo } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js"
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js"
import { setupMenu } from "./menu.js"
import { populatePlayerInfo } from "./playerSection.js"
import { initTraining, updateEnergyBar, updateTrainingSection } from "./trainingSection.js"
import { FIREBASE_CONFIG } from "./constants.js"
import { updateMessagesSection } from "./messagesSection.js"

// Initialize Firebase
const fbApp = initializeApp(FIREBASE_CONFIG)
const auth = getAuth(fbApp)
const database = getDatabase(fbApp)

let player = {}

const provider = new GoogleAuthProvider()

//LANDING PAGE VARIABLES
let loginForm = document.querySelector("#login-form")

//SECTION AND MENU VARIABLES
let gameContainer = document.body.querySelector(".game-container")

//----------
//LANDING PAGE

//Login action
loginForm.querySelector("#login-button").onclick = function (event) {
    signInWithRedirect(auth, provider)
}

getRedirectResult(auth).then((result) => {
    if (result) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
    
        const user = result.user;
        const additionalInfo = getAdditionalUserInfo(result)
        
        
        initPlayer(user)
        if (additionalInfo.isNewUser) {
            createPlayer(user)
        } else {
            initGame()
            document.querySelector(".landing-page").style.display = "none"
            gameContainer.style.display = "grid"
        }
    }
})

function initPlayer(user) {
    player.playerId = user.uid
    player.playerRef = ref(database, `players/${player.playerId}`)
}

function createPlayer() {
    document.querySelector(".landing-page").style.display = "none"
    document.querySelector(".new-player").style.display = "flex"
    
    document.querySelector("#create-new-player-button").onclick = function (event) {
        set(player.playerRef, {
            "player-info": {
                "name": document.getElementById("new-player-name").value,
                "country": document.getElementById("new-player-country").value,
                "bday": new Date(document.getElementById("new-player-bday").value).toDateString(),
                "start-day": new Date().toDateString(),
                "club": "N/A",
                "position": Number(document.getElementById("new-player-position").value),
                "description": ""
            },
            "player-skills": {
                "rep-points": 0,
                "passing-points": 10,
                "speed-points": 10,
                "endurance-points": 10,
                "footwork-points": 10,
                "diving-points": 10,
                "catching-points": 10,
                "reaction-speed-points": 10,
                "tackling-points": 10,
                "1v1-defending-points": 10,
                "intercepting-points": 10,
                "decision-making-points": 10,
                "touch-and-ball-control-points": 10,
                "shooting-points": 10,
                "dribling-points": 10,
                "off-the-ball-movement-points": 10,
                "heading-points": 10,
            },
            "training": initTraining(Number(document.getElementById("new-player-position").value))
        })
        
        initGame()
        document.querySelector(".new-player").style.display = "none"
        gameContainer.style.display = "grid"
    }
}

function initGame() {
    populatePlayerInfo(player.playerId, database)
    updateEnergyBar(player.playerId, database)
    updateTrainingSection(player.playerId, database)
    updateMessagesSection(player.playerId, database)
}

setupMenu()