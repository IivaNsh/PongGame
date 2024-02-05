const express = require('express');
const app = express();
const path = require('path');

const http = require('http').Server(app);
const port = process.env.port || 8080;

const io = require('socket.io')(http);

let staticPath =  path.join(__dirname, '../public');
app.use(express.static(staticPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/main.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/game.html'));
});

app.get('/pc-test', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/test-1.html'));
});

app.get('/mobile-test', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/test-2.html'));
});

app.get('/box-test', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/test-3.html'));
});

http.listen(port, () => {
    console.log(`App on port ${port}`);
});




var players = new Map();

io.on('connection', (socket) => {
    
    //console.log(`${socket.id} connected`);
    
    if(players.size >= 2) { return; }
    
    let inverted = (players.size === 1);
    players.set(socket.id, { pos: 0, score: 0, inverted: inverted });
    console.log([...players.entries()]);

    socket.on("move", (y) => {
        socket.broadcast.emit("movePlatform", y);
    });
    
    socket.on('disconnect', (reason) => {
        players.delete(socket.id);
        if(id) { clearInterval(id); }
        console.log([...players.entries()]);
        //console.log(`${socket.id} disconnected`);
    });
    
    if(players.size == 2) { gameloop(); }
});

let ball = {
    x: 0,
    y: 0,
    v_x: 0,
    v_y: 0
}

let id = null;
function gameloop(){
    id = setInterval(update, 20);
}

let startTime = 0;
let endTime = 0;
function update(){

    if (endTime == 0) endTime = Date.now();
    startTime = Date.now();
    dt = (startTime - endTime)/1000;
    endTime = startTime;

    

    n_ballx = ballx+vballx*dt; 
    n_bally = bally+vbally*dt;

    if(n_ballx <= 0 || n_ballx >= 1) vballx*=-1;
    if(n_bally <= 0 || n_bally >= 1) vbally*=-1;


    ballx += vballx * dt;
    bally += vbally * dt;

    //console.log(dt);
    io.emit("ball_update", { "x": ballx, "y": bally });
}