const socket=io();
console.log('hi');


const createGameButton=document.getElementById("createGame");
const joinGameButton=document.getElementById("joinGame");

function sendUsername(){
    const usernameInput=document.getElementById("username");
    const username=usernameInput.value.trim();

    if (username) {
        socket.emit("setUsername", username);
        console.log(`Username sent: ${username}`);
        return true;
    } else {
        alert("lezmek ign bech tal3eb hh");
        return false;
    }

}


function createGamee(){
    socket.emit("createGame");


}

socket.on("newGame",(data)=>{

    roomUniqueId=data.roomUniqueId;
    console.log(roomUniqueId);
    document.getElementById('createOrJoin').style.display="none";
    document.getElementById("sigmaBoi").style.display="none";
    document.getElementById("tlammo").style.display="block";
    document.getElementById("codeHere").innerHTML=`Room code : <br>${roomUniqueId}`;


    let copyButton=document.createElement('button');
    copyButton.innerText="Copy Code";
    copyButton.classList.add("copyBtn")
    copyButton.classList.add("bttn")
    copyButton.style.display="block";
    copyButton.addEventListener('click', ()=>{
        navigator.clipboard.writeText(roomUniqueId).then(
            function(){
                console.log("code COpy good");
            }, function(err){
                console.error("COpy bad", err);
            }

        )
    })

    document.getElementById("copyHere").appendChild(copyButton);

    startButton=document.getElementById("startButton");
    startButton.addEventListener("click",()=>{
        socket.emit("pressStart",roomUniqueId);
    });




})
socket.on("updatePlayers", (data) => {
    const players = data.players;
    const scores = data.scores;
    const playerContainer = document.querySelector(".text-overlay3");

    playerContainer.innerHTML = '';  
    
    players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        
        
        const playerParagraph = document.createElement('p');
        playerParagraph.textContent = `Player ${index + 1}: ${player} :`;
        playerDiv.appendChild(playerParagraph);

       
        const scoreInput = document.createElement('input');
        scoreInput.type = 'number';
        scoreInput.id = `player${index + 1}`;
        scoreInput.value = scores[index] || 0;  

        
        scoreInput.addEventListener('change', () => {
            const newScore = parseInt(scoreInput.value);
            
            
            socket.emit("updateScore", {
                roomUniqueId,  
                playerName: player,  
                newScore: newScore  
            });
        });

        playerDiv.appendChild(scoreInput);
        playerContainer.appendChild(playerDiv);
    });
});


socket.on("scoreUpdated", (data) => {
    alert(`${data.playerName} changed their score to ${data.newScore}`);
});



function joinGame() {
    const roomUniqueId = document.getElementById("roomUniqueId").value;
    
    if (!roomUniqueId) {
        alert("Please enter a room code!");
        return;
    }

    socket.emit("joinGame", { roomUniqueId }); 
}


socket.on("errorMessage", (msg) => {
    alert(msg);
});


socket.on("startGame", () => {
    document.getElementById("tlammo").style.display="none";
    document.getElementById("gamePlay").style.display="block";
    document.getElementById("title").style.display="none"
});



    





socket.on("playerPressedStart", (playerName) => {
    console.log(`${playerName} has pressed start.`);
    
});


createGameButton.addEventListener("click", () => {
    if (sendUsername()) {  
        createGamee();     
    }
});
joinGameButton.addEventListener("click", () => {
    if (sendUsername()) {  
        joinGame();     
    }
});