//FIREBASE

export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyA_gjejepfFP_X5P8ARSKzj1q20K_82ujo",
    authDomain: "stardom-soccer.firebaseapp.com",
    databaseURL: "https://stardom-soccer-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "stardom-soccer",
    storageBucket: "stardom-soccer.appspot.com",
    messagingSenderId: "583019702852",
    appId: "1:583019702852:web:f17cd95ec916f29b11aa11"
}

// TIME

export const SECONDS = 1000
export const MINUTES = 60 * SECONDS
export const HOURS = 60 * MINUTES
export const DAYS = 24 * HOURS

// POSITIONS AND SKILLS

export const POSITIONS = ["Goal Keeper", "Defender", "Midfielder", "Attacker"]

export const SKILLS = [
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

export const POSITION_TO_SKILL_INDEXES = new Map([
    [0, [0, 1, 2, 3, 4, 5, 6]],
    [1, [0, 1, 2, 7, 8, 9, 10]],
    [2, [0, 1, 2, 9, 10, 11, 12]],
    [3, [0, 1, 2, 12, 13, 14, 15]]
])

export const SKILL_TIERS = [
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

// TRAINING

export const ENERGY_REGENERATION_FREQUENCY = 3*MINUTES

export const TRAINING_DURATIONS = [1, 5, 10, 15, 20, 25, 30]

export const SKILL_TRAINING_DESCRIPTIONS = [
    "Passing and Receiving are fundamentals of any player. Short, long, through the grass or through the air, they come in all shapes and sizes but you have to be able to do all of them!",
    "Speed lets you catch up or go past your opponents. Don't slack off your sprints!",
    "Endurance allows you to last longer with high energy. Train hard and you'll be able to withstand 90+ minutes of intense football with ease!",
    "Footwork is essential in today's game, for any goalkeeper worth their salt is a master at distributing the ball and putting it where they want.",
    "Diving with aproppriate timing and knowing how to fall without getting hurt will get you a long way. Literally.",
    "What does it matter if you are able to get to the balls coming your goal's way, if you are unable to lock them in your hands? Gotta catch all of them (but not a lawsuit)!",
    "\"Like a cat!\" That's how fast you should be capable of reacting to shots, deflections and crosses nearing your penalty area.",
    "Tackling",
    "1v1 Defending",
    "Intercepting",
    "Decision Making",
    "Touch and Ball Control",
    "Shooting",
    "Dribling",
    "Off the Ball Movement",
    "Heading"
]

//

export const TOTAL_MESSAGES_ALLOWED = 25