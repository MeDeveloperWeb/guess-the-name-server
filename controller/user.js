import { createUser, updateUserSocket } from "../utils/user.js";

export async function handleNewUser(username, cb, socketId) {
    try {
        const user = await createUser(username, socketId);
        cb(user);
    } catch (err) {
        console.log(err);
        cb(null, err);
    }
}

export async function handleOldUser(id, socketId) {
    try {
        const user = await updateUserSocket(id, socketId);
        return user;
    } catch (err) {
        console.log(err);
    }
}
