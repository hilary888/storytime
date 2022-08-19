/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get("/health_check", "HealthCheckController.healthCheck")
  Route.post("/signup", "AuthController.signUp")
  Route.get("/verify/:token", "AuthController.verifyEmail").as("verifyEmail")
  Route.get("/forgot_password/:email", "AuthController.getPasswordResetToken")
  Route.post("/reset_password/:token", "AuthController.resetPassword").as("resetPassword")
  Route.post("/login", "AuthController.login")

  // Auth routes
  Route.group(() => {
    Route.get("/logout", "AuthController.logout")
  }).middleware("auth")

}).prefix("/api/v1")
