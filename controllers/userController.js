const fs = require('fs')

const users = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/users.json`))

exports.getAllUsers = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: {
      users
    }
  });
};


exports.getUser = (req, res) => {
    console.log(req.params);

    // Trick to convert string to number
    const id = req.params.id * 1;
    const user = users.find(el => el.id === id);

    res.status(200).json({
      status : 'success',
      data : {
        user
      }
    });
};

// Similar to all routes in Tours 

exports.createUser = (req, res) => {
    res.status(500).json({status: 'error', message: 'This route is not yet defined!'})
}
exports.updateUser = (req, res) => {
    res.status(500).json({status: 'error', message: 'This route is not yet defined!'})
}
exports.deleteUser = (req, res) => {
    res.status(500).json({status: 'error', message: 'This route is not yet defined!'})
}
