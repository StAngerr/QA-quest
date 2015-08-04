/*var SMTPServer = require('smtp-server').SMTPServer;
var server = new SMTPserver(); 


server.listen(9010);*/
var nodemailer = require('nodemailer');

var ses = require('nodemailer-ses-transport');
var transporter = nodemailer.createTransport(ses({
    accessKeyId: 'AWSACCESSKEY',
    secretAccessKey: '/usr/local/ssl'
}));
/*var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'fenomenseed@gmail.com',
        pass: 'Sb5101EEqE1'
    }
});
*/
var mailOptions = {
    from: 'Fred Foo ✔ <fenomenseed@gmail.com>', // sender address
    to: 'violet.infierno@gmainl.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ✔', // plaintext body
    html: '<b>Hello world ✔</b>' // html body
};

transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);

});