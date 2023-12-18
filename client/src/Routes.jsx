import { useContext } from "react";
import { Login } from "./pages/Login"
import { UserContext } from "./context/UserContext";
import { Chat } from "./pages/Chat";

export const Routes = () => {
    const { username, id } = useContext(UserContext);

    if (username && id) {
        return <Chat />;
    }
    return (
        <Login />
    )
}
