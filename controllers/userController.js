const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const dbConnection = require("../utils/dbConnection");
const helper_general = require("../helpers/general");
// Home Page
let getUserInfo = (user_id) => {
    return new Promise((resolve, reject)=>{
        dbConnection.execute("SELECT * FROM `users` WHERE `id`=?", [user_id]).then((row) => {
            row = JSON.parse(JSON.stringify(row));
            row[0][0]['image_original_path'] = (row[0][0].image!='')?process.env.BASE_URL+'/uploads/user/'+row[0][0].image:process.env.BASE_URL+'/assets/profile/dummy-profile-image.jpg';
            row[0][0]['image_thumb_path'] = (row[0][0].image!='')?process.env.BASE_URL+'/uploads/user/thumb/'+row[0][0].image:process.env.BASE_URL+'/assets/profile/dummy-profile-image.jpg';
            resolve(row[0][0]);
        }, (err) => {
            reject(err);
        })
    })
};

exports.homePage = async (req, res, next) => {
    res.render('home', {
        title: 'Welcome to Axces | Dashboard',
        page_title: 'Dashboard'
    });
}

// Register Page
exports.registerPage = (req, res, next) => {
            res.render('register', {
                title: 'Welcome to Axces | Register'
            });
        };

    // User Registration
    exports.register = async (req, res, next) => {
        const errors = validationResult(req);
        const { body } = req;

        if (!errors.isEmpty()) {
            return res.render('register', {
                error: errors.array()[0].msg,
                title: 'Welcome to Axces | Register'
            });
        }

        try {

            const [row] = await dbConnection.execute(
                "SELECT * FROM `users` WHERE `email`=?",
                [body._email]
            );

            if (row.length >= 1) {
                return res.render('register', {
                    error: 'This email already in use.',
                    title: 'Welcome to Axces | Register'
                });
            }

            const hashPass = await bcrypt.hash(body._password, 12);

            const [rows] = await dbConnection.execute(
                "INSERT INTO `users`(`role`,`name`,`email`,`phone`,`password`) VALUES(?,?,?,?,?)",
                ['admin', body._name, body._email, body._phone, hashPass]
            );

            if (rows.affectedRows !== 1) {
                return res.render('register', {
                    error: 'Your registration has failed.',
                    title: 'Welcome to Axces | Register'
                });
            }

            res.render("register", {
                msg: 'You have successfully registered.',
                title: 'Welcome to Axces | Register'
            });

        } catch (e) {
            next(e);
        }
    };

    // Login Page
    exports.loginPage = (req, res, next) => {
        res.render('login', {
            title: 'Welcome to Axces | Login'
        });
    };

    // Login User
    exports.login = async (req, res, next) => {

        const errors = validationResult(req);
        const { body } = req;
        let user;
        if (!errors.isEmpty()) {
            return res.render('login', {
                error: errors.array()[0].msg,
                title: 'Welcome to Axces | Login'
            });
        }

        try {
            var errorMessage = '';
            await helper_general.getOtherUserDetailByEmail(body._email).then(async (row)=>{
              if (row.role !== 'admin') {
                  errorMessage = 'You are not a valid admin user.';
              }
              const checkPass = await bcrypt.compare(body._password, row.password);
              if (checkPass === true && errorMessage === '') {
                  var token = jwt.sign({ id: row.id,email: row.email,phone: row.phone}, process.env.JWT_SECRET_KEY, {
                    expiresIn: 86400 // 24 hours
                  });
                  console.log(row);
                  req.session.userID = row.id;
                  req.session.accessToken = token;
                  global.accessToken = token;
                  global.user = row;
                  return res.redirect('/');
              }
              else if (errorMessage !== '') {
                  errorMessage = errorMessage;
              }
              else {
                  errorMessage = 'Invalid Password.';
              }
              res.render('login', {
                  error: errorMessage,
                  title: 'Welcome to Axces | Login'
              });
            });
        }
        catch (e) {
            next(e);
        }

    }

    exports.profilePage = async (req, res, next) => {
        res.render('profile', {
            title: 'Welcome to Axces | Profile',
            page_title: 'Profile'
        });
    }

    // Edit User Profile
    exports.profile = async (req, res, next) => {
        const errors = validationResult(req);
        const { body } = req;
        if (!errors.isEmpty()) {
            return res.render('profile', {
                error: errors.array()[0].msg,
                title: 'Welcome to Axces | Profile',
                page_title: 'Profile'
            });
        }

        try {
            if (body._password !== '') {
                const hashPass = await bcrypt.hash(body._password, 12);
                const [row] = await dbConnection.execute(
                    "UPDATE users SET name = ?,phone = ?,password = ? WHERE id = ?",
                    [body._name, body._phone, hashPass, req.session.userID]
                );
                if (row.affectedRows !== 1) {
                    return res.render('register', {
                        error: 'Unable to update profile.',
                        title: 'Welcome to Axces | Register'
                    });
                }
            }
            else {
                const [row] = await dbConnection.execute(
                    "UPDATE users SET name = ?,phone = ? WHERE id = ?",
                    [body._name, body._phone, req.session.userID]
                );
                if (row.affectedRows !== 1) {
                    return res.render('register', {
                        error: 'Unable to update profile.',
                        title: 'Welcome to Axces | Register'
                    });
                }
            }
            let data = await getUserInfo(req.session.userID);
            console.log(data);
            global.user = data;
            res.render("profile", {
                msg: 'Your Profile has been updated successfully.',
                title: 'Welcome to Axces | Profile',
                page_title: 'Profile'
            });

        } catch (e) {
            next(e);
        }
    };

    // Forgot Password Page
    exports.forgotPasswordPage = (req, res, next) => {
        res.render('forgot-password', {
            title: 'Welcome to Axces | Forgot Password',
            page_title: 'Forgot Password'
        });
    };

    // Edit User Profile
    exports.forgotPassword = async (req, res, next) => {
        const errors = validationResult(req);
        const { body } = req;

        if (!errors.isEmpty()) {
            return res.render('forgot-password', {
                error: errors.array()[0].msg,
                title: 'Welcome to Axces | Forgot Password',
                page_title: 'Forgot Password'
            });
        }

        try {
            const [row] = await dbConnection.execute(
                "SELECT * FROM `users` WHERE `email`=?",
                [body._email]
            );

            if (row.length == 0) {
                return res.render('forgot-password', {
                    error: 'This email does not exist in the system.',
                    title: 'Welcome to Axces | Forgot Password',
                    page_title: 'Forgot Password'
                });
            }
            else {
                var randomstring = Math.random().toString(36).slice(-8);
                const hashPass = await bcrypt.hash(randomstring, 12);
                await dbConnection.execute(
                    "UPDATE users SET password = ? WHERE email = ?",
                    [hashPass, body._email]
                );
                const fetch = require('node-fetch');
                const url = 'https://api.sendinblue.com/v3/smtp/email';
                const options = {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'api-key': process.env.SEND_IN_BLUE_API
                    },
                    body: JSON.stringify({
                        to: [{ email: body._email }],
                        params: { 'password': randomstring },
                        templateId: 4
                    })
                };

                fetch(url, options)
                    .then(res => res.json())
                    .then(json => {
                        console.log(json);
                        return res.render('forgot-password', {
                            msg: 'Rest password has been sent to your registered email address, please check your inbox.',
                            title: 'Welcome to Axces | Forgot Password',
                            page_title: 'Forgot Password'
                        });
                    })
                    .catch(err => {
                        return res.render('forgot-password', {
                            error: err,
                            title: 'Welcome to Axces | Forgot Password',
                            page_title: 'Forgot Password'
                        });
                    });


            }

        } catch (e) {
            next(e);
        }
    };

  // User Listing Page
