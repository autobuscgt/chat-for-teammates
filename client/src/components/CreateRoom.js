import { useAuth } from "../hooks/useAuth";

function CreateRoom() {
    const {user} = useAuth();
    return (
        <div>
            <form>
                <input/>
                <input/>
                <input/>
            </form>
        </div>  
);
}

export default CreateRoom;