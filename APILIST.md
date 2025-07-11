# LINKUP API'S LIST

### authRouter:
    - POST /signup
    - POST /login
    - POST /logout

### profileRouter:
    - GET /profile/view
    - PATCH /profile/edit
    - PATCH /profile/password

# For sending and responding to the request there are 4 possible status

Status : igonre, interested, accepted, rejected

# For sending the request will be 
### connectionRequestRouter:
    - POST /request/send/interested/:userId
    - POST /request/send/ignored/:userId

# For responding the request will be

    - POST /request/review/accepted/:requestId
    - POST /request/review/rejected/:requestId

# To check all the matches/ connections
### userRouter:
    - GET /user/connections

# To check all the received connection requests

    - GET /user/requests/received

# To check the feeds - It gets the profile of other users on the platform

    - GET /user/feed



####  We will be using express.Router to create different router (eg-> authRouter, userRouter etc) and each of these router will handle the given routes 