exports.userListingPage = async (req, res, next) => {

  res.render('users/user-listing', {
      title: 'Welcome to Axces | Users',
      page_title: 'Manage Users'
  });
}

// Get users list
exports.getAppUsers = async (req, res, next) => {
  let users = [];
  let totalFiltered = 0;
  let data = [];
  await helper_general.getUsers(req).then(row=>{
    users = row;
  },err=>{
    res.json(err);
  });
  await helper_general.getUsersCount(req).then(row=>{
    totalFiltered = row;
  },err=>{
    res.json(err);
  });
  if(totalFiltered > 0){
    users.forEach((user,index) =>{
      var nestedData = {};
      nestedData['sn'] = helper_general.getSerialNumber(req.body.start, index);
      nestedData['name'] = '<span><img src="'+user.image_thumb_path+'" class="img-circle" alt=""></span><span>&nbsp;'+user.name+'</span>';
      nestedData['email'] = user.email;
      nestedData['phone'] = user.phone;
      nestedData['options'] = '<div class="btn-group"  role="group">';
      nestedData['options'] += '<button class="btn btn-sm btn-primary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span>Action</span><span class="caret"></span></button>';
      nestedData['options'] += '<div  class="dropdown-menu">';
      nestedData['options'] += '<li><a onclick="editUser(this)" data-id = "'+user.id+'" class="dropdown-item main-text" href="#"><i class="fa fa-fw fa-pencil"></i> Edit</a></li>';
      nestedData['options'] += '<li><a onclick="deleteUser(this)" data-id = "'+user.id+'" class="dropdown-item main-text" href="#"><i class="fa fa-fw fa-trash"></i> Delete</a></li>';
      nestedData['options'] += '</div >';
      nestedData['options'] += '</div>';
      data.push(nestedData);
    });

  }
  let json_data = {
    "draw" :parseInt(req.body.draw),
    "recordsTotal" :parseInt(totalFiltered),
    "recordsFiltered" :parseInt(totalFiltered),
    "data" :data
  }
  res.json(json_data);
}

exports.deleteUser = async (req, res, next) => {
  var user_id = req.body.user_id;
  await helper_general.getOtherUserDetail(user_id).then(row=>{
    res.render('users/user-delete', {
        user: row
    });
  },err=>{
    res.render('users/user-delete', {
        error: err
    });
  });
}
