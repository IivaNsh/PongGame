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

http.listen(port, () => {
    console.log(`App on port ${port}`);
});



class Room {
    constructor() {
        this.players = new Map();
        this.left = null;
        this.right = null;
        this.ball = {
            x: 0,
            y: 0,
            v_x: 0,
            v_y: 0,
            r: 0.1
        };
        this.id = 0;

        this.startTime = 0;
        this.endTime = 0;
    }

    isFull(){
        return !!this.right && !!this.left;
    }

    isEmpty(){
        return !(!!this.right || !!this.left);
    }

    add( player_id ) {
        this.players.set(player_id, { pos:0, score:0 });
        
        if( !this.left ){
            this.left = player_id;
        }
        else if( !this.right ){
            this.right = player_id;
        }

        if(this.isFull()) { 
            this.startGame();
        }
    }

    remove( player_id ) {
        let removed = this.players.delete(player_id);
        if(!removed) return;
        this.stopGame();
        if(this.left == player_id){
            this.left = null;
        }
        else if(this.right == player_id){
            this.right = null;
        }
    }

    update_position( player_id, pos ) {
        player = this.players.get(player_id);
        if(!player){ return; }
        player.pos = pos;

        console.log([...this.players.entries()]);
    }

    startGame() {
        this.ball = {
            x: 0.5,
            y: 0.5,
            v_x: 0.1,
            v_y: 0.3,
            r: 0.1
        };
        this.id = setInterval(this.game_update.bind(this), 20);
    }

    stopGame() {
        clearInterval(this.id);
    }

    game_update() {
        
        if (this.endTime == 0) this.endTime = Date.now();
        this.startTime = Date.now();
        let dt = (this.startTime - this.endTime)/1000;
        this.endTime = this.startTime;
        


        let x = this.ball.x + this.ball.v_x*dt; 
        let y = this.ball.y + this.ball.v_y*dt;
    
        if(x - this.ball.r <= 0 || x + this.ball.r >= 1) {
            this.ball.v_x*=-1;
        }
        if(y - this.ball.r <= 0 || y + this.ball.r >= 1) {
            this.ball.v_y*=-1;
        }
        
        this.ball.x += this.ball.v_x * dt;
        this.ball.y += this.ball.v_y * dt;
        
    
        //console.log(dt);
        
        //io.emit( "ball_update", this.ball );
        //io.emit( "players_update", players );
    }
}

let rooms = [];

io.on('connection', (socket) => {
    


    let room = null;

    for(let i=0; i<rooms.length; i++){
        if(!rooms[i].isFull()){
            room = rooms[i];
            break;
        }
    }
    if(!room){
        room = new Room();
        rooms.push(room);
    }

    player_id = socket.id;
    room.add(player_id)

    socket.on("position_update", (pos) => {
        room.update_position( socket.id, pos );
    });
    
    socket.on('disconnect', (reason) => {
        room.remove(socket.id);
        rooms = rooms.filter((x) => { return !x.isEmpty() })
        console.log([...rooms])
    });
    
    console.log([...rooms])
});

