/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var querystring = require('querystring');
var https = require('https');
var text = require('textbelt');  
var randtoken = require('rand-token');
var crypto = require("crypto");
var sha256 = crypto.createHash("sha256");

module.exports = {

  /**
   * `UserController.login()`
   */
  login: function (req, res) {

    // See `api/responses/login.js`
    var sha256 = crypto.createHash("sha256");
    sha256.update(req.param('password'), "utf8");//utf8 here
    var inputpassword = sha256.digest("base64");

    return res.login({
      email: req.param('email'),
      password: inputpassword,
      successRedirect: '/welcome',
      invalidRedirect: '/'
    });
  },


  /**
   * `UserController.logout()`
   */
  logout: function (req, res) {

    // "Forget" the user from the session.
    // Subsequent requests from this user agent will NOT have `req.session.me`.
    req.session.me = null;
    req.session.data = null;
    // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
    // send a simple response letting the user agent know they were logged out
    // successfully.
    if (req.wantsJSON) {
      return res.ok('Logged out successfully!');
    }

    // Otherwise if this is an HTML-wanting browser, do a redirect.
    return res.redirect('/');
  },


  /**
   * `UserController.signup()`
   */
  signup: function (req, res) {
    var sha256 = crypto.createHash("sha256");
    sha256.update(req.param('password'), "utf8");//utf8 here
    var securitypassword = sha256.digest("base64");
    // Attempt to signup a user using the provided parameters
    // console.log(req.param('username'));
    User.signup({
      username: req.param('username'),
      email: req.param('email'),
      password: securitypassword,
      firstname: req.param('firstname'),
      lastname: req.param('lastname'),
      address: req.param('address'),
    }, function (err, user) {
      // res.negotiate() will determine if this is a validation error
      // or some kind of unexpected server error, then call `res.badRequest()`
      // or `res.serverError()` accordingly.
      if(err)
      {
        req.flash('error', err);
        return res.redirect('/signup');
        
      }

      // Go ahead and log this user in as well.
      // We do this by "remembering" the user in the session.
      // Subsequent requests from this user agent will have `req.session.me` set.
      req.session.me = user.id;

      // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
      // send a 200 response letting the user agent know the signup was successful.
      if (req.wantsJSON) {
        return res.ok('Signup successful!');
      }

      // Otherwise if this is an HTML-wanting browser, redirect to /welcome.
      return res.redirect('/welcome');
    });
  },
  /**
   * `UserController.account()`
   */
  account: function(req, res){
    var username = 'JOHN MARTIN';
    var hashpower;
    var state;
    User.getUser({id: req.session.me}, function(err, user){
      if (err) return res.negotiate(err);
      if (!user) {
        return res.redirect('/');
      }
      username = user.username.toUpperCase();
      Order.find_pending({userid: req.session.me}, function(err, data){
        if (err) return res.negotiate(err);
        hashpower = data[0];
        Balance.welcome({userid: req.session.me}, function(err, balance){
          if (err) return res.negotiate(err);
          if (!balance) {
            if (!hashpower) {
              state = 1;
            }else{
              state = 2;
            }
            return res.view('user/account', {username: username, hashpower: hashpower, state: state});
          }
          else{
            if (!hashpower) {
              state = 3;
            }else{
              state = 4;
            }
            return res.view('user/account', {username: username, hashpower: hashpower, state: state});
          }
        });
      });
    });
  }
};

