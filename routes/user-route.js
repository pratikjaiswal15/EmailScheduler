const express = require('express');
const router = express.Router();


var schedule = require('node-schedule');

let nodemailer = require('nodemailer');

var Imap = require('imap'),
    inspect = require('util').inspect;
var fs = require('fs'), fileStream;


const job = {};
// An API using moongoose and node.js to send mails using nodemailer
router.post('/send-email', (req, res, next) => {

     // e-mail message options
     let mailOptions = {
        from: '<FROM_EMAIL_ADDRESS>',
        to: '<FROM_EMAIL_PASS>',
        subject: 'Sending email using nodemailer and node.js',
        text: 'Hello!!!. Nice to see you.'
    };

    // e-mail transport configuration
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: '<FROM_EMAIL_ADDRESS>',
            pass: '<FROM_EMAIL_PASSWORD>'
        }
    });


    var date = new Date(2020, 12, 21, 8, 40, 1);

    job = schedule.scheduleJob(date, function(){
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
            console.log(error);
            } else {
            console.log('Email sent: ' + info.response);
            }
        });
  
    });

    

})

// Read all the mails for particular email
router.get('/read-email', (req, res, next) => {
    var imap = new Imap({
        user: 'your_email@service.com',
        password: 'yourPassword',
        host: 'imap.gmail.com',
        port: 993,
        tls: true
        });

      
        function openInbox(cb) {
            imap.openBox('INBOX', true, cb);      
        }

        imap.once('ready', function() {
            openInbox(function(err, box) {
            if (err) throw err;
            imap.search([ 'UNSEEN', ['SINCE', 'June 15, 2018'] ], function(err, results) {
            if (err) throw err;
            var f = imap.fetch(results, { bodies: '' });
            f.on('message', function(msg, seqno) {
            console.log('Message #%d', seqno);
            var prefix = '(#' + seqno + ') ';
            msg.on('body', function(stream, info) {
            console.log(prefix + 'Body');
            stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'));
            });
            msg.once('attributes', function(attrs) {
            console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
            });
            msg.once('end', function() {
            console.log(prefix + 'Finished');
            });
            });
            f.once('error', function(err) {
            console.log('Fetch error: ' + err);
            });
            f.once('end', function() {
            console.log('Done fetching all messages!');
            imap.end();});
                });
              });
            });
            imap.once('error', function(err) {
            console.log(err);
            });
            imap.once('end', function() {
            console.log('Connection ended');
            });
            imap.connect();
            
})


// rescheduling 
router.post('/rescheduling', (req, res , next) => {


    job.reschedule(new Date);



}); 

// delete emails
router.delete('/delete', (req, res, next) => {

    function openInbox(cb){
        imap.openBox('INBOX', false, cb);
    }
    
    imap.once('ready', function() {
        openInbox(function(err,box){
            if (err) throw err;
            var f = imap.seq.fetch('1:*', {
                bodies: 'HEADER.FIELDS (FROM)',
                struct: true
            });
            f.on('message', function(msg, seqno){
                console.log('Message #%d', seqno);
    
                imap.seq.addFlags(seqno, 'Deleted', function(err){
                    console.log(err);
                });
    
            });
            f.once('end', function(){
                imap.end();
            });
        });
    });
    
    imap.connect();
})



module.exports = router