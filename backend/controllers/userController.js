import validator from 'validator'
import bycrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'


// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body

        if (!name || !password || !email) {
            return res.json({ success: false, message: "Missing Details" })
        }
        // validating email
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "enter a valid email" })
        }
        // validating password
        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a strong password (at least 8 characters)" })
        }

        // hashing user passworrd
        const salt = await bycrypt.genSalt(10)
        const hashedPassword = await bycrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, message: "User Registered Successfully", token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


// APi for user login
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body

        // Check if user exists
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" })
        }

        // Compare password
        const isMatch = await bycrypt.compare(password, user.password)
        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


// API to get user profile data
const getProfile = async (req, res) => {

    try {
        const {userId} = req
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}



// API to update user profile data
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId
    const { name, phone, address, dob, gender } = req.body
    const imageFile = req.file

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Missing Details" })
    }

    const updatedAddress = address
      ? typeof address === 'string'
        ? JSON.parse(address)
        : address
      : undefined

    const updateData = {
      name,
      phone,
      dob,
      gender
    }

    if (updatedAddress !== undefined) {
      updateData.address = updatedAddress
    }

    await userModel.findByIdAndUpdate(userId, updateData)

    if (imageFile) {
      const result = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
      const imageUrl = result.secure_url
      await userModel.findByIdAndUpdate(userId, { image: imageUrl })
    }

    res.json({ success: true, message: "Profile Updated Successfully" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}



export { registerUser, loginUser, getProfile, updateProfile }