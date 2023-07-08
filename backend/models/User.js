import { ObjectId } from 'mongodb'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  id: ObjectId,
  username: String,
  password: String,
})

const User = mongoose.model('User', userSchema)

export default User 