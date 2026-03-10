#  --- TESTING ---
Autenticación segura entre GitHub y GCP

<!--  Obtener dirección IP pública-->
curl ifconfig.me 

# Librerias
npm install --save-dev jest supertest
<!-- en git para las pruebas no se usa BD real  -->
npm install --save-dev mongodb-memory-server

npm install axios   

# Dependencias instaladas manual
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

# Correr el test manual
npm test 
npx jest --runInBand --verbose 

# Carpetas creadas correctamente
<!-- se crea la carpeta   --> 
.github/workflows
<!-- y dentro  --> 
ci-cd.yml

<!-- se crea la carpeta   --> 
.tests
<!-- y dentro  --> 
auth.test.js
setup.js <!-- Crea la bd local-->

# Comando para activar el pepeline por primera vez
git commit --allow-empty -m "trigger pipeline"
git push origin [Rama]