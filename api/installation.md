# Installing the AKSO API

1. Clone the repo `git clone git@github.com:AksoEO/API` and enter it `cd API`

2. Make sure you use the right version of node (using nvm run `nvm install $(cat .node-version)`)

   You can check what version of node you're on by running `node -v`

3. Make sure you have the required native dependencies:

   - On Ubuntu, run: `apt install python2.7`

4. Make sure you have MySQL 5.7.15 or higher:

   - On Ubuntu, run `apt install mysql-server-5.7 mysql-client-5.7`

5. Install the API by running `npm i`

6. Set up MySQL by editing `my.cnf` (on Ubuntu that's in `/etc/mysql/my.cnf`)

   Add the following entries:
   ```
   [mysqld]
   innodb_ft_min_token_size = 3
   group_concat_max_len = 1000000
   event_scheduler = on
   ```

7. Reload MySQL (on Ubuntu run `service mysql reload`)

8. Set up the permanent and state data directories

   AKSO needs two data directories:

   - The data dir, which stores all permanent data like codeholder profile pictures

   - The state dir, which stores the email backlog, address label orders etc.

   To create this directories do something like `mkdir akso-data && mkdir akso-state-data` in an appropriate location.

9. Set up the env vars

   On most setups you'll want a file `api.env` in some secure location. It's important this file can only be read by trusted users as it will contain passwords and API keys

   The possible env vars with their defaults are: 

   ```
   # Set this production on production, only affects logging level
   export NODE_ENV=dev

   export AKSO_HTTP_PORT=1111

   # The path of the AKSO API, useful if behind a reverse proxy
   export AKSO_HTTP_PATH='/'

   # Whether to trust X-Forwarded-For from certains ips or subnets.
   # Only use this if the AKSO API is behind a reverse proxy.
   # The value of this variable is passed directly to ExpressJS: 
   # http://expressjs.com/en/4x/api.html#trust.proxy.options.table
   export AKSO_HTTP_TRUST_PROXY=NO_DEFAULT

   # How many CPU threads to dedicate to the API
   export AKSO_HTTP_THREADS=3

   # Whether to use Express helmet for additional security
   # Do not disable this on production
   export AKSO_HTTP_USE_HELMET=1

   # Generate some secure string using e.g. `openssl rand -hex 32`
   # Change it if ever compromised.
   # Use the same string across all instances if using load sharing
   export AKSO_HTTP_SESSION_SECRET=NO_DEFAULT

   # Whether to allow CORS, do not disable CORS on production
   export AKSO_HTTP_DISABLE_CORS_CHECK=0

   # Whether to disable CSRF, do not disable CSRF this on production
   export AKSO_HTTP_DISABLE_CSRF_CHECK=0

   # Whether to disable rate limiting
   # Do not disable rate limiting on production
   export AKSO_HTTP_DISABLE_RATE_LIMIT=0

   # Whether to disable notifications to codeholders
   # when they sign in from a fishy location
   # This should probably not be disabled on production
   export AKSO_DISABLE_LOGIN_NOTIFS=0

   # Whether to disable login slow down
   # Do not disable slow down this on production
   export AKSO_HTTP_DISABLE_DISABLE_SLOW_DOWN=0

   # Optionally, the URL prefix the server is behind.
   # This is used for webhook registration.
   # This address must be port forwarded.
   # If no value is provided, AKSO determines your IP address
   # and uses that with the HTTP port. This does not include the HTTP path,
   # which must be appended to this value manually.
   export AKSO_HTTP_OUTSIDE_ADDRESS=NO_DEFAULT

   export AKSO_MYSQL_HOST=NO_DEFAULT
   export AKSO_MYSQL_USER=NO_DEFAULT
   export AKSO_MYSQL_PASSWORD=NO_DEFAULT

   # The name of the database to store geo-db data in. Can be anything.
   export AKSO_MYSQL_GEODB_DATABASE=NO_DEFAULT

   # If you just blindly imported the database earlier,
   # this should be set to akso
   export AKSO_MYSQL_DATABASE=NO_DEFAULT

   # Put your Sendgrid API key here
   # There is currently no way to use AKSO without a Sendgrid API key.
   # An unlimited trial key can be obtained for free at 
   # https://signup.sendgrid.com/
   export AKSO_SENDGRID_API_KEY=NO_DEFAULT

   # Put your Telegram bot token here
   # You can leave this blank to run without Telegram support
   # Read more about how to create a bot at:
   # https://core.telegram.org/bots#3-how-do-i-create-a-bot
   export AKSO_TELEGRAM_TOKEN=NO_DEFAULT

   # Put the URL to the AKSO payment facilitator here
   export AKSO_PAYMENT_FACILITATOR='https://pago.akso.org'

   # Put 32 bytes in hex here, this must be generated securely using e.g.
   # `openssl rand -hex 32`
   # Change it if ever compromised (updating the db as needed).
   # Use the same string across all instances if using load sharing
   export AKSO_TOTP_AES_KEY=NO_DEFAULT

   # The absolute path to the data dir you created in the previous step
   export AKSO_DATA_DIR=NO_DEFAULT 

   # The absolute path to the state dir you created in the previous step
   export AKSO_STATE_DIR=NO_DEFAULT

   # Whether to delete Stripe webhooks upon shutdown
   # This is useful for dev environments where you don't want
   # failed webhook events to build up when the server is unavailable
   export AKSO_STRIPE_WEBHOOKS_ARE_TEMP=0

   # The Open Exchange Rates APP id, obtainable at 
   # https://openexchangerates.org/. The free plan will work fine.
   export AKSO_OPEN_EXCHANGE_RATES_APP_ID=NO_DEFAULT
   ```

10. Load the database using `source api.env && ./loaddb.sh`.

11. Populate the database using `MODE=<mode> npm run populate-db`. Set mode to `prod` (production), `dev` (development) or `test`.

   Mode can also be set to `client` to create an API client with star perms. This should only be used in combination with `prod`.

12. Run the API using `source api.env && npm start`. You might want to turn this into a daemon for init.d or use something like `pm2`.
