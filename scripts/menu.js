export function setupMenu () {
    const SECTIONS = ["player", "training", "clubhouse", "work", "snacks", "classification", "messages"]
    let activeSection = 0 //always begins in the player section
    
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
};