## 소개
<img width="80%" src="https://user-images.githubusercontent.com/69619672/175767432-dbd21c40-b2d0-41ac-b386-8ad4c4d6573b.gif"/>
<br/>
socket io 라이브러리를 사용한 react-node 연동 채팅웹 서비스

사용자가 채팅방을 만들어 n:m 채팅을 사용할 수 있다.
채팅 내용은 MongoDB에 document를 쌓아 로그를 남겨 채팅 내용을 저장한다.

## 사용 스택
<table>
   <tr>
     <th>Stack</th>
     <th>Version</th>
   </tr>
   <tr>
     <td>Node.js</td>   <td>16.15.1</td>
   </tr>
   <tr>
     <td>React.js</td>  <td>18.1.0</td>
   </tr>
   <tr>
     <td>MongoDB</td>   <td>5.0.9</td>
   </tr>
   <tr>
     <td>NPM</td>       <td>8.12.1</td>
   </tr>
</table>

## 기능
<h4>*파일 전송기능*</h4>
<img width="80%" src="https://user-images.githubusercontent.com/69619672/175767840-a7d1f71b-de54-4ea1-b668-19190a61bbf7.jpg"/>
좌측하단 이미지, 동영상, 파일 버튼을 클릭하여 팝업을 열어 파일을 전송할 수 있다. <br/>
각각 버튼에서 컴포넌트에 props로 값을 보내 한 컴포넌트에서 이미지, 동영상, 파일 전송기능을 처리하도록 구현하였다.
<br/>
<h4>*채팅창*</h4>
<img width="80%" src="https://user-images.githubusercontent.com/69619672/175767837-252b6f16-28cf-4c3c-ba62-8b09585a7de1.jpg"/>
위에서 부터 이미지, 동영상, 파일, 메세지 전송 화면이다. <br/>
이미지: react-simple-image-viewer를 사용하여 클릭시 전체화면으로 사진을 볼수 있음<br/>
동영상: react-player를 사용하여 동영상 재생가능<br/>
파일: nodeJS의 fs를 사용하여 respons에 리턴하여 파일을 다운로드 할 수 있도록 구현<br/>

<h4>*채팅방 사용자 목록*</h4>
<img height="300px" src="https://user-images.githubusercontent.com/69619672/175767836-431d5954-424b-48b2-9734-c22f942fd163.jpg"/>
사용자가 채팅방에 들어오거나 다른방으로 옮기거나 세션이 끊킬경우 이벤트를 발생시켜<br/>
그 채팅방에 다른 사용자들에게 새로운 사용자 목록을 보내 채팅방을 사용중인 사용자 목록을 실시간으로 유지한다.<br/>





