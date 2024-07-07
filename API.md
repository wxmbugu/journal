#### Journal API Endpoints

**1. Create a Journal Entry**

- **URL**: `/api/v1/journal`
- **Method**: `POST`
- **Authorization**: Required (JWT)
- **Description**: Creates a new journal entry for the authenticated user.
- **Request Body**:
  ```json
  {
    "title": "string",
    "content": "string",
    "category_id": "integer"
  }
  ```
- **Response**:
  ```json
  {
    "message": "journal entry was added successfully"
  }
  ```
- **Errors**:
  - Returns appropriate error messages for authorization failures and validation errors.

**2. Create a New Category for Journals**

- **URL**: `/api/v1/journal/new_category`
- **Method**: `POST`
- **Authorization**: Required (JWT)
- **Description**: Creates a new category for journal entries for the authenticated user.
- **Request Body**:
  ```json
  {
    "name": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "category created successfully"
  }
  ```
- **Errors**:
  - Returns appropriate error messages for authorization failures and validation errors.

**3. Update a Journal Entry**

- **URL**: `/api/v1/journal/<journal_id>`
- **Method**: `PUT`
- **Authorization**: Required (JWT)
- **Description**: Updates an existing journal entry identified by `journal_id`.
- **Request Body**:
  ```json
  {
    "title": "string",
    "content": "string",
    "category_id": "integer"
  }
  ```
- **Response**:
  ```json
  {
    "message": "journal updated successfully"
  }
  ```
- **Errors**:
  - Returns appropriate error messages for authorization failures, validation errors, and if the journal entry does not exist.

**4. Update a Journal Category**

- **URL**: `/api/v1/journal/category/<category_id>`
- **Method**: `PUT`
- **Authorization**: Required (JWT)
- **Description**: Updates an existing journal category identified by `category_id`.
- **Request Body**:
  ```json
  {
    "name": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "category updated successfully"
  }
  ```
- **Errors**:
  - Returns appropriate error messages for authorization failures, validation errors, and if the category does not exist.

**5. Fetch All Journals**

- **URL**: `/api/v1/journal`
- **Method**: `GET`
- **Authorization**: Required (JWT)
- **Description**: Fetches all journal entries for the authenticated user.
- **Response**:
  ```json
  {
    "message": [
      {
        "id": "integer",
        "title": "string",
        "category": "string",
        "content": "string",
        "date": "string"
      },
      ...
    ]
  }
  ```
- **Errors**:
  - Returns appropriate error messages for authorization failures.

**6. Fetch a Specific Journal Entry**

- **URL**: `/api/v1/journal/<journal_id>`
- **Method**: `GET`
- **Authorization**: Required (JWT)
- **Description**: Fetches a specific journal entry identified by `journal_id`.
- **Response**:
  ```json
  {
    "message": {
      "id": "integer",
      "title": "string",
      "category": "string",
      "category_id": "integer",
      "content": "string",
      "date": "string"
    }
  }
  ```
- **Errors**:
  - Returns appropriate error messages for authorization failures and if the journal entry does not exist.

**7. Fetch Journals by Category**

- **URL**: `/api/v1/journal/category/<category_id>`
- **Method**: `GET`
- **Authorization**: Required (JWT)
- **Description**: Fetches all journal entries categorized under `category_id`.
- **Response**:
  ```json
  {
    "message": [
      {
        "title": "string",
        "category": "string",
        "content": "string"
      },
      ...
    ]
  }
  ```
- **Errors**:
  - Returns appropriate error messages for authorization failures and if the category does not exist.

**8. Fetch All Categories**

- **URL**: `/api/v1/journal/category`
- **Method**: `GET`
- **Authorization**: Required (JWT)
- **Description**: Fetches all categories of journals for the authenticated user.
- **Response**:
  ```json
  {
    "message": [
      {
        "id": "integer",
        "name": "string"
      },
      ...
    ]
  }
  ```
- **Errors**:
  - Returns appropriate error messages for authorization failures.

**9. Delete a Journal Entry**

- **URL**: `/api/v1/journal/<journal_id>`
- **Method**: `DELETE`
- **Authorization**: Required (JWT)
- **Description**: Deletes a specific journal entry identified by `journal_id`.
- **Response**:
  ```json
  {
    "message": "journal deleted successfully"
  }
  ```
- **Errors**:
  - Returns appropriate error messages for authorization failures and if the journal entry does not exist.

**10. Delete a Journal Category**

- **URL**: `/api/v1/journal/category/<category_id>`
- **Method**: `DELETE`
- **Authorization**: Required (JWT)
- **Description**: Deletes a specific journal category identified by `category_id`.
- **Response**:
  ```json
  {
    "message": "category deleted successfully"
  }
  ```
- **Errors**:
  - Returns appropriate error messages for authorization failures and if the category does not exist.

---

#### Authentication API Endpoints

**1. User Registration**

- **URL**: `/api/v1/authentication/signup`
- **Method**: `POST`
- **Description**: Registers a new user.
- **Request Body**:
  ```json
  {
    "email": "string",
    "username": "string",
    "phone_number": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Creation of Account was successful"
  }
  ```
- **Errors**:
  - Returns appropriate error messages for validation errors and if the user already exists.

**2. User Login**

- **URL**: `/api/v1/authentication/login`
- **Method**: `POST`
- **Description**: Logs in an existing user.
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Successful Login",
    "access_token": "string",
    "refresh_token": "string",
    "user_id": "integer",
    "user_email": "string"
  }
  ```
- **Errors**:
  - Returns appropriate error messages for authentication failures.

**3. Password Reset**

- **URL**: `/api/v1/authentication/reset_password`
- **Method**: `POST`
- **Authorization**: Required (JWT)
- **Description**: Resets user password.
- **Request Body**:
  ```json
  {
    "old_password": "string",
    "new_password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Password updated successfully"
  }
  ```
- **Errors**:
  - Returns appropriate error messages for authentication failures and validation errors.

**4. Update User Details**

- **URL**: `/api/v1/authentication/update_details`
- **Method**: `PUT`
- **Authorization**: Required (JWT)
- **Description**: Updates user details.
- **Request Body**:
  ```json
  {
    "email": "string",
    "username": "string",
    "phone_number": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "user details updated successfully"
  }
  ```
- **Errors**:
  - Returns appropriate error messages for authentication failures and validation errors.

**5. Fetch User Details**

- **URL**: `/api/v1/authentication/get_details/<user_id>`
- **Method**: `GET`
- **Authorization**: Required (JWT)
- **Description**: Fetches user details by `user_id`.
- **Response**:
  ```json
  {
    "email": "string",
    "username": "string",
    "phone_number": "string",
    "date_created": "string"
  }
  ```
- **Errors**:
  - Returns appropriate error messages for authentication failures and if the user does not exist.

**6. Refresh Authentication Token**

- **URL**: `/api/v1/authentication/refresh`
- **Method**: `GET`
- **Authorization**: Required (JWT Refresh Token)
- **Description**: Refreshes the authentication token.
- **Response**:
  ```json
  {
    "message": "token refresh was successful",
    "access_token": "string",
    "refresh_token": "string",
    "user_id": "integer",
    "user_email": "string"
  }
  ```
- **Errors**:
  - Returns appropriate error messages for authentication failures.


