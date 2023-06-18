//LANDING PAGE VARIABLES
let loginForm = document.querySelector("#login-form")

//SECTION AND MENU VARIABLES
let gameContainer = document.body.querySelector(".game-container")
let menu = gameContainer.querySelector(".menu")

const sections = ["player", "training", "clubhouse", "equipment", "snacks", "classification", "messages"]
let activeSection = 0 //always begins in the player section

//PLAYER SECTION VARIABLES
let reputationBarOuter = document.getElementById("reputation-bar-outer")
let reputationBarInner = document.getElementById("reputation-bar-inner")

//----------
//LANDING PAGE

//Login action
loginForm.querySelector("#login-button").onclick = function (event) {
    if (loginForm.querySelector("#username").value == "chef" && loginForm.querySelector("#password").value == "1234") {
        document.querySelector(".landing-page").style.display = "none"
        gameContainer.style.display = "flex"
    }
}

//----------
//SECTION AND MENU

//Changes the active section
function changeSection(newSection) {
    document.getElementById(`section-${sections[activeSection]}`).style.display = "none"
    document.getElementById(`section-${sections[newSection]}`).style.display = "flex"
    activeSection = newSection
}
changeSection(activeSection) //starts in player section

//Sets the click events for the menu
for (let i = 0; i < sections.length; i++) {
    document.getElementById(`menu-${sections[i]}`).onclick = function (event) {
        if (activeSection != i) changeSection(i)
    }
}

//----------
//PLAYER SECTION

//TODO: INSERT REP POINTS AND LEVEL
reputationBarOuter.title = `Reputation Level: 1\nTo next level: 45/100`