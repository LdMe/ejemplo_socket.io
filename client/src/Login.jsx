

const Login = ({ setUser }) => {

    function handleSubmit(e) {
        e.preventDefault()
        setUser(e.target.username.value)
    }
    return (
        <div className="login">
            <h1>Introduce tu nombre de usuario</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" name="username" />
                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default Login