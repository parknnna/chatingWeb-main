import React from 'react'
import ReactDOM from 'react-dom'
import socketio from 'socket.io-client'
import ImageViewer from 'react-simple-image-viewer';
import axios from 'axios'
import ReactPlayer from 'react-player';
import Rooms from './pages/rooms.js'
import FileTrans from './pages/fileTrans.js'
import './css/main.css'


const HOST = location.host
let socket = null;
// const socket = socketio.connect(HOST) // socketio 연결
class ChatForm extends React.Component {

  // 변수 바인딩
  inputRef;
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      message: '',
      searchRef: React.createRef(),
      roomName: sessionStorage.getItem('roomName'),
      fileTransPopup: false,
      fileType: ''
    }
    this.send = this.send.bind(this);
    this.openFileTransPopup = this.openFileTransPopup.bind(this);
    this.closeFileTransPopup = this.closeFileTransPopup.bind(this);
  }

  // 방목록 열기
  openFileTransPopup(type) {
    this.setState({ 
      fileTransPopup: true,
      fileType: type
    });
  };

  // 방목록 닫기
  closeFileTransPopup() {
    this.setState({ 
      fileTransPopup: false,
      fileType: ''
    });
  };

  nameChanged(e) {
    this.setState({ name: e.target.value })
  }

  messageChanged(e) {
    this.setState({ message: e.target.value })
  }

  // 서버에 이름과 메시지 전송 --- (※3)
  send() {
    if (this.state.message.trim().length === 0) {
      return false;
    }

    let roomName = this.state.roomName;

    socket.emit('msg', {
      id: socket.id,
      roomName: roomName,
      name: window.sessionStorage.getItem("name"),
      message: this.state.message,
      time: new Date().toLocaleTimeString()
    });

    this.state.searchRef.current.focus(); // 입력창 포커스
    this.setState({ message: '' }); // 입력창 비우기
  }

  render() {
    return (
      <div>
      {this.state.fileTransPopup ?
        <FileTrans 
          open     = {this.state.fileTransPopup} 
          close    = {this.closeFileTransPopup} 
          socket   = {socket} 
          name     = {window.sessionStorage.getItem("name")}
          roomName = {this.state.roomName}
          fileType = {this.state.fileType}
        />
        :
        <div className='message-form'>
          <div className='chating-items-1'>
          <button onClick={() => this.openFileTransPopup('img')} className='file-button'>이미지</button>
          <button onClick={() => this.openFileTransPopup('video')} className='file-button'>동영상</button>
          <button onClick={() => this.openFileTransPopup('file')} className='file-button'>파일</button>
          </div>
          <div className='chating-items-2'>
            <textarea value={this.state.message} ref={this.state.searchRef} className='chating-input'
              onChange={e => this.messageChanged(e)}
              onKeyDown={
                (e) => {
                  if (e.key === 'Enter') {
                    this.send();
                    e.nativeEvent.returnValue = false;
                  }
                }} />
          </div>
          <div className='chating-items-3'>
            <button onClick={this.send} className='send-button'>전송</button>
            <button onClick={()=>{
              let form = document.getElementById('container');
              form.scrollTop = form.scrollHeight;}}
              className='send-button'
              style={{marginLeft: '5px'}}
              >↓</button>
            <button onClick={()=>{ this.setState({message: `${HOST}/roomJoin?roomName=${sessionStorage.getItem('roomName')}`}) }}
              className='send-button'
              style={{marginLeft: '5px'}}
            >초대</button>
          </div>
        </div>
        }
      </div>
    )
  }
}


class ChatApp extends React.Component {

  // 변수 바인딩
  constructor(props) {
    super(props)
    this.state = {
      logs: [],
      name: "",
      roomName: '',
      popup: true , 
      windowHeight: '',
      currentImage: 0,
      isViewerOpen: false,
      users: []
    }
    this.nameChange = this.nameChange.bind(this);
    this.submit = this.submit.bind(this);
    this.closeRooms = this.closeRooms.bind(this);
    this.openRooms = this.openRooms.bind(this);
    this.connectRoom = this.connectRoom.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.openImageViewer = this.openImageViewer.bind(this);
    this.closeImageViewer = this.closeImageViewer.bind(this);
    this.fileDownload = this.fileDownload.bind(this);
    this.deConnectRoom = this.deConnectRoom.bind(this)
  }

  openImageViewer(index) {
    this.setState({
      currentImage: Array(index),
      isViewerOpen: true
    })
  }

  closeImageViewer() {
    this.setState({
      currentImage: 0,
      isViewerOpen: false
    })
  };

