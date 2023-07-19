class ExpressError extends Error {
    constructor(message,satusCode){
        super();
        this.message=message;
        this.satusCode=satusCode
    } 
}

module.exports =ExpressError;