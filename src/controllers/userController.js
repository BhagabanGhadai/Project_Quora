const userModel = require("../models/userModel");
const validator = require('../validator/validator')


/*********************************************************Register User***********************************************/

const registerUser = async (req, res) => {
    try {
        let data = req.body;
        let { fname, lname, email, phone, password } = data;

        if (!Object.keys(data).length) {
            return res.status(400).send({ status: false, message: "Please provide the user's details to register."})
        }

        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: "Please provide the user's first name.", });
        }

        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: "Please provide the user's last name.", });
        }

        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "Please provide the user's Email-Id.", });
        }

        if (!!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/).test(email)) {
            return res.status(400).send({ status: false, message: `${email} is an invalid email!` })
        }

        const checkEmailId = await userModel.findOne({ email });
        if (checkEmailId) {
            return res.status(400).send({ status: false, message: `${email} is alraedy registered. Please try another Email id.`, })
        }

        if (phone) {

            if (!(/^(\+\d{1,3}[- ]?)?\d{10}$/).test(data.phone)) {
                return res.status(400).send({ status: false, message: `${phone} is an invalid phone.` })}
        }

        const checkPhone = await userModel.findOne({ phone: phone });
        if (checkPhone) {
            return res.status(400).send({ status: false, message: `${phone} is already registered` })
        }

        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: `Please provide Valid password.` })
        }

        if (password.trim().length < 8 || password.trim().length > 15) {
            return res.status(400).send({ status: false, message: `Password must be of 8-15 characters.` })
        }

        const encryptedPassword = await bcrypt.hash(password, saltRounds); 

        //object destructuring for response body.
        // const userDetails = {
        //     fname,
        //     lname,
        //     email,
        //     phone,
        //     password: encryptedPassword,
        // };
        data.password=encryptedPassword

        const saveUserData = await userModel.create(data);
        return res.status(201).send({ status: true, message: `Registration successfull.`, data: saveUserData, });

    } catch (err) {
        return res.status(500).send({ Error: err.message });
    }
}

/*******************************************************LogIn User*******************************************************/

const loginUser = async (req, res) => {

    try {

        const data = req.body;
        const { email, password } = data;

        if (!Object.keys(data).length) {
            return res.status(400).send({ status: false, message: "Please provide login details.", })
        }

        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "Please provide the user's Email id.", });
        }

        if (!!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/).test(email)) {
            return res.status(400).send({ status: false, message: `${email} is an invalid email!` })
        }

        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: ` Please provide user's password.` })
        }

        if (password.trim().length < 8 || password.trim().length > 15) {
            return res.status(400).send({ status: false, message: `Password must be of 8-15 characters.` })
        }

        const findUser = await userModel.findOne({ email });

        if (!findUser) {
            return res.status(401).send({ status: false, message: `Login failed! Email id is incorrect.` })
        }

        let hashedPassword = findUser.password;
        const encryptedPassword = await bcrypt.compare(password, hashedPassword); 

        if (!encryptedPassword)
            return res.status(401).send({ status: false, message: `Login failed! password is incorrect.`, });

        const userId = findUser._id;
        const token = await jwt.sign(
            {
                userId: userId,
                iat: Math.floor(Date.now() / 1000), 
                exp: Math.floor(Date.now() / 1000) + 3600 * 24, 
            }, "IJBIJB893OOH89HSIF8989FN");

        return res.status(200).send({ status: true, message: `Successfully logged in.`, data: token });

    } catch (err) {
        return res.status(500).send({ Error: err.message });
    }
};


/*****************************************************Get User Details*************************************************/

const getUserProfile = async (req, res) => {

    try {
        const userId = req.params.userId;

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId " })
        }

        const findUserProfile = await userModel.findOne({ _id: userId });

        if (!findUserProfile) {

            return res.status(400).send({ status: false, message: `User doesn't exists by ${userId}` })
        }

        return res.status(200).send({ status: true, message: `profile found successfully.`, data: findUserProfile })

    } catch (err) {

        return res.status(500).send({ Error: err.message });

    }
};


/***************************************************Update User Details***********************************************/

const updateUserProfile = async (req, res) => {

    try {

        let userId = req.params.userId;
        let data = req.body;

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId" });
        }

        const findUserProfile = await userModel.findOne({ _id: userId });

        if (!findUserProfile) {
            return res.status(400).send({ status: false, message: `${userId}=> No such User Found` })
        }

        if (!Object.keys(data).length) {
            return res.status(400).send({ status: false, message: "Empty request cannot be processed. Please provide the user's details to register.", })
        }

        if (!validator.isValid(data.fname)) {
            return res.status(400).send({ status: false, message: "Please provide the user's fname.", });
        }

        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: "Please provide the user's lname.", });
        }

        if (data.email) {
            if (!!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/).test(data.email)) {
                return res.status(400).send({ status: false, message: `${data.email} is an invalid email!` })
            }

            const checkEmailId = await userModel.findOne({ email: data.email });
            if (checkEmailId) {
                return res.status(400).send({ status: false, message: `${data.email} is alraedy registered`, })
            }
        }

        if (data.phone) {
            if (!(/^(\+\d{1,3}[- ]?)?\d{10}$/).test(data.phone)) {
                return res.status(400).send({ status: false, message: `${data.phone} is an invalid phone.` })
            }
        }

        const checkPhone = await userModel.findOne({ phone: data.phone });
        if (checkPhone) {
            return res.status(400).send({ status: false, message: `${data.phone} is already registered` })
        }

        let changedUserDetails = await userModel.findOneAndUpdate(
            { _id: userId },
            { $set: { fname: fname, lname: lname, email: email, phone: phone } },
            { new: true })

        return res.status(200).send({ status: true, data: changedUserDetails })

    } catch (err) {

        return res.status(500).send({ Error: err.message });
    }
};


module.exports = { registerUser, loginUser, getUserProfile,updateUserProfile }