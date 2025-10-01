import { create } from 'zustand'
import { Friend } from '../collections/types'
export const useFriends = create((set) => ({
  friends: [] as Friend[],
  setFriends: (friends:Friend[]) => set({friends})
}))

