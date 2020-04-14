# Installing the AKSO API

1. Clone the repo `git clone git@github.com:AksoEO/API` and enter it `cd API`

2. Make sure you use the right version of node (using nvm run `nvm install $(cat .node-version)`)

   You can check what version of node you're on by running `node -v`

3. Make sure you have the required native dependencies:

   - On Ubuntu, run: `apt install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev python2.7`

4. Make sure you have MySQL 5.7.15 or higher:

   - On Ubuntu, run `apt install mysql-server-5.7 mysql-client-5.7`

5. Install the API by running `npm i`

6. Set up the native dependencies properly by running `npm rebuild`

7. Set up MySQL by editing `my.cnf` (on Ubuntu that's in `/etc/mysql/my.cnf`)

   Add the following entries:
   ```
     innodb_ft_min_token_size = 3
     group_concat_max_len = 1000000
     event_scheduler = on
   ```

8. Reload MySQL (on Ubuntu run `service mysqld reload`)

9. Set up the permanent and state data directories

   AKSO needs two data directories:

   - The data dir, which stores all permanent data like codeholder profile pictures

   - The state dir, which stores the email backlog, address label orders etc.

   To create this directories do something like `mkdir akso-data && mkdir akso-state-data` in an appropriate location.

10. Set up the env vars

   On most setups you'll want a file `api.env` in some secure location. It's important this file can only be read by trusted users as it will contain passwords and API keys

   The possible env vars with their defaults are: 

   ```
     NODE_ENV=dev # Set this production on production, only affects logging level

     AKSO_HTTP_PORT=1111
     AKSO_HTTP_PATH='/' # The path of the AKSO API, useful if behind a reverse proxy
     AKSO_HTTP_TRUST_PROXY=NO_DEFAULT # Whether to trust X-Forwarded-For from certains ips or subnets. Only use this if the AKSO API is behind a reverse proxy. The value of this variable is passed directly to ExpressJS: http://expressjs.com/en/4x/api.html#trust.proxy.options.table
     AKSO_HTTP_THREADS=3 # How many CPU threads to dedicate to the API
     AKSO_HTTP_USE_HELMET=1 # Whether to use Express helmet for additional security, do not disable this on production
     AKSO_HTTP_SESSION_SECRET=NO_DEFAULT # Generate some secure string using e.g. `openssl rand -hex 32`, change it if ever compromised. Use the same string across all instances if using load sharing
     AKSO_HTTP_DISABLE_CORS_CHECK=0 # Whether to allow CORS, do not enable this on production
     AKSO_HTTP_DISABLE_CSRF_CHECK=0 # Whether to disable CSRF, do not enable this on production
     AKSO_HTTP_DISABLE_RATE_LIMIT=0 # Whether to disable rate limiting, do not enable this on production
     AKSO_HTTP_DISABLE_DISABLE_SLOW_DOWN=0 # Whether to disable login slow down, do not enable this on production
     AKSO_HTTP_OUTSIDE_ADDRESS=NO_DEFAULT # Optionally, the URL prefix the server is behind. This is used for webhook registration. This address must be port forwarded. If no value is provided, AKSO determines your IP address and uses that with the HTTP port. This does not include the HTTP path, which must be appended to this value manually.

     AKSO_MYSQL_HOST=NO_DEFAULT
     AKSO_MYSQL_USER=NO_DEFAULT
     AKSO_MYSQL_PASSWORD=NO_DEFAULT
     AKSO_MYSQL_DATABASE=NO_DEFAULT # If you just blindly imported the database earlier, this should be set to akso

     AKSO_SENDGRID_API_KEY=NO_DEFAULT # Put your Sendgrid API key here, there is currently no way to use AKSO without a Sendgrid API key. An unlimited trial key can be obtained for free at https://signup.sendgrid.com/

     AKSO_TELEGRAM_TOKEN=NO_DEFAULT # Put your Telegram bot token here, there is currently no way to use AKSO without a Telegram bot. Read more about how to create a bot here https://core.telegram.org/bots#3-how-do-i-create-a-bot

     AKSO_TOTP_AES_KEY=NO_DEFAULT # Put 32 bytes in hex here, this must be generated securely using e.g. `openssl rand -hex 32`, change it if ever compromised (updating the db as needed). Use the same string across all instances if using load sharing

     AKSO_DATA_DIR=NO_DEFAULT # The absolute path to the data dir you created in the previous step
     AKSO_STATE_DIR=NO_DEFAULT # The absolute path to the state dir you created in the previous step

     AKSO_DISABLE_LOGIN_NOTIFS=0 # Whether to disable notifications to codeholders when they sign in from a fishy location, this should probably not be disabled on production

     AKSO_STRIPE_WEBHOOKS_ARE_TEMP=0 # Whether to delete Stripe webhooks upon shutdown, useful for dev environments where you don't want failed webhook events to build up when the server is unavailable
   ```

11. Run the API using `source api.env && npm start`. You might want to turn this into a daemon for init.d or use something like `pm2`.
