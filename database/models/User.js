const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
   {
      username: {
         type: String,
         lowercase: true,
         required: [true, "can't be blank"],
         unique: true,
         match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
         index: true
      },
      email: {
         type: String,
         lowercase: true,
         required: [true, "can't be blank"],
         unique: true,
         match: [/\S+@\S+\.\S+/, 'is invalid'],
         index: true
      },
      fullName: { type: String, required: true },
      role: { type: String, lowercase: true, required: true },
      avatar: { type: String, required: true },
      hash: String
   },
   { timestamps: true }
);

UserSchema.plugin(uniqueValidator, { message: 'is already taken' });

UserSchema.methods.setPassword = async function setPassword(password) {
   await bcrypt.hash(password, 10).then(hash => {
      this.hash = hash;
   });
};

UserSchema.methods.isValidPassword = async function validPassword(password) {
   return bcrypt.compare(password, this.hash).then(res => res);
};

UserSchema.methods.generateJWT = function generateJWT() {
   const today = new Date();
   const exp = new Date(today);
   exp.setDate(today.getDate() + 7);

   return jwt.sign(
      {
         id: this._id,
         username: this.username,
         email: this.email,
         fullName: this.fullName,
         role: this.role,
         avatar: this.avatar,
         exp: parseInt(exp.getTime() / 1000)
      },
      process.env.JWT_SECRET
   );
};

UserSchema.methods.toAuthJSON = function toAuthJSON() {
   return {
      username: this.username,
      email: this.email,
      role: this.role,
      token: this.generateJWT(),
      fullName: this.fullName
   };
};

module.exports = mongoose.model('User', UserSchema);
