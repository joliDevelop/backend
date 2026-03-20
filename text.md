


backend/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   └── mailer.js
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── role.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── utils/
│   │   │   ├── response.js
│   │   │   ├── hash.js
│   │   │   ├── token.js
│   │   │   └── validators.js
│   │   ├── constants/
│   │   │   └── roles.js
│   │   └── errors/
│   │       └── AppError.js
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.repository.js
│   │   │   └── auth.validation.js
│   │   ├── users/
│   │   │   ├── users.routes.js
│   │   │   ├── users.controller.js
│   │   │   ├── users.service.js
│   │   │   ├── users.repository.js
│   │   │   ├── users.model.js
│   │   │   └── users.validation.js
│   │   ├── roles/
│   │   │   ├── roles.service.js
│   │   │   ├── roles.repository.js
│   │   │   └── roles.model.js
│   │   ├── twilio/
│   │   │   ├── twilio.routes.js
│   │   │   ├── twilio.controller.js
│   │   │   ├── twilio.service.js
│   │   │   └── twilio.validation.js
│   │   ├── mail/
│   │   │   ├── mail.routes.js
│   │   │   ├── mail.controller.js
│   │   │   ├── mail.service.js
│   │   │   └── mail.templates.js
│   │   ├── maps/
│   │   │   ├── maps.routes.js
│   │   │   ├── maps.controller.js
│   │   │   ├── maps.service.js
│   │   │   └── maps.validation.js
│   │   ├── password-recovery/
│   │   │   ├── password-recovery.routes.js
│   │   │   ├── password-recovery.controller.js
│   │   │   ├── password-recovery.service.js
│   │   │   ├── password-recovery.repository.js
│   │   │   ├── password-reset-token.model.js
│   │   │   └── password-recovery.validation.js
│   │   ├── verification/
│   │   │   ├── verification.service.js
│   │   │   ├── verification.repository.js
│   │   │   └── verification-code.model.js
│   │   ├── register/
│   │   │   ├── register.routes.js
│   │   │   ├── register.controller.js
│   │   │   ├── register.service.js
│   │   │   ├── register.repository.js
│   │   │   ├── pre-register.model.js
│   │   │   └── register.validation.js
│   │   ├── admin/
│   │   │   ├── admin.service.js
│   │   │   └── admin.model.js
│   │   ├── asesor/
│   │   │   ├── asesor.service.js
│   │   │   └── asesor.model.js
│   │   ├── inversion/
│   │   │   ├── inversion.service.js
│   │   │   └── inversion.model.js
│   │   ├── pension/
│   │   │   ├── pension.service.js
│   │   │   └── pension.model.js
│   │   ├── retiro/
│   │   │   ├── retiro.service.js
│   │   │   └── retiro.model.js
│   │   └── seguro/
│   │       ├── seguro.service.js
│   │       └── seguro.model.js
│   ├── routes/
│   │   └── index.js
│   └── database/
│       ├── seeders/
│       │   └── seed-roles.js
│       └── migrations/
├── tests/
│   ├── setup.js
│   ├── auth/
│   │   └── auth.test.js
│   ├── mail/
│   │   └── mail.test.js
│   └── maps/
│       └── maps.test.js
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md