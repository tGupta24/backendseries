const asyncHandler = (func) => {
    return (req, res, next) => {
        Promise
            .resolve(func(req, res, next))
            .catch((err) =>
                next(err) // pass error to next middleware
            )
    }
}

export default asyncHandler;

/*
// const asyncHandler = (callBack) => {
//     return () => {

//     }
// }
//can be written as

const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req,res,next)

    } catch (err) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}

*/