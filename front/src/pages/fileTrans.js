import React, {useState} from 'react';
import axios from 'axios';
import '../css/popup.css';

export default (props) => {
  // 열기, 닫기, 모달 헤더 텍스트를 부모로부터 받아옴
  const { open, close, socket, name, roomName, fileType} = props;

  const [files, setFiles] = useState({  
    files: new FormData(),
  });

  const fileTrans = () => {

    switch(fileType) {
      case 'img':
        for(let i=0;i<files.length;i++){
          let name = files[i].name
          let pathpoint = name.lastIndexOf('.');
          let filepoint = name.substring(pathpoint+1,name.length);
          let filetype = filepoint.toLowerCase();

          if(filetype=='jpg' || filetype=='gif' || filetype=='png' || filetype=='jpeg' || filetype=='bmp') {

          } else {
            alert('이미지 파일만 선택할 수 있습니다.(jpg, gif, png, jpeg, bmp)');
            return false;
          }
        }
  
        socket.emit('img', {
          id: socket.id,
          roomName: roomName,
          name: name,
          img: files,
          time: new Date().toLocaleTimeString()
        })
        close();
        break;


      case 'file':  
        var data = new FormData();

        for(let i = 0; i < files.length; i++) {
          data.append("files", files[i]);
          data.append("fileName", files[i].name);
        }

        data.append('id', socket.id);
        data.append('roomName', roomName);
        data.append('name', name);
    
        axios.post(`/fileTrans`, data, {"content-type": "multipart/form-data;charset=UTF-8"})
        .then((res)=>{
          socket.emit('file', res.data.msg)
          close();
        }).catch((Error)=>{
            console.log(Error);
        })
        break;


      default:
        var data = new FormData();

        for(let i = 0; i < files.length; i++) {
          let name = files[i].name
          let pathpoint = name.lastIndexOf('.');
          let filepoint = name.substring(pathpoint+1,name.length);
          let filetype = filepoint.toLowerCase();

          if(filetype=='ogm' || filetype=='wmv' || filetype=='mpg' || filetype=='webm' || 
             filetype=='ogv' || filetype=='mov' || filetype=='asx' || filetype=='mpeg' ||
             filetype=='mp4' || filetype=='m4v' || filetype=='avi') {
          } else {
            alert('비디오 파일만 선택할 수 있습니다.(jpg, gif, png, jpeg, bmp)');
            return false;
          }


          data.append("files", files[i]);
          data.append("fileName", files[i].name);
        }

        data.append('id', socket.id);
        data.append('roomName', roomName);
        data.append('name', name);
    
        axios.post(`/fileTransVideo`, data, {"content-type": "multipart/form-data;charset=UTF-8"})
        .then((res)=>{
          socket.emit('file', res.data.msg)
          close();
        }).catch((Error)=>{
            console.log(Error);
        })
        break;
    }
  }

  const filesChangedHandler = (e) =>{ 
    setFiles(e.target.files);
  }

  return (
    <div className={open ? 'openModal modal' : 'modal'}>
      {open ? (
        <section>
          <header>
            { fileType === 'img'  ? '이미지' :
              fileType === 'file' ? '파일'  :
              '동영상'
            } 전송
            <button className="close" onClick={close}>
              &times;
            </button>
          </header>
          <main>
            <input 
              type="file" 
              id="input-file"
              multiple= {fileType === 'img' ? "multiple" : false}
              accept={fileType === 'img' ? 
                      "image/gif, image/jpeg, image/png" 
                      : 
                      fileType === 'video' ?
                      "video/*"
                      :
                      false
                     }
              placeholder="file"
              onChange={filesChangedHandler}
            />
          </main>
          <footer>
            <button className="close" onClick={fileTrans}>전송</button>
            <button className="close" onClick={close}>닫기</button>
          </footer>
        </section>
      ) : null}
    </div>
  );
};