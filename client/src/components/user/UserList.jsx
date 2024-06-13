import { useEffect, useState } from 'react';
import User from "./User";

const UserList = ({ loggedUser, socket }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const handleLoginAcknowledge = (data) => {
            setUsers(data);
        };

        socket.on('login-acknowledge', handleLoginAcknowledge);
        return () => socket.off('login-acknowledge', handleLoginAcknowledge);
    }, [socket]);

    const filteredUsers = users.filter(user => user !== loggedUser);

    return (
        <section className="user-list">
            <h2>Usuarios Conectados</h2>
            <ul className="users">
                {filteredUsers.map(user => (
                    <User key={user} loggedUser={loggedUser} user={user} socket={socket} />
                ))}
            </ul>
        </section>
    );
};

export default UserList;
