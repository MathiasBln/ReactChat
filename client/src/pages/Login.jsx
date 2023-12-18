import axios from "axios"
import { useContext, useState } from "react"
import { UserContext } from "../context/UserContext"

export const Login = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('Register')

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isLoginOrRegister === 'Login' ? '/login' : '/register';
        const { data } = await axios.post(url, { username, password });
        setLoggedInUsername(username);
        setId(data.id);
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
                <input
                    value={username}
                    onChange={ev => setUsername(ev.target.value)}
                    type="text"
                    placeholder="Username"
                    className="block w-full rounded-sm p-2 mb-2 border" />
                <input
                    value={password}
                    onChange={ev => setPassword(ev.target.value)}
                    type="password"
                    placeholder="password"
                    className="block w-full rounded-sm p-2 mb-2 border" />
                <button className="bg-blue-500 text-white block w-full rounded-sm p-2">{isLoginOrRegister}</button>
                {isLoginOrRegister === 'Register' && (
                    <div>
                        Already a member ? {" "}
                        <button onClick={() => setIsLoginOrRegister('Login')}>
                            Login here
                        </button>
                    </div>
                )}
                {isLoginOrRegister === 'Login' && (
                    <div>
                        Create an account? {" "}
                        <button onClick={() => setIsLoginOrRegister('Register')}>
                            Register here
                        </button>
                    </div>
                )}

            </form>
        </div>
    )
}