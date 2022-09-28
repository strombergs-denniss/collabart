import { addDoc, collection, deleteDoc, doc, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore'

const userQuery = db => query(collection(db, 'users'), where('order', '>', -1), orderBy('order'))

const storiesQuery = db => query(collection(db, 'stories'), orderBy('name'))

const storyQuery = (db, id) => doc(db, 'stories', id)

const linesQuery = (db, id) => query(collection(db, `stories/${ id }/lines`), orderBy('timestamp'))

const createStory = async (db, { name, description, inputLimit, players }) => {
    return await addDoc(collection(db, 'stories'), {
        name,
        description,
        inputLimit,
        players
    })
}

async function createLine(db, storyId, { uid, data }) {
    console.log(storyId, uid, data)

    const line = await addDoc(
        collection(db, `stories/${ storyId }/lines`),
        {
            uid,
            data,
            timestamp: serverTimestamp()
        }
    )

    return line
}

async function updateLine(db, storyId, id, data) {
    return await setDoc(doc(db, `stories/${ storyId }/lines`, id), {
        data
    }, { merge: true })
}

async function deleteLine(db, storyId, id) {
    return await deleteDoc(doc(db, `stories/${ storyId }/lines`, id))
}

async function createUser(db, { uid, name }) {
    return await setDoc(doc(db, 'users', uid), {
        name,
        order: 0,
        color: '#000000'
    })
}

export {
    userQuery,
    storiesQuery,
    storyQuery,
    createStory,
    linesQuery,
    createLine,
    updateLine,
    deleteLine,
    createUser
}
