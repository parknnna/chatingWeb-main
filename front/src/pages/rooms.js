import React, {useEffect, useState} from 'react';
import axios from 'axios';
import '../css/popup.css';

export default (props) => {
  // 열기, 닫기, 모달 헤더 텍스트를 부모로부터 받아옴
  const { open, close, connect, deConnect} = props;

  const [rooms , setRooms] = useState([]);
  const [roomName , setRoomName] = useState('');

  useEffect(()=>{
    getRooms()
  },[])

  // 방추가
  const addRoom = () => {
    if(roomName.trim() === ''){
      alert('채팅방 이름을 입력해주세요.');
      return false;
    }

    axios.post(`/addRooms`,{
        roomName: roomName
    }).then(res => {
        res.data.success === true ? alert('추가되었습니다.') : alert('처리중 오류가 있습니다')
        setRoomName('');
        getRooms();
    })
  }

  // 방 목록 요청
  const getRooms = () => {
    axios.get(`/getRooms`).then((response)=>{
        setRooms(response.data)
    })
  }

  // 방 접속
  const connRoom = (e) => {
    deConnect(window.sessionStorage.getItem('roomName'));
    window.sessionStorage.setItem("roomName", e.target.innerHTML);
    connect();
    close();
  }

  return (
    <div className={open ? 'openModal modal' : 'modal'}>
      {open ? (
        <section>
          <header>
            채팅방 목록
            <button className="close" onClick={close}>
              &times;
            </button>
          </header>
          <main>
            <table>
              <thead>
              </thead>
              <tbody>
              {
                  rooms.map((item, index) => {
                      return(
                          <tr key={`${item.roomName}`}>
                              <td onClick={(e) => connRoom(e)} style={{width: '85%'}}>{item.roomName}</td><td>{item.cnt || 0} 명</td>
                          </tr>  
                      )      
                  })
              }
              </tbody>
            </table>
          </main>
          <footer>
            <input value={roomName} onChange={(e)=> setRoomName(e.target.value)}></input>
            &nbsp;
            <button className="close" onClick={addRoom}>추가</button>
            &nbsp;
            <button className="close" onClick={getRooms}>새로고침</button>
            &nbsp;
            <button className="close" onClick={close}>
              close
            </button>
          </footer>
        </section>
      ) : null}
    </div>
  );
};