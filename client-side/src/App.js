import React from "react";
import "./App.css";
import MainContainer from "./components/MainContainer";
import Login from "./components/Authentication/Login";
import { Route, Routes } from "react-router-dom";
import Welcome from "./components/Welcome";
import ChatArea from "./components/ChatArea";
import CreateGroups from "./components/CreateGroups";
import Users from "./components/Users";
import Groups from "./components/Groups";
import { UseSelector, useSelector } from "react-redux";
import bgimage from "./assets/images/bg.jpg";
import bgimage1 from "./assets/images/bgimg1.jpg";
import { SocketProvider } from "./Context/Socket";
import Room from "./components/Room";
import { PeerProvider } from "./Context/Peer";
import AddPeopleToGroup from "./components/AddPeopleToGroup";
import VideoRoom from "./components/VideoRoom";
import ChatProvider from "./Context/ChatProvider";

function App() {
  const lightTheme = useSelector((state) => state.themeKey);
  return (
    <div
      className="App"
      style={{
        backgroundImage: lightTheme ? `url(${bgimage})` : `url(${bgimage1})`,
      }}
    >
      <SocketProvider>
      <ChatProvider>
        <PeerProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/app" element={<MainContainer />}>
          <Route path="welcome" element={<Welcome />} />
          <Route path="chat" element={<ChatArea />} />
          <Route path="users" element={<Users />} />
          <Route path="groups" element={<Groups />} />
          <Route path="create-groups" element={<CreateGroups />} />
          <Route path="room/:roomId" element={<Room />} />
          <Route path="videoroom/:roomId" element={<VideoRoom />} />
        </Route>
      </Routes>
      </PeerProvider>
      </ChatProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
