const fs = require('fs')

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
)

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'success',
    requestedAt: req.requestedTime,
    results: users.length,
    data: {
      users
    }
  })
}

exports.getUser = (req, res) => {
  const id = req.params.id * 1

  const user = users.find(el => el.id === id)
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  })
}

exports.createUser = (req, res) => {
  const newId = users[users.length - 1].id + 1
  const newUser = Object.assign({ id: newId }, req.body)

  users.push(newUser)
  fs.writeFile(
    `${__dirname}/../dev-data/data/users.json`,
    JSON.stringify(users),
    res.status(201).json({
      success: 'success',
      data: {
        user: newUser
      }
    })
  )
}

exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined!' })
}
exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined!' })
}
