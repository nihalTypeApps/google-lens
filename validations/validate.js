const { validationResult } = require('express-validator')

exports.validateRequest = [(req, res, next) => {
    const errors = validationResult(req);
    let error = [];
    let response = {};
    response['status'] = '0';
    response['data'] = {};
    if (!errors.isEmpty()) {
        error.push(errors.array()[0].msg);
      }
      if(error.length > 0){
        response['data']['error'] = error;
        res.json(response);
      }
    next();
    }];

  