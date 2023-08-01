import { useSelector } from "react-redux"
import { selectPostById } from "./postsSlice"

import PostAuthor from "./PostAuthor"
import TimeAgo from "./TimeAgo"
import ReactionButtons from "./ReactionButtons"

import { useParams } from "react-router-dom"

const SinglePostpage = () => {
  const { postId }= useParams()

  const post = useSelector((state) => selectPostById(state, Number(postId)))

  if (!post) {
    return (
      <section>
          <h2>Post not found!</h2>
      </section>
    )
  }

  return (
    <article>
      <h3>{post.title}</h3>
      <p>{post.body.substring(0 ,75)}...</p>
      <p className="postCredit">
        <PostAuthor userId={post.userId}/>
        <TimeAgo timestamp={post.date}/>
      </p>
      <ReactionButtons post={post} />
    </article>
  )
}
export default SinglePostpage