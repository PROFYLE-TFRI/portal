
# PROFYLE Portal

Welcome to the profyle portal.


## Installation

```sh
git clone https://github.com/PROFYLE-TFRI/portal
git clone -b portal-testing https://github.com/PROFYLE-TFRI/metadata
cd portal
npm install
cd client
npm install
cd ..
cp config.example.js config.js
```

Then, edit `config.js` to match your paths/options. You will need to point
the property `paths.data` of `config.js` to the `/root_folder_example` of the
PROFYLE-TFRI/metadata repo (branch: `portal-testing`).


## Running (development)

```sh
npm start:watch
```

And on a separate terminal:

```sh
cd client && npm start
```

## Running (production)

```sh
npm run build
PORT=80 npm start
```
