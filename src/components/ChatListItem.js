import "../css/ChatListItem.css";

function ChatListItem({ chatRoomName, currentTalk, isChecked }) {
  return (
    <div className="chatRoomInfo">
      <div>
        <div id="chatRoomName">{chatRoomName}</div>
        <div id="currentTalk">{currentTalk}</div>
      </div>
      <div className={`alarm ${isChecked ? "checked" : ""}`}>🔴</div>
    </div>
  );
}

export default ChatListItem;
