/* eslint-disable react/prop-types */
import PostAuthor from "./PostAuthor"
import TimeAgo from "./TimeAgo"
import ReactionButtons from "./ReactionButtons"

const PostsExcerpt = ({ post }) => {
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
export default PostsExcerpt