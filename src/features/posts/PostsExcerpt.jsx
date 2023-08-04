/* eslint-disable react/prop-types */
import PostAuthor from "./PostAuthor"
import TimeAgo from "./TimeAgo"
import ReactionButtons from "./ReactionButtons"

import { Link } from "react-router-dom"
import React from "react"

// for .memo we change the component in 'let'
let PostsExcerpt = ({ post }) => {
  return (
    <article>
      <h3>{post.title}</h3>
      <p className="excerpt">{post.body.substring(0 ,75)}...</p>
      <p className="postCredit">
        <Link to={`post/${post.id}`}>View post</Link>
        <PostAuthor userId={post.userId}/>
        <TimeAgo timestamp={post.date}/>
      </p>
      <ReactionButtons post={post} />
    </article>
  )
}

// React.memo allows the component to not re-render if the prop that is passed not change
PostsExcerpt = React.memo(PostsExcerpt)
export default PostsExcerpt