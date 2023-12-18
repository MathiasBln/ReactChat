import { useContext, useEffect, useState } from "react"
import { Avatar } from "../components/Avatar";
import { UserContext } from "../context/UserContext";
import { uniqBy } from "lodash";

export const Chat = () => {
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const { username, id } = useContext(UserContext);
    const [newMessage, setNewMessage] = useState("");
    const [allMessages, setAllMessages] = useState([]);

    const showOnlinePeoples = (peopleArray) => {
        const people = {};
        peopleArray.forEach(({ userId, username }) => {
            people[userId] = username;
        });
        setOnlinePeople(people);
    }

    const handleMessage = (ev) => {
        const messageData = JSON.parse(ev.data);
        console.log({ ev, messageData })
        if ('online' in messageData) {
            showOnlinePeoples(messageData.online);
        } else if ('message' in messageData) {
            setAllMessages(prev => ([...prev, { ...messageData }]))
        }
    }

    const onlinePeopleExceptMe = { ...onlinePeople };
    delete onlinePeopleExceptMe[id]

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:4000")
        setWs(ws);
        ws.addEventListener("message", handleMessage)
    }, [])

    const sendMessage = (ev) => {
        ev.preventDefault();
        ws.send(JSON.stringify({
            to: selectedUserId,
            message: newMessage
        }))
        setNewMessage("");
        setAllMessages(prev => ([...prev, {
            message: newMessage,
            sender: id,
            recipient: selectedUserId,
            id: Date.now(),
        }]));
    }

    const messagesWithoutDupes = uniqBy(allMessages, 'id')

    return (
        <div className="flex h-screen">
            <div className="bg-white w-1/4">
                <div className="p-2 mb-4 pl-4 pt-4">Logo</div>
                {Object.keys(onlinePeopleExceptMe).map((userId) => (
                    <div key={userId}
                        onClick={() => setSelectedUserId(userId)}
                        className={"border-b border-gray-100 flex " + (userId === selectedUserId && 'bg-blue-100')}>
                        {userId === selectedUserId && (
                            <div className="w-1 bg-blue-700 h-12 " />
                        )}
                        <div className=" p-2 pl-4 flex gap-4 items-center">
                            <Avatar username={onlinePeople[userId]} userId={userId} />
                            <p>{onlinePeople[userId]}</p>
                        </div>

                    </div>
                ))}
            </div>
            <div className=" flex flex-col bg-blue-50 w-3/4 p-2">
                <div className="flex-grow">
                    {!selectedUserId && (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-2xl text-gray-400">Select a user to start chat</p>
                        </div>
                    )}
                    {selectedUserId && (
                        <div>
                            {messagesWithoutDupes.map(m => (
                                <div>
                                    {m.sender === id ? (
                                        <div className="flex justify-end">
                                            <div className="bg-blue-500 text-white p-2 rounded">
                                                {m.message}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-start">
                                            <div className="bg-white p-2 rounded">
                                                {m.message}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {selectedUserId && (
                    <form className="flex gap-2 mx-2" onSubmit={sendMessage}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(ev) => setNewMessage(ev.target.value)}
                            placeholder="Type your message"
                            className='bg-white border p-2 flex-grow border rounded'
                        />
                        <button type='submit' className="bg-blue-500 p-2 text-white rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send-horizontal">
                                <path d="m3 3 3 9-3 9 19-9Z" /><path d="M6 12h16" />
                            </svg>
                        </button>
                    </form>
                )}
            </div>
        </div >
    )
}