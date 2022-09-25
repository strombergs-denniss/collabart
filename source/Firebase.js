import { collection, getDocs, addDoc, serverTimestamp, deleteDoc, doc, setDoc } from 'firebase/firestore'

const LINE_COLLECTION = 'lines'

async function getLines(fs) {
    const lineSnapshot = await getDocs(collection(fs, LINE_COLLECTION))
    const lineList = lineSnapshot.docs.map(doc => doc.data())

    return lineList
}

async function getUsers(fs, callback = () => {}) {
    const snapshot = await getDocs(collection(fs, 'users'))
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    callback(list)
}

async function createLine(fs, { uid, data }) {
    const line = await addDoc(
        collection(fs, LINE_COLLECTION),
        {
            uid,
            data,
            timestamp: serverTimestamp()
        }
    )

    return line
}

async function updateLine(fs, id, data) {
    await setDoc(doc(fs, LINE_COLLECTION, id), {
        data
    }, { merge: true })
}

async function deleteLine(fs, id) {
    await deleteDoc(doc(fs, LINE_COLLECTION, id))
}

async function createUser(fs, { uid, name }) {
    console.log(uid, name)

    await setDoc(doc(fs, 'users', uid), {
        name
    })
}

export {
    LINE_COLLECTION,
    getLines,
    createLine,
    deleteLine,
    getUsers,
    updateLine,
    createUser
}
