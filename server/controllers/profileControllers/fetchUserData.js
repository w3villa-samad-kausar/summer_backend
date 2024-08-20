const {getUserById}=require('../../queries/profileQueries')

const getUserData = async (req, res) => {
    try {
        const userId = req.user.email;
        console.log(userId)
        const user =  getUserById(userId,(err,result)=>{
            if(err){
                console.log(err)

            }
            else{
                console.log(result)
                res.status(200).json(result);
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' ,err});
    }
};

module.exports = {
    getUserData,
};