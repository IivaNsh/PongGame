const express = require('express');
const app = express();
const path = require('path');

const http = require('http').Server(app);
const port = process.env.port || 8080;

const io = require('socket.io')(http);


app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pong.html'));
});


http.listen(port, () => {
    console.log(`App on pport ${port}`);
});

let connections = 0;
io.on('connection', (socket) => {
    connections += 1;
    console.log(connections);
    console.log(`a user connected <${socket.id}>`);
    
    
    if(connections <= 2){

        socket.on("move", (y) => {
            console.log(`${socket.id} moved to ${y}`)
            socket.broadcast.emit("movePlatform", y);
        });
        
        if(connections == 2){
            gameloop();
        }
        
    }
    socket.on('disconnect', (reason) => {
        connections -=1;
        console.log(connections);
    });
});



let ballx= 0.5, bally = 0.5;
let vballx= 0.5, vbally = 0.1;


let id = null
function gameloop(){
    id = setInterval(update, 20);
}

let startTime = 0;
let endTime = Date.now();
function update(){

    startTime = Date.now();
    dt = (startTime - endTime)/1000;
    endTime = startTime;

    if (connections < 2){ clearInterval(id); return null; }

    n_ballx = ballx+vballx*dt; 
    n_bally = bally+vbally*dt;

    if(n_ballx <= 0 || n_ballx >= 1) vballx*=-1;
    if(n_bally <= 0 || n_bally >= 1) vbally*=-1;


    ballx += vballx * dt;
    bally += vbally * dt;

    //console.log(dt);
    io.emit("moveBall", { "x": ballx, "y": bally });
    
}