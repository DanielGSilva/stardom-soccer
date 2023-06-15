let gameContainer = document.body.querySelector(".game-container")
let menu = gameContainer.querySelector(".menu")

const sections = ["player", "training", "clubhouse", "equipment", "snacks", "classification", "messages"]
let activeSection = 0

function changeSection(newSection) {
    document.getElementById(`section-${sections[activeSection]}`).style.display = "none"
    document.getElementById(`section-${sections[newSection]}`).style.display = "block"
    activeSection = newSection
}
changeSection(activeSection)

for (let i = 0; i < sections.length; i++) {
    document.getElementById(`menu-${sections[i]}`).onclick = function (event) {
        if (activeSection != i) changeSection(i)
    }
}