// defining async utility, this replaces the try catch needed for async functions
module.exports = func => { //pass in func
    //returns a new function and catches any errors to pass to next
    return (req,res,next) => {
        func(req,res,next).catch(next) 
    }
}