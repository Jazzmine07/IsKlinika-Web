const router = require('express').Router();
const userController = require('../Controller/userController');
const { loggedIn } = require('../Controller/userController');

router.get('/', (req, res) => {
  res.redirect('/login');
});

// Get login page
router.get('/login', (req, res) => {
  console.log("Read login successful!");
  res.render('login');
});

// Get dashboard page
router.get('/dashboard', loggedIn, (req, res) => {
  userController.getUser(req, userInfo => {
    //console.log("user? " + userInfo);
    console.log("Read dashboard successful!");
    res.render('dashboard', {
      user: userInfo
    });
  })
});

// Get clinic visit page
router.get('/clinic-visit', loggedIn, (req, res) => {
  console.log("Read dashboard successful!");
  res.render('clinic-visit');
});

// Get clinic visit page
router.get('/clinic-visit/create', loggedIn, (req, res) => {
  console.log("Read create clinic visit successful!");
  res.render('clinic-visit-create');
});

// Get profile page
router.get('/profile', loggedIn, (req, res) => {
  console.log("Read profile successful!");
  res.render('profile');
});

router.post('/login', userController.login);
//router.post('/getStudent', registrarController.getStudent);

module.exports = router;