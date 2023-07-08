import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
  id: String,
  title: String,
  author: String,
  content: String,
  created: Date,
  updated: Date,
})

const Post = mongoose.model('Post', postSchema)

export default Post