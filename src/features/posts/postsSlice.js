import { 
  createSlice, 
  createAsyncThunk, 
  createSelector,
  createEntityAdapter
} from "@reduxjs/toolkit";
import { sub } from "date-fns";
import axios from "axios";

const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';

// Normalization means "no duplication of data"
// Normalize state shape :
// An object with ids array & entities objects that contains all the items
// {
//   posts: {
//     ids: [1, 2, 3,...],
//     entities: {
//       '1': {
//         userId: 1,
//         id: 1,
//         title: "..."
//       },
//       ...
//     }
//   }
// }

const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date)
})

// the adaptater creates automatically a normalize state with getInitialState
// so we don't need to specify posts: []
const initialState = postsAdapter.getInitialState({
    status: 'idle', //'idle | 'loading' | 'succeeded' | 'failed'
    error: null,
    count: 0
  })

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async() => {
  try {
    const response = await axios.get(POSTS_URL)
    return response.data
  } catch(error) {
    return error.message
  }
})

export const addNewPost = createAsyncThunk('posts/addNewPost', async (initialPost) => {
  try {
    const response = await axios.post(POSTS_URL, initialPost)
    return response.data
  } catch(err) {
    return err.message
  }
})

export const updatePost = createAsyncThunk('posts/updatePost', async (initialPost) => {
  const { id } = initialPost;
  try {
    const response = await axios.put(`${POSTS_URL}/${id}`, initialPost)
    return response.data
  } catch(err) {
    //return err.message
    return initialPost //only for testing Redux! 
  }
})

export const deletePost = createAsyncThunk('posts/delePost', async(initialPost) => {
  const { id } = initialPost;
  try {
    const response = await axios.delete(`${POSTS_URL}/${id}`)
    if(response?.status === 200) return initialPost
    return `${response?.status}: ${response?.statusText}`
  } catch (err) {
    return err.message
  }
})

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    reactionAdded(state, action) {
        const { postId, reaction } = action.payload
        const existingPost = state.entities[postId]
        if(existingPost) {
          existingPost.reactions[reaction]++ 
        }
    },
    increaseCount (state) {
        state.count = state.count + 1
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Adding date and reactions
        let min = 1;
        const loadedPosts = action.payload.map(post => {
            post.date = sub(new Date(), { minutes: min++ }).toISOString();
            post.reactions = {
                thumbsUp: 0,
                wow: 0,
                heart: 0,
                rocket: 0,
                coffee: 0
            }
            return post;
        });

        // Add any fetched posts to the array
        //state.posts = [...loadedPosts]
        // the Adapter has his own CRUD methods like upsertmany
        postsAdapter.upsertMany(state, loadedPosts)
    })
    .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
    })
    .addCase(addNewPost.fulfilled, (state, action) => {
        // Fix for API post IDs:
        // Creating sortedPosts & assigning the id 
        // would be not be needed if the fake API 
        // returned accurate new post IDs
        const sortedPosts = state.posts.sort((a, b) => {
            if (a.id > b.id) return 1
            if (a.id < b.id) return -1
            return 0
        })
        action.payload.id = sortedPosts[sortedPosts.length - 1].id + 1;
        // End fix for fake API post IDs 

        action.payload.userId = Number(action.payload.userId)
        action.payload.date = new Date().toISOString();
        action.payload.reactions = {
            thumbsUp: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0
        }
        console.log(action.payload)
        //state.posts.push(action.payload)
        postsAdapter.addOne(state, action.payload)
      })
    .addCase(updatePost.fulfilled, (state, action) => {
      if(!action.payload?.id) {
        console.log('Update could not complete');
        console.log(action.payload);
        return
      }
      //const { id } = action.payload
      action.payload.date = new Date().toISOString()
      //const posts = state.posts.filter( post => post.id !== id)
      // we update the state with all the previous posts & pass the new post
      //state.posts = [...posts, action.payload]
      postsAdapter.upsertOne(state, action.payload)
    })
    .addCase(deletePost.fulfilled, (state, action) => {
      if(!action.payload?.id) {
        console.log('Delete could not complete');
        console.log(action.payload);
        return
      }
      const { id } = action.payload
      //const posts = state.posts.filter( post => post.id !== id)
      // we update the state with all the previous posts, except the post selected
      //state.posts = posts
      postsAdapter.removeOne(state, id)
    })
  }
})

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds
  // Pass in a selector that returns the posts slice of state
} = postsAdapter.getSelectors(state => state.posts)

// Action creators are generated for each case reducer function
//export const selectAllPosts = (state) => state.posts.posts
export const getPostsStatus = (state) => state.posts.status
export const getPostsError = (state) => state.posts.error
export const getCount = (state) => state.posts.count

// export const selectPostById = (state, postId ) => 
//   state.posts.posts.find(post => post.id === postId)

// createSelector is a memoize selector. 
// It accept 1 or more input function. There are inside of brackets
// the return of their functions are the dependencies (like in useEffect)
// They provide the input parameters for the output function (posts, userId)
// the selector will re-run only if posts or userId change 
export const selectPostsByUser = createSelector(
  [selectAllPosts, (state, userId) => userId],
  (posts, userId) => posts.filter(post => post.userId === userId)
)

export const { increaseCount, reactionAdded } = postsSlice.actions

export default postsSlice.reducer