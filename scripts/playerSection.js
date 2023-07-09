import { ref, onValue, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js"
import { POSITIONS, SKILLS, POSITION_TO_SKILL_INDEXES, SKILL_TIERS } from "./constants.js"

export let populatePlayerInfo = function (playerId, database) {
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
}