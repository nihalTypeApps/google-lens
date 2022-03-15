const axios = require('axios');
const url = 'https://api.sendinblue.com/v3/smtp/email';

exports.sendEmail = async (to_email, params, templateId) => {
    const options = {
        method: 'post',
        url,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'api-key': process.env.SEND_IN_BLUE_API
        },
        data: JSON.stringify({
            to: [{ email: to_email}],
            params: params,
            templateId: templateId
        })
    };

    return axios(options);
}