// --------------------------------------------------------
// 실시간 채팅 서버
// --------------------------------------------------------

require('dotenv').config();      // .env환경변수
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const mime = require('mime');
const app = require('./app');      // app호출
const upload = require('./multer');

const PORT = process.env.PORT;   // 포트 번호
const mongo_HOST = process.env.MONGODB_HOST;
const DB_NAME = process.env.DB_NAME;

var getDownloadFilename = require('./getDownloadFilename').getDownloadFilename;

let users = [];

// server ON
const server = require('http').createServer(app);
server.listen(PORT, () => {
    console.log(`Express Server running on ${PORT}`);
});

// 웹 소켓 서버 실행
const io = require("socket.io")(server, {
    // 개발용 전체 cors허용
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
});

// 클라이언트가 접속했을 때의 이벤트 설정
io.on('connection', (socket) => {
    let { roomName, nickname } = socket.handshake.query;
    socket.join(roomName);
    socket.nickname = nickname;

    io.to(roomName).emit('connectUser', getUsers(roomName));

    // 메시지를 받으면
    socket.on('msg', (msg) => {
        // 모든 클라이언트에게 전송
        io.to(roomName).emit('msg', msg);
        addLogs(msg);
    });
    // 이미지 전송
    socket.on('img', (msg) => {
        console.log(1111)
        io.to(roomName).emit('msg', msg);
        addLogs(msg);
    });
    // 파일 전송
    socket.on('file', (msg) => {
        io.to(roomName).emit('msg', msg);
    });

    // 방 접속 해제
    socket.on('disconnect', (roomName) => {
        users.pop(socket.nickname);
        socket.leave(roomName)
        io.to(roomName).emit('connectUser', getUsers(roomName));
    });
    socket.on('disconnectRoom', (roomName) => {
        users.pop(socket.nickname);
        socket.leave(roomName)

        io.to(roomName).emit('connectUser', getUsers(roomName));
    });

});

// 몽고DB에 이력을 쌓는다
const addLogs = (msg) => {
	MongoClient.connect(mongo_HOST, function(err, db) {
        if (err) throw err;

        database = db.db(DB_NAME);

        database.collection('chatingLog').insertOne(msg, function(err, res) {
            if (err) throw err;
            db.close();
        });
	});	
}

// 요청----------------------
// 루트에 접근하면 /public로 리다이렉트
app.get('/', (req, res) => { 
    res.redirect(302, '/public');
});

app.get('/roomJoin', (req, res) => { 
    res.redirect(302, '/public?roomName=' + req.query.roomName);
});

// 방 목록 호출
app.get("/getRooms", (req, res) => {
    MongoClient.connect(mongo_HOST, function(err, db) {
		if (err) throw err;
		database = db.db(DB_NAME);		
		database.collection('chatingRooms').find({}).sort({_id:-1}).toArray(function(err, result) {
			if (err) throw err;
            let rooms = result || [];

            rooms.map( (value, index) => {
                rooms[index].cnt = io.sockets.adapter.rooms.get(value.roomName)?.size
            })

            res.send(rooms);
			db.close();
        });
	});
});

// 방 목록 등록
app.post("/addRooms", (req, res) => {
    let { roomName } = req.body;
    MongoClient.connect(mongo_HOST, function(err, db) {
        if (err) throw err;

        database = db.db(DB_NAME);

        database.collection('chatingRooms').insertOne({roomName: roomName}, function(err, res) {
            if (err) throw err;
            db.close();
        });
	});	
    res.send({success: true});
});

// 방 이름에 대한 채팅로그
app.post('/getLogs', (req, res) => {
    let { roomName } = req.body;

    MongoClient.connect(mongo_HOST, function(err, db) {
		if (err) throw err;
		database = db.db(DB_NAME);		
		database.collection('chatingLog').find({ roomName: roomName }).sort({_id:-1}).toArray(function(err, result) {
			if (err) throw err;
            let log = result || [];
            res.send({ logs : log });
			db.close();
        });
	});
});


// 파일전송
app.post('/fileTrans', upload.array('files'), (req, res) => {
    let file = req.files[0];
    let ext  = file.originalname.split(".").pop();
    let {roomName, name, fileName, id} = req.body;

    let msg = {
        id: id,
        roomName: roomName,
        name: name,
        ext: ext,
        fileName: fileName, 
        uuid: file.filename,
        time: new Date().toLocaleTimeString()
    };
    addLogs(msg);
    res.send({msg: msg});
});

// 비디오 전송
app.post('/fileTransVideo', upload.array('files'), (req, res) => {
    let file = req.files[0];
    let ext  = file.originalname.split(".").pop();
    let {roomName, name, fileName, id} = req.body;

    let msg = {
        id: id,
        roomName: roomName,
        name: name,
        type: 'video',
        fileName: fileName, 
        uuid: file.filename,
        time: new Date().toLocaleTimeString()
    };
    addLogs(msg);
    res.send({msg: msg});
});

// 파일 다운로드
app.get('/fileDownload', (req, res) => {
    let {fileName, uuid} = req.query;

    var file = 'public/uploads/'+uuid;

    var mimetype = mime.lookup(file);

    res.setHeader('Content-disposition', 'attachment; filename=' +  getDownloadFilename(req, fileName));
    res.setHeader('Content-type', mimetype);

    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
})

// 사용자 이름 중복 체크
app.post('/checkUser', (req, res) => {
    // io.sockets
    let { name } = req.body;
    

    //ret: 0: 성공, 1: 이름 중복
    if(users.indexOf(name) < 0){
        users.push(name);
        res.send({ret: 0})
    } else {
        res.send({ret: 1})
    }
})

let getUsers = (roomName) => {
    let ret = [];

    if(io.sockets.adapter.rooms.get(roomName) != null){
        io.sockets.adapter.rooms.get(roomName).forEach( user => {
            io.sockets.sockets.forEach( socket => {
                if(socket.id === user){
                    ret.push(socket.nickname)
                }
            })
        })
    }

    return ret;
}