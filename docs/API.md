# ALMS API & ENDPOINT DOCUMENTATION
This document attempts to be an exhaustive guide to using ALMS API and its endpoints. With it, you should be able to create your own ALMS client.

**To learn about general ALMS functionality, checkout the [documentation](DOCUMENTATION.md).**

# General API information

## Authentication header
**Aperture Secure Authentication Protocol (ASAP)** is used for request authorization. For a detailed view of how it works, check out the [relevant section of the documentation](DOCUMENTATION.md#aperture-secure-authentication-protocol-asap). What is important here is that every request that requires authorization needs to have a header titled `token` that will include the current user's session token.

## Error response
All error responses include the same JSON content. It is of the following format:
```
{
   "error": <http error code>,
   "message": "<error detail message>"
}
```

Sometimes, error responses can include additional fields, for example a list of supplied users that do not exist.

## Authentication error responses
Authentication fails return a 401 error response with the following possible messages:
   - *UNAUTHORIZED*
      - returned if request didn't include the "token" header at all
   - *AUTH TOKEN BAD*
      - returned if the request included an invalid auth token
   - *AUTH TOKEN EXPIRED*
      - returned if the supplied auth token already expired

## Success response
Endpoints that do not return anything will return a generic success response of the following format:
```
{
   "response": 200,
   "message": "OK"
}
```

## Rate limiting
ALMS limits the number of responses per minute per IP address. The limit is currently hardcoded and is 250 requests per minute. If the amount is exceeded, the server responds with a 429 error code and the following response is sent:
```
{
   "error": 429,
   "message": "TOO MANY REQUESTS"
}
```

# Endpoints:

### GET `/`
- index endpoint
- returns general ALMS statistics

#### Required headers:
- none

#### 200 OK response:
```
{
   "status": "<ALMS status>",
   "stats": {
      "activeUsers": <number of active/online users>,
      "totalUsers": <number of total registered accounts>,
      "uptime": <uptime in seconds>,
      "version": "<ALMS version>"
   }
}
```

#### ERROR responses:
- none

---

### POST `/login`
- handles user login and allows user authentication

#### Required headers:
- none

#### JSON request content:
```
{
	"username": "<username>",
	"password": "<password>"
}
```

#### JSON field requirements
- username
   - string
- password
   - string

#### 200 OK response:
```
{
   "token": "<session token>",
   "employee": {
      "id": <employeeId>,
      "username": "<username>",
      "name": "<first name>",
      "surname": "<surname>"
   }
}
```

#### ERROR responses:
- **400**
   - *JSON FIELDS MISSING*
   - *ALL FIELDS MUST BE STRING*
- **401**
   - *USER DOES NOT EXIST*
   - *INCORRECT PASSWORD*
- **500**
   - *INTERNAL ALMS ERROR*

---

### POST `/register`
- allows creating new users
#### Required headers:
- none
#### JSON request content:
```
{
	"username": "<username>",
	"password": "<password>",
	"name": "<first name>",
	"surname": "<surname>"
}
```

#### JSON field requirements
- username
   - string
   - must be between 2 and 32 characters long
- password
   - string
   - must be between 8 and 48 characters long
- name
   - string
   - must be between 2 and 32 characters long
- surname
   - string
   - must be between 2 and 32 characters long

#### 200 OK response:
- [default success response](#success-response)

#### ERROR responses:
- **400**
   - *JSON FIELDS MISSING*
   - *ALL FIELDS MUST BE STRING*
   - *REQUIREMENTS NOT SATISFIED*
      - response includes an additional array titled `errors` that includes a list of strings explaining which requirements were not satisfied
   - *USERNAME TAKEN*
- **500**
   - *INTERNAL ALMS ERROR*

---

### GET `/is-username-taken/<username>`
- returns a true/false response based on if the provided username is already taken

#### Required headers:
- none

#### 200 OK response:
```
<true/false>
```

#### ERROR responses:
- none

---

### GET `/get-direct-conversation/<username>`
- returns a direct conversation object with another employee

#### Required headers:
- [authentication header](#authentication-header)

#### 200 OK response:
Note: Direct conversations do not have a name, so their "name" attribute is always null.
```
{
   "id": <conversation id>,
   "name": null,
   "isGroup": 0,
   "datetimeCreated": "<date and time when the conversation was created>",
   "datetimeUpdated": "<last time the conversation was updated (new message was sent)>",
   "participants": [
      {
         "id": <employee id>,
         "username": "<employee username>",
         "name": "<employee name>",
         "surname": "<employee surname>"
      },
      ...
   ]
}
```

#### ERROR responses:
- **401**
   - [authentication error responses](#authentication-error-responses)
- **404**
   - *EMPLOYEE DOES NOT EXIST*
- **500**
   - *INTERNAL ALMS ERROR*

---

### GET `/get-conversation-by-id/<id>`
- returns a conversation object of the specified ID

#### Required headers:
- [authentication header](#authentication-header)

#### 200 OK response:
```
{
   "id": <conversation id>,
   "name": <name/null>,
   "isGroup": <0/1>,
   "datetimeCreated": "<date and time when the conversation was created>",
   "datetimeUpdated": "<last time the conversation was updated (new message was sent)>",
   "participants": [
      {
         "id": <employee id>,
         "username": "<employee username>",
         "name": "<employee name>",
         "surname": "<employee surname>"
      },
      ...
   ]
}
```

#### ERROR responses:
- **401**
   - [authentication error responses](#authentication-error-responses)
- **404**
   - *CONVERSATION NOT FOUND*

---

### GET `/get-all-conversations`
- returns an array of all conversation objects the employee is part of 

#### Required headers:
- [authentication header](#authentication-header)

#### 200 OK response:
```
[
   {
      "id": <conversation id>,
      "name": <conversation name/null>,
      "isGroup": <0/1>,
      "datetimeCreated": "<date and time when the conversation was created>",
      "datetimeUpdated": "<last time the conversation was updated (new message was sent)>",
      "participants": [
         {
            "id": <employee id>,
            "username": "<employee username>",
            "name": "<employee name>",
            "surname": "<employee surname>"
         },
         ...
      ]
   },
   ...
]
```

#### ERROR responses:
- **401**
   - [authentication error responses](#authentication-error-responses)

---

### GET `/get-direct-conversations`
- returns an array of all **direct** conversation objects the employee is part of 

#### Required headers:
- [authentication header](#authentication-header)

#### 200 OK response:
Note: Direct conversations do not have a name, so their "name" attribute is always null.
```
[
   {
      "id": <conversation id>,
      "name": null,
      "isGroup": 0,
      "datetimeCreated": "<date and time when the conversation was created>",
      "datetimeUpdated": "<last time the conversation was updated (new message was sent)>",
      "participants": [
         {
            "id": <employee id>,
            "username": "<employee username>",
            "name": "<employee name>",
            "surname": "<employee surname>"
         },
         ...
      ]
   },
   ...
]
```

#### ERROR responses:
- **401**
   - [authentication error responses](#authentication-error-responses)

---

### GET `/get-group-conversations`
- returns an array of all **group** conversation objects the employee is part of 

#### Required headers:
- [authentication header](#authentication-header)

#### 200 OK response:
```
[
   {
      "id": <conversation id>,
      "name": <conversation name>,
      "isGroup": 1,
      "datetimeCreated": "<date and time when the conversation was created>",
      "datetimeUpdated": "<last time the conversation was updated (new message was sent)>",
      "participants": [
         {
            "id": <employee id>,
            "username": "<employee username>",
            "name": "<employee name>",
            "surname": "<employee surname>"
         },
         ...
      ]
   },
   ...
]
```

#### ERROR responses:
- **401**
   - [authentication error responses](#authentication-error-responses)

---

### GET `/get-unread-conversations`
- returns an array of all conversation objects the employee is part of and that contain messages the employee hasn't viewed yet
- **in comparison to other conversation endpoints, these conversation objects also include the amount of unread messages**

#### Required headers:
- [authentication header](#authentication-header)

#### 200 OK response:
```
[
   {
      "id": <conversation id>,
      "name": <conversation name>,
      "isGroup": 1,
      "datetimeCreated": "<date and time when the conversation was created>",
      "datetimeUpdated": "<last time the conversation was updated (new message was sent)>",
      "unreadMessages: <count of unread messages>",
      "participants": [
         {
            "id": <employee id>,
            "username": "<employee username>",
            "name": "<employee name>",
            "surname": "<employee surname>"
         },
         ...
      ]
   },
   ...
]
```

#### ERROR responses:
- **401**
   - [authentication error responses](#authentication-error-responses)

---

### POST `/create-group-conversation`
- creates a new group conversation

#### Required headers:
- [authentication header](#authentication-header)

#### JSON request content:
```
{
	"name": <conversation name>,
	"employees": [
      "employee_username",
      ...
   ]
}
```

#### JSON field requirements
- name
   - string
   - can't be longer than 16 characters
- employees
   - array
   - all items must be string
   - group conversations can't have more than a 100 participants

#### 200 OK response:
- [default success response](#success-response)

#### ERROR responses:
- **401**
   - [authentication error responses](#authentication-error-responses)
- **400**
   - *JSON FIELDS MISSING*
   - *EMPLOYEES MUST BE ARRAY*
   - *NAME TOO LONG*
   - *TOO MANY PARTICIPANTS*
   - *EMPLOYEES DO NOT EXIST*
      - this response also includes an array titled `nonexistentUsernames` that includes all usernames that were supplied and do not actually exist
- **500**
   - *INTERNAL ALMS ERROR*

---

### POST `/send-message`
- sends message to a conversation

#### Required headers:
- [authentication header](#authentication-header)

#### JSON request content:
```
{
	"conversationId": <conversation id>,
	"content": "<message content>"
}
```

#### JSON field requirements
- conversationId
   - integer
- content
   - string
   - can't be longer than 500 characters

#### 200 OK response:
- [default success response](#success-response)

#### ERROR responses:
- **401**
   - [authentication error responses](#authentication-error-responses)
- **400**
   - *JSON FIELDS MISSING*
   - *CONTENT MUST BE STRING*
   - *CONTENT TOO LONG*
- **404**
   - *CONVERSATION NOT FOUND*
- **500**
   - *INTERNAL ALMS ERROR*

---

### GET `/get-messages/<conversation id>`
- returns a list of the 100 most recent messages in a conversation 
- requesting this endpoint will mark all messages in the conversation as "read"

#### Required headers:
- [authentication header](#authentication-header)

#### 200 OK response:
```
[
      {
      "id": <message id>,
      "employeeId": <author employee id>,
      "username": "<author employee username>",
      "name": "<author employee name>",
      "surname": "<author employee surname>",
      "content": "<message content>",
      "datetimeSent": "<date and time when the message was sent>"
   },
   ...
]
```

#### ERROR responses:
- **401**
   - [authentication error responses](#authentication-error-responses)
- **404**
   - *CONVERSATION NOT FOUND*

---

### GET `/get-unread-messages/<conversation id>`
- returns a list of all **unread** messages in a conversation 
- requesting this endpoint will mark all messages in the conversation as "read"

#### Required headers:
- [authentication header](#authentication-header)

#### 200 OK response:
```
[
      {
      "id": <message id>,
      "employeeId": <author employee id>,
      "username": "<author employee username>",
      "name": "<author employee name>",
      "surname": "<author employee surname>",
      "content": "<message content>",
      "datetimeSent": "<date and time when the message was sent>"
   },
   ...
]
```

#### ERROR responses:
- **401**
   - [authentication error responses](#authentication-error-responses)
- **404**
   - *CONVERSATION NOT FOUND*