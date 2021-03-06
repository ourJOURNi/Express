const express = require("express");
const User = require('../models/user.model');
const bcrypt = require("bcrypt");
const { object } = require("joi");
const router = express.Router();

function createToken(user) {
  console.log('Token is being Created');
  return jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: 200 // 86400 expires in 24 hours
    });
}
exports.getAllUsers = (req, res) => {

  // Returns an Array of Objects that holds each user's name and email
  User.find((err, users) => {
    if(err) return res.status(400).json(err);
    return res.status(200).json(users.map( users => {
      let rObj = {};
      rObj.name = users.fullName;
      rObj.email = users.email;
      rObj.profilePicture = users.profilePicture;
      return rObj;
    }))
  })
}
exports.getUserDetails = (req, res) => {
  // console.log('Searching Database for User Details');
  let email = req.body.email;
  User.findOne({ email }, (err, user) => {
    if (err) {
      console.log('There was an Error')
      return res.status(400).send({ 'msg': err });
    }
    if (!user) {
      console.log('There was no User')
      return res.status(400).json({msg: 'No user with that email' });
    } else
    {
      // console.log('This users details: ' + user)
      return res.status(200).send(user);
    }
  })
}
exports.getTheirDetails = (req, res) => {
  console.log('Searching Database for Their Details');
  let email = req.body.email;
  if (!email) return res.status(400).json({msg: 'there was no email in the request'});

  User.findOne(
    { email },
    (err, user) => {
      if (err)return res.status(400).json(err);
      if (!user)return res.status(400).json({msg: 'No user with that email' });

      const details = user;
      return res.status(200).json(details);
    }
  )
}
exports.changeAbout = (req, res) => {
  console.log(req.body)


    let password = req.body.password;
    let filter = {email: req.body.email};
    let update = {about: req.body.newAbout};

    User.findOne(
      {email: req.body.email},
      (err, user) => {
        if (err) return res.status(400).json({msg: 'there was an err', err})

        if (!user) return res.status(400).json({msg: 'there was no user with that email'})

        user.comparePassword(password, (err, isMatch) => {
          if (isMatch && !err) {
            console.log('Passwords matched!');

            User.updateOne(filter, update)
            .then( data => {
              console.log('Updated About:' + JSON.stringify(data));
              return res.status(200).send(isMatch);
            })
            .catch( err => {
              console.log(err);
              return res.status(400).send('Someone already has that email address');
            })
          } else {
            console.log('Wrong Password');
            return res.status(400).json({ msg: 'Wrong Password' });
          }
        })
      }
    )
}
exports.changePhone = (req, res) => {
  console.log('Attempting to change phone number...')
  console.log(req.body)
    if (!req.body.newPhone || !req.body.password) {
      res.status(400).send('Please enter an phone and password')
    } else {

      let newPhone = req.body.newPhone;
      let email = req.body.email;
      let password = req.body.password;
      let filter = email;
      let update = { phone: newPhone};

      console.log('Finding user ...')
      // Find user, compare password, then update email.
      User.findOne({ email: email}, (err, user) => {
        if (err) {
          return res.status(400).send({ 'msg': err });
        }

        if (!user) {
          return res.status(400).json({ 'msg': 'The user does not exist' });
        }

        if (user.phone === newPhone) {
          return res.status(400).send('Please enter an email address that is different than your current one.');
        }

        console.log('Comparing passwords ...')
        user.comparePassword(password, (err, isMatch) => {
          if (isMatch && !err) {
            console.log('Passwords matched!');
            User.updateOne(filter, update)
            .then( data => {
              console.log('Updated Phone:' + JSON.stringify(data));
              return res.status(200).send(isMatch);
            })
            .catch( err => {
              console.log(err);
              return res.status(400).send('Someone already has that phone address');
            })
          } else {
            console.log('Wrong Password');
            return res.status(400).json({ msg: 'Wrong Password' });
          }
        })
      })
    }
}
exports.changeEmail = (req, res) => {
  console.log(req.body)
    if (!req.body.email || !req.body.password) {
      res.status(400).send('Please enter an email and password')
    } else {

      let oldEmail = req.body.oldEmail;
      let email = req.body.email;
      let password = req.body.password;
      let filter = { email: oldEmail };
      let update = { email: email};

      console.log('Old email: ' + oldEmail);
      console.log('New email: ' + email);

      // Find user, compare password, then update email.
      User.findOne({ email: oldEmail}, (err, user) => {
        if (err) {
          return res.status(400).send({ 'msg': err });
        }

        if (!user) {
          return res.status(400).json({ 'msg': 'The user does not exist' });
        }

        if (user.email === email) {
          return res.status(400).send('Please enter an email address that is different than your current one.');
        }

        user.comparePassword(password, (err, isMatch) => {
          if (isMatch && !err) {
            console.log('Passwords matched!');

            User.updateOne(filter, update)
            .then( data => {
              console.log('Updated Email:' + JSON.stringify(data));
              return res.status(200).send(isMatch);
            })
            .catch( err => {
              console.log(err);
              return res.status(400).send('Someone already has that email address');
            })
          } else {
            console.log('Wrong Password');
            return res.status(400).json({ msg: 'Wrong Password' });
          }
        })
      })
    }
}
exports.changePassword = (req, res) => {
  console.log('request');
  console.log(req.body);

  if ( !req.body.oldPassword || !req.body.newPassword) {
    res.status(400).send('Please enter an old password and a new password')
  }

  else if (req.body.oldPassword === req.body.newPassword) {
    console.log('New Password is the same as old password');
    res.status(400).send('Please enter a password that is different than your old password');
  }

  else if (req.body.reTypeNewPassword !== req.body.newPassword) {
    console.log('Retyped password does not match new password');
    res.status(400).send('Retyped password does not match new password');
  }
    else {

    console.log('Changing passsword..');
    User.findOne({ email: req.body.email }, (err, user) => {
      if (err) {
        return res.status(400).json({ 'msg': err });
      } else {
        console.log(user);

        user.comparePassword(req.body.oldPassword, (err, isMatch) => {

          if (isMatch & !err) {

            // Create new hashed password
            bcrypt.genSalt(10, (err, salt) => {

              if (err) return next(err);

              bcrypt.hash(req.body.newPassword, salt, (err, hash) => {
                console.log('New Password Hashed: ' + hash);
                let newPassword = hash;
                let filter = { password: user.password };
                let update = { password: newPassword }

                User.updateOne(filter, update)
                  .then( data => {
                    console.log('Updated Password: ' + JSON.stringify(data));
                    res.status(200).send(isMatch);
                  })
                  .catch( err => {
                    console.log(err);
                    res.status(400).end('There was an error');
                  })
                })
              })
          } else {
            console.log(isMatch);
            return res.status(200).send('Passwords do not match!');
          }
        })
      }
    })
  }
}
exports.changeAddress = (req, res) => {
  // Find user
  // compare password
  // update user
  const email = req.body.email
  const addressOne = req.body.addressOne;
  const addressTwo = req.body.addressTwo;
  const city = req.body.city;
  const state = req.body.state;
  const zip = req.body.zip;
  const password = req.body.password;

  if (!email || !addressOne || !city || !state || !zip || !password) {
    return res.status(400).send('Please enter an Email, Address 1, City, State, Zip, and Password ');
  } else {

    let filter = { email };
    let update = {
      addressOne,
      addressTwo,
      city,
      state,
      zip
    };

    User.findOne({ email }, (err, user) => {
      if (err) {
        return res.status(400).send({ 'msg': err });
      }

      if (!user) {
        return res.status(400).json({ 'msg': 'The user does not exist' });
      }

      user.comparePassword(password, (err, isMatch) => {
        if (isMatch && !err) {
          console.log('Passwords matched!');

          User.updateOne(filter, update)
          .then( data => {
            console.log('Changed Address to: ' + addressOne + addressTwo + ', ' + city + ', ' + state + ', ' + zip + '.');
            console.log('Updated Address:' + JSON.stringify(data));
            // console.log('isMatch: ' + isMatch);
            return res.status(200).send(isMatch);
          })
          .catch( err => {
            console.log(err);
            return res.status(400).send('There was an error');
          })
        } else {
          console.log('Wrong Password');
          return res.status(400).json({'msg' : 'Wrong Password'})
        }
      })
      console.log(user);
    })
  }
}
exports.changeSchool = (req, res) => {
  console.log(req.body);
  // Find user, compare password, then update email.
  if ( !req.body.newSchool || !req.body.password || !req.body.email || !req.body.newGrade) {
    res.status(400).end('Please enter a new school, a new grade, your password, and your email')
  } else {

      let email = req.body.email;
      let newSchool = req.body.newSchool;
      let newGrade = req.body.newGrade;
      let password = req.body.password;
      let filter = { email };
      let update = { school: newSchool, grade: newGrade};

      User.findOne({ email }, (err, user) => {
        if (err) {
          return res.status(400).send({ 'msg': err });
        }

        if (!user) {
          return res.status(400).json({ 'msg': 'The user does not exist' });
        }

        user.comparePassword(password, (err, isMatch) => {
          if (isMatch && !err) {
            console.log('Passwords matched!');

            User.updateOne(filter, update)
            .then( data => {
              console.log('Changed School to: ' + newSchool);
              console.log('Changed Grade to: ' + newGrade);
              console.log('Updated School & Grade:' + JSON.stringify(data));
              // console.log('isMatch: ' + isMatch);
              res.status(200).send(isMatch);
            })
            .catch( err => {
              console.log(err);
              res.status(400).send('There was an error');
            })
          } else {
            console.log('Wrong Password');
            res.status(400).json({'msg' : 'Wrong Password'})
          }
        })
      })
  }
}
