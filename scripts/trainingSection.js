import { ref, onValue, get, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js"
import { SKILLS, POSITION_TO_SKILL_INDEXES, MINUTES, SECONDS, SKILL_TRAINING_DESCRIPTIONS, TRAINING_DURATIONS, ENERGY_REGENERATION_FREQUENCY } from "./constants.js"

export let updateEnergyBar = function (playerId, database) {
    let updateEnergyInterval
    onValue(ref(database, `players/${playerId}/training/energy`), (snapshot) => {
        clearInterval(updateEnergyInterval)
        let diff = snapshot.val() - Date.now()
            
        if (diff < 0) {
            document.querySelector(".energy-bar-inner").innerHTML = `Energy: 100`
            document.querySelector(".energy-bar-inner").style.width = `100%`
            document.querySelector(".energy-bar-outer").title = `Full Energy!`
            return
        }
        
        let minutesLeft = Math.ceil(diff / MINUTES)
        let currentEnergy = 100 - Math.ceil(diff / ENERGY_REGENERATION_FREQUENCY)
        
        document.querySelector(".energy-bar-inner").innerHTML = `Energy: ${currentEnergy}`
        document.querySelector(".energy-bar-inner").style.width = `${currentEnergy}%`
        document.querySelector(".energy-bar-outer").title = `Time left to full energy: ${minutesLeft} mins`
            
        updateEnergyInterval = setInterval(function () {
            let diff = snapshot.val() - Date.now()
            
            if (diff < 0) {
                clearInterval(updateEnergyInterval)
                document.querySelector(".energy-bar-inner").innerHTML = `Energy: 100`
                document.querySelector(".energy-bar-inner").style.width = `100%`
                document.querySelector(".energy-bar-outer").title = `Full Energy!`
                return
            }
            
            let minutesLeft = Math.ceil(diff / MINUTES)
            let currentEnergy = 100 - Math.ceil(diff / ENERGY_REGENERATION_FREQUENCY)
            
            document.querySelector(".energy-bar-inner").innerHTML = `Energy: ${currentEnergy}`
            document.querySelector(".energy-bar-inner").style.width = `${currentEnergy}%`
            document.querySelector(".energy-bar-outer").title = `Time left to full energy: ${minutesLeft} mins`
            
        }, 1*MINUTES);
    })
}

export let updateTrainingSection = function (playerId, database) {
    onValue(ref(database, `players/${playerId}/training/active-session/end`), (snapshot) => {
        if (snapshot.val() - Date.now() < 0) {
            selectTraining()
        } else {
            inTraining()
        }
    })
    
    function selectTraining() {
        updateTrainingOptions()
        hideActiveSession()
        showTrainingOptions()    
    }
    
    function inTraining() {
        updateActiveSession()
        hideTrainingOptions()
        showActiveSession()    
    }
    
    function showTrainingOptions() {
        for (let i = 1; i < 5; i++) {
            document.getElementById(`training-session-card-${i}`).style.display = "grid";
        }
    }
    
    function hideTrainingOptions() {
        for (let i = 1; i < 5; i++) {
            document.getElementById(`training-session-card-${i}`).style.display = "none";
        }
    }
    
    function showActiveSession() {
        document.getElementById('training-session-card-active').style.display = "grid";
    }
    
    function hideActiveSession() {
        document.getElementById('training-session-card-active').style.display = "none";
    }
    
    function updateTrainingOptions() {
        for (let i = 1; i < 5; i++) {
            onValue(ref(database, `players/${playerId}/training/option-${i}`), (snapshot) => {
                document.getElementById(`training-session-card-${i}`).getElementsByClassName('training-session-card-title')[0].innerHTML = SKILLS[snapshot.val().skill][0]
                
                document.getElementById(`training-session-card-${i}`).getElementsByClassName('training-session-card-description')[0].innerHTML = SKILL_TRAINING_DESCRIPTIONS[snapshot.val().skill]
                
                document.getElementById(`training-session-card-${i}`).getElementsByClassName('training-session-card-energy')[0].innerHTML = `Energy: ${TRAINING_DURATIONS[snapshot.val().energy]}`
                
                document.getElementById(`training-session-card-${i}`).getElementsByClassName('training-session-card-reward')[0].innerHTML = `Reward: $${snapshot.val().reward}`
                
                document.getElementById(`training-session-card-${i}`).getElementsByClassName('training-session-card-increase')[0].innerHTML = `Increase: ${snapshot.val().increase} points`
                
                document.getElementById(`training-session-card-${i}`).getElementsByClassName('training-session-card-bonus')[0].innerHTML = `Bonus: ${snapshot.val().bonus}`
                
                document.getElementById(`training-session-card-${i}`).getElementsByClassName('training-session-card-begin')[0].onclick = function (event) {
                    beginTraining(snapshot.val())
                }
            })
        }
    }
    
    function updateActiveSession() {
        onValue(ref(database, `players/${playerId}/training/active-session`), (snapshot) => {
            let trainedSkill = SKILLS[snapshot.val().skill]
            let energy = TRAINING_DURATIONS[snapshot.val().energy]
            let increase = snapshot.val().increase
            let reward = snapshot.val().reward
            let bonus = snapshot.val().bonus
            
            let durationInSeconds = energy * 60
            let innerTimeLeftText = document.getElementById(`training-session-card-active`).getElementsByClassName('training-session-card-time-left-text')[0]
            let innerTimeLeftBar = document.getElementById(`training-session-card-active`).getElementsByClassName('training-session-card-time-left-inner')[0]
            let widthIncrementPerSecond = 100/durationInSeconds
            
            document.getElementById(`training-session-card-active`).getElementsByClassName('training-session-card-title')[0].innerHTML = trainedSkill[0]
                
            document.getElementById(`training-session-card-active`).getElementsByClassName('training-session-card-description')[0].innerHTML = SKILL_TRAINING_DESCRIPTIONS[snapshot.val().skill]
            
            document.getElementById(`training-session-card-active`).getElementsByClassName('training-session-card-energy')[0].innerHTML = `Energy: ${energy}`
            
            document.getElementById(`training-session-card-active`).getElementsByClassName('training-session-card-reward')[0].innerHTML = `Reward: $${reward}`
            
            document.getElementById(`training-session-card-active`).getElementsByClassName('training-session-card-increase')[0].innerHTML = `Increase: ${increase} points`
            
            document.getElementById(`training-session-card-active`).getElementsByClassName('training-session-card-bonus')[0].innerHTML = `Bonus: ${bonus}`
            
            let diff = snapshot.val().end - Date.now()
                
            if (diff < 0) {
                endTraining(trainedSkill[1], increase, reward, bonus)
                selectTraining()
                return
            }
            
            let minutesLeft = Math.floor(diff / MINUTES)
            let secondsLeft = Math.floor((diff % MINUTES) / SECONDS)
            
            let totalSecondsElapsed = durationInSeconds - (minutesLeft*60 + secondsLeft)
            innerTimeLeftText.innerHTML = `Time left: ${minutesLeft.toLocaleString(undefined, {minimumIntegerDigits: 2})}:${secondsLeft.toLocaleString(undefined, {minimumIntegerDigits: 2})}`
            innerTimeLeftBar.style.width = `${totalSecondsElapsed*widthIncrementPerSecond}%`
            
            let updateActiveSession = setInterval(function () {
                let diff = snapshot.val().end - Date.now()
                
                if (diff < 0) {
                    clearInterval(updateActiveSession)
                    endTraining(trainedSkill[1], increase, reward, bonus)
                    selectTraining()
                    return
                }
                
                let minutesLeft = Math.floor(diff / MINUTES)
                let secondsLeft = Math.floor((diff % MINUTES) / SECONDS)
                
                let totalSecondsElapsed = durationInSeconds - (minutesLeft*60 + secondsLeft)
                innerTimeLeftText.innerHTML = `Time left: ${minutesLeft.toLocaleString(undefined, {minimumIntegerDigits: 2})}:${secondsLeft.toLocaleString(undefined, {minimumIntegerDigits: 2})}`
                innerTimeLeftBar.style.width = `${totalSecondsElapsed*widthIncrementPerSecond}%`
            }, 1*SECONDS);
        })
    }
    
    function endTraining(skillPath, increase, reward, bonus) {
        get(ref(database, `players/${playerId}/player-skills/${skillPath}`)).then((snapshot) => {
            set(ref(database, `players/${playerId}/player-skills/${skillPath}`), snapshot.val()+increase)
        })
    }
    
    function beginTraining(trainingOption) {
        let activeSession = {
            "skill": trainingOption.skill,
            "energy": trainingOption.energy,
            "increase": trainingOption.increase,
            "reward": trainingOption.reward,
            "bonus": trainingOption.bonus,
            "end": (Date.now() + TRAINING_DURATIONS[trainingOption.energy] * MINUTES)
        }
        
        get(ref(database, `players/${playerId}/training/energy`)).then((snapshot) => {
            set(ref(database, `players/${playerId}/training/energy`), (snapshot.val() < Date.now() ? (Date.now() + TRAINING_DURATIONS[trainingOption.energy] * ENERGY_REGENERATION_FREQUENCY) : (snapshot.val() + TRAINING_DURATIONS[trainingOption.energy] * ENERGY_REGENERATION_FREQUENCY)))
        })
        
        set(ref(database, `players/${playerId}/training/active-session`), activeSession)
        
        for (let i = 1; i < 5; i++) {
            updateTrainingOption(i)
        }
    }
    
    function updateTrainingOption(optionNumber) {
        let option = {}
        option.energy = Math.round(Math.random() * (TRAINING_DURATIONS.length-1))
        option.increase = Math.random() < 0.5 ? 0.5 * TRAINING_DURATIONS[option.energy] : TRAINING_DURATIONS[option.energy]
        option.reward = 0
        option.bonus = 0
        
        get(ref(database, `players/${playerId}/player-info/position`)).then((snapshot) => {
            let skillIndexes = POSITION_TO_SKILL_INDEXES.get(snapshot.val())
            option.skill = skillIndexes[~~(Math.random() * skillIndexes.length)]
            set(ref(database, `players/${playerId}/training/option-${optionNumber}`), option)
        })
    }
}

export let initTraining = function (position) {
    let training = {
        "energy": Date.now(),
        "active-session": {
            "end": Date.now()
        }
    }
    
    let skillIndexes = POSITION_TO_SKILL_INDEXES.get(position)
    for (let i = 1; i < 5; i++) {
        let option = {}
        option.energy = Math.round(Math.random() * (TRAINING_DURATIONS.length-1))
        option.increase = Math.random() < 0.5 ? 0.5 * TRAINING_DURATIONS[option.energy] : TRAINING_DURATIONS[option.energy]
        option.reward = 0
        option.bonus = 0
        option.skill = skillIndexes[Math.round(Math.random() * (skillIndexes.length-1))]
        training[`option-${i}`] = option
    }
    
    return training
}