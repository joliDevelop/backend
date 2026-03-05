# TESTING

npm install --save-dev jest supertest
<!-- en git para las pruebas no se usa BD real  -->
npm install --save-dev mongodb-memory-server

Configurar package.json
"scripts": {
  "start": "node src/app.js",
  "dev": "nodemon src/app.js",
  "test": "jest --runInBand" <!-- agrega está linea > 
},
<!-- agrega esto: --> 
"jest": {
  "setupFilesAfterEnv": [
      "<rootDir>/tests/setup.js"
  ]
},

npm test <!-- Correr los test >

<!-- se crea la carpeta   --> 
.github/workflows
<!-- y dentro  --> 
deploy.yml


<!-- se crea la carpeta   --> 
.tests
<!-- y dentro  --> 
auth.test.js
setup.js <!-- Crea la bd local-->