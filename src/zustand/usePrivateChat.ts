import { create } from 'zustand'
import { PrivateChatAccount } from '../collections/types'
export const usePrivateChatAccount = create((set) => ({
  privateChatAccount: {
    name:'',
    email:'',
    photoURL:''
  },
  setPrivateChatAccount: (privateChatAccount:PrivateChatAccount) => set({privateChatAccount})
}))

export const useInboxHidden = create((set) => ({
  inboxHidden: true,
  setInboxHidden: (inboxHidden:boolean) => set({inboxHidden})
}))


