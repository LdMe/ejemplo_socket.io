

import {  useEffect,useRef } from 'react'
import "./Chat.css"

const Chat = ({messages,loggedUser,onSubmit}) => {
    const messagesEndRef = useRef(null)
   
    useEffect(() => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    function handleSubmit(e) {
        e.preventDefault()
        const data = {
            message: e.target.message.value,
            from: loggedUser
        }
        onSubmit(data)
        e.target.reset()
    }

    function handleMessageClass(message) {
        return message.from === loggedUser ? 'sent' : 'received'
    }
    return (
        <div className="chat">
            <div className="messages">
                {
                    messages.map((message, index) => (
                        <div className={handleMessageClass(message)}key={index}>
                            <p className='from'>{message.from}</p>
                            <p className='message'>{message.message}</p>
                        </div>
                    ))
                }
                <div className="messages-end" ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="chat-form">
                <textarea type="text" name="message"/>
                <button type="submit">Enviar</button>
            </form>
        </div>
    )
}

export default Chat
