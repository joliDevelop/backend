const express = require('express');
const router = express.Router();

// importar rutas de módulos
router.use('/auth', require('../modules/auth/routers/auth.routes'));
router.use('/users', require('../modules/user/routers/user.routes'));
router.use('/recover', require('../modules/recoverPassword/routers/recoverPassword.routes'));
router.use('/register', require('../modules/register/routers/register.routes'));
router.use('/maps', require('../modules/maps/routers/maps.routes'));
router.use('/test', require('../modules/tests/routers/test.routes'));
router.use('/twilio', require('../modules/twilio/routers/twilio.routes'));
router.use('/files', require('../modules/files/routers/files.routes'));

module.exports = router;