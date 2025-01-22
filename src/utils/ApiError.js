// apierror is custom class to provide better error handling for apis

// we explicitily use this class to catch the error 


class ApiError extends Error {

    // jaha bhi error throw karenge vaha ek obj banayenge new ApiError name se and constuctor me sabhi bhej denge
    constructor(
        statusCode, //http status code for the error 
        message = "something went wrong", // message
        errors = [],// 
        stack = ""  // it is the stacktrace where the error occurs in the code
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }

}

export default ApiError;