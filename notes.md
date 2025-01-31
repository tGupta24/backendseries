## Steps for Setting Up a Professional Backend Project:

### 1) Initialize Git Repository:
- Run `git init` to initialize a new Git repository for version control.

### 2) Create Directory Structure:
- Create a `public` folder, a `temp` subfolder inside it, and add a `.gitkeep` file to track the empty folder.  
  ```sh
  mkdir -p public/temp && touch public/temp/.gitkeep
  ```

### 3) Setup `.gitignore`:
- Use `.gitignore` to exclude unnecessary or sensitive files from the repository.  
- Generate its content from [Gitignore Generator](https://www.toptal.com/developers/gitignore).

### 4) Setup Environment Variables:
- Create `.env` for sensitive configurations and `.env.sample` to list environment variables without exposing values.  
  ```sh
  touch .env .env.sample
  ```

### 5) Create Source Directory:
- Organize project files by creating `src` and subdirectories: `controllers`, `db`, `middlewares`, `models`, `routes`, and `utils`.
  ```sh
  mkdir -p src/{controllers,db,middlewares,models,routes,utils}
  ```

### 6) Install Dependencies:
- Install development tools like `nodemon` for auto-reloading and `prettier` for code formatting.  
  ```sh
  npm install -D nodemon prettier
  ```

### 7) Update `package.json`:
- Add `"dev": "nodemon src/index.js"` in the `scripts` section to enable a development server.
- Include `"type": "module"` to use ES6 modules syntax.

### 8) Setup Prettier:
- Create `.prettierignore` to skip formatting certain files or directories:
  ```sh
  node_modules/
  public/temp/
  ```
- Add `.prettierrc` to define Prettier formatting rules:
  ```json
  {
    "semi": true,
    "singleQuote": true,
    "tabWidth": 2
  }
  ```

### 9) Push Code to Remote Repository:
- Set the default branch as `main` and link your local repository to a remote one for collaboration.
  ```sh
  git branch -M main
  git remote add origin <repository_url>
  git push -u origin main
  ```

### 10) Setup Middleware and Validate Structure:
- Write middleware in the `middlewares` folder for tasks like authentication or logging.
- Ensure all files and configurations match the directory structure and project setup.

---

## Steps to Connect the Database:

### 1) Setup MongoDB Atlas:
- Create a new project in MongoDB Atlas and set up the cluster.
- Configure services and connect the IP Address to access the database from anywhere.

### 2) Configure `.env`:
- Add the MongoDB URI from MongoDB Atlas to the `.env` file.

### 3) Install Dependencies:
```sh
npm install dotenv mongoose express
```

### 4) Connecting the Database:
- Method 1: Directly connect the database in `index.js` in `src`.
- Method 2: Create a separate file for database connection and import it into `index.js`.

### 5) Using dotenv:
```js
require('dotenv').config({ path: './.env' });
```
Or, if using ES6:
```json
"scripts": {
  "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"
}
```

### 6) Notes:
- Use **try-catch** for error handling.
- Use **async-await** because database responses may take time.
- Restart the server after changes in `.env` using:
  ```sh
  npm run dev
  ```

---

## Steps to Create the `utils` Folder:

### 1) Purpose of `utils` Folder:
The `utils` folder contains reusable utility functions, classes, and modules.
```
/utils
├── asyncHandler.js  # Handles async route errors
├── ApiResponse.js   # Custom response format
├── ApiError.js      # Centralized error handling
```

### 2) Utility Functions:
#### **Async Handler**
- Simplifies handling of asynchronous errors in Express routes.
- Wraps an async function and automatically passes errors to the next() middleware.

#### **API Error**
- Centralized error handling with standard properties like `statusCode`, `message`, `errors`, etc.

#### **API Response**
- Standardized API responses with structure including `statusCode`, `data`, `message`, and `success`.

---

## Creating Models for User and Video:

### 1) User Model:
- Create `user.model.js` with user schema containing user details.

### 2) Video Model:
- Create `video.model.js` for video details.

### 3) Install Dependencies:
```sh
npm install bcrypt jsonwebtoken mongoose-aggregate-paginate-v2
```

### 4) Functionality:
- `mongoose-aggregate-paginate-v2` helps paginate MongoDB aggregation queries.
- `bcrypt` hashes passwords for security.
- `JWT` is used for authentication and authorization.
- **Access Token** (short-lived) and **Refresh Token** (long-lived) are used for user authentication.
- Custom methods in Mongoose can be added using:
  ```js
  schema.methods.methodName = async function() { ... }
  ```

---

## Uploading Files using Multer and Cloudinary:

### 1) Install Dependencies:
```sh
npm install cloudinary multer
```

### 2) Setup Cloudinary:
- Configure Cloudinary in the `.env` file:
  ```sh
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret
  ```

### 3) Cloudinary Configuration:
- Create `cloudinary.js` in the `utils` folder.
- The upload function should be **async** as file uploads take time.

### 4) Multer Middleware:
- Create `multer.js` middleware to handle file storage.

---

## Setting Up Controllers and Routes:

### 1) Create Controller and Route:
- In `user.controller.js`, create a function `registerUser` that handles user registration.
- In `user.routes.js`, define the `/register` route and link it to `registerUser`.
- In `app.js`, register routes:
  ```js
  app.use("/api/v1/users", userRouter);
  ```

### 2) Important Notes:
- If importing with a different name, **do not use default export**.
- Example:
  ```js
  export { registerUser };
  import { registerUser as userRouter } from 'user.controller.js';
  ```

---

## Authentication Middleware:

### 1) Purpose:
- Ensures only authorized users access protected routes.

### 2) Steps to Create Auth Middleware:
1. Create `auth.middleware.js`.
2. Define `verifyJWT` function using **async handler**.
3. Extract **Access Token** from cookies or headers.
4. Verify token using `jwt.verify()`.
5. Find user by ID in the token and attach it to `req.user`.
6. Use `next()` to pass control to the next middleware.

---

## Access Token vs Refresh Token:

- **Access Token:** Short-lived (e.g., 1 day).
- **Refresh Token:** Long-lived, stored in the database.
- When the access token expires, the refresh token is used to generate a new one instead of requiring login again.

## Refreshing access token 
- write it in controller
0. try catch
1. take a incoming refresh TOKEN either from cookies or from body because refrsh token is present in body not in header
2. if not then error
3. `import jwt from "jsonwebtken"`
4. verify using `jwtverify()` and get decoded token because incoming token is not decoded so to decode the token we use jwtverify method
5. since refreshToken has id so find user using id by await because we need 
6. now we have two token one present in database and another one is incoming token by user
```js
if(incomingRefreshToken !== user?.refreshToke){
   throw new ApiError(401,"InValid refresh Token)
}
```
7. if match use method `await generateAccessAndRefreshToken(user._id)`
8. send status cookies with options and json
9. go to user route and add a secure endpoint



