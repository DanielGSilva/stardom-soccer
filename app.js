//FIREBASE SETUP
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js"
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, getAdditionalUserInfo } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js"
import { getDatabase, ref, set, onValue, get, child } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js"

const firebaseConfig = {
    apiKey: "AIzaSyA_gjejepfFP_X5P8ARSKzj1q20K_82ujo",
    authDomain: "stardom-soccer.firebaseapp.com",
    databaseURL: "https://stardom-soccer-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "stardom-soccer",
    storageBucket: "stardom-soccer.appspot.com",
    messagingSenderId: "583019702852",
    appId: "1:583019702852:web:f17cd95ec916f29b11aa11"
}

// Initialize Firebase
const fbApp = initializeApp(firebaseConfig)
const auth = getAuth(fbApp)
const database = getDatabase(fbApp)

let playerId, playerRef

const provider = new GoogleAuthProvider();

//LANDING PAGE VARIABLES
let loginForm = document.querySelector("#login-form")

//SECTION AND MENU VARIABLES
let gameContainer = document.body.querySelector(".game-container")

const SECTIONS = ["player", "training", "clubhouse", "work", "snacks", "classification", "messages"]
let activeSection = 0 //always begins in the player section

const POSITIONS = ["Goal Keeper", "Defender", "Midfielder", "Attacker"]
const SKILLS = [
    ["Passing/Receiving", "passing-points"],
    ["Speed", "speed-points"],
    ["Endurance", "endurance-points"],
    ["Footwork", "footwork-points"],
    ["Diving", "diving-points"],
    ["Catching", "catching-points"],
    ["Reaction Speed", "reaction-speed-points"],
    ["Tackling", "tackling-points"],
    ["1v1 Defending", "1v1-defending-points"],
    ["Intercepting", "intercepting-points"],
    ["Decision Making", "decision-making-points"],
    ["Touch and Ball Control", "touch-and-ball-control-points"],
    ["Shooting", "shooting-points"],
    ["Dribling", "dribling-points"],
    ["Off the Ball Movement", "off-the-ball-movement-points"],
    ["Heading", "heading-points"]
]
const POSITION_TO_SKILL_INDEXES = new Map()
POSITION_TO_SKILL_INDEXES.set(0, [0, 1, 2, 3, 4, 5, 6])
POSITION_TO_SKILL_INDEXES.set(1, [0, 1, 2, 7, 8, 9, 10])
POSITION_TO_SKILL_INDEXES.set(2, [0, 1, 2, 9, 10, 11, 12])
POSITION_TO_SKILL_INDEXES.set(3, [0, 1, 2, 12, 13, 14, 15])

const SKILL_TIERS = [
    [100, '#4169E1'],
    [500, '#32CD32'],
    [1000, '#FFFF00'],
    [5000, '#FFA500'],
    [10000, '#FF2400'],
    [50000, '#663399'],
    [100000, '#CD7F32'],
    [200000, '#C0C0C0'],
    [500000, '#FFD700'],
    [1000000, "#28282B"]
]

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
    playerId = user.uid
    playerRef = ref(database, `players/${playerId}`)
}

function createPlayer() {
    document.querySelector(".landing-page").style.display = "none"
    document.querySelector(".new-player").style.display = "flex"
    
    document.querySelector("#create-new-player-button").onclick = function (event) {
        set(playerRef, {
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
            }
        })
        
        initGame()
        document.querySelector(".new-player").style.display = "none"
        gameContainer.style.display = "grid"
    }
}

function initGame() {
    populatePlayerInfo()
    changeSection(activeSection) //starts in player section
}

