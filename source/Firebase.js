import { collection, getDocs, addDoc, serverTimestamp, deleteDoc, doc, setDoc } from 'firebase/firestore'

async function getLines(fs) {
    const lineSnapshot = await getDocs(collection(fs, 'lines'))
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
        collection(fs, 'lines'),
        {
            uid,
            data,
            timestamp: serverTimestamp()
        }
    )

    return line
}

async function updateLine(fs, id, data) {
    await setDoc(doc(fs, 'lines', id), {
        data
    }, { merge: true })
}

async function deleteLine(fs, id) {
    await deleteDoc(doc(fs, 'lines', id))
}

async function createUser(fs, { uid, name }) {
    console.log(uid, name)

    await setDoc(doc(fs, 'users', uid), {
        name
    })
}

export {
    getLines,
    createLine,
    deleteLine,
    getUsers,
    updateLine,
    createUser
}
