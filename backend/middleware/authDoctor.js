import jwt from "jsonwebtoken"



// doctor authentication middleware
const authDoctor = async (req, res, next) => {
    try {
        const { dtoken } = req.headers

        if (!dtoken) {
            return res.json({ success: false, message: "Unauthorized" })
        }

        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)

        const docId = token_decode.id || token_decode.doctorId
        req.docId = docId
        req.body = req.body || {}
        req.body.docId = docId

        next()

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default authDoctor;
