import { collection, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore'

async function getLines(fs) {
    const lineSnapshot = await getDocs(collection(fs, 'lines'))
    const lineList = lineSnapshot.docs.map(doc => doc.data())

    return lineList
}

async function createLine(fs, { data }) {
    const line = await addDoc(
        collection(fs, 'lines'),
        {
            data,
            timestamp: serverTimestamp()
        }
    )

    return line
}

async function deleteLine(fs, id) {
    await deleteDoc(doc(fs, 'lines', id))
}

export {
    getLines,
    createLine,
    deleteLine
}
