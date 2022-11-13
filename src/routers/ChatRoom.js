import { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import ChatBubble from "../components/ChatBubble";
import "../css/ChatRoom.css";
import SockJS from "sockjs-client";
import * as Stomp from "stompjs";

const SERVER_NAME = "http://54.215.135.43:8080";

function ChatRoom({ nowChatRoomName, nowChatRoomuuid }) {
  const [stompClient, setStompClient] = useState(null);
  const [chatContent, setChatContent] = useState("");
  const [count, setCount] = useState(3);
  const [nowUser, setNowUser] = useState("user1");
  const [chatLog, setChatLog] = useState([
    {
      content: "뭐해",
      sender: "user1",
      count: 1,
      time: "11:31",
    },
    {
      content: "놀아",
      sender: "user2",
      count: 2,
      time: "11:31",
    },
    {
      content:
        "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ",
      sender: "user2",
      count: 3,
      time: "11:32",
    },
  ]);

  const scrollRef = useRef();

  const stompConnect = (onResponseMessage) => {
    return new Promise((succ, fail) => {
      const sockJS = new SockJS("http://54.215.135.43:8080/ws");
      const stompCli = Stomp.over(sockJS);
      setStompClient(stompCli);
      const headers = {
        token: localStorage.getItem("token"),
      };

      console.log(headers);

      stompCli.connect(
        function (frame) {
          // 토큰 집어넣고
          console.log("connected: " + frame);
          stompSubscribe("/sub/" + nowChatRoomuuid, onResponseMessage); // 해당 방으로 구독 ->
          succ(true);
        },
        function (error) {
          fail(error);
        }
      );
    });
  };

  const stompSubscribe = (path, onResponseMessage) => {
    const headers = {
      token: localStorage.getItem("token"),
    };

    stompClient.subscribe(
      path,
      function (response) {
        //전달받은 메시지
        console.log("응답: " + response);
        //const message = JSON.parse(response.body);
        // setChatLog([...chatLog, message])
        onResponseMessage(response);
      },
      headers
    );
  };

  const stompDisconnect = () => {
    if (stompClient != null) {
      if (stompClient.connected) {
        stompClient.disconnect(() => {});
      }
      stompClient = null;
    }
  };

  const stompSendMessage = (type, message) => {
    //syncPub으로 해당 메시지를 publish 요청한다.
    const body = {
      type: type,
      roomId: global.syncInfo.roomId, //서버에서는 토큰 안에 있는 룸아이디랑 이 룸아이디랑 일치하는지 검사해야한다.
      senderToken: global.syncInfo.token,
      message: message,
    };
    stompClient.send(
      "/pub/syncPub",
      { token: global.syncInfo.token },
      JSON.stringify(body)
    );
  };

  // const isWebsocketConnected = () => {
  //   return stompClient != null;
  // };

  const onChange = (e) => {
    if (chatContent.length > 144) {
      return;
    } else {
      setChatContent(e.target.value);
    }
  };
  const onSubmit = (e) => {
    e.preventDefault();
    if (chatContent === "") {
      return;
    } else {
      setCount((x) => x + 1);
      const newChat = {
        content: chatContent,
        sender: nowUser,
        count: count,
        time: "11:33",
      };
      setChatLog([...chatLog, newChat]);
      setChatContent("");
    }
  };

  useEffect(() => {
    console.log("render");
    stompConnect();
    return () => stompDisconnect();
  }, []);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatLog]);

  return (
    <div>
      <Header
        title={nowChatRoomName}
        roomUuid={nowChatRoomuuid}
        backBtn={true}
        etcBtn={true}
      />
      <div className="chatLogList" ref={scrollRef}>
        {chatLog.map((chatLog) => (
          <ChatBubble
            key={chatLog.sender + chatLog.count}
            chatLog={chatLog}
            nowUser={nowUser}
          />
        ))}
      </div>
      <form className="chatInput" onSubmit={onSubmit}>
        <textarea
          className="contentInput"
          name="talk"
          onChange={onChange}
          value={chatContent}
        />
        <input className="contentSubmit" type="submit" value={">"} />
      </form>
    </div>
  );
}

export default ChatRoom;
