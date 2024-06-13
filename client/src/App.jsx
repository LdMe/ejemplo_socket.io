import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Login from './Login';
import './App.css';
import GroupChat from './components/chat/GroupChat';
import UserList from './components/user/UserList';

const socket = io('http://192.168.1.130:3002');

function App() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (username) {
      socket.emit('login', { username });
    }
  }, [username]);

  return (
    <>
      {username ? (
        <>
          <aside>
            <UserList loggedUser={username} socket={socket} />
          </aside>
          <main>
            <h1>Chat con Socket.io</h1>
            <h2>Usuario: {username}</h2>
            <GroupChat loggedUser={username} socket={socket} />
          </main>
        </>
      ) : (
        <Login setUser={setUsername} />
      )}
    </>
  );
}

export default App;