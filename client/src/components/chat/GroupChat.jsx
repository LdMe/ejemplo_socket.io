import { useState, useEffect, useRef } from 'react'
import Chat from './Chat'
const GroupChat = ({ loggedUser, socket }) => {
    const [messages, setMessages] = useState([])

    useEffect(() => {
        const handleGroupMessage = (data) => {
            setMessages([...messages, data])
        }
        socket.on('group-message', (data) => {
            handleGroupMessage(data)
        })

        return () => socket.off('group-message', handleGroupMessage)
    }, [messages])

    function handleSubmit(data) {
        socket.emit('group-message', data)
    }

    return (
        <div className="group-chat">
            <h2>Chat Grupal</h2>
            <Chat
                messages={messages}
                loggedUser={loggedUser}
                onSubmit={handleSubmit}
            />
        </div>
    )
}

export default GroupChat
