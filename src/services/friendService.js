// ============================================
// !doneyet — Friend Service (Offline-First)
// ============================================

import { db, isFirebaseConfigured } from '../config/firebase'
import {
  doc, setDoc, getDoc, collection, query, where, getDocs,
  deleteDoc, serverTimestamp, onSnapshot,
} from 'firebase/firestore'

/**
 * Send a friend request
 */
export async function sendFriendRequest(fromUserId, toUserId) {
  if (!isFirebaseConfigured) return { success: false, error: 'Offline mode' }
  try {
    // Create request in both users' friend subcollections
    await setDoc(doc(db, 'users', toUserId, 'friends', fromUserId), {
      userId: fromUserId,
      status: 'pending',
      direction: 'incoming',
      createdAt: serverTimestamp(),
    })
    await setDoc(doc(db, 'users', fromUserId, 'friends', toUserId), {
      userId: toUserId,
      status: 'pending',
      direction: 'outgoing',
      createdAt: serverTimestamp(),
    })
    return { success: true }
  } catch (err) {
    console.warn('Failed to send friend request:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(userId, friendId) {
  if (!isFirebaseConfigured) return { success: false, error: 'Offline mode' }
  try {
    await setDoc(doc(db, 'users', userId, 'friends', friendId), {
      userId: friendId, status: 'accepted', acceptedAt: serverTimestamp(),
    }, { merge: true })
    await setDoc(doc(db, 'users', friendId, 'friends', userId), {
      userId, status: 'accepted', acceptedAt: serverTimestamp(),
    }, { merge: true })
    return { success: true }
  } catch (err) {
    console.warn('Failed to accept request:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Decline/remove a friend
 */
export async function removeFriend(userId, friendId) {
  if (!isFirebaseConfigured) return { success: false, error: 'Offline mode' }
  try {
    await deleteDoc(doc(db, 'users', userId, 'friends', friendId))
    await deleteDoc(doc(db, 'users', friendId, 'friends', userId))
    return { success: true }
  } catch (err) {
    console.warn('Failed to remove friend:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Get friends list with profiles
 */
export async function getFriendsList(userId) {
  if (!isFirebaseConfigured || !userId) return []
  try {
    const q = query(
      collection(db, 'users', userId, 'friends'),
      where('status', '==', 'accepted')
    )
    const snapshot = await getDocs(q)
    const friends = []
    for (const friendDoc of snapshot.docs) {
      const friendData = friendDoc.data()
      const profileSnap = await getDoc(doc(db, 'users', friendData.userId))
      if (profileSnap.exists()) {
        friends.push({ id: friendData.userId, ...profileSnap.data() })
      }
    }
    return friends
  } catch (err) {
    console.warn('Failed to get friends:', err)
    return []
  }
}

/**
 * Get pending friend requests
 */
export async function getPendingRequests(userId) {
  if (!isFirebaseConfigured || !userId) return []
  try {
    const q = query(
      collection(db, 'users', userId, 'friends'),
      where('status', '==', 'pending'),
      where('direction', '==', 'incoming')
    )
    const snapshot = await getDocs(q)
    const requests = []
    for (const reqDoc of snapshot.docs) {
      const reqData = reqDoc.data()
      const profileSnap = await getDoc(doc(db, 'users', reqData.userId))
      if (profileSnap.exists()) {
        requests.push({ id: reqData.userId, ...profileSnap.data() })
      }
    }
    return requests
  } catch (err) {
    console.warn('Failed to get pending requests:', err)
    return []
  }
}

/**
 * Get leaderboard (friends + self, sorted by problems solved)
 */
export async function getLeaderboard(userId) {
  if (!isFirebaseConfigured || !userId) return []
  try {
    const friends = await getFriendsList(userId)
    const selfSnap = await getDoc(doc(db, 'users', userId))
    const self = selfSnap.exists() ? { id: userId, ...selfSnap.data(), isSelf: true } : null

    const board = [...friends, self].filter(u => u && !u.ghostMode)
    board.sort((a, b) => (b.totalSolved || 0) - (a.totalSolved || 0))
    return board
  } catch (err) {
    console.warn('Failed to get leaderboard:', err)
    return []
  }
}

/**
 * Listen to friend requests in real-time
 */
export function listenToFriendRequests(userId, callback) {
  if (!isFirebaseConfigured || !userId) return () => {}
  try {
    const q = query(
      collection(db, 'users', userId, 'friends'),
      where('status', '==', 'pending'),
      where('direction', '==', 'incoming')
    )
    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      callback(requests)
    })
  } catch (err) {
    console.warn('Failed to listen to requests:', err)
    return () => {}
  }
}
