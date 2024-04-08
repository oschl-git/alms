# ALMS API ENDPOINT DOCUMENTATION
This document attempts to be an exhaustive guide to using ALMS endpoints. With it, you should be able to create your own ALMS client.

**To learn about general ALMS functionality, checkout the [documentation](DOCUMENTATION.md).**

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

## Endpoints:
### POST `/login`
- the login endpoint allowing user authentication
#### Required headers:
- none
#### JSON request content:
```
{
	"username": "<username>",
	"password": "<password>"
}
```

### JSON filed requirements
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
- the register endpoint allowing creation of new users
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

### POST `/send-message`
- and endpoint allowing users to send messages to conversations
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

### GET `/get-direct-conversation/<username>`
- an andpoint which returns a direct conversation object with another employee
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

### GET `/get-all-conversations`
- an andpoint which returns an array of all conversation objects the employee is part of 
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
- an andpoint which returns an array of all **direct** conversation objects the employee is part of 
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
- an andpoint which returns an array of all **group** conversation objects the employee is part of 
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
- an andpoint which returns an array of all conversation objects the employee is part of and that contain messages the employee hasn't viewed yet
- **in comparison to other get endpoints, these conversation objects also include the amount of unread messages**
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