function populatePlayerInfo () {
    const playerInfoPath = `players/${playerId}/player-info`
    
    onValue(ref(database, `${playerInfoPath}/name`), (snapshot) => {
        document.getElementById("player-info-name").innerHTML = snapshot.val()
    })
    
    onValue(ref(database, `${playerInfoPath}/country`), (snapshot) => {
        document.getElementById("player-info-country").innerHTML = snapshot.val()
    })
    
    onValue(ref(database, `${playerInfoPath}/bday`), (snapshot) => {
        document.getElementById("player-info-bday").innerHTML = snapshot.val()
        document.getElementById("player-info-age").innerHTML = Math.abs(new Date(Date.now() - new Date(snapshot.val())).getFullYear() - 1970)
    })
    
    onValue(ref(database, `${playerInfoPath}/start-day`), (snapshot) => {
        document.getElementById("player-info-start-day").innerHTML = snapshot.val()
    })
    
    onValue(ref(database, `${playerInfoPath}/club`), (snapshot) => {
        document.getElementById("player-info-club").innerHTML = snapshot.val()
    })
    
    onValue(ref(database, `${playerInfoPath}/position`), (snapshot) => {
        document.getElementById("player-info-position").innerHTML = POSITIONS[snapshot.val()]
        populatePlayerSkills(snapshot.val())
    })
    
    onValue(ref(database, `${playerInfoPath}/description`), (snapshot) => {
        document.querySelector("#player-info-description p").innerHTML = snapshot.val()
    })
    
    onValue(ref(database, `players/${playerId}/player-skills/rep-points`), (snapshot) => {
        let repLevel = calculateRepLevel(snapshot.val())
        document.getElementById("reputation-bar-outer").title = `Reputation Level: ${repLevel[0]}\nTo next level: ${repLevel[1]}/${repLevel[2]}`
        document.getElementById("reputation-bar-inner").style.height = `${repLevel[1]*100/repLevel[2]}%`
        document.getElementById("player-info-rep-level").innerHTML = repLevel[0]
    })
}

function populatePlayerSkills (position) {
    const playerSkillsPath = `players/${playerId}/player-skills`
    
    const skill_indexes = POSITION_TO_SKILL_INDEXES.get(position)
    
    for (let i = 0; i < 7; i++) {
        const skill = SKILLS[skill_indexes[i]]
        
        onValue(ref(database, `${playerSkillsPath}/${skill[1]}`), (snapshot) => {
            updateSkillBar(skill[0], i+1, snapshot.val())
            updateSkillLevel(skill_indexes)
        })
    }
}

function updateSkillLevel(skillIndexes) {
    const playerSkillsPath = `players/${playerId}/player-skills`
    let skillSum = 0
    let count = 0
    
    for (const skillIndex of skillIndexes) {
        get(ref(database, `${playerSkillsPath}/${SKILLS[skillIndex][1]}`)).then((snapshot) => {
            skillSum += snapshot.val()
            count++
            
            if (count == 7) {
                document.getElementById("player-info-skill-level").innerHTML = `${(skillSum / 7).toFixed(1)}`
            }
        })
    }
}

function updateSkillBar(skillName, order, points) {
    document.getElementById(`skill-bar-${order}-inner`).innerHTML = skillName
    document.getElementById(`skill-bar-${order}-outer`).title = `${skillName} Points: ${points}`
    
    let skillTier = calculateSkillTier(points)
    if (skillTier != 0) {
        document.getElementById(`skill-bar-${order}-outer`).style.backgroundColor = SKILL_TIERS[skillTier-1][1]
    } else {
        document.getElementById(`skill-bar-${order}-outer`).style.backgroundColor = "#2F4F4F"
    }
    document.getElementById(`skill-bar-${order}-inner`).style.backgroundColor = SKILL_TIERS[skillTier][1]
    
    document.getElementById(`skill-bar-${order}-inner`).style.width = interpolateSkillWidth(skillTier, points)
}

function calculateSkillTier(points) {
    for (const tier of SKILL_TIERS) {
        if (points < tier[0]) return SKILL_TIERS.indexOf(tier)
    }
    return SKILL_TIERS.length-1
}

function interpolateSkillWidth(skillTier, points) {
    if (points > SKILL_TIERS[skillTier][0]) return `97%`
    
    let maxPoints = SKILL_TIERS[skillTier][0]
    let minPoints
    if (skillTier == 0) {
        minPoints = 10
    } else {
        minPoints = SKILL_TIERS[skillTier-1][0]
    }
    
    return `${10 + 87*(points-minPoints)/(maxPoints-minPoints)}%`
}

function calculateRepLevel(points) {
    let level = Math.floor(0.3 * Math.sqrt(points))
    let pointsAtCurrentLevel = points - Math.ceil(Math.pow(level/0.3, 2))
    let pointsToNextLevel = Math.ceil(Math.pow((level+1)/0.3, 2)) - Math.ceil(Math.pow(level/0.3, 2))
    return [level, pointsAtCurrentLevel, pointsToNextLevel] 
}

//----------
//SECTION AND MENU

//Changes the active section
function changeSection(newSection) {
    document.getElementById(`section-${SECTIONS[activeSection]}`).style.display = "none"
    document.getElementById(`section-${SECTIONS[newSection]}`).style.display = "grid"
    activeSection = newSection
}

//Sets the click events for the menu
for (let i = 0; i < SECTIONS.length; i++) {
    document.getElementById(`menu-${SECTIONS[i]}`).onclick = function (event) {
        if (activeSection != i) changeSection(i)
    }
}