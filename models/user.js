const { Schema, model } = require('mongoose');
const { createHmac, randomBytes } = require('crypto');
const { createTokenForUser } = require('../services/authentication');

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageURL: {
        type: String,
        default: "/images/default.png",
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    },
}, { timestamps: true });

// Pre-save hook to hash password
userSchema.pre('save', function (next) {
    const user = this;

    if (!user.isModified('password')) return next();

    const salt = randomBytes(16).toString('hex');
    const hashedPassword = createHmac('sha256', salt)
        .update(user.password)
        .digest('hex');

    user.salt = salt;
    user.password = hashedPassword;

    next();
});

// Static method for password verification
userSchema.static("matchPasswordAndGenerateToken", async function (email, password) {
    const user = await this.findOne({ email });

    if (!user) throw new Error('User not found!');

    const salt = user.salt;
    const hashedPassword = user.password;
    const userProvidedHash = createHmac('sha256', user.salt)
        .update(password)
        .digest('hex');

    if (user.password !== userProvidedHash) {
        throw new Error('Incorrect password');
    }
    const token = createTokenForUser(user);
    return token;
});

const User = model('user', userSchema);
module.exports = User;