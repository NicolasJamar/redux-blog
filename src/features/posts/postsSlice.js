import { createSlice, nanoid, createAsyncThunk } from "@reduxjs/toolkit";
import { sub } from "date-fns";
import axios from "axios";

const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';

const initialState = {
  posts: [],
  status: 'idle', //'idle | 'loading' | 'succeeded' | 'failed'
  error: null
}

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      reducer(state, action) {
        state.posts.push(action.payload)
      },
      prepare(title, content, userId) {
        return {
          payload: {
            id: nanoid(), 
            title, 
            content,
            userId,
            date: new Date().toISOString(),
            reactions: {
              thumbsUp: 0,
              wow: 0,
              heart: 0,
              rocket: 0,
              coffee: 0
            }
          }
        }
      } 
    },
    reactionAdded: {
      reducer(state, action) {
        const { postId, reaction } = action.payload
        const existingPost = state.posts.find( post => post.id === postId)
        if(existingPost) {
          existingPost.reactions[reaction]++ 
        }
      }
    }
  },
})

// Action creators are generated for each case reducer function
export const selectAllPosts = (state) => state.posts.posts

export const { postAdded, reactionAdded } = postsSlice.actions

export default postsSlice.reducer