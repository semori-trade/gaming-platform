## Description

This is a REST API for controlling user in a system.

## Run project
```bash
docker compose up -d
# go to adminer 8080 login with creds from docker-compose.yml and run sql migration with hands
cp .env.example .env
pnpm install
# need for typia working
pnpm run prepare 
pnpm run dev
```


## Stack
- TypeScript
- Node.js
- Koa
- typia
- jwt
- argon2
- PostgreSQL
- Kysely (Query Builder)

## API

### Postman Collection
./gaming-platform.postman\_collection.json

### Routes

- POST /user/login
- POST /user/sign-up
- POST /user/logout

- GET /user/profile
- PUT /user/profile
- POST /user/top-up
- POST /user/withdraw

- PUT /user/internal/deactivate-account
- PUT /user/internal/activate-account
- PUT /user/internal/verify-account

## Database

Design: https://dbdiagram.io/d/66a2b2538b4bb5230e605957

### Migration
./migrations/0__init.sql


## Testing
POST /user/sign-in
1. If credentials are valid, return a 200 status code and a JWT token in the Authorized response header.
2. If credentials are not valid, return a 400 status code and a message "Invalid email or password."
3. If the email is invalid, return a 401 status code and a message "Invalid email or password."
4. If the password is invalid, return a 401 status code and a message "Invalid email or password."
(Note: 3 and 4 are the same because we don't want to reveal if the email exists in the database.)

POST /user/sign-up
1. If credentials are valid, return a 201 status code and a message indicating that the user was created.
2. If credentials are not valid, return a 400 status code and a message "Invalid email or password."
3. If the email already exists, return a 400 status code and a message "Email already exists." (Note: This exposes that the email exists in the system, but in the real world, we would send an email with an auth token so the hacker would not know that the email exists because they would get the response "Sent email.")

POST /user/logout
1. If the JWT token is valid, return a 200 status code and remove the JWT token from the authorized header.
2. If the JWT token is invalid, return a 401 status code and an error "No token provided."

GET /user/profile
1. If the JWT token is valid, return a 200 status code and the user profile.
2. If the JWT token is invalid, return a 401 status code and a message "Unauthorized."
3. If the user is deactivated, return a 401 status code and a message that the user is deactivated. Only internal users can deactivate users.

PUT /user/profile
1. If the JWT token is valid and the body (nickname or password) is provided, return a 200 status code and a message indicating that the user was updated.
2. If the JWT token is invalid, return a 401 status code and a message "Invalid token."
3. If the body is invalid, return a 400 status code and a message "Invalid body."
4. If no body is provided, return a 400 status code and a message "No fields to update."

POST /user/top-up
1. If the JWT token is valid and the body (amount, paymentProvider) is provided and the payment provider successfully handles the data, return a 200 status code and a message indicating that the user was topped up and the user balance was updated.
2. If, for some reason, the user does not exist, return an error and a 500 status code.
3. If the user balance is lower than the minimum top-up amount for the payment provider, return a 500 status code and a message indicating that the user balance is lower than the minimum top-up amount for the payment provider.
4. If the payment provider returns an error while processing the transaction, return a 500 status code and a message indicating that the payment provider failed.

POST /user/withdraw
1. If the JWT token is valid and the body (amount, paymentProvider) is provided and the payment provider successfully handles the data, return a 200 status code and a message indicating that the user was topped up and the user balance was updated.
2. If the user is not verified, return a 500 status code and a message indicating that the user is not verified.
3. If, for some reason, the user does not exist, return an error and a 500 status code.
4. If the user balance is lower than the minimum withdrawal amount for the payment provider, return a 500 status code and a message indicating that the user balance is lower than the minimum withdrawal amount for the payment provider.
5. If the payment provider returns an error while processing the transaction, return a 500 status code and a message indicating that the payment provider failed.

PUT /user/internal/deactivate-account
1. Set the user as deactivated by email. If the user tries to log in again, they will get a 401 status code and a message indicating that the user is deactivated. We cannot change the deactivation status for the user immediately because we do not store the JWT in the cache.

2. PUT /user/internal/activate-account
Set the user as active by email. If the user tries to log in again, they will be able to use public endpoints. We cannot change the deactivation status for the user immediately because we do not store the JWT in the cache.

PUT /user/internal/verify-account
3. Set the user as verified by email. Verified users can withdraw money from the system. We cannot change the verification status for the user immediately because we do not store the JWT in the cache.
