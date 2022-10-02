import { addDoc, collection, deleteDoc, doc, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore'

import { randomInt } from './Utility'

function usersQuery(db) {
    return query(collection(db, 'users'), where('order', '>', -1), orderBy('order'))
}

async function createUser(db, { uid, name }) {
    return await setDoc(doc(db, 'users', uid), {
        name,
        order: 0,
        color: '#000000'
    })
}

function storiesQuery(db) {
    return query(collection(db, 'stories'), orderBy('name'))
}

function storyDoc(db, id) {
    return doc(db, 'stories', id)
}

async function createStory(db, { name, description, inputLimit, players, allowTurnSkip }) {
    return await addDoc(collection(db, 'stories'), {
        name,
        description,
        inputLimit,
        players,
        allowTurnSkip,
        currentPlayer: players[randomInt(0, players.length - 1)]
    })
}

async function setNextPlayer(db, storyId, currentPlayer) {
    return await setDoc(doc(db, `stories/${ storyId }`), {
        currentPlayer
    }, { merge: true })
}

function linesQuery(db, id) {
    return query(collection(db, `stories/${ id }/lines`), orderBy('timestamp'))
}

async function createLine(db, storyId, { uid, data }) {
    return await addDoc(
        collection(db, `stories/${ storyId }/lines`),
        {
            uid,
            data,
            timestamp: serverTimestamp()
        }
    )
}

async function updateLine(db, storyId, id, data) {
    return await setDoc(doc(db, `stories/${ storyId }/lines`, id), {
        data
    }, { merge: true })
}

async function deleteLine(db, storyId, id) {
    return await deleteDoc(doc(db, `stories/${ storyId }/lines`, id))
}

export {
    createLine,
    createStory,
    createUser,
    deleteLine,
    linesQuery,
    setNextPlayer,
    storiesQuery,
    storyDoc,
    updateLine,
    usersQuery}
