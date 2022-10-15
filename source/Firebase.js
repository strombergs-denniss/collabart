import { addDoc, collection, deleteDoc, doc, limit, orderBy, query, serverTimestamp, setDoc, startAt } from 'firebase/firestore'

import { createDiff, randomInt } from './Utility'

const USERS_COLLECTION = 'users'
const STORIES_COLLECTION = 'stories'
const LINES_COLLECTION = 'lines'
const PAGE_SIZE = 16

function usersQuery(db) {
    return query(collection(db, USERS_COLLECTION))
}

async function createUser(db, { uid, name }) {
    return await setDoc(doc(db, USERS_COLLECTION, uid), {
        name,
        color: '#ffffff'
    })
}

function storiesQuery(db) {
    return query(collection(db, STORIES_COLLECTION), orderBy('name'))
}

function storyDoc(db, id) {
    return doc(db, STORIES_COLLECTION, id)
}

async function createStory(db, { name, description, inputLimit, players, allowTurnSkip }) {
    return await addDoc(collection(db, STORIES_COLLECTION), {
        name,
        description,
        inputLimit,
        players,
        allowTurnSkip,
        currentPlayer: players[randomInt(0, players.length - 1)]
    })
}

async function updateStory(db, oldStory, newStory) {
    const diff = createDiff(oldStory, newStory)

    return await setDoc(doc(db, `${ STORIES_COLLECTION }/${ oldStory.id }`), diff, { merge: true })
}

async function setNextPlayer(db, storyId, currentPlayer) {
    return await setDoc(doc(db, `${ STORIES_COLLECTION }/${ storyId }`), {
        currentPlayer
    }, { merge: true })
}

function linesQuery(db, id, lastLine, isReverse = false) {
    if (lastLine) {
        if (isReverse) {
            return query(collection(db, `${ STORIES_COLLECTION }/${ id }/${ LINES_COLLECTION }`), orderBy('timestamp', 'asc'), limit(PAGE_SIZE), startAt(lastLine))
        }

        return query(collection(db, `${ STORIES_COLLECTION }/${ id }/${ LINES_COLLECTION }`), orderBy('timestamp', 'desc'), limit(PAGE_SIZE), startAt(lastLine))
    }

    return query(collection(db, `${ STORIES_COLLECTION }/${ id }/${ LINES_COLLECTION }`), orderBy('timestamp', 'desc'), limit(PAGE_SIZE))
}

function lastLineQuery(db, id) {
    return query(collection(db, `${ STORIES_COLLECTION }/${ id }/${ LINES_COLLECTION }`), orderBy('timestamp', 'desc'), limit(1))
}

async function createLine(db, storyId, { uid, data }) {
    return await addDoc(
        collection(db, `${ STORIES_COLLECTION }/${ storyId }/${ LINES_COLLECTION }`),
        {
            uid,
            data,
            timestamp: serverTimestamp()
        }
    )
}

async function updateLine(db, storyId, id, data) {
    return await setDoc(doc(db, `${ STORIES_COLLECTION }/${ storyId }/${ LINES_COLLECTION }`, id), {
        data
    }, { merge: true })
}

async function deleteLine(db, storyId, id) {
    return await deleteDoc(doc(db, `${ STORIES_COLLECTION }/${ storyId }/${ LINES_COLLECTION }`, id))
}

export {
    createLine,
    createStory,
    createUser,
    deleteLine,
    lastLineQuery,
    linesQuery,
    PAGE_SIZE,
    setNextPlayer,
    storiesQuery,
    storyDoc,
    updateLine,
    updateStory,
    usersQuery
}
