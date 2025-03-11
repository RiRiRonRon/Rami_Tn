const { Console } = require("console");
const express=require("express");
const app =express();
const http=require('http');
const server=http.createServer(app);
const {Server}=require('socket.io');
const io= new Server(server);


let players=[];
let player1Score = 5;
let player2Score = 2;
let player3Score = 3;
let player4Score = 4;
const rooms={};
const roomStartStatus = {};  
app.use(express.static("player"));


io.on("connection",(socket)=>{
    console.log("A player connected");

    

socket.on("pressStart", (roomUniqueId) => {
    
    if (!rooms[roomUniqueId]) {
        socket.emit("error", "Room mefamech.");
        return;
    }

    
    if (!roomStartStatus[roomUniqueId]) {
        roomStartStatus[roomUniqueId] = [];
    }

    
    if (!roomStartStatus[roomUniqueId].includes(socket.username)) {
        roomStartStatus[roomUniqueId].push(socket.username);
    }

   
    if (roomStartStatus[roomUniqueId].length === rooms[roomUniqueId].players.length) {
        
        io.to(roomUniqueId).emit("startGame");
    } else {
        
        io.to(roomUniqueId).emit("playerPressedStart", socket.username);
    }
});

    
    socket.on("setUsername", (username) => {
        socket.username = username; 
        console.log(`${username} has joined the game.`);
        
      
        io.emit("playerJoined", username);
    });



    socket.on("createGame",()=>{

        
        const roomUniqueId=makeid(5);
        console.log(roomUniqueId);
        rooms[roomUniqueId] = {
            players: [socket.username], 
            scores: [player1Score]
        };
        
        socket.join(roomUniqueId);
        io.to(roomUniqueId).emit("updatePlayers", {
            players: rooms[roomUniqueId].players,
            scores: rooms[roomUniqueId].scores
        });
        socket.emit("newGame",{roomUniqueId:roomUniqueId});


    })
    socket.on("updateScore", (data) => {
        const { roomUniqueId, playerName, newScore } = data;
    
        if (rooms[roomUniqueId]) {
            const playerIndex = rooms[roomUniqueId].players.indexOf(playerName);
    
            if (playerIndex !== -1) {
                rooms[roomUniqueId].scores[playerIndex] = newScore;
    
                
                io.to(roomUniqueId).emit("updatePlayers", {
                    players: rooms[roomUniqueId].players,
                    scores: rooms[roomUniqueId].scores
                });
    
                
                io.to(roomUniqueId).emit("scoreUpdated", {
                    playerName,
                    newScore
                });
            }
        }
    });
    
    
    socket.on("joinGame", (data) => {
        const roomUniqueId = data.roomUniqueId; 
    
        if (!rooms[roomUniqueId]) {
            socket.emit("errorMessage", "Invalid Room Code");
            return;
        }
    
        if (rooms[roomUniqueId].players.length >= 4) {
            socket.emit("errorMessage", "Room is full");
            return;
        }
    
        rooms[roomUniqueId].players.push(socket.username);
        socket.join(roomUniqueId);
        socket.emit("newGame",{roomUniqueId:roomUniqueId});
    
        
        io.to(roomUniqueId).emit("updatePlayers", { 
            players: rooms[roomUniqueId].players,
            scores: rooms[roomUniqueId].scores
        });
    });
    
    socket.on("disconnect", () => {
        let roomUniqueId = null;
    
        
        for (const [roomId, room] of Object.entries(rooms)) {
            const playerIndex = room.players.indexOf(socket.username);
            
            if (playerIndex !== -1) {
                roomUniqueId = roomId;
                room.players.splice(playerIndex, 1);
                room.scores.splice(playerIndex, 1); 
                
                
                io.to(roomUniqueId).emit("updatePlayers", {
                    players: room.players,
                    scores: room.scores
                });
    
               
                if (room.players.length === 0) {
                    delete rooms[roomUniqueId];
                }
                
                break;
            }
        }
    });
    
    







})



function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}



server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});

