import { ref, onValue, get, update, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js"
import { TOTAL_MESSAGES_ALLOWED } from "./constants.js"

export let updateMessagesSection = function (playerId, database) {
    setupGeneralButtons()
    
    onValue(ref(database, `players/${playerId}/messages`), (snapshot) => {
        let msgCounter = 0
        let lastMessage = snapshot.val()["last-message"]
        
        if (lastMessage > 0) {
            for (let i = 0; i < TOTAL_MESSAGES_ALLOWED; i++) {
                let msgToRetrieve = lastMessage-i > 0 ? lastMessage-i : TOTAL_MESSAGES_ALLOWED+lastMessage-i
                msgCounter += updateMessageSummary(i+1, snapshot.val()[`message-${msgToRetrieve}`])
            }
        }
        
        document.getElementsByClassName("messages-quantity")[0].innerHTML = `${msgCounter.toLocaleString(undefined, {minimumIntegerDigits: 2})}/25`
    })
    
    function setupGeneralButtons() {
        document.getElementsByClassName("messages-read-go-back-button")[0].onclick = function (event) {
            document.getElementsByClassName("messages-read")[0].style.display = "none"
            document.getElementsByClassName("messages-inbox")[0].style.display = "grid"
        }
        
        document.getElementsByClassName("messages-write-go-back-button")[0].onclick = function (event) {
            document.getElementsByClassName("messages-write")[0].style.display = "none"
            document.getElementsByClassName("messages-inbox")[0].style.display = "grid"
        }
        
        document.getElementsByClassName("messages-write-button")[0].onclick = function (event) {
            document.getElementsByClassName("messages-read")[0].style.display = "none"
            document.getElementsByClassName("messages-inbox")[0].style.display = "none"
            document.getElementsByClassName("messages-write")[0].style.display = "grid"
        }
        
        document.getElementsByClassName("messages-write-send-button")[0].onclick = function (event) {
            sendMessage()
        }
    }
    
    function updateMessageSummary(msgOrder, msg) {
        let msgSummary = document.getElementById(`messages-inbox-summary-${msgOrder}`)
        
        if (msg === null || msg === undefined) {
            msgSummary.style.display = "none"
            return 0
        }
        
        msgSummary.style.display = "grid"
        get(ref(database, `players/${msg["from"]}/player-info/name`)).then((snapshot) => {
            msgSummary.getElementsByClassName("messages-inbox-summary-timestamp")[0].innerHTML = formatMsgTimestamp(msg["timestamp"])
            msgSummary.getElementsByClassName("messages-inbox-summary-sender")[0].innerHTML = snapshot.val()
            msgSummary.getElementsByClassName("messages-inbox-summary-subject")[0].innerHTML = msg["subject"]
            msgSummary.onclick = function (event) {
                openMessage(msg)
            }
        })
        
        return 1
    }
    
    function openMessage(msg) {
        document.getElementsByClassName("messages-inbox")[0].style.display = "none"
        let msgsRead = document.getElementsByClassName("messages-read")[0]
        
        get(ref(database, `players/${msg["from"]}/player-info/name`)).then((snapshot) => {
            msgsRead.style.display = "grid"
            msgsRead.getElementsByClassName("messages-read-subject")[0].innerHTML = msg["subject"]
            msgsRead.getElementsByClassName("messages-read-timestamp")[0].innerHTML = formatMsgTimestamp(msg["timestamp"])
            msgsRead.getElementsByClassName("messages-read-sender")[0].innerHTML = snapshot.val()
            msgsRead.getElementsByClassName("messages-read-text")[0].innerHTML = msg["text"]
            msgsRead.getElementsByClassName("messages-read-reply-button")[0].onclick = function (event) {
                replyToMessage(msg["subject"], snapshot.val())
            }
        })
    }
    
    function replyToMessage(msgSubject, msgReceiver) {
        document.getElementsByClassName("messages-write-subject")[0].value = "Re: " + msgSubject
        document.getElementsByClassName("messages-write-receiver")[0].value = msgReceiver
        
        document.getElementsByClassName("messages-read")[0].style.display = "none"
        document.getElementsByClassName("messages-write")[0].style.display = "grid"
    }
    
    function sendMessage() {
        let subjectInput = document.getElementsByClassName("messages-write-subject")[0].value
        let receiverInput = document.getElementsByClassName("messages-write-receiver")[0].value
        let textInput = document.getElementsByClassName("messages-write-text")[0].value
        
        if (subjectInput === "") {
            alert("Message Subject is empty!")
            return false
        }
        
        if (textInput === "") {
            alert("Message text is empty!")
            return false
        }
        
        if (receiverInput === "") {
            alert("Message receiver is empty!")
            return false
        }
        
        get(query(ref(database, "players"), orderByChild("player-info/name"), equalTo(receiverInput))).then((snapshot) => {
            if (snapshot.val() === null || snapshot.val() === undefined) {
                alert("Message receiver could not be found!")
                return false
            }
            
            let receiverId = Object.keys(snapshot.val())[0]
            
            get(ref(database, `players/${receiverId}/messages/last-message`)).then((snapshot) => {
                let nextMessage = snapshot.val() +1
                
                if (nextMessage > TOTAL_MESSAGES_ALLOWED) {
                    nextMessage -= TOTAL_MESSAGES_ALLOWED
                }
                
                const updates = {};
                updates[`players/${receiverId}/messages/message-${nextMessage}`] = {
                    "from": playerId,
                    "subject": subjectInput,
                    "text": textInput,
                    "timestamp": Date.now()
                };
                updates[`players/${receiverId}/messages/last-message`] = nextMessage;
                
                update(ref(database), updates)
                
                document.getElementsByClassName("messages-write-subject")[0].value = ""
                document.getElementsByClassName("messages-write-receiver")[0].value = ""
                document.getElementsByClassName("messages-write-text")[0].value = ""
            })
        })
    }
    
    function formatMsgTimestamp(timestamp) {
        let date = new Date(timestamp)
        
        // DD/MM/YY HH:MM
        return date.getDate().toLocaleString(undefined, {minimumIntegerDigits: 2}) + "/"
            + (date.getMonth() +1).toLocaleString(undefined, {minimumIntegerDigits: 2}) + "/"
            + date.getFullYear().toString().substring(2) + " "
            + date.getHours().toLocaleString(undefined, {minimumIntegerDigits: 2}) + ":"
            + date.getMinutes().toLocaleString(undefined, {minimumIntegerDigits: 2})
    }
}