  // 컴포넌트 첫 마운트시
  componentDidMount(){
    window.addEventListener('resize', this.handleResize); // 리사이즈 핸들러 이벤트 추가

    window.addEventListener("beforeunload", this.deConnectRoom);
  }

  // 리사이즈시 현재 window높이를 저장후 바인딩
  handleResize() {
    this.setState({windowHeight: window.innerHeight});
  }

  // name 상태 변화 이벤트
  nameChange(e) {
    this.setState({
      name: e.target.value
    })
  }

  // 방 접속 해제
  deConnectRoom() {
    if(socket != null) {
      socket.emit('disconnectRoom', this.state.roomName);
      
      // socket.emit('msg', {
      //   roomName: roomName,
      //   name: 'global',
      //   message: window.sessionStorage.getItem("name") + '님이 퇴장하였습니다.',
      //   time: new Date().toLocaleTimeString()
      // });
    }
  }

  // 방 접속
  connectRoom() {
    let roomName = window.sessionStorage.getItem("roomName");

    socket = socketio(HOST, {
      reconnectionDelayMax: 10000,
      query: {
        "roomName": roomName,
        "nickname": window.sessionStorage.getItem("name")
      }
    });

    // // 방에 접속시 방안에 입장 메시지 뿌림
    // socket.emit('msg', {
    //   roomName: roomName,
    //   name: 'global',
    //   message: window.sessionStorage.getItem("name") + '님이 입장하였습니다.',
    //   time: new Date().toLocaleTimeString()
    // });

    // 방에 접속시 메세지 등록
    socket.on('msg', (obj) => {
      const logs2 = this.state.logs;
      obj.key = 'key_' + (this.state.logs.length + 1);
      logs2.unshift(obj); // 로그에 추가하기
      this.setState({ logs: logs2 });

      let form = document.getElementById('container');
      form.scrollTop = form.scrollHeight;
    })

    socket.on('connectUser', (obj) => {
      this.setState({users: obj})
    });

    axios.post(`/getLogs`,
      { roomName : roomName }
    ).then((response)=>{
      this.setState({
        logs: response.data.logs || [],
        roomName: roomName
      })
    })
  }

  // 방목록 열기
  openRooms() {
    this.setState({popup: true});
  };

  // 방목록 닫기
  closeRooms() {
    this.setState({popup: false});
  };

  // 이름 등록
  submit() {
    if (this.state.name.trim().length === 0) {
      alert('이름을 입력해주세요.');
      return false;
    }

    axios.post(`/checkUser`,{
      name: this.state.name
    }).then((response)=>{
      let ret = response.data.ret
      switch(ret){
        case 1:
          alert('동일한 이름의 사용자가 존재합니다.');
          break;
        default:
          window.sessionStorage.setItem("name", this.state.name);
          this.setState({ name: window.sessionStorage.getItem("name") });

          if(new URL(location.href).searchParams.get('roomName') !== null) {
            let paramRoomName = new URL(location.href).searchParams.get('roomName');

            this.setState({
              popup: false,
              roomName: paramRoomName
            });

            sessionStorage.setItem('roomName', paramRoomName);
            this.connectRoom()
          }
          break;
      }
    })
  }

  fileDownload(fileName, ext, uuid){
    axios({
      url: `/fileDownload`, 
      method: "GET",
      esponseType: "blob", // 응답 데이터 타입 정의,
      params:{
        fileName: fileName,
        ext: ext,
        uuid: uuid
      }
    })
  }

