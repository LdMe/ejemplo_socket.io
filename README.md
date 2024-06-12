# Guía de Uso de Socket.io para Chat con React y Express

## Índice
1. [Introducción](#introducción)
2. [Backend](#backend)
   - [Configuración del Servidor](#configuración-del-servidor)
   - [Gestión de Usuarios Conectados](#gestión-de-usuarios-conectados)
   - [Manejo de Eventos de Socket.io](#manejo-de-eventos-de-socketio)
   - [index.js](#indexjs)
3. [Frontend](#frontend)
   - [App.jsx](#appjsx)
   - [UserList.jsx](#userlistjsx)
   - [User.jsx](#userjsx)
   - [GroupChat.jsx](#groupchatjsx)
   - [Chat.jsx](#chatjsx)
4. [Ejecución](#ejecución)
5. [Referencias](#referencias)

## Introducción
Esta guía proporciona una explicación detallada de cómo utilizar Socket.io junto con React y Express para implementar un chat en tiempo real. El proyecto consta de un backend construido con Express y un frontend desarrollado con React. Socket.io se utiliza para facilitar la comunicación en tiempo real entre el cliente y el servidor.

El chat permite a los usuarios enviar mensajes tanto en un chat grupal como en chats privados con otros usuarios conectados. Además, se muestra una lista actualizada de los usuarios conectados en tiempo real.

## Backend

### index.js
Este archivo configura y establece el servidor backend utilizando Express y Socket.io. Se encarga de manejar las conexiones de los clientes, gestionar los usuarios conectados y manejar los eventos relacionados con el chat, como mensajes grupales y mensajes privados.

El archivo comienza con la configuración del servidor Express y Socket.io, donde se importan los módulos necesarios, se crea una instancia de la aplicación Express, se configura el middleware CORS y se crea un servidor HTTP utilizando la instancia de Express. Luego, se crea una instancia de Socket.io adjunta al servidor HTTP, permitiendo conexiones desde cualquier origen.

A continuación, se define un objeto `users` para almacenar los usuarios conectados, asociando sus nombres de usuario con sus respectivos `socket.id`. Se implementan funciones auxiliares para obtener el `socket.id` asociado a un nombre de usuario y viceversa.

El archivo también maneja diferentes eventos de Socket.io. Cuando un cliente se conecta, se muestra un mensaje en la consola. Al desconectarse un cliente, se elimina su asociación del objeto `users` y se emite la lista actualizada de usuarios conectados a todos los clientes. Cuando un usuario inicia sesión, se asocia su nombre de usuario al `socket.id` correspondiente y se emite la lista actualizada de usuarios conectados. Además, se manejan los eventos de mensajes grupales y privados, donde se añade el nombre de usuario al mensaje y se emite a los destinatarios correspondientes.

### index.js

```javascript
import express from 'express'; // Importa el framework Express para crear el servidor HTTP
import http from 'http'; // Importa el módulo HTTP para crear el servidor
import { Server as socketIo } from 'socket.io'; // Importa la clase Server de socket.io y la renombra como socketIo
import cors from 'cors'; // Importa el middleware CORS para permitir solicitudes de otros dominios

const APP_PORT = 3002; // Define el puerto en el que el servidor escuchará
const app = express(); // Crea una instancia de la aplicación Express
app.use(cors()); // Usa el middleware CORS en la aplicación Express
const server = http.createServer(app); // Crea un servidor HTTP usando la instancia de Express

const io = new socketIo(server, { // Crea una instancia de Socket.io adjunta al servidor HTTP
    cors: {
        origin: '*', // Permite conexiones desde cualquier origen
    },
});

const users = {}; // Objeto para almacenar los usuarios conectados con su socket.id

function getSocketId(username) {
    return users[username]; // Retorna el socket.id asociado al nombre de usuario
}

function getUsername(socketId) {
    return Object.keys(users).find(key => users[key] === socketId); // Retorna el nombre de usuario asociado al socket.id
}

io.on('connection', (socket) => { // Maneja el evento de conexión de un nuevo cliente
    console.log('User connected'); // Log en consola cuando un usuario se conecta

    socket.on('disconnect', () => { // Maneja el evento de desconexión de un cliente
        console.log('User disconnected'); // Log en consola cuando un usuario se desconecta
        const username = getUsername(socket.id); // Obtiene el nombre de usuario asociado al socket.id
        if (username) { // Si se encuentra un nombre de usuario
            delete users[username]; // Elimina al usuario del objeto users
            io.emit('login-acknowledge', Object.keys(users)); // Emite la lista actualizada de usuarios conectados a todos los clientes
        }
    });

    socket.on('login', (data) => { // Maneja el evento de login de un usuario
        users[data.username] = socket.id; // Asocia el nombre de usuario al socket.id en el objeto users
        io.emit('login-acknowledge', Object.keys(users)); // Emite la lista actualizada de usuarios conectados a todos los clientes
    });

    socket.on('group-message', (data) => { // Maneja el evento de mensaje grupal
        const username = getUsername(socket.id); // Obtiene el nombre de usuario asociado al socket.id
        if (username) { // Si se encuentra un nombre de usuario
            io.emit('group-message', data); // Emite el mensaje grupal a todos los clientes
        }
    });

    socket.on('private-message', (data) => { // Maneja el evento de mensaje privado
        const toSocketId = getSocketId(data.to); // Obtiene el socket.id del destinatario
        if (toSocketId) { // Si se encuentra un socket.id
            io.to(toSocketId).emit('private-message', data); // Envía el mensaje privado al destinatario
        }
    });
});

server.listen(APP_PORT, () => { // El servidor escucha en el puerto definido
    console.log(`Listening on *:${APP_PORT}`); // Log en consola indicando en qué puerto está escuchando el servidor
});

```
## Frontend
El frontend se encarga de proporcionar la interfaz de usuario para el chat y gestionar la interacción con el servidor mediante Socket.io. A continuación, se describen los componentes principales del frontend.

### App.jsx
Este componente es el punto de entrada de la aplicación React. Se encarga de establecer la conexión con el servidor de Socket.io, gestionar el estado del nombre de usuario y renderizar condicionalmente la interfaz del chat o el componente de login.

El componente comienza importando los módulos y componentes necesarios, incluyendo `socket.io-client` para establecer la conexión con el servidor de Socket.io. Luego, se define un estado para almacenar el nombre de usuario utilizando el hook `useState`.

Se utiliza el hook `useEffect` para emitir el evento de login al servidor cuando se establece el nombre de usuario. Esto permite asociar el nombre de usuario con el `socket.id` correspondiente en el backend.

Finalmente, se renderiza condicionalmente la interfaz del chat o el componente de login según si hay un nombre de usuario establecido. Si hay un nombre de usuario, se muestra la interfaz del chat, que incluye la lista de usuarios conectados y el chat grupal. Si no hay un nombre de usuario, se muestra el componente de login para que el usuario pueda ingresar su nombre.

```jsx
import { useEffect, useState } from 'react'; // Importa useEffect y useState desde React
import { io } from 'socket.io-client'; // Importa la función io de socket.io-client para conectar con el servidor de Socket.io
import Login from './Login'; // Importa el componente Login
import './App.css'; // Importa el archivo de estilos CSS para este componente
import GroupChat from './components/chat/GroupChat'; // Importa el componente GroupChat
import UserList from './components/user/UserList'; // Importa el componente UserList

const socket = io('http://192.168.1.130:3002'); // Conecta al servidor de Socket.io en la URL especificada

function App() {
  const [username, setUsername] = useState(""); // Declara un estado para almacenar el nombre de usuario

  useEffect(() => {
    if (username) { // Si hay un nombre de usuario
      socket.emit('login', { username }); // Emite un evento de login al servidor con el nombre de usuario
    }
  }, [username]); // Este efecto se ejecuta cada vez que cambia el valor de username

  return (
    <>
      {username ? ( // Si hay un nombre de usuario, muestra la interfaz del chat
        <>
          <aside>
            <UserList loggedUser={username} socket={socket} /> {/* Renderiza la lista de usuarios conectados */}
          </aside>
          <main>
            <h1>Chat con Socket.io</h1> {/* Muestra el título del chat */}
            <h2>Usuario: {username}</h2> {/* Muestra el nombre de usuario actual */}
            <GroupChat loggedUser={username} socket={socket} /> {/* Renderiza el componente de chat grupal */}
          </main>
        </>
      ) : ( // Si no hay un nombre de usuario, muestra el componente Login
        <Login setUser={setUsername} /> // Renderiza el componente Login y pasa la función setUsername como prop
      )}
    </>
  );
}

export default App; // Exporta el componente App como el componente por defecto

```

### UserList.jsx

Este componente muestra la lista de usuarios conectados en tiempo real. Se suscribe al evento `'login-acknowledge'` del socket para recibir actualizaciones de la lista de usuarios y renderiza cada usuario como un componente `User`.

El componente comienza importando los módulos y componentes necesarios, incluyendo el componente `User`. Luego, se define un estado para almacenar la lista de usuarios conectados utilizando el hook `useState`.

Se utiliza el hook `useEffect` para suscribirse al evento `'login-acknowledge'` del socket. Cuando se recibe este evento, se actualiza el estado de la lista de usuarios con los datos recibidos. Además, se filtra la lista de usuarios para excluir al usuario actualmente conectado.

Finalmente, se renderiza la lista de usuarios conectados, mapeando cada usuario a un componente `User`. Esto permite mostrar la lista de usuarios en tiempo real y permitir la interacción con cada usuario a través del componente `User`.

```jsx
import { useEffect, useState } from 'react'; // Importa useEffect y useState desde React
import User from "./User"; // Importa el componente User

const UserList = ({ loggedUser, socket }) => { // Declara el componente UserList que recibe loggedUser y socket como props
    const [users, setUsers] = useState([]); // Declara un estado para almacenar la lista de usuarios conectados

    useEffect(() => { // Hook de efecto para manejar la suscripción a eventos de socket
        const handleLoginAcknowledge = (data) => { // Función manejadora para el evento 'login-acknowledge'
            setUsers(data); // Actualiza la lista de usuarios con los datos recibidos
        };

        socket.on('login-acknowledge', handleLoginAcknowledge); // Se suscribe al evento 'login-acknowledge' de socket
        return () => socket.off('login-acknowledge', handleLoginAcknowledge); // Limpia la suscripción al desmontar el componente
    }, [socket]); // Este efecto se ejecuta solo cuando cambia el socket

    const filteredUsers = users.filter(user => user !== loggedUser); // Filtra la lista de usuarios para excluir al usuario actualmente conectado

    return ( // Renderiza la lista de usuarios conectados
        <section className="user-list">
            <h2>Usuarios Conectados</h2> {/* Título de la sección */}
            <ul className="users">
                {filteredUsers.map(user => ( // Mapea los usuarios filtrados y renderiza un componente User para cada uno
                    <User key={user} loggedUser={loggedUser} user={user} socket={socket} />
                ))}
            </ul>
        </section>
    );
};

export default UserList; // Exporta el componente UserList como el componente por defecto

```

### User.jsx

Este componente representa a un usuario en la lista de usuarios conectados. Muestra el nombre de usuario y el número de mensajes no leídos. Al hacer clic en el usuario, se abre un modal con el chat privado correspondiente.

El componente comienza importando los módulos y componentes necesarios, incluyendo el componente `Modal` y `Chat`. Luego, se definen estados para controlar la apertura del modal, almacenar los mensajes privados y contar los mensajes no leídos.

Se utiliza el hook `useEffect` para suscribirse al evento `'private-message'` del socket. Cuando se recibe un mensaje privado, se verifica si el remitente coincide con el usuario actual. Si es así, se añade el mensaje al estado de mensajes privados y se incrementa el contador de mensajes no leídos si el modal no está abierto.

El componente también implementa funciones para manejar el envío de mensajes privados, la apertura y el cierre del modal. Cuando se envía un mensaje privado, se emite el evento correspondiente al servidor a través del socket.

Finalmente, se renderiza el nombre de usuario y el número de mensajes no leídos. Al hacer clic en el usuario, se abre un modal que muestra el chat privado con el usuario seleccionado, utilizando el componente `Chat`.
```jsx
import { useState, useEffect } from 'react'; // Importa useState y useEffect desde React

import Modal from '../modal/Modal'; // Importa el componente Modal
import Chat from '../chat/Chat'; // Importa el componente Chat
import './User.css'; // Importa el archivo de estilos CSS para este componente

const User = ({ loggedUser, user, socket }) => { // Declara el componente User que recibe loggedUser, user y socket como props
    const [open, setOpen] = useState(false); // Declara un estado para controlar si el modal está abierto
    const [messages, setMessages] = useState([]); // Declara un estado para almacenar los mensajes privados
    const [unreadMessages, setUnreadMessages] = useState(0); // Declara un estado para contar los mensajes no leídos

    useEffect(() => { // Hook de efecto para manejar la suscripción a eventos de socket
        const handlePrivateMessage = (data) => { // Función manejadora para el evento 'private-message'
            if (data.from !== user) return; // Si el mensaje no es del usuario actual, no hacer nada
            setMessages(prevMessages => [...prevMessages, data]); // Añade el nuevo mensaje a la lista de mensajes
            if (!open) setUnreadMessages(prevUnread => prevUnread + 1); // Si el modal no está abierto, incrementa el contador de mensajes no leídos
        };

        socket.on('private-message', handlePrivateMessage); // Se suscribe al evento 'private-message' de socket

        return () => socket.off('private-message', handlePrivateMessage); // Limpia la suscripción al desmontar el componente
    }, [messages, user, open, socket]); // Este efecto se ejecuta cuando cambian messages, user, open o socket

    function handleSubmit(data) { // Función para manejar el envío de un mensaje privado
        data.to = user; // Establece el destinatario del mensaje
        socket.emit('private-message', data); // Emite el mensaje privado a través del socket
        setMessages(prevMessages => [...prevMessages, data]); // Añade el mensaje enviado a la lista de mensajes
    }
    function handleOpen() { // Función para manejar la apertura del modal
        setUnreadMessages(0); // Resetea el contador de mensajes no leídos
        setOpen(true); // Abre el modal
    }
    function handleClose() { // Función para manejar el cierre del modal
        setOpen(false); // Cierra el modal
    }

    return ( // Renderiza el componente User
        <>
            <div className="user" onClick={handleOpen}> {/* Muestra el nombre de usuario y el número de mensajes no leídos */}
                <b>{user} {unreadMessages > 0 && <span className='unread'>{unreadMessages}</span>}</b>
            </div>
            {open && ( // Si el modal está abierto, renderiza el componente Modal con el contenido del chat
                <Modal onClose={handleClose} open={open}>
                    <section className="chat-header">
                        <h2>{user}</h2> {/* Muestra el nombre del usuario con el que se está chateando */}
                    </section>
                    <Chat
                        messages={messages} // Pasa los mensajes al componente Chat
                        user={user} // Pasa el usuario actual al componente Chat
                        loggedUser={loggedUser} // Pasa el usuario logueado al componente Chat
                        onSubmit={handleSubmit} // Pasa la función handleSubmit al componente Chat
                    />
                </Modal>
            )}
        </>
    );
}

export default User; // Exporta el componente User como el componente por defecto
```

### GroupChat.jsx

Este componente representa el chat grupal. Muestra el título del chat y se suscribe al evento `'group-message'` del socket para recibir mensajes grupales. Pasa el estado de mensajes y la función de envío al componente `Chat`.

El componente comienza importando los módulos y componentes necesarios, incluyendo el componente `Chat`. Luego, se define un estado para almacenar los mensajes del chat grupal.

Se utiliza el hook `useEffect` para suscribirse al evento `'group-message'` del socket. Cuando se recibe un mensaje grupal, se añade al estado de mensajes del chat grupal.

El componente también implementa una función para manejar el envío de mensajes grupales. Cuando se envía un mensaje grupal, se emite el evento correspondiente al servidor a través del socket.

Finalmente, se renderiza el título del chat grupal y se pasa el estado de mensajes y la función de envío al componente `Chat`, que se encarga de mostrar los mensajes y proporcionar un formulario para enviar nuevos mensajes.

```jsx
import { useState, useEffect, useRef } from 'react'; // Importa useState, useEffect y useRef desde React
import Chat from './Chat'; // Importa el componente Chat

const GroupChat = ({ loggedUser, socket }) => { // Declara el componente GroupChat que recibe loggedUser y socket como props
    const [messages, setMessages] = useState([]); // Declara un estado para almacenar los mensajes del chat grupal

    useEffect(() => { // Hook de efecto para manejar la suscripción a eventos de socket
        const handleGroupMessage = (data) => { // Función manejadora para el evento 'group-message'
            setMessages(prevMessages => [...prevMessages, data]); // Añade el nuevo mensaje a la lista de mensajes
        };

        socket.on('group-message', handleGroupMessage); // Se suscribe al evento 'group-message' de socket

        return () => socket.off('group-message', handleGroupMessage); // Limpia la suscripción al desmontar el componente
    }, [socket]); // Este efecto se ejecuta solo cuando cambia el socket

    function handleSubmit(data) { // Función para manejar el envío de un mensaje grupal
        socket.emit('group-message', data); // Emite el mensaje grupal a través del socket
    }

    return ( // Renderiza el componente GroupChat
        <div className="group-chat">
            <h2>Chat Grupal</h2> {/* Título de la sección de chat grupal */}
            <Chat
                messages={messages} // Pasa los mensajes al componente Chat
                loggedUser={loggedUser} // Pasa el usuario logueado al componente Chat
                onSubmit={handleSubmit} // Pasa la función handleSubmit al componente Chat
            />
        </div>
    );
};

export default GroupChat; // Exporta el componente GroupChat como el componente por defecto
```

### Chat.jsx

Este componente muestra la lista de mensajes y proporciona un formulario para enviar nuevos mensajes. Se encarga de desplazarse automáticamente al final de la lista de mensajes cuando se recibe un nuevo mensaje.

El componente comienza importando los módulos y hooks necesarios, incluyendo `useEffect` y `useRef`. Luego, se define una referencia para el final de la lista de mensajes utilizando el hook `useRef`.

Se utiliza el hook `useEffect` para desplazarse automáticamente al final de la lista de mensajes cada vez que se recibe un nuevo mensaje. Esto asegura que el usuario siempre vea los mensajes más recientes.

El componente también implementa una función para manejar el envío de mensajes. Cuando se envía un mensaje, se previene el comportamiento predeterminado del formulario, se crea un objeto con el mensaje y el remitente, se llama a la función `onSubmit` pasada como prop y se resetea el formulario.

Además, se implementa una función para determinar la clase CSS del mensaje según el remitente. Esto permite aplicar estilos diferentes a los mensajes enviados y recibidos.

Finalmente, se renderiza la lista de mensajes, donde cada mensaje se muestra con el remitente y el contenido del mensaje. También se proporciona un formulario para enviar nuevos mensajes, que consta de un área de texto y un botón de envío.

```jsx
import { useEffect, useRef } from 'react'; // Importa useEffect y useRef desde React
import "./Chat.css"; // Importa el archivo de estilos CSS para este componente

const Chat = ({ messages, loggedUser, onSubmit }) => { // Declara el componente Chat que recibe messages, loggedUser y onSubmit como props
    const messagesEndRef = useRef(null); // Declara una referencia para el final de la lista de mensajes

    useEffect(() => { // Hook de efecto para desplazarse automáticamente al final de la lista de mensajes
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" }); // Desplaza la vista al final de los mensajes cada vez que cambia la lista de mensajes
    }, [messages]); // Este efecto se ejecuta solo cuando cambia la lista de mensajes

    function handleSubmit(e) { // Función para manejar el envío de un mensaje
        e.preventDefault(); // Previene el comportamiento predeterminado del formulario
        const data = {
            message: e.target.message.value, // Obtiene el valor del mensaje desde el formulario
            from: loggedUser // Establece el remitente del mensaje como el usuario logueado
        };
        onSubmit(data); // Llama a la función onSubmit pasada como prop
        e.target.reset(); // Resetea el formulario después de enviar el mensaje
    }

    function handleMessageClass(message) { // Función para determinar la clase CSS del mensaje
        return message.from === loggedUser ? 'sent' : 'received'; // Asigna 'sent' si el mensaje es del usuario logueado, 'received' en caso contrario
    }

    return ( // Renderiza el componente Chat
        <div className="chat">
            <div className="messages">
                {messages.map((message, index) => ( // Mapea los mensajes y renderiza cada uno
                    <div className={handleMessageClass(message)} key={index}> {/* Asigna una clase CSS basada en el remitente del mensaje */}
                        <p className='from'>{message.from}</p> {/* Muestra el remitente del mensaje */}
                        <p className='message'>{message.message}</p> {/* Muestra el contenido del mensaje */}
                    </div>
                ))}
                <div className="messages-end" ref={messagesEndRef} /> {/* Elemento de referencia para desplazar la vista al final */}
            </div>
            <form onSubmit={handleSubmit} className="chat-form"> {/* Formulario para enviar un mensaje */}
                <textarea type="text" name="message" /> {/* Área de texto para escribir el mensaje */}
                <button type="submit">Enviar</button> {/* Botón para enviar el mensaje */}
            </form>
        </div>
    );
};

export default Chat; // Exporta el componente Chat como el componente por defecto
```

## Ejecución
Para ejecutar el proyecto, se deben seguir los siguientes pasos:
1. Iniciar el servidor backend:
   - Navegar a la carpeta `server`.
   - Ejecutar el comando `npm install` para instalar las dependencias.
   - Ejecutar el comando `npm run dev` para iniciar el servidor.

2. Iniciar el frontend:
   - Navegar a la carpeta raíz del proyecto.
   - Ejecutar el comando `npm install` para instalar las dependencias.
   - Ejecutar el comando `npm run dev` para iniciar la aplicación React.

3. Acceder a la aplicación:
   - Abrir un navegador web y visitar `http://localhost:3000`.
   - Ingresar un nombre de usuario y comenzar a chatear.

## Referencias
- [Documentación de Socket.io](https://socket.io/docs/v4/)
- [Building a Chat App with Socket.io and React | dev.to ](https://dev.to/novu/building-a-chat-app-with-socketio-and-react-2edj)