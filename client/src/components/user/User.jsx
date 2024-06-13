import { useState, useEffect } from 'react'

import Modal from '../modal/Modal'
import Chat from '../chat/Chat'
import './User.css'

const User = ({ loggedUser, user, socket }) => {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([])
    const [unreadMessages, setUnreadMessages] = useState(0)

    useEffect(() => {
        const handlePrivateMessage = (data) => {
            if (data.from !== user) return;
            setMessages([...messages, data]);
            if (!open) setUnreadMessages(unreadMessages + 1);
        };

        socket.on('private-message', handlePrivateMessage)

        return () => socket.off('private-message', handlePrivateMessage)
    }, [messages, user, open])

    function handleSubmit(data) {
        data.to = user
        socket.emit('private-message', data)
        setMessages(prevMessages => [...prevMessages, data])
    }
    function handleOpen() {
        setUnreadMessages(0)
        setOpen(true)
    }
    function handleClose() {
        setOpen(false)
    }

    return (
        <>
            <div className="user" onClick={handleOpen}>
                <b>{user} {unreadMessages > 0 && <span className='unread'>{unreadMessages}</span>}</b>
            </div>
            {open &&
                <Modal onClose={handleClose} open={open}>
                    <section className="chat-header">
                        <h2>{user}</h2>
                    </section>
                    <Chat
                        messages={messages}
                        user={user}
                        loggedUser={loggedUser}
                        onSubmit={handleSubmit}
                    />

                </Modal>
            }
        </>
    )
}

export default User