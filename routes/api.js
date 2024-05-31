const express = require('express');
const router = express.Router();
const UserController = require('../controller/AdminController/AuthController');
const AdminController = require('../controller/AdminController/AdminController');
const ClientUserController = require('../controller/ClientController/ClientAuthController');
const multer = require('multer');
const upload = multer({ storage: UserController.storage });

// ADMIN USER API HERE

// GET //
router.get('/find-user', UserController.getIdnumber);
router.get('/update-password', UserController.UpdatePassword);
router.get('/user-profile', UserController.getUserProfile);
router.get('/newreg-notify', UserController.newClientRegistrationNotification);
router.get('/unread-notify', UserController.unreadNotification);
router.get('/get-roles', AdminController.getRoles)
router.get('/client-user-list', AdminController.AllClientListData)
//POST//
router.post('/admin-register', UserController.adminUserReg);
router.post('/admin-login', UserController.userLogin);
router.post('/upload-profile', upload.single('image'), UserController.UploadProfilePicture);
router.post('/upload-cover', upload.single('image'), UserController.UploadCoverPicture);
router.post('/is-open-notification', UserController.isOpenNotification);
router.post('/read-notification', UserController.readNotification);
router.post('/activate-client', UserController.acceptNewClient);
router.post('/upload-roles', AdminController.saveNewRole);
router.post('/update-roles', AdminController.updateRole);

//DELETE//
router.delete('/admin-logout', UserController.userLogout);
router.delete('/delete-roles', AdminController.deleteRole);
// ENDS HERE


// CLIENT API HERE
router.post('/client-register', ClientUserController.clientRegistration);
router.get('/verify-email', ClientUserController.verifyEmail);
router.post('/set-password', ClientUserController.setPassword)

module.exports = router;