  render() {
    // 로그를 사용해 HTML 요소 생성 --- (※6)
    const chartHeight = window.innerHeight - 85;

    const users = this.state.users.map((user, index) => {
      return (
        <tr key={index}>
          <td>{user}</td>
        </tr>
      )
    })
    

    const messages = this.state.logs.slice(0).reverse().map(e => (
      <div key={e.key}>
        {  // 자신이 보낸 메세지
          e.name === window.sessionStorage.getItem("name") ?
            <div key={e.key} className='speech-block-me'>
              <span className='time-me'>{e.time}</span>
              <span className='speech-bubble-me'>
                {e.message}
                {
                  'img' in e &&
                  Object.keys(e.img).map((i) => {
                    let bufferArr = e.img[i];

                    if(typeof e.img[i] === 'object'){
                      let blob = new Blob([bufferArr], { type: "image/png" });
                      bufferArr = window.URL.createObjectURL(blob); 
                    } else {
                      bufferArr = "data:image/png;base64," + bufferArr;
                    }
                    return(
                      <img 
                        key={i} 
                        src={bufferArr} 
                        style={{padding: "3px"}}
                        onClick={ () => this.openImageViewer(bufferArr) }
                      />
                    )
                  })
                }
                {this.state.isViewerOpen && (
                  <ImageViewer
                    src={ this.state.currentImage }
                    disableScroll={ false }
                    closeOnClickOutside={ true }
                    onClose={ this.closeImageViewer }
                  />
                )}
                {
                  'ext' in e &&
                  <a onClick={()=>{window.location.href=`/fileDownload?fileName=${e.fileName}&ext=${e.ext}&uuid=${e.uuid}`}}>
                    <img src={ 'img/fileImg.png' } style={{marginBottom: '-8px'}}/>{e.fileName}
                  </a>
                }
                {
                  'type' in e &&
                  <ReactPlayer url={`uploads/${e.uuid}`}  controls={true} />
                }
              </span>
              <p style={{ clear: 'both' }} />
            </div>
          : // 전역 모든 채팅 사용자
          e.name === 'global' ? 
            <div key={e.key} className='speech-block-global'>
              {e.message}<font style={{fontSize: '8px'}}>{e.time}</font>
              <p style={{ clear: 'both' }} />
            </div>
          : // 자신을 제외한 사용자
            <div key={e.key} className='speech-block-you'> 
              <span className='speech-name-you'>{e.name}</span>
              <span className='speech-bubble-you'>
                {e.message}
                {
                  'img' in e &&
                  Object.keys(e.img).map((i, index) => {
                    let bufferArr = e.img[i];

                    if(typeof e.img[i] === 'object'){
                      let blob = new Blob([bufferArr], { type: "image/png" });
                      bufferArr = window.URL.createObjectURL(blob); 
                    } else {
                      bufferArr = "data:image/png;base64," + bufferArr;
                    }
                    return(
                      <img 
                        key={index} 
                        src={bufferArr} 
                        style={{padding: "3px"}}
                        onClick={ () => this.openImageViewer(bufferArr) }
                      />
                    )
                  })
                }
                {this.state.isViewerOpen && (
                  <ImageViewer
                    src={ this.state.currentImage }
                    disableScroll={ false }
                    closeOnClickOutside={ true }
                    onClose={ this.closeImageViewer }
                  />
                )}
                {
                  'ext' in e &&
                  <a onClick={()=>{window.location.href=`/fileDownload?fileName=${e.fileName}&ext=${e.ext}&uuid=${e.uuid}`}}>
                    {e.fileName}<img src={ 'img/fileImg.png' } style={{marginBottom: '-8px'}}/>
                  </a>
                }
                {
                  'type' in e &&
                  <ReactPlayer url={`uploads/${e.uuid}`}  controls={true} />
                }
              </span>
              <span className='time-you' >{e.time}</span>
              <p style={{ clear: 'both' }} />
            </div>
        }
      </div>
    ))

    return (
      <div className='main'>
        {window.sessionStorage.getItem("name") === null ?
          <div style={{
            position: "absolute", width: "100%", height: "100%"
          }}>
            <div style={{
              position: "relative",
              top: "43%",
              textAlign: 'center'
            }}>
              <font>NAME : </font><input onChange={(e) => { this.nameChange(e) }} value={this.state.name}></input> <button onClick={this.submit}>접속</button>
            </div>
          </div>
          :
          this.state.popup ? 
          <Rooms open={this.state.popup} close={this.closeRooms} connect={this.connectRoom} deConnect={this.deConnectRoom}/>
          :
          <div className='chating-form' id='chating-form'>
            <div style={{
              overflow: "scroll",
              width: "100%",
              height: `30px`,
              backgroundColor: '#ddddddab',
              overflow: "hidden",
              textAlign: "center"
            }}>
              <font style={{fontWeight: "bold"}}>{this.state.roomName}</font> &nbsp;
              <button onClick={this.openRooms} className='roomButton'>방목록</button>
            </div>
            <div style={{
              overflow: "scroll",
              width: "80%",
              height: `${chartHeight}px`,
              backgroundColor: '#ddddddab',
              overflowX: "hidden",
              float: 'left'
            }} className="container" id='container'>{messages}</div>
            <div style={{
              overflow: "scroll",
              width: "20%",
              height: `${chartHeight}px`,
              backgroundColor: 'rgb(189 189 189 / 67%)',
              overflowX: "hidden",
            }} className="container" id='container'>
              <table>
                <thead><tr><th key={'users'}>사용자</th></tr></thead>
                <tbody>
                {users}
                </tbody>
              </table>
            </div>
            <ChatForm />
          </div>
        }
      </div>
    )
  }
}

ReactDOM.render(
  <ChatApp />,
  document.getElementById('root'))