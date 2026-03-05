# TESTING

npm install --save-dev jest supertest

Configurar package.json
"scripts": {
  "start": "node src/app.js",
  "dev": "nodemon src/app.js",
  "test": "jest --runInBand" <!-- > agrega esto 
}

npm test <!-- Correr los test >

<!-- se crea la carpeta   --> 
.github/workflows
<!-- y dentro  --> 
deploy.yml