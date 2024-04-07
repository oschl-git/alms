# ALMS DOCUMENTATION
This document attempts to be an exhaustive overview of all ALMS functionality and an extensive guide for taking advantage of its capabilities.

**Endpoint documentation is not part of this document. To learn about ALMS endpoints specifically, check out the [endpoints documentation](ENDPOINTS.md).**

- author: **Ondřej Schlaichert**
- created in: **2024**
- made as a final school project for the subject PV at **SPŠE Ječná**
- licensed under the **[GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html)**

## Configuration
ALMS requires a `.env` file to be created in the project directory (not in `src`, but in the root project directory). It should contain the following values:
```
# Logging configuration
LOG_FOLDER="<path to a directory where logs should be stored>"

# Session token configuration
TOKEN_VALID_FOR_MIN=<how long session tokens should be valid for>

# HTTP/HTTPS configuration
PORT=<port ALMS should run on>
USE_HTTPS=<true/false>
HTTPS_CERT="<path to an HTTPS certificate>"
HTTPS_KEY="<path to an HTTPS key>"

# Message encryption
ENCRYPTION_KEY = "<a 32 byte encryption key>"

# MySQL connection
DB_HOST="<MySQL server address>"
DB_USER="<MySQL user>"
DB_PASSWORD="<MySQL user password>"
DB_NAME="<MySQL database name>"
```
### Example:
```
# Logging configuration
LOG_FOLDER="/home/user/logs/alms"

# Session token configuration
TOKEN_VALID_FOR_MIN=10

# HTTPS configuration
PORT=443
USE_HTTPS=true
HTTPS_CERT="/etc/letsencrypt/live/domain/fullchain.pem"
HTTPS_KEY="/etc/letsencrypt/live/domain/privkey.pem"

# Message encryption
ENCRYPTION_KEY = "ykZVeqavTHTIce8OZohiY1yPEf9E4TqP" # CHANGE THIS!

# MySQL connection
DB_HOST="localhost"
DB_USER="glados"
DB_PASSWORD="averysecurepassword"
DB_NAME="ALMS"
```

## Security

### Aperture Secure Authentication Protocol (ASAP)
ASAP is used for HTTP/HTTPS request authorization. It works in the following steps:

1) The client attempts to log in with a username and password, sending a POST request to the `/login` endpoint.
2) If the supplied details match, ALMS generates a new 128-byte session token and associates it with the provided employee. The token, along with additional user details, are sent in response.
3) The client stores the session token and sends it as header titled `Token` with each request. Every request containing the token refreshes its expiry time.
4) If no requests are sent for a time specified in the `.env` file (`TOKEN_VALID_FOR_MIN` option, 10 minutes by default), the token expires and can no longer be used for authorization. The user must log in again.

### Password hashing
Passwords are hashed using the [scrypt](https://en.wikipedia.org/wiki/Scrypt) algorithm. For details on the implementation, examine the code in [`password-hasher.js`](../src/security/password-hasher.js).

### Message encryption
Messages are encrypted using the [AES-256](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) algorithm. For details on the implementation, examine the code in [`message-encryptor.js`](../src/security/message-encryptor.js).

### HTTPS
ALMS should be hosted and connected to **exclusively** using the secure HTTPS protocol to mitigate password and session token theft; HTTP should only be used for local testing. HTTPS servers should be hosted on port 443. Configuring HTTPS certificates and keys can be done in the `.env` file, as specified in the configuration section above.

## MySQL database
A MySQL database is used to store user data. It uses the following schema:

![MySQL schema diagram](./img/mysql-diagram.png)

**SQL scripts to import the database can be found in the [mysql](../mysql) folder.**